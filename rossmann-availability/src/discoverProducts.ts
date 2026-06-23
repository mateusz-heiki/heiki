import { config } from "./config.js";
import { launchContext, warmup, acceptCookies } from "./browser.js";
import { log, sleep, urlMatchesHint, writeJson } from "./util.js";
import type { Product } from "./types.js";
import type { Page } from "playwright";

const str = (v: unknown) => (v == null ? undefined : String(v));

/** Rekurencyjnie wyciąga z JSON obiekty wyglądające jak produkty. */
function extractProducts(node: unknown, out: Product[], seen: Set<string>): void {
  if (Array.isArray(node)) {
    for (const el of node) extractProducts(el, out, seen);
    return;
  }
  if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    const id = o.id ?? o.productId ?? o.code ?? o.sku;
    const name = o.name ?? o.title ?? o.productName ?? o.fullName;
    const url = o.url ?? o.link ?? o.seoUrl ?? o.slug;

    if (id != null && name != null) {
      const key = String(id);
      if (!seen.has(key)) {
        seen.add(key);
        const rawUrl = str(url);
        out.push({
          id: key,
          name: String(name),
          url: rawUrl
            ? rawUrl.startsWith("http")
              ? rawUrl
              : config.baseUrl + (rawUrl.startsWith("/") ? rawUrl : "/" + rawUrl)
            : config.baseUrl,
          ean: str(o.ean ?? o.gtin ?? o.barcode),
          price: str(o.price ?? o.priceValue ?? o.grossPrice),
          brand: config.brandName,
        });
      }
    }
    for (const v of Object.values(o)) extractProducts(v, out, seen);
  }
}

/** Fallback: zbiera produkty bezpośrednio z DOM listingu. */
async function scrapeProductsFromDom(page: Page): Promise<Product[]> {
  const sel = config.selectors;
  return page.$$eval(
    sel.productLink,
    (links, baseUrl) => {
      const seen = new Set<string>();
      const items: { id: string; name: string; url: string; price?: string }[] = [];
      for (const a of links as HTMLAnchorElement[]) {
        const href = a.href;
        if (!href || !href.includes("/produkty/")) continue;
        // Próbujemy wyłuskać id z końcówki sluga, np. /produkty/...,123456
        const m = href.match(/(\d{4,})/);
        const id = m ? m[1]! : href;
        if (seen.has(id)) continue;
        seen.add(id);
        const card = a.closest("article, li, div") ?? a;
        const name =
          (a.textContent ?? "").trim() ||
          (card.querySelector("h3, h2, [class*=name]")?.textContent ?? "").trim();
        const price = (
          card.querySelector("[class*=price], [data-testid=price]")?.textContent ?? ""
        ).trim();
        items.push({ id, name, url: href, price: price || undefined });
      }
      return items.map((i) => ({ ...i, baseUrl }));
    },
    config.baseUrl,
  ).then((items) =>
    items.map((i) => ({
      id: i.id,
      name: i.name,
      url: i.url,
      price: i.price,
      brand: config.brandName,
    })),
  );
}

/** Przewija stronę, by doładować leniwie ładowane produkty. */
async function autoScroll(page: Page): Promise<void> {
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 4000);
    await sleep(900);
    // Próba kliknięcia "pokaż więcej", jeśli istnieje.
    try {
      await page
        .locator('button:has-text("więcej"), button:has-text("Pokaż")')
        .first()
        .click({ timeout: 1000 });
      await sleep(1200);
    } catch {
      /* brak przycisku — kontynuuj scroll */
    }
  }
}

export async function discoverProducts(): Promise<Product[]> {
  const context = await launchContext();
  const page = await context.newPage();
  try {
    await warmup(page);

    const payloads: unknown[] = [];
    page.on("response", async (res) => {
      if (!urlMatchesHint(res.url(), config.apiHints.productListing)) return;
      if (!(res.headers()["content-type"] ?? "").includes("json")) return;
      try {
        payloads.push(await res.json());
      } catch {
        /* pomijamy nie-JSON */
      }
    });

    log.info(`Otwieram stronę marki: ${config.brandUrl}`);
    await page.goto(config.brandUrl, { waitUntil: "networkidle", timeout: 60000 });
    await acceptCookies(page);
    await autoScroll(page);
    await sleep(1500);

    const products: Product[] = [];
    const seen = new Set<string>();
    for (const p of payloads) extractProducts(p, products, seen);

    if (products.length === 0) {
      log.warn("Brak produktów z API — próbuję odczytać z DOM…");
      const domProducts = await scrapeProductsFromDom(page);
      for (const p of domProducts) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          products.push(p);
        }
      }
    }

    // Odfiltruj do marki Heiki Heiki po nazwie (na wszelki wypadek, gdy listing
    // zawiera produkty powiązane / sugerowane).
    const filtered = products.filter((p) =>
      /heiki/i.test(p.name) || config.brandUrl.toLowerCase().includes("heiki"),
    );
    const result = filtered.length > 0 ? filtered : products;

    if (result.length === 0) {
      log.warn(
        "Nie wykryto żadnych produktów. Sprawdź ROSSMANN_BRAND_URL oraz selektory " +
          "w config.ts (uruchom z HEADLESS=false, by zobaczyć stronę).",
      );
    } else {
      log.ok(`Wykryto ${result.length} produktów marki ${config.brandName}.`);
      writeJson(config.files.products, result);
      log.info(`Zapisano do ${config.files.products}`);
    }
    return result;
  } finally {
    await context.close();
  }
}
