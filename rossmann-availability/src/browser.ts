import { chromium, type BrowserContext, type Page } from "playwright";
import { config } from "./config.js";
import { ensureDir, log, sleep } from "./util.js";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/**
 * Uruchamia trwały kontekst przeglądarki (zachowuje cookies/sensor Akamai między
 * uruchomieniami) z ustawieniami możliwie zbliżonymi do prawdziwego Chrome.
 */
export async function launchContext(): Promise<BrowserContext> {
  ensureDir(config.userDataDir);
  const context = await chromium.launchPersistentContext(config.userDataDir, {
    headless: config.headless,
    userAgent: UA,
    locale: "pl-PL",
    timezoneId: "Europe/Warsaw",
    viewport: { width: 1366, height: 900 },
    args: [
      "--disable-blink-features=AutomationControlled",
      "--lang=pl-PL",
    ],
  });

  // Drobny "stealth": usuń najbardziej oczywisty sygnał automatyzacji.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  return context;
}

/** Akceptuje baner cookies, jeśli się pojawi (best-effort). */
export async function acceptCookies(page: Page): Promise<void> {
  try {
    const btn = page.locator(config.selectors.cookieAccept).first();
    await btn.click({ timeout: 4000 });
    log.info("Zaakceptowano cookies.");
    await sleep(500);
  } catch {
    /* baner mógł się nie pojawić — to OK */
  }
}

/**
 * "Rozgrzewka" — wejście na stronę główną, aby Akamai wystawił komplet ciastek
 * zanim zaczniemy odpytywać o dane. Wywołaj raz na początku sesji.
 */
export async function warmup(page: Page): Promise<void> {
  log.info("Rozgrzewka sesji (strona główna)…");
  await page.goto(config.baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await acceptCookies(page);
  await sleep(1500);
}
