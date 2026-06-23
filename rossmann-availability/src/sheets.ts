import fs from "node:fs";
import { google } from "googleapis";
import { config } from "./config.js";
import { log } from "./util.js";
import type { AvailabilityRecord } from "./types.js";

const HEADERS = [
  "Sprawdzono",
  "Produkt",
  "EAN",
  "ID produktu",
  "Miasto",
  "Drogeria",
  "Ulica",
  "ID sklepu",
  "Status",
  "Status (surowy)",
];

function toRow(r: AvailabilityRecord): (string | number)[] {
  return [
    r.checkedAt,
    r.productName,
    r.ean ?? "",
    r.productId,
    r.shopCity ?? "",
    r.shopName ?? "",
    r.shopStreet ?? "",
    r.shopId,
    r.status,
    r.rawStatus ?? "",
  ];
}

/** Czy konfiguracja Google Sheets jest kompletna. */
export function sheetsConfigured(): boolean {
  return Boolean(
    config.google.sheetId && fs.existsSync(config.google.serviceAccountFile),
  );
}

export async function writeToSheets(records: AvailabilityRecord[]): Promise<void> {
  if (!sheetsConfigured()) {
    log.warn(
      "Google Sheets nie skonfigurowane (brak GOOGLE_SHEET_ID lub pliku konta " +
        "serwisowego) — pomijam zapis do arkusza. Wyniki są w plikach CSV/JSON.",
    );
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: config.google.serviceAccountFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = config.google.sheetId;
  const tab = config.google.tab;

  // Utwórz zakładkę, jeśli nie istnieje.
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === tab);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title: tab } } }] },
    });
    log.info(`Utworzono zakładkę "${tab}".`);
  }

  // Wyczyść i zapisz od nowa (pełny snapshot bieżącego skanu).
  await sheets.spreadsheets.values.clear({ spreadsheetId, range: tab });
  const values = [HEADERS, ...records.map(toRow)];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  log.ok(`Zapisano ${records.length} wierszy do Google Sheets (zakładka "${tab}").`);
}
