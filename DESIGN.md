---
name: "HEIKI HEIKI Pro"
description: "Professional partner portal: B2B for distributors, retail chains, brand partners."
colors:
  ink: "#1d1d1f"
  paper: "#f5f5f7"
  paper-pure: "#fbfbfd"
  tile-dark: "#161617"
  tile-mid: "#86868b"
  tile-faint: "#a1a1a6"
  rule: "#d2d2d7"
  rule-soft: "#e8e8ed"
  link: "#0066cc"
  accent: "#c44a2b"
typography:
  display:
    fontFamily: "\"Söhne\", \"Inter Tight\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 5.5vw, 5.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.014em"
  headline:
    fontFamily: "\"Söhne\", \"Inter Tight\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.5vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.012em"
  title:
    fontFamily: "\"Söhne\", \"Inter Tight\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.008em"
  body:
    fontFamily: "\"Söhne\", \"Inter Tight\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.002em"
  body-nav:
    fontFamily: "\"Söhne\", \"Inter Tight\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-0.002em"
  label:
    fontFamily: "\"Söhne\", \"Inter Tight\", \"Inter\", -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.04em"
rounded:
  sm: "6px"
  md: "12px"
  lg: "18px"
  pill: "980px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "90px"
  xxl: "120px"
  sidebar-width: "264px"
  sidebar-pad-y: "32px"
  sidebar-pad-x: "20px"
  tree-indent: "16px"
  tree-row-gap: "4px"
components:
  link-cta:
    textColor: "{colors.link}"
    typography: "{typography.body}"
  button-pill:
    backgroundColor: "{colors.link}"
    textColor: "{colors.paper-pure}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
    typography: "{typography.label}"
  button-pill-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-pure}"
  tile-light:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "120px 24px"
  tile-dark:
    backgroundColor: "{colors.tile-dark}"
    textColor: "{colors.paper-pure}"
    padding: "120px 24px"
---

# Design System: HEIKI HEIKI Pro

## 1. Overview

**Creative North Star: "A pharmacy archive that knows it's also a brand."**

HEIKI HEIKI Pro is a partner portal: distributors, retail chains, brand collaborators come here for product specs, ingredient research, brand reference, and press assets. The audience is professional, not consumer, so the surface earns its restraint differently than a DTC site would: there is real information to deliver, and the design has to make it findable without making it boring.

The chassis is a persistent left-sidebar category tree (logo top-left, tree below, indent rhythm reading as a quiet table of contents) on a paper canvas to the right. The homepage opens with a floating gallery as the "visual world" introduction: tiles drift on mouse-parallax, no hard grid, signaling brand atmosphere before the partner drills into specs. Deeper pages take a more structured posture (long-form, anchored, dense where the content earns it).

The discipline is Apple's: one type family with negative tracking, paper-tinted neutrals (never pure white), asymmetric tile rhythm, motion only where earned. The layout is not Apple's — apple.com has no sidebar. The reference anchors here are Aesop's wholesale portal, Helmut Lang's archive, and Bottega Veneta's press room: brand-grade visuals on a real navigation chassis.

What this system rejects: card grids of identical icons-and-headings, hero-metric blocks, gradient text, glassmorphism, scroll-jacked parallax, gray-on-color text, dashboard-aesthetic tropes, and anything that would make a partner say "this was put together quickly."

**Key Characteristics:**
- One typeface family, two weights (regular and semibold). Hierarchy through scale, not variety.
- Paper-tinted neutrals, never `#fff` or `#000`. Pure white reads as cheap.
- Section rhythm is asymmetric: tiles vary in height, padding, theme.
- Motion budget concentrated on detail pages; shell stays calm.
- CTAs are text links by default; buttons appear only where conversion friction is real.

## 2. Colors: The Paper-and-Ink Palette

A near-black on warm paper. One chromatic accent, used sparingly. Tiles flip light-and-dark within a single page.

### Primary
- **Ink** (`#1d1d1f` / `oklch(20.4% 0.002 286)`): Body text, headlines on light tiles, the dark tile background. Never pure black. The 2-point chroma toward neutral is the difference between premium and printer-cartridge.

### Secondary
- **Accent Persimmon** (`#c44a2b` / `oklch(53% 0.16 35)`): One accent, used on ≤10% of any surface. Active state on nav, important link emphasis, the single CTA on a hero tile. Replace this hue with your brand color before shipping; the discipline (single accent, sparse use, moderate saturation) is the lesson, not the specific persimmon.

### Tertiary
- **Link Blue** (`#0066cc` / `oklch(50% 0.15 246)`): Text-link CTAs (Apple's "Learn more >"). Distinct from Accent on purpose: link blue is utility, Accent is identity. Don't merge them.

### Neutral
- **Paper** (`#f5f5f7` / `oklch(96.5% 0.002 286)`): Default page background. Warm-tinted, not pure white. The reason the page feels expensive even before anything is on it.
- **Paper Pure** (`#fbfbfd` / `oklch(98.7% 0.002 286)`): One level brighter, for cards or tiles that need to lift off the page background by a hair.
- **Tile Dark** (`#161617` / `oklch(17.5% 0.002 286)`): Dark tile background. Slightly deeper than Ink so Ink-colored elements remain visible against it.
- **Tile Mid** (`#86868b` / `oklch(60% 0.003 286)`): Sub-headlines, secondary text, captions. The "supporting" gray.
- **Rule** (`#d2d2d7` / `oklch(86% 0.003 286)`): Hairlines, dividers, table rules. Never as a border on cards.

### Named Rules
**The Paper Rule.** Pure white (`#fff`) and pure black (`#000`) are prohibited site-wide. Every neutral carries a faint warm-cool tint (chroma 0.002–0.005). Even one pure-white panel breaks the system.

**The One Accent Rule.** Persimmon (or your replacement) appears on ≤10% of any visible surface. If a page has more than one bright accent moment, demote all but the most important to Ink or Link Blue.

**The Per-Tile Theme Rule.** Theme is decided per tile, not per page. A homepage with three tiles can be light-light-dark, light-dark-light, or all-light. Tiles choose their theme by what photography or color the product needs, not by a global toggle.

## 3. Typography

**Display Font:** Söhne (Klim Type Foundry), with `Inter Tight` / `Inter` / `-apple-system` / `BlinkMacSystemFont` / `system-ui` / `sans-serif` as the dev fallback stack.
**Body Font:** Söhne (same stack).

**Character:** One family throughout. Söhne is the production typeface (commercial license required from Klim before launch); Inter Tight and Inter are the unlicensed dev fallbacks that render until the Söhne files are deployed. The order matters: Inter Tight is closer to Söhne's metrics than Inter, so the dev preview reads correctly. Söhne carries Apple-tier discipline without being SF Pro or Inter; it has been adopted by Bloomberg, Mailchimp, and a long list of premium brand systems.

Söhne's metrics are tighter than Inter by design, so the negative tracking values are smaller than they'd be for Inter alone. Don't crank tracking further when Söhne ships.

### Hierarchy
- **Display** (semibold 600, `clamp(2.75rem, 5.5vw, 5.5rem)`, 1.05 line-height, -0.014em tracking): Hero headlines, one per page maximum.
- **Headline** (semibold 600, `clamp(2rem, 3.5vw, 3.25rem)`, 1.08, -0.012em): Section openers, tile headlines.
- **Title** (medium 500, 1.5rem, 1.2, -0.008em): Sub-headlines, card titles, group labels.
- **Body** (regular 400, 1.0625rem / 17px, 1.5, -0.002em): All prose. Cap line length at 65–75 characters (`max-width: 36rem`).
- **Body Nav** (regular 400, 0.9375rem / 15px, 1.4, -0.002em): Sidebar tree items. One notch denser than Body to give the navigation column more rhythm without breaking family voice.
- **Label** (medium 500, 0.75rem / 12px, 1.3, +0.04em tracking): Section labels in the sidebar, captions, metadata. Use uppercase for sidebar section labels only.

### Named Rules
**The Negative Tracking Rule.** Tracking is negative on every type role above 1.5rem. Values are calibrated for Söhne; if Söhne is unavailable and Inter is rendering, the tracking is approximately right but the type will read slightly looser. Ship Söhne before launch.

**The One Family Rule.** Söhne only. No serif display pairings, no mono accents, no script touches. Personality comes from weight and scale, not variety.

**The Line Length Rule.** Body text never exceeds 75ch. On large viewports, `max-width: 36rem` (≈576px) for prose blocks. Wider columns are unreadable regardless of font choice.

**The Inter Reflex Rule.** Inter is the dev fallback only. Never the production typeface. Inter has saturated AI-generated landing pages to the point of being the default reflex; using it as the final type voice signals "no font decision was made." Söhne, by contrast, costs money and time. The cost is the discipline.

## 4. Elevation

This system is flat at rest. No ambient shadows on cards or tiles. Depth comes from background-color contrast between tiles (the "Per-Tile Theme Rule"), not from elevation. Shadows appear only on transient states: dropdowns, popovers, hover-lifted elements that need to read as "in front."

### Shadow Vocabulary
- **Popover** (`box-shadow: 0 4px 16px oklch(20% 0 0 / 0.08), 0 1px 2px oklch(20% 0 0 / 0.04)`): Dropdowns, tooltips, anything floating above the page.
- **Hover lift** (`box-shadow: 0 8px 24px oklch(20% 0 0 / 0.06)`): Optional, applied with `transform: translateY(-2px)` to interactive cards on hover. Use sparingly; most things shouldn't lift.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. No card has a resting shadow. Shadows exist as a response (hover, focus, floating overlay), never as decoration.

## 5. Components

### Buttons

The system has two button forms: a **text link with chevron** (preferred, Apple's homepage default) and a **pill button** (use only when the action needs conversion weight).

#### Text Link CTA (preferred)
- **Style:** Link Blue text, body typography (1.0625rem / 17px), trailing `›` chevron with 0.25em left margin.
- **Hover:** Underline appears; color does not change.
- **Use for:** "Learn more," "See specs," "Read the article," and most homepage tile CTAs. Apple sells $4000 laptops with text links. Yours can do the same.

#### Pill Button
- **Shape:** Fully rounded (`border-radius: 980px` resolves to a pill at any height).
- **Primary:** Link Blue background, Paper Pure text, 12px × 22px padding, label typography (13px medium, +0.01em tracking — NOT uppercase).
- **Hover:** Background darkens to Ink. No transform, no shadow.
- **Use for:** "Buy," "Sign up," "Get started" — only the single most important action per page.

### Cards / Tiles

The system favors **tiles** (full-bleed sections with background color) over **cards** (bordered boxes on a page).

- **Tile background:** Paper, Paper Pure, or Tile Dark — chosen per-tile per the Per-Tile Theme Rule.
- **Tile padding:** 120px top/bottom on desktop (`spacing.xxl`), 64px on mobile. Generous vertical space is the system's primary atmosphere control.
- **Tile content max-width:** 980px, horizontally centered.
- **Shadow:** None. Border: None. Boundary is the background color change.

For times you do need a card (settings list, dashboard panel):
- **Corner Style:** 12px (`rounded.md`), 18px (`rounded.lg`) for larger cards.
- **Background:** Paper Pure on a Paper page; Tile Dark only if the surrounding context is darker.
- **Border:** 1px Rule, or nothing. Never a colored border. Never a left-side accent stripe.
- **Internal padding:** 24–48px depending on density.

### Inputs / Fields
- **Style:** 1px Rule border, transparent background, 12px radius, 12px × 16px padding, body typography. Label sits above the field, not inside it (no floating labels).
- **Focus:** Border shifts to Link Blue, plus a 3px Link Blue glow at 25% opacity (`box-shadow: 0 0 0 3px oklch(50% 0.15 246 / 0.25)`). No border-width changes; the layout must not shift.
- **Error:** Border shifts to Accent Persimmon. Error message appears below the field in Tile Mid, label-sized.

### Navigation — Left Sidebar (signature)

The persistent shell. 264px wide on desktop, scrolls independently of the main canvas.

- **Background:** Paper Pure on a Paper main canvas. The bar of differentiation is one shade, no shadow.
- **Right edge:** 1px Rule-Soft (`#e8e8ed`). Hairline, not a heavy divide.
- **Padding:** 32px vertical, 20px horizontal.
- **Logo:** Top-left, 32px tall, Ink color, 24px below the top edge.
- **Section labels:** Label typography (12px medium, +0.04em tracking, uppercase), Tile Faint color. 32px above the first row of the section, 12px below the label.
- **Tree row:** Body Nav typography (15px regular). 8px vertical padding, 0 horizontal (alignment is via indent, not padding). 4px between rows.
- **Indent:** 16px per level. Maximum two levels deep.
- **Default state:** Ink color, no background, no border.
- **Hover state:** Color shifts to Tile Mid (`#86868b`). 150ms ease-out. No background pill.
- **Active state:** Ink color. A 2px Accent dot to the left of the row (in the indent gutter), aligned to the row's baseline. The accent dot is the only chromatic touch in the sidebar.
- **Expand indicator:** A 9px chevron on the right of any expandable row. Rotates 90° when open. Tile Faint color.
- **Mobile (<834px):** Sidebar collapses to a hamburger in the top-left. Opens a full-height sheet from the left, slides in over the canvas, no backdrop blur (Per-Tile Theme Rule respected by giving the sheet a Paper Pure background, not a transparent overlay).

### Navigation — Top Bar (when present)
Not used on this portal's primary shell. Reserved for future per-section toolbars (filter, search, view-toggle) that anchor 60px under the top edge of the main canvas.

### Tile (signature component)

The defining component for content tiles inside the main canvas. A `<section>` with:
- Full canvas width (excludes sidebar), generous vertical padding (`xxl` desktop, `lg` mobile)
- One headline (Display or Headline scale)
- One sub-headline (Title scale, Tile Mid color)
- One or two text-link CTAs OR one pill button
- An image OR a video OR a chromatic background — never all three
- Centered alignment for hero tiles, left-aligned for content tiles in the portal context (the sidebar already anchors the left edge of the page)
- No surrounding container, no card border, no shadow

### Floating Gallery (homepage signature)

The homepage hero. A contained viewport (~70vh on desktop, full canvas width) populated with 15–20 image tiles in a clustered freeform layout.

- **No grid.** Tiles overlap and breathe, varied sizes (200–420px wide), portrait and square ratios mixed.
- **Continuous gentle drift:** each tile floats on a slow individual sine wave (period 8–14s, amplitude 6–14px). Phases offset so the field never appears to pulse.
- **Mouse-parallax:** each tile has a depth value (0.15–1.0). Mouse offset is multiplied by depth and applied as a translate. Hero tiles drift more, background tiles drift less.
- **Hover:** tile under cursor lifts 4px and casts a Popover shadow. Other tiles fade to 65% opacity.
- **No drag, no zoom, no scroll-hijack.** The lighter cousin of Cosmos.so's canvas: alive, but never blocking the scroll.
- **Reduced motion:** disable the float and the parallax. Static layout with hover-lift only.
- **Imagery rotation:** swap content per visit if practical (different seed → different photograph clustering). Otherwise hand-curate the set as part of the brand surface.

## 6. Do's and Don'ts

### Do:
- **Do** vary tile heights and themes. A page of seven equal-height tiles is a catalog, not a story.
- **Do** apply negative tracking to every type role above 1.5rem (-0.012em to -0.022em depending on size).
- **Do** use Paper (`#f5f5f7`), never pure white.
- **Do** prefer text-link CTAs (`Learn more ›`) over buttons on marketing surfaces.
- **Do** keep the navigation bar at one weight, one color, no decoration.
- **Do** spend the motion budget on detail pages; keep the shell calm.
- **Do** let the background color be the tile boundary; no borders, no shadows on tiles.

### Don't:
- **Don't** use `#fff` or `#000` anywhere. Always Paper / Ink.
- **Don't** apply `background-clip: text` to a gradient. Solid color, weight contrast for emphasis.
- **Don't** put icon-headline-text cards in a grid of four or six. Each tile is one product story.
- **Don't** use ambient shadows on resting elements. Flat by default.
- **Don't** use `border-left` greater than 1px as a colored accent stripe on cards, alerts, or callouts. Use a tinted full background or a leading icon instead.
- **Don't** layer glassmorphism (backdrop-filter blur) decoratively. Reserve for genuinely-floating overlays, if at all.
- **Don't** introduce a second typeface family. Inter is the system. Weight and scale carry hierarchy.
- **Don't** use Accent Persimmon on more than 10% of a visible surface. If you find yourself wanting more accent, you need fewer competing elements, not more accent.
- **Don't** scroll-jack. No pinned-and-stuck heroes. No forced animation sequences gated by scroll position.
- **Don't** use em dashes in copy. Commas, colons, parentheses, periods.
