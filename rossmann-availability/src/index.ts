#!/usr/bin/env node
import { Command } from "commander";
import { config } from "./config.js";
import { log } from "./util.js";
import { discoverProducts } from "./discoverProducts.js";
import { discoverShops } from "./discoverShops.js";
import { capture } from "./capture.js";
import { checkAvailability } from "./checkAvailability.js";
import { writeToSheets, sheetsConfigured } from "./sheets.js";

const program = new Command();

program
  .name("rossmann")
  .description(
    "Pobieranie stanów dostępności produktów marki Heiki Heiki w drogeriach Rossmann PL.",
  );

program
  .command("discover-products")
  .description("Wykrywa produkty marki ze strony marki i zapisuje data/products.json")
  .action(async () => {
    await discoverProducts();
  });

program
  .command("discover-shops")
  .description("Pobiera listę wszystkich drogerii i zapisuje data/shops.json")
  .action(async () => {
    await discoverShops();
  });

program
  .command("capture")
  .argument("[productUrl]", "URL produktu do nagrania zapytania (opcjonalnie)")
  .description("Interaktywnie nagrywa prawdziwe zapytanie API o dostępność (raz)")
  .action(async (productUrl?: string) => {
    await capture(productUrl);
  });

program
  .command("scan")
  .description("Pełny skan dostępności (wszystkie produkty × wszystkie sklepy)")
  .option("--limit-products <n>", "ogranicz liczbę produktów (test)", Number)
  .option("--limit-shops <n>", "ogranicz liczbę sklepów (test)", Number)
  .option("--no-sheets", "nie zapisuj do Google Sheets (tylko pliki CSV/JSON)")
  .action(async (opts: { limitProducts?: number; limitShops?: number; sheets: boolean }) => {
    const records = await checkAvailability({
      limitProducts: opts.limitProducts,
      limitShops: opts.limitShops,
    });
    if (records.length === 0) return;
    if (opts.sheets) {
      if (sheetsConfigured()) await writeToSheets(records);
      else
        log.warn(
          "Pomijam Google Sheets — uzupełnij GOOGLE_SHEET_ID i plik konta serwisowego.",
        );
    }
  });

program
  .command("run")
  .description("Wszystko po kolei: discover-products → discover-shops → capture → scan")
  .action(async () => {
    log.info("Krok 1/4: produkty");
    await discoverProducts();
    log.info("Krok 2/4: sklepy");
    await discoverShops();
    log.info("Krok 3/4: nagranie zapytania (interaktywne)");
    await capture();
    log.info("Krok 4/4: skan");
    const records = await checkAvailability();
    if (records.length && sheetsConfigured()) await writeToSheets(records);
  });

program.parseAsync(process.argv).catch((err) => {
  log.error(err);
  process.exit(1);
});

void config; // zapewnia wczytanie .env przy starcie
