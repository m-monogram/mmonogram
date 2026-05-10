## Goal

Make every visible string on every public page fully translate when the user switches between EN, RU, and AR. Today there are three classes of gaps:

1. **24 keys missing in RU and AR** under `catalog.*` (exterior/interior/wheels/performance/exhaust/protection items 1–4). They fall back to the raw key string.
2. **Recently added/rewritten UI uses hardcoded English** — `VinChecker`, `RepresentativesMapSection`, `RepresentativeDetailPage`, `NotFound`, plus one stray prop in `HomePage`.
3. **`OfferAgreement.tsx`** is a 250-line legal document, fully English. Out of scope (legal text stays EN).

## Audit summary

Hardcoded English strings to translate:

- **`src/components/VinChecker.tsx`**
  - "Official Verification Service" badge
  - Long description paragraph ("Authenticate your M-Monogram vehicle…")
  - "24 / 7 Concierge", "Dubai · Mon — Sat" subtitles
  - "M-Monogram · Authenticated Atelier" trust footer
- **`src/components/sections/RepresentativesMapSection.tsx`**
  - Eyebrow "Global Network"
  - Title "Official Representatives"
  - Subtitle "Locate the nearest M-Monogram representative."
  - "Scroll to zoom · Drag to pan" hint
  - "{N} Locations" counter (interpolate count)
- **`src/pages/RepresentativeDetailPage.tsx`**
  - "Global Network" back link
  - "Atelier" eyebrow, default description fallback
  - Field labels: "Address", "Phone", "Email", "Hours"
  - Fallback values: "Address coming soon", "Available on request", "By appointment", "info@mmonogram.com" (keep email literal)
  - "Open in Google Maps", "OSM"
  - "Request Appointment" button
  - "Continue exploring", "Also in {region}"
  - 404 fallback: "Representative Not Found", description, "Back to Map"
- **`src/pages/NotFound.tsx`**
  - "Error 404", "Page Not Found", description, "Return to Home"
- **`src/pages/HomePage.tsx`**
  - `<NextSectionCTA label="Explore" nextLabel="The M-Monogram Story" />` — replace with `t()` calls (these props are already translated elsewhere via the `nextSection` keyspace; reuse them)

Also missing in RU/AR (24 keys):
`catalog.exteriorItem1..4`, `interiorItem1..4`, `wheelsItem1..4`, `performanceItem1..4`, `exhaustItem1..4`, `protectionItem1..4`.

## Plan

### 1. Extend `src/data/translations.ts`

Add three new namespaces (EN + RU + AR) with full parity:

- `verify` — extend with: `badge`, `descriptionLong`, `concierge`, `officeHours`, `trustLine`.
- `representatives` — new namespace:
  - `eyebrow`, `title`, `subtitle`
  - `mapHint`, `locations` (e.g. "Locations" / "Локаций" / "مواقع")
  - `back`, `atelier`, `address`, `phone`, `email`, `hours`
  - `addressFallback`, `phoneFallback`, `hoursFallback`
  - `openGoogleMaps`, `osm`
  - `requestAppointment`
  - `continueExploring`, `alsoIn` (string template "Also in {region}")
  - `notFoundTitle`, `notFoundDescription`, `backToMap`
- `notFound` — `error404`, `title`, `description`, `cta`.

Backfill the 24 missing `catalog.*Item1..4` keys in `ru` and `ar` (translate using the same labels already used in EN; values are short item names like "Front bumper", "Carbon hood", etc. — pull from the EN block as the source of truth).

### 2. Wire up components

For each file, import `useLanguage`, replace hardcoded strings with `t("...")`. Where a string interpolates a value (e.g. "11 Locations", "Also in Middle East"), use template strings: `${representatives.length} ${t("representatives.locations")}` and `${t("representatives.alsoIn")} ${rep.region}`. Region names themselves stay as-is (data field) — only the connector word translates.

Files to edit:

- `src/components/VinChecker.tsx`
- `src/components/sections/RepresentativesMapSection.tsx`
- `src/pages/RepresentativeDetailPage.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/HomePage.tsx` (NextSectionCTA props only)

### 3. Verification pass

After the edits, re-run the parity check (`bun -e` script that flattens both trees) and confirm all three locales have identical key sets and zero missing keys. Then visually load `/`, `/brand`, `/projects`, `/commission`, `/verify`, `/contact`, `/representatives/dubai-uae`, `/404` in EN, RU, AR and confirm no English leaks through (especially under the map, the verification block, and the representative detail card).

### Out of scope

- `src/pages/OfferAgreement.tsx` — legal document, stays English.
- `src/pages/PrivacyPolicy.tsx` — already wired to `t()`.
- Admin dashboard pages — internal tool, EN only.
- Region names inside `representatives.ts` data (Middle East, Europe, Asia, Americas) — stay in English as proper nouns within the data layer; only the surrounding UI text translates.
