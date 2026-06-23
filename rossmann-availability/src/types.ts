/** Status dostępności produktu w danej drogerii. */
export type AvailabilityStatus =
  | "AVAILABLE" // dostępny
  | "LOW" // niski stan / ostatnie sztuki
  | "UNAVAILABLE" // niedostępny
  | "UNKNOWN"; // nie udało się ustalić

export interface Product {
  /** Wewnętrzny identyfikator produktu na rossmann.pl. */
  id: string;
  name: string;
  /** Pełny URL strony produktu. */
  url: string;
  /** Kod EAN, jeśli udało się go odczytać. */
  ean?: string;
  /** Cena katalogowa (string, tak jak na stronie), jeśli dostępna. */
  price?: string;
  brand: string;
}

export interface Shop {
  /** Identyfikator drogerii w systemie Rossmann. */
  id: string;
  name?: string;
  city?: string;
  street?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  /** Surowy obiekt z API (na wypadek dodatkowych pól). */
  raw?: unknown;
}

export interface AvailabilityRecord {
  productId: string;
  productName: string;
  ean?: string;
  shopId: string;
  shopCity?: string;
  shopName?: string;
  shopStreet?: string;
  status: AvailabilityStatus;
  /** Surowa wartość statusu zwrócona przez API (do diagnostyki/mapowania). */
  rawStatus?: string;
  checkedAt: string; // ISO 8601
}

/**
 * Szablon zapytania o dostępność przechwycony z prawdziwego ruchu strony
 * (komenda `capture`). Pozwala odtwarzać zapytania bez zgadywania endpointu.
 */
export interface AvailabilityRequestTemplate {
  url: string;
  method: string;
  headers: Record<string, string>;
  /** Treść POST (jeśli była), z podmienionymi placeholderami. */
  postData?: string;
  /** Jak w URL/treści oznaczono identyfikatory — do podmiany przy odtwarzaniu. */
  placeholders: {
    productId?: string;
    shopId?: string;
    city?: string;
  };
  capturedAt: string;
}
