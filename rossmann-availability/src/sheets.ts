import fs from "node:fs";
import { google, type sheets_v4 } from "googleapis";
import { config } from "./config.js";
import { log } from "./util.js";
import type { AvailabilityRecord, AvailabilityStatus } from "./types.js";
import type { ChangeRecord, HistoryRow } from "./report.js";

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

const HISTORY_HEADERS = [
  "Skan",
  "ID produktu",
  "Produkt",
  "Dostępny",
  "Niski stan",
  "Niedostępny",
  "Nieznany",
  "Sklepów łącznie",
];

const CHANGE_HEADERS = [
  "Sprawdzono",
  "Typ zmiany",
  "Produkt",
  "EAN",
  "Miasto",
  "Drogeria",
  "ID sklepu",
  "Poprzedni status",
  "Aktualny status",
];

/** Czy konfiguracja Google Sheets jest kompletna. */
export function sheetsConfigured(): boolean {
  return Boolean(
    config.google.sheetId && fs.existsSync(config.google.serviceAccountFile),
  );
}

function getSheetsClient(): sheets_v4.Sheets {
  const auth = new google.auth.GoogleAuth({
    keyFile: config.google.serviceAccountFile,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function ensureTab(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  title: string,
): Promise<void> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === title);
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
    log.info(`Utworzono zakładkę "${title}".`);
  }
}

export async function writeToSheets(records: AvailabilityRecord[]): Promise<void> {
  if (!sheetsConfigured()) {
    log.warn(
      "Google Sheets nie skonfigurowane (brak GOOGLE_SHEET_ID lub pliku konta " +
        "serwisowego) — pomijam zapis do arkusza. Wyniki są w plikach CSV/JSON.",
    );
    return;
  }

  const sheets = getSheetsClient();
  const spreadsheetId = config.google.sheetId;
  const tab = config.google.tab;

  await ensureTab(sheets, spreadsheetId, tab);

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

/**
 * Odczytuje poprzedni snapshot z głównej zakładki (zanim zostanie nadpisany).
 * Używane do liczenia zmian w CI, gdzie pliki lokalne nie przetrwają między
 * uruchomieniami. Zwraca minimalne rekordy (klucz + status + etykiety).
 */
export async function readPreviousFromSheets(): Promise<AvailabilityRecord[]> {
  if (!sheetsConfigured()) return [];
  const sheets = getSheetsClient();
  const spreadsheetId = config.google.sheetId;
  const tab = config.google.tab;
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: tab,
    });
    const rows = res.data.values ?? [];
    if (rows.length <= 1) return [];
    // Kolejność kolumn jak w HEADERS.
    const idx = (name: string) => HEADERS.indexOf(name);
    return rows.slice(1).map((r) => ({
      checkedAt: String(r[idx("Sprawdzono")] ?? ""),
      productName: String(r[idx("Produkt")] ?? ""),
      ean: (r[idx("EAN")] as string) || undefined,
      productId: String(r[idx("ID produktu")] ?? ""),
      shopCity: (r[idx("Miasto")] as string) || undefined,
      shopName: (r[idx("Drogeria")] as string) || undefined,
      shopStreet: (r[idx("Ulica")] as string) || undefined,
      shopId: String(r[idx("ID sklepu")] ?? ""),
      status: (String(r[idx("Status")] ?? "UNKNOWN") as AvailabilityStatus),
      rawStatus: (r[idx("Status (surowy)")] as string) || undefined,
    }));
  } catch {
    return [];
  }
}

/** Dopisuje podsumowanie bieżącego skanu do zakładki "Historia" (append). */
export async function appendHistory(rows: HistoryRow[]): Promise<void> {
  if (!sheetsConfigured() || rows.length === 0) return;
  const sheets = getSheetsClient();
  const spreadsheetId = config.google.sheetId;
  const tab = "Historia";
  await ensureTab(sheets, spreadsheetId, tab);

  // Nagłówek tylko gdy zakładka pusta.
  const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tab}!A1:A1` });
  if (!existing.data.values?.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [HISTORY_HEADERS] },
    });
  }
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: rows.map((r) => [
        r.checkedAt,
        r.productId,
        r.productName,
        r.available,
        r.low,
        r.unavailable,
        r.unknown,
        r.shopsTotal,
      ]),
    },
  });
  log.ok(`Dopisano ${rows.length} wierszy do zakładki "Historia".`);
}

/** Nadpisuje zakładkę "Zmiany" raportem różnic z bieżącego skanu. */
export async function writeChanges(changes: ChangeRecord[]): Promise<void> {
  if (!sheetsConfigured()) return;
  const sheets = getSheetsClient();
  const spreadsheetId = config.google.sheetId;
  const tab = "Zmiany";
  await ensureTab(sheets, spreadsheetId, tab);
  await sheets.spreadsheets.values.clear({ spreadsheetId, range: tab });
  const values = [
    CHANGE_HEADERS,
    ...changes.map((c) => [
      c.checkedAt,
      c.change,
      c.productName,
      c.ean ?? "",
      c.shopCity ?? "",
      c.shopName ?? "",
      c.shopId,
      c.prevStatus,
      c.status,
    ]),
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    requestBody: { values },
  });
  log.ok(`Zapisano ${changes.length} zmian do zakładki "Zmiany".`);
}
