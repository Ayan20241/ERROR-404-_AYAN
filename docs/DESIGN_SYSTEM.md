# Design System

> **Prime directive:** This product must not look like a generic template or "classic" CRUD UI. It should feel like a premium city-guide magazine crossed with a modern ticketing platform — bold type, poster-first event cards, rich imagery, and a small number of signature moments. Every screen should be recognizably *this* product within two seconds.

## 1. Design Direction

**Style:** Editorial premium — oversized display typography, warm paper background, deep ink text, one vivid accent system, dark cinematic sections for contrast.
**Mood:** Energetic, local, alive. "The city is buzzing tonight" — not "enterprise dashboard."
**Design Principles:**

- **Poster first.** Events are visual products. Imagery and typography carry the card; metadata supports.
- **One hero per screen.** Every page has a single dominant element (headline, map, or featured event). Everything else steps back.
- **Ink + accent discipline.** Most of the UI is warm neutrals; the coral-to-violet gradient is reserved for moments that matter: SmartMatch, primary CTAs, live indicators.
- **Dense but breathable.** Rich information, generous spacing, no clutter. Never a wall of identical grey boxes.
- **Motion with intent.** Subtle, fast, purposeful transitions (card lift, sheet slide, pill morph). No decorative animation that slows the demo or hurts performance.

## 2. Brand

**Brand Name:** Hyperlocal Events (working title)
**Logo:** Wordmark in Bricolage Grotesque Bold, tight tracking; the "o" in "Local" may be replaced by a map-pin dot in accent coral in the full lockup. Keep a plain-text fallback.
**Brand Voice:** Warm, local, a little playful. Short sentences. ("Happening near you", "2.4 km away", "Almost full".) Never corporate, never hype-y, never fake statistics.

## 3. Color Palette

| Token | Hex | Usage |
|---|---|---|
| Background (paper) | `#FBFAF6` | App background, light sections |
| Surface | `#FFFFFF` | Cards, sheets, modals |
| Ink (primary text) | `#12100C` | Headlines, body text |
| Muted text | `#6E675C` | Secondary text, metadata |
| Border | `#E9E3D8` | Hairlines on light surfaces |
| Accent coral (primary) | `#FF4A1C` | Primary CTAs, live indicators, key highlights |
| Accent violet | `#6C4CF1` | Focus rings, SmartMatch secondary, links |
| Accent amber | `#FFB03A` | Gradient midpoint, ratings, warnings accent |
| Signature gradient | `#FF4A1C → #FFB03A → #6C4CF1` | SmartMatch pills/rings, hero accents, score visuals — use sparingly |
| Dark section bg | `#0F0E11` | Hero bands, footer, map overlay panels |
| Dark section text | `#F5F1E8` | Text on dark |
| Success | `#0E9F6E` | Confirmations, "Registered" states |
| Warning | `#D97706` | "Almost full", deadlines |
| Error | `#DC2626` | Errors, destructive actions |

**Contrast rules:** Body text is always Ink on Paper or Paper on Dark (both pass WCAG AA). Coral is for large/bold elements and CTAs with white bold text; never small body text on white. Category chips use their own hues only as small accents with ink text.

**Category accent hues** (chips, map pins, calendar dots): Technology `#2563EB`, Music `#DB2777`, Food `#EA580C`, Sports `#059669`, Arts & Culture `#7C3AED`, Business `#0F766E`, Education `#B45309`, Community `#4D7C0F`, Health `#0891B2`, Other `#6E675C`.

## 4. Typography

**Display / Heading Font:** Bricolage Grotesque (Google Fonts, free) — distinctive grotesque with real character; used for headlines, event titles, numbers.
**Body / UI Font:** Manrope (Google Fonts, free) — warm, geometric, highly legible.

| Style | Spec |
|---|---|
| Display (hero) | Bricolage 64–80px / 700 / line-height 0.95 / tracking -0.02em |
| H1 | Bricolage 40px / 700 / 1.05 |
| H2 | Bricolage 30px / 650 / 1.15 |
| H3 | Bricolage 22px / 600 / 1.25 |
| Event title (card) | Bricolage 19px / 600 / 1.25 |
| Body | Manrope 16px / 500 / 1.55 |
| Small / metadata | Manrope 13px / 600 / 1.4 (uppercase micro-labels: 11px, tracking 0.08em) |

Numbers (distances, prices, scores) always in Bricolage for a distinctive tabular feel.

## 5. Spacing

**Base Unit:** 4px
**Scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96
**Page gutters:** 20px mobile, 32px tablet, 48px desktop; max content width 1280px (discovery may go full-bleed for the map split view).

## 6. Border Radius

- Small (chips, inputs): 12px
- Medium (buttons): 14px
- Large (cards): 20px
- Hero / sheets: 28px
- Pill (SmartMatch pill, tags, nav location pill): 999px

Squared-off corners are banned except on full-bleed images inside cards (top corners inherit the card radius).

## 7. Shadows

- Small: `0 1px 2px rgba(18,16,12,.05), 0 2px 8px rgba(18,16,12,.05)`
- Card hover: `0 12px 32px -8px rgba(18,16,12,.18)`
- CTA glow (primary buttons only): `0 8px 24px -6px rgba(255,74,28,.45)`
- Sheets/modals: `0 24px 64px -16px rgba(18,16,12,.30)`

## 8. Buttons

- **Primary:** Ink background (`#12100C`), paper text, pill or 14px radius, Manrope 700. On dark sections, primary is coral with the CTA glow. Hover: lift 1px + shadow deepens.
- **Accent (SmartMatch contexts):** signature gradient background, white bold text.
- **Secondary:** Surface background, 1px Border, Ink text.
- **Danger:** Error background, white text — only for destructive confirmations.
- **Disabled:** 40% opacity, no shadow, `cursor: not-allowed`.
- **Loading:** Label replaced by spinner + short verb ("Registering…"); width must not jump.

## 9. Inputs

- **Default:** Surface bg, 1px Border, 12px radius, 44px min height, Ink text.
- **Focus:** 2px violet ring (offset 2px), border becomes transparent.
- **Error:** Error border + error message text below in Error color.
- **Disabled:** Paper bg, muted text.
- **Placeholder:** Muted text, sentence case, example-driven ("Search hackathons, concerts…").
- Search and filter controls live in a **sticky glass filter bar** (backdrop-blur, paper at 80% opacity) — a signature element, not a plain form row.

## 10. Cards

**Event card (signature component):** Surface bg, 20px radius, small shadow; poster image area (4:3) with:
- floating **date badge** (top-left, Surface pill: "SAT 24" + month),
- **SmartMatch pill** (top-right, gradient, only when scored: "92% match"),
- **price chip** (bottom-left on image: "Free" or "₹299").
Below: category micro-label (accent hue), Bricolage title (2-line clamp), venue + distance line with icons, time line, footer row: spots-left indicator ("Almost full" in Warning) + Save bookmark button.
**Hover (desktop):** lift + image scale 1.04, shadow to card-hover. **Whole card is the link** except Save/Register buttons.
**Featured card:** horizontal, 2× width in the feed grid, dark overlay with Paper text — used for the top SmartMatch pick.

## 11. Navigation

- **Header:** slim, glass (paper 85% + blur), logo left; center: location pill (pin icon + area name + radius); right: Search icon, Notifications bell with unread dot, avatar menu. Organizer link appears for organizer role.
- **Mobile navigation:** bottom bar with 5 items (Discover, Map, Saved, My Events, Profile) — Lucide icons + labels, active item in coral.
- **Discovery layout:** hero band (dark, oversized display type + live ticker of trending categories) → "For You" rail (horizontal scroll of scored cards) → filter bar (sticky) → results grid or map/list split.

## 12. States

- **Loading:** skeleton cards that mirror the real card layout (image block + lines), shimmer animation; never a bare spinner for content areas.
- **Empty:** large Lucide icon in a tinted circle, one-line explanation, one clear CTA ("Widen your radius", "Clear filters", "Create the first event").
- **Error:** inline panel with what happened + retry action; toast for transient action failures.
- **Success:** toast (Ink bg, Paper text, check icon) + the affected UI updates immediately (e.g., button becomes "Registered ✓").
- **Disabled:** as §8/§9.

## 13. Icons

**Library:** Lucide React. **Default size:** 20px (16px in chips, 24px in bottom nav). **Style:** outline, 1.8px stroke, round caps. No emoji as UI icons. Map pins: custom div markers in category hues with a white glyph.

## 14. Responsive Design

- **Mobile (<640px):** single column; map/list toggle is a floating segmented control; bottom nav visible; hero type scales to 44px.
- **Tablet (640–1024px):** 2-column card grid; header nav condensed.
- **Desktop (>1024px):** 3-column grid; map view is a 55/45 split (list scrolls, map sticky); max width 1280px except split view.
- Touch targets ≥ 44px everywhere. No horizontal page scroll at any breakpoint.

## 15. Accessibility

- Semantic HTML (`main`, `nav`, `article` for cards, real `button`/`a`).
- Contrast per §3; never communicate by color alone (match pill has % text; "Almost full" is text, not just color).
- Full keyboard navigation; visible focus states (violet ring) on every interactive element.
- Accessible labels on icon-only buttons; `aria-live` for toast announcements.
- Map is never the only way to reach an event — list view parity is mandatory.
- Respect `prefers-reduced-motion`: disable lift/zoom transitions.

## 16. Signature moments (what makes this UI *not* classic)

1. **Dark editorial hero** with oversized Bricolage headline and a scrolling ticker of trending categories.
2. **SmartMatch pill + reason line** on cards ("92% match — matches your AI interest · 2.4 km away · within budget") — personalization made visible.
3. **Poster-first cards** with floating date badges and price chips, not table-like rows.
4. **Sticky glass filter bar** and **map/list split view** with category-colored pins.
5. **Match score ring** on the event detail page (SVG ring in the signature gradient) with the full explanation breakdown.


## 17. Development acceptance rules

Every P0 screen must be implemented with the same visual system and must include the relevant states below; these are acceptance criteria, not optional polish:

- **Discovery:** loading skeleton, populated results, no results with a clear recovery action, and retryable error state. Filters must remain usable on mobile.
- **Event detail:** visible date/time with timezone clarity, venue/location, price, capacity/availability, organizer identity, and a registration action whose disabled/loading/success/error states are explicit.
- **Forms:** labels are visible, validation messages are adjacent to the field, errors are announced accessibly, and submitted values are preserved when safe to do so.
- **Authentication:** show pending state during submission; do not reveal whether an unrelated email belongs to an account beyond the provider's intended behavior.
- **Organizer dashboard:** distinguish draft/published/cancelled/completed status; charts must reflect real database values and include an empty state when no data exists.
- **Notifications:** unread/read states must be distinguishable without color alone.
- **Map:** map failure must never block event discovery; provide a working list fallback and attribution for the selected map style/tile provider.
- **Responsive behavior:** test at narrow mobile width (~360 px), tablet, and desktop; no horizontal page overflow, clipped primary actions, or hover-only interactions.
- **Accessibility:** all actions work by keyboard, focus is visible, images have useful alt text (or empty alt when decorative), controls have accessible names, and status is not conveyed by color alone. Respect reduced-motion preferences.
- **Performance:** load map code only when needed; lazy-load below-the-fold imagery; avoid large decorative animation and layout shifts.

Use design tokens for every color, radius, shadow, and spacing decision. If a needed token is missing, add it here first rather than inventing a one-off value in a component.
