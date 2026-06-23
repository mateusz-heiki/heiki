import { config } from "./config.js";
import { launchContext, warmup } from "./browser.js";
import { log, sleep, urlMatchesHint, writeJson } from "./util.js";
import type { Shop } from "./types.js";
import type { Page } from "playwright";

/**
 * Z dowolnej struktury JSON wyciąga obiekty wyglądające jak drogerie.
 * Rekurencyjnie szuka tablic, których elementy mają identyfikator i cechy adresu.
 */
function extractShops(node: unknown, out: Shop[], seen = new Set<string>()): void {
  if (Array.isArray(node)) {
    for (const el of node) extractShops(el, out, seen);
    return;
  }
  if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    const id =
      o.id ?? o.shopId ?? o.storeId ?? o.code ?? o.number ?? o.poiId ?? o.marketId;
    const city = o.city ?? o.town ?? o.miasto ?? o.locality;
    const street = o.street ?? o.address ?? o.adres ?? o.addressLine ?? o.streetName;

    if (id != null && (city != null || street != null)) {
      const key = String(id);
      if (!seen.has(key)) {
        seen.add(key);
        out.push({
          id: key,
          name: str(o.name ?? o.title ?? o.shopName),
          city: str(city),
          street: str(street),
          postalCode: str(o.postalCode ?? o.zip ?? o.kodPocztowy ?? o.zipCode),
          lat: numOrU(o.lat ?? o.latitude ?? o.y),
          lng: numOrU(o.lng ?? o.lon ?? o.longitude ?? o.x),
          raw: o,
        });
      }
    }
    // Schodzimy głębiej (np. { data: { shops: [...] } }).
    for (const v of Object.values(o)) extractShops(v, out, seen);
  }
}

const str = (v: unknown) => (v == null ? undefined : String(v));
const numOrU = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** Zbiera odpowiedzi JSON pasujące do podpowiedzi URL dla sklepów. */
async function collectShopResponses(page: Page): Promise<unknown[]> {
  const payloads: unknown[] = [];
  page.on("response", async (res) => {
    const url = res.url();
    if (!urlMatchesHint(url, config.apiHints.shops)) return;
    const ct = res.headers()["content-type"] ?? "";
    if (!ct.includes("json")) return;
    try {
      payloads.push(await res.json());
    } catch {
      /* nie-JSON lub błąd parsowania — pomijamy */
    }
  });
  return payloads;
}

export async function discoverShops(): Promise<Shop[]> {
  const context = await launchContext();
  const page = await context.newPage();
  try {
    await warmup(page);

    const payloads = await collectShopResponses(page);

    // Strona z wyszukiwarką drogerii. Jeśli ścieżka się różni, dostosuj URL.
    const candidates = ["/drogerie", "/sklepy", "/znajdz-drogerie", "/store-locator"];
    for (const path of candidates) {
      try {
        await page.goto(config.baseUrl + path, {
          waitUntil: "networkidle",
          timeout: 60000,
        });
        await sleep(2500);
        if (payloads.length > 0) break;
      } catch {
        /* spróbuj kolejny kandydat */
      }
    }

    // Czasem lista doczytuje się po interakcji z mapą — dajemy chwilę.
    await sleep(2000);

    const shops: Shop[] = [];
    const seen = new Set<string>();
    for (const p of payloads) extractShops(p, shops, seen);

    if (shops.length === 0) {
      log.warn(
        "Nie wykryto listy drogerii automatycznie. Uruchom z HEADLESS=false " +
          "i sprawdź zakładkę Network, lub użyj komendy `capture`, by podejrzeć ruch.",
      );
    } else {
      log.ok(`Wykryto ${shops.length} drogerii.`);
      writeJson(config.files.shops, shops);
      log.info(`Zapisano do ${config.files.shops}`);
    }
    return shops;
  } finally {
    await context.close();
  }
}
