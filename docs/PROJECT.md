# HEIKI HEIKI Pro — Project Snapshot

Documentation of the partner portal as built, as of the `claude/audit-heikiheiki-design-RCmAp` branch.

This document is the **as-built** state. For the design system (tokens, components, rules) see `DESIGN.md`. For machine-readable tokens and component snippets see `.impeccable/design.json`.

## 1. What this is

A B2B partner portal for HEIKI HEIKI. Audience: distributors, retail chains, brand collaborators — not direct consumers. The site exists to deliver product specs, ingredient research, science notes, brand assets, and press coverage to accredited partners. A separate consumer storefront lives at heikiheiki.com.

**Register:** brand-dominant with portal scaffolding. The homepage is an identity statement (gallery, atmosphere); deeper routes are working information surfaces (catalogue, ingredient database, science writeups, press). The sidebar is navigation, not an app shell.

**Design discipline:** Apple-adjacent restraint, translated for a project without Apple's photography or type budget. References: Aesop wholesale portal, Helmut Lang archive, Bottega Veneta press room.

## 2. Information architecture

Three sections in the persistent left sidebar:

```
Products
├── Haircare
│   ├── Shampoo
│   ├── Conditioner
│   ├── Mask
│   ├── Serum
│   ├── Cream
│   ├── Mist
│   └── Styling Paste
└── Body
    ├── Shower
    ├── Balm
    ├── Serum
    └── Deodorant

Reference
├── Ingredient Database
└── Science

Brand
├── Visual World
└── In Media
```

**Section labels** are non-navigable (uppercase, tracked, Tile Faint color, 12px).
**Branches** (Haircare, Body) are clickable and expandable. Clicking the row navigates to the branch index; clicking the chevron toggles the leaf list.
**Leaves** are clickable, navigate to a single content surface.
**Reference and Brand sections** have no branches; their items are leaves directly.

Active state across all levels: 3px Persimmon accent dot in the indent gutter, weight bumps to 500. No background pill, no underline.

Two-level indent max. The `Products → Haircare → Shampoo` URL is three segments deep, but visually Products is a section label rather than a row, so the sidebar only renders two indent levels.

## 3. Pages built

### 3.1 Homepage (`/`)

Production-quality. Built in vertical order:

1. **Topbar meta strip** — full width inside the canvas. Left: kicker text `Partner Portal · Spring / Summer 2026` in uppercase Label typography. Right: text links `Press kit` and `Contact` (mailto:partners@heikiheiki.com). 1px Rule-Soft bottom border.
2. **Hero intro** — left-aligned. Display headline: `A working archive for partners.` (max 18ch, semibold, negative tracking). Lede: one sentence in Tile Mid color, max 48ch.
3. **Floating gallery (masonry)** — full canvas width with 48px horizontal padding. CSS `columns: 3` on desktop, 2 on tablets (≤1100px canvas width), 1 on small phones (≤460px). 18 tiles total: 16 photographs from picsum.photos with varied aspect ratios (3:4, 4:5, 1:1, 2:3), plus 2 typographic tiles (`Nº 01 — Shampoo, hair restoration.` on Paper Pure, `Care, reduced. — What works. Nothing else.` on Tile Dark).
   - Interaction: hover dims sibling tiles to 50%, lifts the focused tile 3px with a soft shadow. Reduced-motion respected (transform disabled).
4. **Thread row** — three columns at >1100px, two at 833–1100px, one stacked at smaller widths. Each "thread" is a small editorial unit: uppercase kicker (Persimmon, +0.10em tracking), 1.625rem title, body lede (Tile Mid, max 38ch), and a text-link CTA with a chevron that opens the gap on hover.
   - Threads: Catalogue (→ /products/haircare), Reference (→ /ingredients), Brand (→ /visual-world).
5. **Footer** — single line. `HEIKI HEIKI Pro · For accredited partners. Public store at heikiheiki.com.` 0.8125rem Tile Mid text with an underlined link.

### 3.2 Scaffolded routes (17)

Every other route in the sidebar resolves to a `PlaceholderPage` component with:
- A breadcrumb (`Home / Section / Branch / Leaf`)
- A `Section` kicker in Persimmon
- The route's display title in Display scale
- An optional description (set on branch indexes and the four siblings)
- A status card: `Scaffolded route — This page is a placeholder so the navigation tree resolves end-to-end. Content lands in the next pass.`

This is intentional. The brief committed to "main page frame, many iterations to come."

| Route | Display name | Description set? |
|---|---|---|
| `/products/haircare` | Haircare | ✓ |
| `/products/haircare/shampoo` | Shampoo | – |
| `/products/haircare/conditioner` | Conditioner | – |
| `/products/haircare/mask` | Mask | – |
| `/products/haircare/serum` | Serum | – |
| `/products/haircare/cream` | Cream | – |
| `/products/haircare/mist` | Mist | – |
| `/products/haircare/styling-paste` | Styling Paste | – |
| `/products/body` | Body | ✓ |
| `/products/body/shower` | Shower | – |
| `/products/body/balm` | Balm | – |
| `/products/body/serum` | Serum | – |
| `/products/body/deodorant` | Deodorant | – |
| `/ingredients` | Ingredient Database | ✓ |
| `/science` | Science | ✓ |
| `/visual-world` | Visual World | ✓ |
| `/in-media` | In Media | ✓ |

## 4. Component inventory

| Component | Path | Role |
|---|---|---|
| `AppShell` | `components/AppShell.tsx` | Grid layout (sidebar + canvas), responsive shell |
| `Sidebar` | `components/Sidebar.tsx` | Persistent left navigation, mobile sheet trigger |
| `Logo` | `components/Logo.tsx` | Stacked `heiki/heiki` wordmark + `PRO` suffix, top-left of sidebar |
| `FloatingGallery` | `components/FloatingGallery.tsx` | The homepage masonry gallery |
| `PlaceholderPage` | `components/PlaceholderPage.tsx` | Breadcrumb + title scaffold for unbuilt routes |
| `lib/navigation.ts` | – | Single source of truth for the nav tree; used by Sidebar and PlaceholderPage |

Component CSS is co-located, one `.module.css` per `.tsx`.

## 5. Tech stack

- **Framework**: Next.js 16.2 (App Router, Turbopack)
- **Runtime**: React 19.2
- **Language**: TypeScript 5, strict mode
- **Styling**: CSS Modules + CSS Custom Properties on `:root`. No Tailwind, no styled-components, no Vanilla Extract. Tokens are the canonical source; modules consume them via `var(--token)`.
- **Fonts**: Söhne (Klim, production, licensed separately) → Inter Tight (via `next/font/google`, self-hosted, dev fallback) → `-apple-system` → system.
- **Animation library**: none. Hover lifts and tree expand use vanilla CSS transitions with `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint). 150ms for state changes, 300ms for transforms.
- **Icon library**: none. Three SVGs (chevron, hamburger, close) drawn inline.
- **Images**: `picsum.photos` placeholders with deterministic seeds. Production should replace with HEIKI HEIKI's real product / brand photography.

## 6. Design decisions and rationale

### 6.1 Why a sidebar, not Apple's top nav

The brief asked for "Apple style" with a left-sidebar category tree. apple.com itself has no sidebar; its nav is top, full-bleed. We resolved the tension by treating "Apple style" as a discipline (typography, restraint, motion-where-earned, paper-tinted neutrals) rather than a literal layout. The sidebar is closer to Aesop / Helmut Lang / Bottega Veneta press-portal territory.

### 6.2 Why Söhne over Inter

Inter is on the impeccable skill's reflex-reject font list — it's the AI-default sans of 2026 and it has saturated brand surfaces to the point of signaling "no font decision was made." Söhne (Klim Type Foundry) is the closest character substitute that hasn't saturated. Commercial license; budget for it before launch. Inter Tight is the unlicensed dev stand-in until then.

Tracking values are calibrated for Söhne's tighter metrics. When Söhne ships, do not crank tracking further.

### 6.3 Why masonry, not the previous freeform float

First iteration used absolute-positioned tiles with mouse-parallax and continuous sine-wave drift, modeled on a stripped-down cosmos.so canvas. The user redirected: fixed grid, equal column widths, varied heights driven by aspect ratios. CSS `columns` does this natively with zero JS.

The hover-dim-and-lift interaction was kept because it's the one piece of motion that earns its place: it answers "which one am I looking at?" without being decorative.

### 6.4 Why text-link CTAs over buttons

apple.com sells $4000 laptops with `Learn more ›` text links rather than buttons. The portal follows that posture: most CTAs are text links with a trailing chevron. Pill buttons are reserved for genuine conversion moments (none in the current scope; defined in DESIGN.md for future use).

### 6.5 Why placeholder pages instead of skipping unbuilt routes

A non-navigable sidebar would lie about the IA. Every leaf resolves to a real page with a breadcrumb so the partner can navigate the whole tree, even though most leaves carry no content yet. The status card states this explicitly rather than padding with fake content.

### 6.6 Why no dark mode (yet)

Theme is chosen per surface, not via a global toggle. The current set of pages all live on Paper (`#f5f5f7`); the dark-tile tokens exist in DESIGN.md for future surfaces (a single typographic tile on the homepage uses Tile Dark, demonstrating the per-tile rule). A site-wide dark mode is not part of the brief.

## 7. Open items and likely next iterations

In rough priority order.

### 7.1 Brand color
Persimmon (`#c44a2b`) is a placeholder. Used in two visible places: the active-state dot in the sidebar tree, and the small kicker labels on the homepage thread row. Swap a single `--color-accent` token to change globally. A skincare-neutral grayscale palette (drop the accent entirely) is also viable; DESIGN.md notes this trade-off.

### 7.2 Real imagery
Eighteen picsum placeholders. The visual identity of the homepage depends entirely on what photographs sit in the gallery. Replace with HEIKI HEIKI's product / brand / ingredient photography. Aspect ratios in code drive height variation; swap the URLs and keep the same ratios for layout stability, or adjust ratios per shot.

### 7.3 Söhne licensing
Currently rendering Inter Tight via `next/font`. Acquire Söhne (Klim, https://klim.co.nz/retail-fonts/soehne/) and self-host. Weights in use: 400, 500, 600. Update `--font-sans` in `globals.css` and add a `@font-face` declaration.

### 7.4 Per-leaf content
Each of the 17 placeholder routes needs real content. Suggested order:
1. `/ingredients` — likely the most-visited surface for distributors.
2. `/products/haircare` and `/products/body` index pages — a real catalogue layout.
3. Individual product pages (Shampoo, Conditioner, etc.) — one template, populated per SKU.
4. `/science`, `/visual-world`, `/in-media` — long-form content.

### 7.5 Accessibility audit
The build is semantic (real headings, landmarks, focus-visible, ARIA where needed, reduced-motion respected). Has not been tested with screen readers or against WCAG AA contrast in every state. Run an axe-core pass before launch.

### 7.6 Partner authentication
The brief is for a partner portal but no auth gate exists. If retail-confidential content lands on these surfaces, an auth layer (NextAuth, Clerk, or similar) is needed in front of `/products`, `/ingredients`, `/science`, depending on what's gated.

### 7.7 Search
A portal of this shape eventually needs search across products and ingredients. Not in current scope.

### 7.8 Mobile gallery
At ≤460px the masonry collapses to a single column. Worth testing whether a 2-up grid feels better on phones (Cosmos uses 2 cols on mobile). Quick CSS swap if so.

## 8. Branch state

```
Branch: claude/audit-heikiheiki-design-RCmAp
Latest:  a474bdf (Switch gallery to masonry grid)
Prior:   987c3ba (Scaffold HEIKI HEIKI Pro partner portal)
         828fdc4 (Seed DESIGN.md from apple.com benchmark)
         a2fac24 (Link impeccable and emil-design-eng skills to Claude Code)
         8f71703 (Add emil-design-eng skill)
         4e5b406 (Add impeccable skill)
```

To run locally:

```bash
git clone https://github.com/mateusz-heiki/heiki.git
cd heiki
git checkout claude/audit-heikiheiki-design-RCmAp
npm install
npm run dev
```

Then `http://localhost:3000`.

## 9. Where this documentation lives

- `DESIGN.md` — the design system spec (Stitch-format YAML frontmatter + prose).
- `.impeccable/design.json` — machine-readable sidecar with tonal ramps, motion tokens, and component HTML/CSS snippets for the live design panel.
- `docs/PROJECT.md` (this file) — the as-built snapshot.

The first two are normative for the design system; this file is descriptive of the current implementation. When they diverge, DESIGN.md wins on intent, code wins on what actually exists, and this document is updated to match.
