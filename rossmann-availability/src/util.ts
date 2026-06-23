import fs from "node:fs";
import path from "node:path";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ── Logowanie ───────────────────────────────────────────────────────────── */

const ts = () => new Date().toISOString().slice(11, 19);
export const log = {
  info: (...a: unknown[]) => console.log(`[${ts()}]`, ...a),
  warn: (...a: unknown[]) => console.warn(`[${ts()}] ⚠`, ...a),
  error: (...a: unknown[]) => console.error(`[${ts()}] ✖`, ...a),
  ok: (...a: unknown[]) => console.log(`[${ts()}] ✓`, ...a),
};

/* ── Pliki ───────────────────────────────────────────────────────────────── */

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeJson(file: string, data: unknown): void {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

export function readJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export function writeCsv(file: string, rows: Record<string, unknown>[]): void {
  ensureDir(path.dirname(file));
  if (rows.length === 0) {
    fs.writeFileSync(file, "", "utf8");
    return;
  }
  const headers = Object.keys(rows[0]!);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  fs.writeFileSync(file, lines.join("\n"), "utf8");
}

/* ── Współbieżność ───────────────────────────────────────────────────────── */

/**
 * Uruchamia `worker` dla każdego elementu z `items`, utrzymując maks. `limit`
 * jednoczesnych zadań. Zwraca wyniki w kolejności wejściowej.
 */
export async function pool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  let done = 0;
  const total = items.length;

  const runners = Array.from({ length: Math.max(1, limit) }, async () => {
    while (true) {
      const i = next++;
      if (i >= total) break;
      results[i] = await worker(items[i]!, i);
      done++;
      onProgress?.(done, total);
    }
  });

  await Promise.all(runners);
  return results;
}

/* ── Retry ───────────────────────────────────────────────────────────────── */

export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 4,
  baseMs = 1000,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await sleep(baseMs * 2 ** i);
    }
  }
  throw lastErr;
}

/* ── Heurystyki ──────────────────────────────────────────────────────────── */

/** Czy fragment URL pasuje do któregokolwiek z podpowiedzi (case-insensitive). */
export function urlMatchesHint(url: string, hints: readonly string[]): boolean {
  const u = url.toLowerCase();
  return hints.some((h) => u.includes(h.toLowerCase()));
}

/**
 * Próbuje zmapować dowolną surową wartość statusu na nasz enum.
 * Pokrywa typowe oznaczenia (liczby, słowa PL/EN, poziomy stanu).
 */
import type { AvailabilityStatus } from "./types.js";
export function normalizeStatus(raw: unknown): AvailabilityStatus {
  if (raw == null) return "UNKNOWN";
  const s = String(raw).trim().toLowerCase();

  if (
    ["true", "1", "in_stock", "instock", "available", "dostepny", "dostępny", "high", "wysoki"].includes(s)
  )
    return "AVAILABLE";
  if (["low", "niski", "ostatnie", "limited", "few", "medium", "sredni", "średni"].includes(s))
    return "LOW";
  if (
    ["false", "0", "out_of_stock", "outofstock", "unavailable", "niedostepny", "niedostępny", "brak", "none"].includes(s)
  )
    return "UNAVAILABLE";

  // Liczby: 0 = brak, niski próg = LOW, więcej = dostępny.
  const n = Number(s);
  if (Number.isFinite(n)) {
    if (n <= 0) return "UNAVAILABLE";
    if (n <= 3) return "LOW";
    return "AVAILABLE";
  }
  return "UNKNOWN";
}
