## Goal

Move the Official Representatives map from its standalone page (`/representatives`) onto the homepage as a section near the bottom. Remove the "All Locations" list entirely. Keep pins on the map clickable — clicking a pin navigates to that representative's individual detail page (existing `/representatives/:id` route stays).

## Placement on the homepage

Add a new `RepresentativesMapSection` between `StatsSection` and `NextSectionCTA`:

```text
HeroSection
MissionStatement
LatestAdditionsCarousel
AboutUsSection
BrandStrip
StatsSection
→ RepresentativesMapSection   ← NEW
NextSectionCTA (Explore → Brand)
VinBanner
Footer
```

Reasoning: this slot sits after the credibility build-up (projects, about, stats) and before the brand-story CTA — a natural "where to find us in the world" beat that reinforces global presence without breaking the existing narrative flow toward Brand → Commission → Contact.

## Section design

- Full-width dark section, generous vertical padding (`py-24 md:py-32`).
- Eyebrow: "GLOBAL NETWORK" (`.text-eyebrow`, trilingual via `t()`).
- H2 (`.h-display-2`): "OFFICIAL REPRESENTATIVES".
- Subtitle (one short line): "Locate the nearest M-Monogram representative."
- Interactive world map below, `max-w-6xl mx-auto`, glassmorphism frame (`bg-slate-900/30 border-white/10 backdrop-blur-xl`), aspect ratio ~16/9, rounded-none to match site language.
- Bottom-left hint: "SCROLL TO ZOOM · DRAG TO PAN". Bottom-right counter: "{N} LOCATIONS".
- No list of locations rendered anywhere on the page.

## Pin interaction

- Each pin is a clickable button with subtle pulsing white dot + outer ring on hover.
- Click → `navigate('/representatives/' + rep.id)` (uses existing `RepresentativeDetailPage` and `representatives.ts` data — no changes there).
- On hover: small floating tooltip with city name (no address, no extra info — keeps the editorial feel).
- Lazy load the map section with `Suspense` to avoid weighing down LCP.

## Files to change

- **New** `src/components/sections/RepresentativesMapSection.tsx` — extract the map + pins (without the All Locations list) from the existing `RepresentativesPage`, wrap in homepage section styling.
- **Edit** `src/pages/HomePage.tsx` — lazy-import and render the new section between `StatsSection` and `NextSectionCTA`.
- **Delete** `src/pages/RepresentativesPage.tsx` — no longer used.
- **Edit** `src/App.tsx` — remove the `/representatives` route (keep `/representatives/:id`).
- **Edit** `src/components/Footer.tsx` — remove or repoint the "Representatives" footer link (point to `/#representatives` anchor on home).
- **Edit** `src/data/translations.ts` — add `representatives.eyebrow`, `representatives.title`, `representatives.subtitle` keys in EN/RU/AR if not already present; remove the unused "All Locations" string.

## Out of scope

- Real geographic coordinates / new pin data — the existing `representatives.ts` mock pin positions are reused as-is.
- Detail page redesign — `RepresentativeDetailPage` stays exactly as it is.
