# Rossmann Availability — dostępność produktów Heiki Heiki

Narzędzie CLI, które sprawdza **stany dostępności produktów marki Heiki Heiki we
wszystkich drogeriach Rossmann Polska** i zapisuje wynik do **Google Sheets**
(oraz lokalnie do CSV/JSON).

## Jak to działa (i dlaczego tak)

`rossmann.pl` jest chroniony systemem antybotowym klasy Akamai — zwykłe
`curl`/`fetch` dostają `403`. Dlatego narzędzie steruje **prawdziwą przeglądarką**
(Playwright + Chromium), która przechodzi przez ochronę, i:

1. **wykrywa produkty** marki ze strony marki/wyszukiwarki (`discover-products`),
2. **pobiera listę wszystkich drogerii** (`discover-shops`),
3. **nagrywa raz prawdziwe zapytanie API o dostępność** ze strony produktu
   (`capture`) — dzięki temu nie zgadujemy i nie hardkodujemy endpointu, którego
   Rossmann nie publikuje,
4. **odtwarza to zapytanie dla każdej pary produkt × sklep** w kontekście
   przeglądarki (z ważnymi ciasteczkami), zbiera statusy i zapisuje wyniki
   (`scan`).

> Pełny skan to ~liczba produktów × ~2000 sklepów zapytań. Zacznij od testu
> `--limit-shops 20 --limit-products 1`, zanim puścisz całość.

## Wymagania

- Node.js ≥ 20
- Dostęp do internetu **bez blokady `rossmann.pl`** (uruchamiaj na własnej
  maszynie/serwerze — nie w środowisku z restrykcyjną polityką sieciową).

## Instalacja

```bash
cd rossmann-availability
npm install            # zainstaluje też Chromium dla Playwright
cp .env.example .env   # uzupełnij wartości
```

## Konfiguracja `.env`

Najważniejsze pola:

| Zmienna | Opis |
| --- | --- |
| `ROSSMANN_BRAND_URL` | URL listingu marki Heiki Heiki (skopiuj z przeglądarki) |
| `HEADLESS` | `false` przy pierwszym uruchomieniu i `capture`, potem `true` |
| `CONCURRENCY` | liczba równoległych zapytań (zacznij od 3–4) |
| `REQUEST_DELAY_MS` | opóźnienie między zapytaniami (anty-blokada) |
| `GOOGLE_SHEET_ID` | ID arkusza Google |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | ścieżka do JSON konta serwisowego |
| `GOOGLE_SHEET_TAB` | nazwa zakładki na wyniki |

### Google Sheets — konto serwisowe

1. Wejdź do [Google Cloud Console](https://console.cloud.google.com/) → utwórz
   projekt.
2. Włącz **Google Sheets API**.
3. **IAM & Admin → Service Accounts** → utwórz konto serwisowe → **Keys → Add
   key → JSON**. Zapisz plik jako `google-service-account.json` w katalogu
   projektu.
4. Utwórz arkusz w Google Sheets i **udostępnij go na adres e-mail konta
   serwisowego** (pole `client_email` z JSON) z prawem **Edytujący**.
5. Wklej ID arkusza (z URL) do `GOOGLE_SHEET_ID`.

## Użycie

```bash
# 1) Wykryj produkty marki
npm run discover:products

# 2) Pobierz listę wszystkich drogerii
npm run discover:shops

# 3) Nagraj raz prawdziwe zapytanie o dostępność (HEADLESS=false, interaktywnie)
npm run capture
#    → w oknie przeglądarki kliknij "Sprawdź dostępność w drogerii",
#      wybierz dowolny sklep, poczekaj na status i naciśnij ENTER w terminalu.

# 4) (jednorazowo) dopnij szablon — patrz niżej "Krok kalibracji"

# 5) Test na małej próbce
npm run scan -- --limit-products 1 --limit-shops 20

# 6) Pełny skan + zapis do Google Sheets
npm run scan
```

Albo wszystko po kolei: `npm run rossmann run`.

### Krok kalibracji (po `capture`)

Po nagraniu powstaje `data/availability-request.json`. Otwórz go i w sekcji
`placeholders` wpisz **dokładne wartości**, które pojawiły się w `url`/`postData`
podczas nagrania:

```jsonc
{
  "url": "https://www.rossmann.pl/api/.../availability?product=123456&shop=789",
  "method": "GET",
  "placeholders": {
    "productId": "123456",   // id produktu użytego przy nagraniu
    "shopId": "789"          // id sklepu, który wybrałeś przy nagraniu
  }
}
```

Skan podmienia te literały na id każdego produktu i każdego sklepu z list
`data/products.json` i `data/shops.json`. To jedyny ręczny krok — wynika z tego,
że Rossmann nie publikuje API i jego strukturę trzeba potwierdzić raz na żywo.

## Wyniki

- `data/availability.csv` i `data/availability.json` — pełny snapshot,
- Google Sheets (zakładka z `GOOGLE_SHEET_TAB`) — nadpisywana przy każdym skanie.

Kolumny: data sprawdzenia, produkt, EAN, id produktu, miasto, drogeria, ulica,
id sklepu, status (`AVAILABLE` / `LOW` / `UNAVAILABLE` / `UNKNOWN`), status surowy.

## Raport zmian i historia

Każdy skan automatycznie porównuje się z poprzednim:

- **`data/changes.csv` / `.json`** — tylko zmiany (np. produkt pojawił się
  w danej drogerii, zniknął, spadł do ostatnich sztuk).
- Zakładka **„Zmiany"** w Google Sheets — to samo, nadpisywane co skan.
- Zakładka **„Historia"** w Google Sheets — dopisywany co skan wiersz
  podsumowania per produkt (ile sklepów dostępny / niski / brak), więc widać
  trend w czasie.

Poprzedni stan brany jest z lokalnego `data/availability.json`, a gdy go nie ma
(np. w CI) — odczytywany z arkusza, zanim zostanie nadpisany. Sam raport bez
ponownego skanu: `npm run rossmann report`.

Typy zmian: `NEW_AVAILABLE`, `RESTOCKED`, `LOW_STOCK`, `OUT_OF_STOCK`,
`STATUS_CHANGED`, `NEW_ENTRY`.

## Harmonogram (GitHub Actions)

W repo jest workflow `.github/workflows/rossmann-scan.yml`, który uruchamia
pełny skan **codziennie o 06:00 UTC** (oraz ręcznie z zakładki *Actions →
Run workflow*). Wyniki trafiają do Google Sheets, a CSV/JSON jako artefakt.

Ustaw w **Settings → Secrets and variables → Actions**:

**Secrets:**
| Nazwa | Wartość |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | cała zawartość pliku konta serwisowego (JSON) |
| `GOOGLE_SHEET_ID` | ID arkusza |
| `ROSSMANN_BRAND_URL` | URL listingu marki |
| `AVAILABILITY_TEMPLATE_JSON` | zawartość `data/availability-request.json` po kalibracji |

**Variables (opcjonalnie):** `CONCURRENCY`, `REQUEST_DELAY_MS`, `GOOGLE_SHEET_TAB`.

> `AVAILABILITY_TEMPLATE_JSON` trzymamy jako *secret*, bo nagrane nagłówki mogą
> zawierać ciasteczka sesji. Po pierwszej lokalnej kalibracji (`capture`) wklej
> tam zawartość pliku. Produkty i listę sklepów workflow wykrywa sam przy każdym
> uruchomieniu.

## Dostrajanie / rozwiązywanie problemów

- **Pusta lista produktów/sklepów** → uruchom z `HEADLESS=false`, sprawdź
  `ROSSMANN_BRAND_URL` i selektory/podpowiedzi w `src/config.ts`
  (`apiHints`, `selectors`).
- **Dużo statusów `UNKNOWN`** → klucz statusu w odpowiedzi API jest inny;
  dodaj go do `STATUS_KEYS` w `src/checkAvailability.ts` (zajrzyj do
  `data/captured-availability.json`).
- **403 / blokady** → zmniejsz `CONCURRENCY`, zwiększ `REQUEST_DELAY_MS`,
  uruchom raz z `HEADLESS=false`, by odświeżyć profil/ciastka.

## Uwaga prawna

Narzędzie służy do monitorowania dostępności **własnej marki**. Korzystaj
rozsądnie (rozsądny rate limiting) i zgodnie z regulaminem serwisu.
