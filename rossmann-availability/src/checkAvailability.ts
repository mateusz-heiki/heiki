import { config } from "./config.js";
import { launchContext, warmup } from "./browser.js";
import {
  log,
  normalizeStatus,
  pool,
  readJson,
  retry,
  sleep,
  writeCsv,
  writeJson,
} from "./util.js";
import type {
  AvailabilityRecord,
  AvailabilityRequestTemplate,
  AvailabilityStatus,
  Product,
  Shop,
} from "./types.js";
import type { APIRequestContext } from "playwright";

/** Klucze, pod którymi w odpowiedzi API zwykle kryje się stan dostępności. */
const STATUS_KEYS = [
  "availability",
  "available",
  "status",
  "stock",
  "stockLevel",
  "inStock",
  "quantity",
  "stan",
  "dostepnosc",
  "dostępność",
];

/** Rekurencyjnie szuka w obiekcie pierwszej sensownej wartości statusu. */
function findStatus(node: unknown): { status: AvailabilityStatus; raw?: string } {
  const stack: unknown[] = [node];
  while (stack.length) {
    const cur = stack.pop();
    if (cur && typeof cur === "object") {
      const o = cur as Record<string, unknown>;
      for (const k of Object.keys(o)) {
        if (STATUS_KEYS.includes(k.toLowerCase())) {
          const v = o[k];
          if (v != null && typeof v !== "object") {
            return { status: normalizeStatus(v), raw: String(v) };
          }
        }
      }
      for (const v of Object.values(o)) {
        if (v && typeof v === "object") stack.push(v);
      }
    }
  }
  return { status: "UNKNOWN" };
}

/** Podstawia identyfikatory produktu i sklepu w szablonie zapytania. */
function fillTemplate(
  tpl: AvailabilityRequestTemplate,
  productId: string,
  shopId: string,
): { url: string; postData?: string } {
  let url = tpl.url;
  let postData = tpl.postData;
  const sub = (s: string | undefined, from: string | undefined, to: string) =>
    s && from ? s.split(from).join(to) : s;

  url = sub(url, tpl.placeholders.productId, productId) ?? url;
  url = sub(url, tpl.placeholders.shopId, shopId) ?? url;
  postData = sub(postData, tpl.placeholders.productId, productId);
  postData = sub(postData, tpl.placeholders.shopId, shopId);
  return { url, postData };
}

async function queryOne(
  request: APIRequestContext,
  tpl: AvailabilityRequestTemplate,
  product: Product,
  shop: Shop,
): Promise<AvailabilityRecord> {
  const { url, postData } = fillTemplate(tpl, product.id, shop.id);
  const headers = { ...tpl.headers };
  delete headers["content-length"];

  const base: Omit<AvailabilityRecord, "status" | "rawStatus"> = {
    productId: product.id,
    productName: product.name,
    ean: product.ean,
    shopId: shop.id,
    shopCity: shop.city,
    shopName: shop.name,
    shopStreet: shop.street,
    checkedAt: new Date().toISOString(),
  };

  try {
    const res = await retry(
      () =>
        request.fetch(url, {
          method: tpl.method,
          headers,
          data: postData,
          timeout: 20000,
        }),
      3,
      800,
    );
    if (!res.ok()) return { ...base, status: "UNKNOWN", rawStatus: `HTTP ${res.status()}` };
    const json = await res.json().catch(() => null);
    if (json == null) return { ...base, status: "UNKNOWN", rawStatus: "no-json" };
    const { status, raw } = findStatus(json);
    return { ...base, status, rawStatus: raw };
  } catch (err) {
    return { ...base, status: "UNKNOWN", rawStatus: String(err).slice(0, 80) };
  }
}

export interface ScanOptions {
  limitProducts?: number;
  limitShops?: number;
}

export async function checkAvailability(
  opts: ScanOptions = {},
): Promise<AvailabilityRecord[]> {
  const products = readJson<Product[]>(config.files.products);
  const shops = readJson<Shop[]>(config.files.shops);
  const tpl = readJson<AvailabilityRequestTemplate>(config.files.availabilityTemplate);

  if (!products?.length) {
    log.error("Brak produktów. Uruchom najpierw: npm run discover:products");
    return [];
  }
  if (!shops?.length) {
    log.error("Brak listy sklepów. Uruchom najpierw: npm run discover:shops");
    return [];
  }
  if (!tpl) {
    log.error(
      "Brak szablonu zapytania o dostępność. Uruchom najpierw: npm run capture\n" +
        "(jednorazowo nagrywa prawdziwe zapytanie API ze strony).",
    );
    return [];
  }
  if (!tpl.placeholders.shopId) {
    log.warn(
      "W szablonie nie ustawiono placeholders.shopId — bez tego nie podmienimy " +
        "sklepu i każdy wiersz dotyczyłby tego samego sklepu. Uzupełnij plik " +
        config.files.availabilityTemplate,
    );
  }

  const useProducts = opts.limitProducts ? products.slice(0, opts.limitProducts) : products;
  const useShops = opts.limitShops ? shops.slice(0, opts.limitShops) : shops;

  const pairs: { product: Product; shop: Shop }[] = [];
  for (const product of useProducts)
    for (const shop of useShops) pairs.push({ product, shop });

  log.info(
    `Skan: ${useProducts.length} produktów × ${useShops.length} sklepów = ` +
      `${pairs.length} zapytań (współbieżność ${config.concurrency}).`,
  );

  const context = await launchContext();
  const page = await context.newPage();
  await warmup(page); // ustanawia ciastka Akamai dla context.request
  const request = context.request;

  const records = await pool(
    pairs,
    config.concurrency,
    async ({ product, shop }) => {
      const rec = await queryOne(request, tpl, product, shop);
      if (config.requestDelayMs) await sleep(config.requestDelayMs);
      return rec;
    },
    (done, total) => {
      if (done % 50 === 0 || done === total)
        log.info(`  …${done}/${total}`);
    },
  );

  await context.close();

  writeJson(config.files.resultsJson, records);
  writeCsv(config.files.resultsCsv, records as unknown as Record<string, unknown>[]);
  log.ok(
    `Zapisano ${records.length} wyników → ${config.files.resultsCsv} i ${config.files.resultsJson}`,
  );

  const summary = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  log.info("Podsumowanie statusów:", summary);

  return records;
}
