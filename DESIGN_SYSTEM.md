# Logi8173 — Design System

Living document. Every UI component must conform to these rules. Updated as the app evolves.

---

## Brand Identity

- **Name**: Logi8173
- **Logo**: Battalion 8173 emblem (sword + mountains shield)
- **Tagline**: ניהול לוגיסטיקה דיגיטלית
- **Language**: Hebrew RTL throughout
- **Tone**: Clean, professional, trustworthy — not military-green camo, not startup-flashy

---

## Color Palette

Source of truth: `src/theme/foundation/colors.ts`

### Primary — Forest (deep mountain green, drawn from the battalion logo)

| Scale | Hex | Usage |
|-------|-----|-------|
| `forest.50` | #eaf2ed | Lightest tint |
| `forest.100` | #d4e5d8 | Active nav background (light), subtle fills |
| `forest.200` | #a8c9b0 | |
| `forest.300` | #6fa079 | Primary border, focus ring |
| `forest.400` | #4f8659 | **Primary surface in dark mode** |
| `forest.500` | #3c6e45 | **Primary surface in light mode / main brand** |
| `forest.600` | #2F6B45 | Pulled directly from the logo |
| `forest.700` | #224d32 | Active nav text, emphasis (light) |
| `forest.800` | #173724 | Active nav background (dark) |
| `forest.900` | #0e2217 | Darkest shade |

Use the semantic `primary` palette (`colorPalette="primary"`) instead of hardcoded forest shades whenever possible — `primary` automatically swaps to a red scale in combat mode.

### Danger — Rose (soft red)

Main: `rose.300` (#E9A6A6). Full scale in `colors.ts`.

### Info — Sky Blue

Main: `sky.300` (#A0C4FF). Full scale in `colors.ts`.

### Neutrals — Gray

| Scale | Hex | Usage |
|-------|-----|-------|
| `gray.50` | #F8F9FB | App background (light) |
| `gray.100` | #F0F4F8 | Muted backgrounds |
| `gray.200` | #E4E9ED | Borders, dividers |
| `gray.500` | #747A85 | Secondary text |
| `gray.800` | #333C4D | Cards (dark mode) |
| `gray.900` | #16171A | Primary text / background (dark) |

### Status Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| Success | `green.600` | #19BE65 | Stock OK, activity closed |
| Warning | `yellow.600` | #FDA828 | Low stock, pending |
| Error | `red.600` | #F92457 | Shortages, errors (distinct from rose) |

### Semantic Tokens (three modes: Light / Dark / Combat)

| Token | Light | Dark | Combat |
|-------|-------|------|--------|
| `bg` | `#F8F9FB` | `#0f1113` | `#0a0000` |
| `bg.card` | `white` | `#181b1f` | `#140404` |
| `bg.muted` | `gray.100` | `#23272c` | `#1c0707` |
| `fg` | `gray.900` | `#eef1f3` | `#ff3838` |
| `fg.muted` | `gray.500` | `#98a0ab` | `#a62020` |
| `fg.onPrimary` | `white` | `#0a0d0f` | `#0a0000` |
| `border` | `gray.200` | `#2a2f35` | `#3a0a0a` |
| `border.focus` | `forest.400` | `forest.300` | `#7a1414` |
| `primary` | `forest.500` | `forest.400` | `#ff2a2a` |
| `interactive` | `forest.500` | `forest.400` | `#ff2a2a` |
| `interactive.hover` | `forest.600` | `forest.300` | `#ff5c5c` |
| `surface.selected` | `forest.100` | `forest.800` | `#2a0707` |
| `success` | `green.600` | `green.600` | `#ff6666` |
| `warning` | `yellow.600` | `yellow.600` | `#ff8c8c` |
| `error` | `red.600` | `red.600` | `#ff2020` |

**Chakra conditions mapping** (see `src/theme/index.ts`):

```ts
conditions: {
  light:  '[data-theme="light"] &',
  dark:   '[data-theme="dark"] &, [data-theme="combat"] &',  // combat inherits dark
  combat: '[data-theme="combat"] &',                         // layered overrides
}
```

Combat only defines overrides on top of dark — every token without an explicit `_combat` value falls through to the dark value automatically.

### Semantic `primary` Color Palette

`colorPalette="primary"` on Chakra components (Button, Badge, etc.) resolves to forest shades in light/dark and to a red scale in combat. Prefer this over `colorPalette="forest"` so combat mode works correctly.

| Shade | Light / Dark | Combat |
|-------|-------|--------|
| 100 | `forest.100` | `#ff8080` |
| 300 | `forest.300` | `#ff3838` |
| 500 | `forest.500` | `#ff2020` |
| 700 | `forest.700` | `#7a1414` |
| 900 | `forest.900` | `#3a0a0a` |

`primary.contrast` flips between `#ffffff` (light), `#0a0d0f` (dark — forest.400 is bright enough that white text misses WCAG), and `#0a0000` (combat). Chakra picks this automatically for solid button variants.

### Forbidden

- No raw hex values in components — always use theme tokens
- No new colors without updating this document
- No opacity hacks for creating color variants — use the scale

---

## Typography

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| `2xl` | 24px | 700 | Page titles (לוח בקרה, מלאי) |
| `xl` | 20px | 600 | Section headings |
| `lg` | 18px | 600 | Card titles, dialog titles |
| `md` | 16px | 400 | Body text (default) |
| `sm` | 14px | 400 | Secondary text, table cells, nav items |
| `xs` | 12px | 400 | Badges, timestamps, helper text |

### Rules

- Always use `textStyle` prop — never raw `fontSize`
- Font: **Heebo** (Hebrew-optimized, loaded from Google Fonts) — NOT Inter
- `fontWeight="600"` for headings, `"400"` for body
- No `fontWeight="bold"` — use `"600"` or `"700"` explicitly
- `xs` (12px) — **never for critical/operational text** (field conditions). Use `sm` as minimum for actionable content

---

## Spacing

All spacing uses Chakra's scale tokens (multiples of 4px):

| Token | Pixels | Usage |
|-------|--------|-------|
| `1` | 4px | Tight gaps (icon to text) |
| `2` | 8px | Compact internal padding |
| `3` | 12px | Nav item padding, small gaps |
| `4` | 16px | Standard gap, card padding (mobile) |
| `6` | 24px | Card padding (desktop), section gaps |
| `8` | 32px | Page padding, major section spacing |
| `10` | 40px | Large section separators |

### Rules

- Never use raw pixel values — always Chakra tokens
- Mobile padding: `4` (16px)
- Desktop padding: `6` (24px)
- Consistent gap in flex/stack: `4` for compact, `6` for spacious

---

## Layout

### Breakpoints

| Name | Min Width | Usage |
|------|----------|-------|
| `base` | 0px | Mobile — single column, no sidebar |
| `md` | 768px | Tablet — sidebar appears |
| `lg` | 1024px | Desktop — full layout |

### App Shell

```
┌─────────────────────────────────────┐
│ Header: logo + title + user avatar  │
├──────────┬──────────────────────────┤
│ Sidebar  │ Main content             │
│ (≥md)    │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

- Header: fixed height, `borderBottomWidth="1px"`
- Sidebar: `w="200px"`, hidden on mobile (`display={{ base: "none", md: "flex" }}`)
- Main: `flex="1"`, `p="6"`, `overflowY="auto"`

### Mobile Navigation

- Bottom tab bar on mobile (future)
- Currently: hamburger menu or direct navigation

---

## Components

### Buttons

| Variant | Usage | Props |
|---------|-------|-------|
| Primary | Main actions (שמור, הנפק, התחבר) | `colorPalette="primary"` variant `"solid"` |
| Secondary | Secondary actions (ביטול, חזרה) | `variant="outline"` |
| Danger | Destructive actions (מחק, סגור פעילות) | `colorPalette="red"` variant `"solid"` |
| Ghost | Subtle actions (סינון, עוד) | `variant="ghost"` |

Prefer `bg="interactive"` + `color="fg.onPrimary"` + `_hover={{ bg: "interactive.hover" }}` over hardcoded `forest.*` shades — both tokens adapt to combat mode automatically.

### Cards

- Background: `bg.surface` (white / gray.800)
- Border: `borderWidth="1px"` `borderColor="border.muted"`
- Radius: `borderRadius="lg"` (8px)
- Padding: `p="4"` mobile, `p="6"` desktop
- Shadow: `shadow="sm"` for elevated cards

### Tables

- Use Chakra's grid-based table pattern with `role="table"`
- Header: `fontWeight="600"`, `textStyle="sm"`, `color="fg.muted"`
- Rows: `borderBottomWidth="1px"`, hover with `bg="bg.subtle"`
- Cell padding: `py="3"` `px="4"`

### Forms

- Labels: `fontWeight="500"`, `textStyle="sm"`
- Inputs: Chakra `Input` with `size="md"`
- Validation errors: `color="red.500"`, `textStyle="xs"`, shown below input
- Required fields: asterisk in label

### Badges / Status Pills

| Status | Colors |
|--------|--------|
| פעיל (active) | `colorPalette="green"` |
| טיוטה (draft) | `colorPalette="gray"` |
| סגור (closed) | `colorPalette="blue"` |
| חוסר (shortage) | `colorPalette="red"` |
| ממתין (pending) | `colorPalette="yellow"` |

### Empty States

- Centered in container
- Icon (optional) + heading + description
- Primary action button if applicable
- Example: "אין פריטים במלאי" + כפתור "הוסף פריט ראשון"

### Loading States

- Full page: centered spinner with app logo
- Section: `Spinner` centered in section area
- Table: skeleton rows

---

## Icons

- Source: `react-icons/md` (Material Design)
- Wrap with Chakra's `Icon` component
- Size: `boxSize="5"` (20px) default, `"4"` for compact

---

## Shadows

| Token | Usage |
|-------|-------|
| `shadow="sm"` | Cards, dropdowns |
| `shadow="md"` | Modals, dialogs |
| `shadow="lg"` | Floating elements |

---

## Toasts & Notifications

| Type | Pattern | Duration |
|------|---------|----------|
| Success | Toast (transient) | 3s auto-dismiss |
| Info | Toast (transient) | 5s auto-dismiss |
| Error | Inline alert or banner — NOT toast | Persistent until dismissed |
| Offline | Banner at top of page | Persistent until reconnected |

### Rules
- Toasts for transient confirmations only ("הפריט נשמר", "הנפקה בוצעה")
- Errors and destructive outcomes use inline alerts — users must acknowledge
- Offline state uses a sticky banner, not a toast

---

## Mobile Field Use

- **Touch targets**: minimum 44x44px for all interactive elements
- **Sunlight readability**: high-contrast focus/pressed states
- **One-hand operation**: primary actions at bottom of screen (sticky action bar)
- **Numeric keypad**: use `inputMode="numeric"` for count fields and personal IDs
- **Signature capture**: minimum canvas height 200px, clear/save buttons, "אני מאשר" confirmation
- **Offline awareness**: banner when offline, queue actions for retry (V2)

---

## Confirmation & Destructive Flows

- Destructive actions (delete, close activity) require confirmation dialog
- Dialog: title + explanation + two buttons (cancel + confirm with `colorPalette="red"`)
- Non-destructive confirmations: inline feedback (toast)

---

## RTL Considerations

- `dir="rtl"` set on `<html>` — Chakra handles the rest
- Use `borderInlineEndWidth` not `borderRightWidth`
- Use `ps` / `pe` (padding-inline-start/end) when directional padding is needed
- Use `textAlign="start"` not `textAlign="right"`
- Icons that imply direction (arrows, back/forward) must flip in RTL
- Logical border radii where relevant (`borderStartRadius`, `borderEndRadius`)

---

## Color Modes

Three user-selectable modes controlled by a toggle in the header:

| Mode | Intent | Primary | Background |
|------|--------|---------|------------|
| **Light** | Day / office use | Forest green | Near-white |
| **Dark** | Evening / battery saver | Forest green (brighter) | Near-black, neutral |
| **Combat** | Night field use, preserves night vision | Red | Pure black |

### Rules

- Choice is persisted to `localStorage` under `logi8173_color_mode`. Default is Light.
- `useColorMode()` is a shared store — every consumer sees the same mode and re-renders on change.
- An inline script in `index.html` writes `<html data-theme="…">` before React hydrates (no flash on reload).
- Every new semantic token must define light + dark values. Combat overrides are optional — they inherit dark through the shared `_dark` condition.
- In combat, status colors (`success`, `warning`, `error`, `rose`, `sky`) all collapse to red shades. Never rely on color alone to communicate meaning — always pair with an icon or explicit label.
- Activity border color (header top border) keeps its OKLCh-generated per-activity color in every mode — this is the one exception, preserved so operators can still tell activities apart visually.
- Signature canvas (`SignatureCanvas`) and saved signature rendering (`SignatureImage`) adapt pen/background colors to the current mode. Saved SVGs are sanitized (`<path>`-only whitelist) and re-stroked with `currentColor` so the same stored signature reads correctly in any mode.

---

## Accessibility

- Touch targets: minimum 44px on mobile
- `aria-label` on icon-only buttons
- `role="table"` / `role="row"` / `role="cell"` on grid-based tables
- Keyboard navigation support (Tab, Enter, Space)
- Color contrast: WCAG AA minimum (4.5:1 for body text, 3:1 for large text/icons/focus rings)
- `primary` is accent only — never use as body text color (contrast risk)
- Validated pairings in each mode: contrast ≥ 13:1 on `bg.card` + `fg` in dark, ≥ 4.8:1 on `bg.card` + `fg` in combat (both pass WCAG AA)
- In combat, status colors all shift to red — pair every status signal with an icon or text so meaning isn't color-only

---

## Layout Patterns

### Bento Box Dashboard
Dashboard uses an iOS-widget-inspired Bento grid layout:
- Cards in varying sizes (1-col, 2-col, 3-col spans)
- Hierarchical sizing: most important stat gets the biggest card
- `borderRadius="2xl"`, `padding="6"`, generous white space
- Each card has a colored icon tint matching its semantic meaning

### Tables (Desktop) / Cards (Mobile)
- Desktop (≥md): CSS Grid table with sortable column headers
- Mobile (<md): stacked cards with key info at a glance
- Both layouts use the same data source and filters
- Sort headers: `SortableHeader` component with asc/desc/neutral arrow icons

### Page Layout
- Main content: `maxW="1200px"`, `padding: 8` (desktop), `padding: 4` (mobile)
- `pb: 24` on mobile for bottom nav clearance
- Consistent `PageHeader` component on all pages (title + description)

---

## Micro-Animations

Source: `src/theme/animations.ts` — pure CSS, zero dependencies

| Animation | Usage | Duration |
|-----------|-------|----------|
| `fadeInUp` | Page sections, headers on load | 0.4s ease |
| `scaleIn` | Empty state appearance | 0.3s ease |
| `cardHover` | Cards lift on hover/tap | 0.2s cubic-bezier |
| `listItem(index)` | Staggered cascade for lists | 0.4s + 0.05s × index |
| `pulse` | "Gap" status badge (draws attention) | 2s infinite |

### Principles
- Every interactive element has a transition (min 0.15s)
- Cards: `translateY(-2px)` + shadow on hover
- Table rows: subtle `scale(1.005)` on hover
- Staggered entrance: items appear one by one, 50ms apart
- Icon hover: `scale(1.1) rotate(-5deg)` on stat card icons

---

## Shared Components

Source: `src/components/`

| Component | Purpose | Props |
|-----------|---------|-------|
| `PageHeader` | Page title + description | `title`, `description?` |
| `StatCard` | Bento stat card with icon + number | `icon`, `value`, `label`, `color?`, `bgTint?`, `index?` |
| `SearchInput` | Debounced search with clear button | `placeholder`, `onSearch` |
| `FilterSelect` | Chakra NativeSelect dropdown | `label`, `value`, `options`, `onChange` |
| `SortableHeader` | Clickable column header with arrows | `label`, `sortKey`, `currentSort`, `onSort` |
| `StatusBadge` | Colored pill with icon for item status | `status`, `label` |
| `EmptyState` | No-data state with icon + CTA | `icon?`, `title`, `description?`, `actionLabel?`, `onAction?` |
| `ErrorBanner` | Modal overlay for errors | `message`, `onDismiss` |
| `UserAvatar` | Google avatar with initial fallback | `name`, `avatarUrl`, `size?` |

---

## Navigation

### Desktop (≥md)
- Sidebar: 200px wide, `bg.card` background (adapts per mode)
- Active: `surface.selected` background, `interactive` text, orange indicator bar (`sunburst.400`) on inline-start
- CSS transitions on all states

### Mobile (<md)
- Floating bottom nav bar: `forest.800` background (`#173724`), `borderRadius="2xl"`, side margins
- Active: `forest.600` pill with white icon + label, orange top indicator
- Inactive: `fg.muted` icons, no label
- Label appears with CSS `max-width` + `opacity` transition (no DOM add/remove)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-04-04 | Initial design system created |
| 2026-04-04 | Added: toasts, mobile field use, confirmation flows, RTL textAlign/radii, contrast rules (Codex review) |
| 2026-04-04 | Replaced color palette: brand.* → sage/rose/sky. Added semantic tokens (bg, bg.card, bg.muted, fg, border). Source of truth: `src/theme/` |
| 2026-04-04 | Switched font from Inter to Heebo (Hebrew-optimized). Added interactive/focus/disabled tokens. xs restricted from critical text (Gemini review) |
| 2026-04-05 | Phase 2: Bento Box dashboard, micro-animations system, shared components library, table/card responsive pattern, navigation design (desktop sidebar + mobile floating bar) |
| 2026-04-24 | Phase 3 (Epic #86 stage 1): replaced sage with Forest palette, added three color modes (Light / Dark / Combat), new semantic `primary` palette with `_combat` overrides, ThemeToggle in header, FOUC-prevention inline script, SignatureImage/SignatureCanvas adapt to mode |
