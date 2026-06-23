import { config } from "./config.js";
import { log, writeCsv, writeJson } from "./util.js";
import type { AvailabilityRecord, AvailabilityStatus } from "./types.js";

export type ChangeType =
  | "NEW_AVAILABLE" // pojawił się w sprzedaży (był brak / nieznany → dostępny)
  | "OUT_OF_STOCK" // zniknął (był dostępny/niski → brak)
  | "LOW_STOCK" // spadł do niskiego stanu
  | "RESTOCKED" // wrócił z niskiego do pełnej dostępności
  | "STATUS_CHANGED" // inna zmiana statusu
  | "NEW_ENTRY"; // nowa para produkt×sklep (brak w poprzednim skanie)

export interface ChangeRecord {
  productId: string;
  productName: string;
  ean?: string;
  shopId: string;
  shopCity?: string;
  shopName?: string;
  prevStatus: AvailabilityStatus | "—";
  status: AvailabilityStatus;
  change: ChangeType;
  checkedAt: string;
}

const key = (r: { productId: string; shopId: string }) => `${r.productId}::${r.shopId}`;

function classify(
  prev: AvailabilityStatus | undefined,
  curr: AvailabilityStatus,
): ChangeType | null {
  if (prev === undefined) return "NEW_ENTRY";
  if (prev === curr) return null;
  if (curr === "AVAILABLE" && (prev === "UNAVAILABLE" || prev === "UNKNOWN"))
    return "NEW_AVAILABLE";
  if (curr === "AVAILABLE" && prev === "LOW") return "RESTOCKED";
  if (curr === "UNAVAILABLE") return "OUT_OF_STOCK";
  if (curr === "LOW") return "LOW_STOCK";
  return "STATUS_CHANGED";
}

/** Porównuje bieżący skan z poprzednim i zwraca tylko realne zmiany. */
export function diffRecords(
  current: AvailabilityRecord[],
  previous: AvailabilityRecord[],
): ChangeRecord[] {
  const prevMap = new Map(previous.map((r) => [key(r), r]));
  const changes: ChangeRecord[] = [];

  for (const cur of current) {
    const prev = prevMap.get(key(cur));
    const change = classify(prev?.status, cur.status);
    if (!change) continue;
    // Nowe wpisy raportujemy tylko jeśli faktycznie są dostępne (mniej szumu).
    if (change === "NEW_ENTRY" && cur.status !== "AVAILABLE" && cur.status !== "LOW")
      continue;
    changes.push({
      productId: cur.productId,
      productName: cur.productName,
      ean: cur.ean,
      shopId: cur.shopId,
      shopCity: cur.shopCity,
      shopName: cur.shopName,
      prevStatus: prev?.status ?? "—",
      status: cur.status,
      change,
      checkedAt: cur.checkedAt,
    });
  }
  return changes;
}

/** Zlicza statusy per produkt — wiersze do zakładki "Historia". */
export interface HistoryRow {
  checkedAt: string;
  productId: string;
  productName: string;
  available: number;
  low: number;
  unavailable: number;
  unknown: number;
  shopsTotal: number;
}

export function buildHistory(records: AvailabilityRecord[]): HistoryRow[] {
  const byProduct = new Map<string, HistoryRow>();
  const runStamp = new Date().toISOString();
  for (const r of records) {
    let row = byProduct.get(r.productId);
    if (!row) {
      row = {
        checkedAt: runStamp,
        productId: r.productId,
        productName: r.productName,
        available: 0,
        low: 0,
        unavailable: 0,
        unknown: 0,
        shopsTotal: 0,
      };
      byProduct.set(r.productId, row);
    }
    row.shopsTotal++;
    if (r.status === "AVAILABLE") row.available++;
    else if (r.status === "LOW") row.low++;
    else if (r.status === "UNAVAILABLE") row.unavailable++;
    else row.unknown++;
  }
  return [...byProduct.values()];
}

/** Zapisuje raport zmian lokalnie (CSV/JSON) i wypisuje podsumowanie. */
export function writeChangeReport(changes: ChangeRecord[]): void {
  writeJson(config.dataDir + "/changes.json", changes);
  writeCsv(
    config.dataDir + "/changes.csv",
    changes as unknown as Record<string, unknown>[],
  );
  if (changes.length === 0) {
    log.info("Brak zmian względem poprzedniego skanu.");
    return;
  }
  const counts = changes.reduce<Record<string, number>>((a, c) => {
    a[c.change] = (a[c.change] ?? 0) + 1;
    return a;
  }, {});
  log.ok(`Wykryto ${changes.length} zmian:`, counts);
}
