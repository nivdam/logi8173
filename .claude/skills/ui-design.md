---
name: ui-design
description: UI design patterns and component guidelines for Logi8173. Use when creating or modifying any UI component, page layout, or visual element.
trigger: when writing JSX, creating components, building pages, or making design decisions
---

# UI Design — Logi8173

## Before writing any component

1. **Read `DESIGN_SYSTEM.md`** at project root — it is the single source of truth for colors, typography, spacing, and component rules
2. **Check if a similar component already exists** in `src/components/`
3. **Mobile first** — start with the mobile layout, then expand for desktop

## Component Creation Checklist

- [ ] Uses Chakra UI components only (no native HTML tags)
- [ ] Uses theme tokens for colors, spacing, shadows (no raw hex/px)
- [ ] Uses `textStyle` for typography (no raw `fontSize`)
- [ ] RTL-safe: `ps`/`pe` not `pl`/`pr`, `start`/`end` not `left`/`right`
- [ ] Has both light and dark mode variants (use semantic tokens)
- [ ] Touch targets ≥ 44px on interactive elements
- [ ] Hebrew text for all user-facing strings
- [ ] One component per file, types at bottom

## Layout Patterns

### Page Layout
```tsx
<Flex direction="column" minH="100vh" bg="bg.canvas">
  <Header />
  <Flex flex="1">
    <Sidebar display={{ base: "none", md: "flex" }} />
    <Box as="main" flex="1" p={{ base: "4", md: "6" }} overflowY="auto">
      {children}
    </Box>
  </Flex>
</Flex>
```

### Card
```tsx
<Box bg="bg.surface" borderWidth="1px" borderColor="border.muted" borderRadius="lg" p={{ base: "4", md: "6" }} shadow="sm">
  {content}
</Box>
```

### Dashboard Bento Card
```tsx
<Box bg="bg.surface" borderWidth="1px" borderColor="border.muted" borderRadius="lg" p="5" shadow="sm" cursor="pointer" _hover={{ shadow: "md", borderColor: "brand.200" }} transition="all 0.2s">
  <Text textStyle="sm" color="fg.muted">{label}</Text>
  <Text textStyle="2xl" fontWeight="700" mt="1">{value}</Text>
</Box>
```

### Form Field
```tsx
<Field.Root>
  <Field.Label textStyle="sm" fontWeight="500">{label}</Field.Label>
  <Input size="md" />
  <Field.ErrorText textStyle="xs" color="red.500">{error}</Field.ErrorText>
</Field.Root>
```

### Empty State
```tsx
<Flex direction="column" align="center" justify="center" py="16" gap="4">
  <Icon boxSize="12" color="fg.muted" />
  <Text textStyle="lg" fontWeight="600">{title}</Text>
  <Text textStyle="sm" color="fg.muted">{description}</Text>
  <Button colorPalette="brand" mt="2">{actionLabel}</Button>
</Flex>
```

## Color Usage Quick Reference

| Purpose | Token |
|---------|-------|
| Page background | `bg.canvas` |
| Card/surface | `bg.surface` |
| Primary text | `fg.default` |
| Secondary text | `fg.muted` |
| Borders | `border.muted` |
| Primary action | `colorPalette="brand"` |
| Danger action | `colorPalette="red"` |
| Success indicator | `green.600` |
| Warning indicator | `yellow.600` |
| Error indicator | `red.600` |
| Info indicator | `blue.500` |

## Status Badges

| Status | Hebrew | colorPalette |
|--------|--------|-------------|
| Active | פעיל | `green` |
| Draft | טיוטה | `gray` |
| Closed | סגור | `blue` |
| Shortage | חוסר | `red` |
| Pending | ממתין | `yellow` |

## Button Variants

| Use Case | Code |
|----------|------|
| Primary action | `<Button colorPalette="brand">שמור</Button>` |
| Secondary | `<Button variant="outline">ביטול</Button>` |
| Danger | `<Button colorPalette="red">מחק</Button>` |
| Ghost/subtle | `<Button variant="ghost">עוד</Button>` |

## Responsive Breakpoints

- `base` (0px) — mobile, single column
- `md` (768px) — tablet, sidebar appears
- `lg` (1024px) — desktop, full layout

```tsx
// Example responsive props
p={{ base: "4", md: "6" }}
display={{ base: "none", md: "flex" }}
gridTemplateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }}
```

## RTL Cheat Sheet

```tsx
// ✅ Correct (RTL-safe)
ps="4"              // padding-inline-start
pe="4"              // padding-inline-end
ms="auto"           // margin-inline-start
textAlign="start"
borderInlineEndWidth="1px"
borderStartRadius="lg"

// ❌ Wrong (breaks in RTL)
pl="4"
pr="4"
ml="auto"
textAlign="right"
borderRightWidth="1px"
borderTopRightRadius="lg"
```

## Icons

- Source: `react-icons/md` (Material Design)
- Default size: `boxSize="5"` (20px)
- Compact: `boxSize="4"` (16px)
- Always wrap with Chakra `Icon`

## Shadows

| Token | Usage |
|-------|-------|
| `sm` | Cards, subtle elevation |
| `md` | Dialogs, modals, dropdowns |
| `lg` | Floating elements, popovers |

## Toasts vs Alerts

- **Toast**: transient success/info ("הפריט נשמר") — auto-dismiss 3-5s
- **Inline Alert**: errors and destructive outcomes — persistent, user must dismiss
- **Banner**: offline state — sticky at top, persistent until reconnected
