---
name: ui-design
description: UI design patterns and component guidelines for Logi8173. Use when creating or modifying any UI component, page layout, or visual element.
trigger: when writing JSX, creating components, building pages, or making design decisions
---

# UI Design — Logi8173

## Before writing any component

1. **Read `DESIGN_SYSTEM.md`** at project root — single source of truth
2. **Check `src/components/`** for existing shared components
3. **Mobile first** — start with mobile layout, then expand for desktop
4. **Use `src/theme/animations.ts`** for all motion — never create inline keyframes

## Component Creation Checklist

- [ ] Chakra UI components only (no native HTML tags)
- [ ] Theme tokens for colors, spacing, shadows (no raw hex/px)
- [ ] `textStyle` for typography (no raw `fontSize`)
- [ ] RTL-safe: `ps`/`pe`, `start`/`end`, `borderInlineEndWidth`
- [ ] Semantic tokens for light/dark mode (`bg`, `fg`, `border`)
- [ ] Touch targets ≥ 44px on interactive elements
- [ ] Hebrew text via `t()` from `src/lib/i18n`
- [ ] One component per file, types at bottom
- [ ] Micro-animation on interactive elements (cardHover, listItem)

## Design Tokens Quick Reference

| Purpose | Token |
|---------|-------|
| Page background | `bg` |
| Card/surface | `bg.card` |
| Hover/subtle background | `bg.muted` |
| Primary text | `fg` |
| Secondary text | `fg.muted` |
| Borders | `border` |
| Focus ring | `border.focus` |
| Error border | `border.error` |

### Brand Colors

| Color | Usage |
|-------|-------|
| `sage.50`–`sage.900` | Primary brand (from logo shield) |
| `sunburst.300`–`sunburst.500` | Accent/indicator (from logo sunburst) |
| `sky.50`–`sky.900` | Info, secondary accent |
| `rose.50`–`rose.900` | Soft danger |
| `green.600` | Success |
| `yellow.600` | Warning |
| `red.600` | Error |

## Layout Patterns

### Page Structure
```
<Flex direction="column" gap={{ base: "5", md: "7" }}>
  <PageHeader title={t("page.title")} description={t("page.description")} />
  {/* filters */}
  {/* content */}
</Flex>
```
- Main content area: `maxW="1200px"`, `p={{ base: "4", md: "8" }}`
- Bottom padding on mobile: `pb="24"` (for floating bottom nav clearance)
- Always use `PageHeader` component for page titles — consistent across all pages

### Bento Card (Dashboard)
```
<Box
  bg="bg.card"
  borderRadius="2xl"
  borderWidth="1px"
  borderColor="border"
  p={{ base: "4", md: "5" }}
  css={{ ...animations.cardHover, ...animations.listItem(index) }}
>
```
- `borderRadius="2xl"` — iOS widget feel
- `p="5"` or `p="6"` — generous padding
- `cardHover` animation on all cards

### Stat Card (VetCRM style)
```
┌─────────────────────┐
│ Label          Icon  │
│                      │
│ BIG NUMBER           │
│                      │
│ View link >          │
└─────────────────────┘
```
- Label top-right, icon top-left (RTL)
- Number: `size="3xl"`, `fontWeight="700"`, colored
- Link at bottom: `textStyle="xs"`, `color="fg.muted"`, chevron icon
- Each card has unique color + tinted icon background

### Table (Desktop) → Cards (Mobile)
- Desktop (≥md): CSS Grid with `SortableHeader` columns
- Mobile (<md): stacked cards with key info visible
- Same data, same filters — just different layout
- Grid header row: `bg="bg.muted"`, `borderRadius="lg"`
- Table rows: `_hover={{ bg: "bg.muted" }}`, `cursor="pointer"`

### Transaction Row (Dashboard)
```
┌─────────────────────────────────────────┐
│ [Avatar] Name        [Type Badge] Date  │
│          Item summary                   │
└─────────────────────────────────────────┘
```
- Avatar: circle with initials, colored by type (sage=issue, sky=return)
- Type badge: pill with colored background
- Date: desktop only, hidden on mobile

## Shared Components (`src/components/`)

| Component | When to use |
|-----------|-------------|
| `PageHeader` | Every page — title + optional description |
| `SearchInput` | Search with debounce + clear button |
| `FilterSelect` | Chakra NativeSelect dropdown for filters |
| `SortableHeader` | Clickable table column header with sort arrows |
| `StatusBadge` | Item status pill (ok/low/gap) with icon |
| `EmptyState` | No data / no results state |
| `ErrorBanner` | Modal overlay for error messages |
| `UserAvatar` | Google avatar with initial fallback |

## Animations (`src/theme/animations.ts`)

Keyframes defined in `src/theme/animations.css` (imported in main.tsx).

| Helper | Usage |
|--------|-------|
| `animations.fadeInUp` | Page sections on load |
| `animations.scaleIn` | Empty state appearance |
| `animations.pulse` | Attention-drawing (gap badge) |
| `animations.cardHover` | Card lift + shadow on hover |
| `animations.listItem(index)` | Staggered list entrance (50ms apart) |
| `animations.delayedFadeInUp(sec)` | Delayed section entrance |

### Rules
- Every card: `css={animations.cardHover}`
- Every list: `css={animations.listItem(index)}`
- Page sections: `css={animations.delayedFadeInUp(0.25)}`
- Never use inline `@keyframes` — they're defined globally
- Interactive elements: minimum `transition: "all 0.15s ease"`

## Navigation

### Desktop Sidebar
- Light: `bg="bg.card"`, `borderInlineEndWidth="1px"`
- Active: `bg="sage.100"`, `color="sage.700"`, orange indicator bar (`sunburst.400`)
- Inactive: `color="fg.muted"`, hover `bg="bg.muted"`
- Icons: Lucide, `size={18}`

### Mobile Bottom Nav
- Floating: `sage.800`, `borderRadius="2xl"`, side margins, `shadow="xl"`
- Active: `sage.600` pill + white icon + label (CSS transition, no DOM swap)
- Inactive: icon only, `color="#8db1a8"`
- Orange top indicator bar on active tab
- Label animates via `max-width` + `opacity` transition

## Icons

- Source: **Lucide** (`lucide-react`) — NOT react-icons
- Default: `size={20}`, `strokeWidth={1.5}`
- Active/selected: `strokeWidth={2}` or `strokeWidth={2.2}`
- Always import specific icons: `import { Package } from "lucide-react"`

## Status Badges

| Status | Hebrew | Color | Icon |
|--------|--------|-------|------|
| ok | תקין | `green.600` | `CircleCheck` |
| low | מלאי נמוך | `yellow.600` | `AlertTriangle` |
| gap | חוסר | `red.600` | `CircleX` (+ pulse animation) |

Activity statuses:

| Status | Hebrew | Color |
|--------|--------|-------|
| active | פעיל | `green.600` |
| draft | טיוטה | `gray.500` |
| closed | סגור | `sky.600` |
| credit | זיכוי | `yellow.600` |
| reconciliation | התאמה | `sunburst.400` |

## Buttons

| Use Case | Style |
|----------|-------|
| Primary action | `bg="sage.600"` `color="white"` `_hover={{ bg: "sage.700" }}` |
| Secondary | `variant="outline"` `borderRadius="lg"` |
| Danger | `colorPalette="red"` |
| Ghost/subtle | `variant="ghost"` |

## Font

- **Heebo** (Google Fonts) — Hebrew-optimized
- Loaded in `index.html`, configured in `src/theme/index.ts`
- `fonts.heading` and `fonts.body` both set to Heebo

## RTL Cheat Sheet

```tsx
// ✅ Correct (RTL-safe)
ps="4"                    // padding-inline-start
pe="4"                    // padding-inline-end
ms="auto"                 // margin-inline-start
textAlign="start"
borderInlineEndWidth="1px"
insetInlineStart="0"
<ChevronLeft />           // points right in RTL = "forward"

// ❌ Wrong (breaks in RTL)
pl="4"  pr="4"  ml="auto"
textAlign="right"
borderRightWidth="1px"
left="0"
```

## i18n

- All user-facing text via `t()` from `src/lib/i18n`
- Hebrew: `src/lib/i18n/he.json` (default)
- English: `src/lib/i18n/en.json`
- Never hardcode Hebrew strings in components
