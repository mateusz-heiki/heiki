import "dotenv/config";
import path from "node:path";

const root = process.cwd();

function bool(v: string | undefined, def: boolean): boolean {
  if (v == null) return def;
  return ["1", "true", "yes", "tak"].includes(v.toLowerCase());
}

function num(v: string | undefined, def: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export const config = {
  baseUrl: process.env.ROSSMANN_BASE_URL ?? "https://www.rossmann.pl",
  brandUrl:
    process.env.ROSSMANN_BRAND_URL ??
    "https://www.rossmann.pl/szukaj?Search=heiki%20heiki",
  brandName: "Heiki Heiki",

  headless: bool(process.env.HEADLESS, true),
  concurrency: num(process.env.CONCURRENCY, 4),
  requestDelayMs: num(process.env.REQUEST_DELAY_MS, 350),
  userDataDir: path.resolve(
    root,
    process.env.USER_DATA_DIR ?? "./data/browser-profile",
  ),

  // Katalog na cache i wyniki.
  dataDir: path.resolve(root, "data"),

  // Pliki cache / wyników.
  files: {
    products: path.resolve(root, "data/products.json"),
    shops: path.resolve(root, "data/shops.json"),
    availabilityTemplate: path.resolve(root, "data/availability-request.json"),
    resultsJson: path.resolve(root, "data/availability.json"),
    resultsCsv: path.resolve(root, "data/availability.csv"),
  },

  google: {
    sheetId: process.env.GOOGLE_SHEET_ID ?? "",
    serviceAccountFile: path.resolve(
      root,
      process.env.GOOGLE_SERVICE_ACCOUNT_FILE ?? "./google-service-account.json",
    ),
    tab: process.env.GOOGLE_SHEET_TAB ?? "Dostępność",
  },

  /**
   * Wzorce URL używane do rozpoznawania wywołań API strony podczas
   * przechwytywania ruchu. Jeśli Rossmann zmieni strukturę, dostosuj tutaj.
   * Każdy wpis to fragment, który musi wystąpić w URL odpowiedzi XHR.
   */
  apiHints: {
    productListing: ["search", "produkt", "product"],
    shops: ["shop", "drogeri", "store", "sklep", "poi"],
    availability: ["availab", "dostepn", "dostępn", "stock", "stan"],
  },

  /**
   * Selektory DOM używane jako fallback przy wykrywaniu produktów na
   * listingu marki (gdy nie uda się przechwycić czystego JSON).
   */
  selectors: {
    productCard: '[data-testid="product-tile"], .product-tile, article a[href*="/produkty/"]',
    productLink: 'a[href*="/produkty/"]',
    productName: '[data-testid="product-name"], .product-tile__name, h3',
    productPrice: '[data-testid="price"], .price, .product-tile__price',
    cookieAccept:
      '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll, [data-testid="cookie-accept"], button:has-text("Akceptuj")',
  },
} as const;

export type Config = typeof config;
