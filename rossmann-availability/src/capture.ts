import readline from "node:readline";
import { config } from "./config.js";
import { launchContext, warmup, acceptCookies } from "./browser.js";
import { log, readJson, urlMatchesHint, writeJson } from "./util.js";
import type { Product, AvailabilityRequestTemplate } from "./types.js";

interface CapturedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  postData?: string;
}

/**
 * Tryb interaktywny: otwiera stronę produktu w widocznej przeglądarce, a Ty
 * ręcznie wykonujesz "Sprawdź dostępność w drogerii" dla dowolnego sklepu.
 * Narzędzie nagrywa odpowiednie zapytanie i zapisuje je jako szablon, którego
 * potem używa skan dla wszystkich sklepów. Dzięki temu nie zgadujemy endpointu.
 */
export async function capture(productUrl?: string): Promise<void> {
  // Wymuszamy widoczną przeglądarkę niezależnie od HEADLESS.
  (config as { headless: boolean }).headless = false;

  let url = productUrl;
  if (!url) {
    const products = readJson<Product[]>(config.files.products);
    url = products?.[0]?.url;
  }
  if (!url) {
    log.error(
      "Podaj URL produktu: `npm run capture -- <url>` lub najpierw uruchom discover-products.",
    );
    return;
  }

  const context = await launchContext();
  const page = await context.newPage();
  const captured: CapturedRequest[] = [];

  page.on("request", (req) => {
    if (!urlMatchesHint(req.url(), config.apiHints.availability)) return;
    captured.push({
      url: req.url(),
      method: req.method(),
      headers: req.headers(),
      postData: req.postData() ?? undefined,
    });
    log.info(`▶ Przechwycono: ${req.method()} ${req.url()}`);
  });

  await warmup(page);
  log.info(`Otwieram produkt: ${url}`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await acceptCookies(page);

  console.log(
    "\n────────────────────────────────────────────────────────────\n" +
      "W oknie przeglądarki kliknij 'Sprawdź dostępność w drogerii',\n" +
      "wybierz dowolny sklep i poczekaj aż pokaże się status.\n" +
      "Gdy zobaczysz wynik, wróć tutaj i naciśnij ENTER.\n" +
      "────────────────────────────────────────────────────────────\n",
  );

  await new Promise<void>((resolve) => {
    const rl = readline.createInterface({ input: process.stdin });
    rl.question("", () => {
      rl.close();
      resolve();
    });
  });

  // Zapis pełnego logu przechwyconych zapytań (do diagnostyki).
  writeJson(config.dataDir + "/captured-availability.json", captured);

  const best = captured.at(-1);
  if (!best) {
    log.warn(
      "Nie przechwycono żadnego zapytania pasującego do podpowiedzi 'availability'. " +
        "Rozszerz config.apiHints.availability i spróbuj ponownie. " +
        "Pełny log: data/captured-availability.json",
    );
    await context.close();
    return;
  }

  const template: AvailabilityRequestTemplate = {
    url: best.url,
    method: best.method,
    headers: best.headers,
    postData: best.postData,
    placeholders: {
      // Wskazówka do ręcznego oznaczenia, gdzie w URL/treści jest id sklepu/produktu.
      // Skan podstawi wartości w miejsca dokładnych dopasowań tych identyfikatorów.
    },
    capturedAt: new Date().toISOString(),
  };
  writeJson(config.files.availabilityTemplate, template);
  log.ok(`Zapisano szablon zapytania: ${config.files.availabilityTemplate}`);
  log.info(
    "Otwórz ten plik i potwierdź, gdzie w 'url'/'postData' jest identyfikator " +
      "sklepu i produktu — uzupełnij sekcję 'placeholders' (patrz README).",
  );

  await context.close();
}
