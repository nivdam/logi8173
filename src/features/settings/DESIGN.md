# Settings UI — Design Patterns

## Responsive Strategy

Mobile-first, single-column layout that scales to 2-column grid on `xl` breakpoint.

### Breakpoints used

| Token | Width | Usage |
|-------|-------|-------|
| `base` | 0px+ | Mobile — compact, icon-only actions, hidden descriptions |
| `sm` | 480px+ | Add-button text appears alongside `+` icon |
| `md` | 768px+ | Section descriptions visible, card padding increases |
| `xl` | 1280px+ | 2-column grid (`SimpleGrid columns={{ base: 1, xl: 2 }}`) |

## Section Card (`SettingsSectionCard`)

```
┌──────────────────────────────────────┐
│  Title          [+ Add Button]       │
│  Description (hidden on mobile)      │
├──────────────────────────────────────┤
│  Card list / Empty state / Spinner   │
└──────────────────────────────────────┘
```

- Header is always a single row: title left, add button right
- Add button: icon-only (`+`) on `base`, text + icon on `sm+`
- Description: `display={{ base: "none", md: "block" }}`
- Padding: `p={{ base: "3", md: "5" }}`

## List Item Cards

Each card is a **single horizontal row** on all breakpoints:

```
┌────────────────────────────────────────────┐
│  [Info + Badges]              [Edit][Del]  │
└────────────────────────────────────────────┘
```

### Layout rules

- `Flex align="center"` — always a row, never stacked
- Left side (`flex="1" minW="0"`): name + badge on first line, email/subtitle on second
- Right side (`flexShrink={0}`): `IconButton` actions with `gap="1"`
- Padding: `p={{ base: "2.5", md: "3" }}`
- Gap between cards: `gap="2"`

### Action buttons

- Always `IconButton variant="ghost" size="sm"` — no text labels
- Edit: `<Pencil size={14} />`
- Delete/Toggle: `<Trash2 size={14} />` or `<Power size={14} />`
- Disabled buttons with context use `Tooltip` to explain why
- Destructive actions use `colorPalette="red"`

### Badges

- Inline with the name, same row: `<Flex align="center" gap="2">`
- Role badge: `colorPalette="gray" variant="subtle"` (status indicator — neutral so it stays readable in combat mode)
- Status badge (active/inactive): `colorPalette="green"` / `"gray"`
- "Current session" label: hidden on mobile (`display={{ base: "none", md: "block" }}`)

## Dialog Pattern

Dialogs use the **always-mounted shell + keyed form** pattern to avoid Chakra scroll-lock bugs:

```tsx
// Shell — always mounted, never gets a `key` prop
<Dialog.Root open={open} onOpenChange={onOpenChange}>
  <Portal>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        // Form — gets `key={resetKey}` to reset state on each open
        <DialogForm key={resetKey} ... />
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog.Root>
```

**Why**: putting `key` on the Dialog component itself causes React to unmount `Dialog.Root`, which breaks Chakra's body scroll-lock cleanup (`overflow`, `pointer-events`, `data-scroll-lock`, `data-inert` stay on `<body>`). Keeping the shell always mounted lets Chakra's state machine run its full close lifecycle.

The inner form component holds all `useState` for field values. When `resetKey` changes (on each open), React unmounts and remounts the form, resetting all fields to their initial values from props.

### Dialog state in the parent

```tsx
const [dialogTarget, setDialogTarget] = useState<Item | "add" | null>(null)
const [dialogSessionKey, setDialogSessionKey] = useState(0)

const isDialogOpen = dialogTarget !== null
const selectedItem = dialogTarget !== null && dialogTarget !== "add" ? dialogTarget : undefined
```

- `dialogTarget`: `null` = closed, `"add"` = add mode, object = edit mode
- `dialogSessionKey`: incremented on every open, passed as `resetKey`
- Derived `isDialogOpen` and `selectedItem` — no separate `useState` needed

## Tooltip Pattern

Used for disabled buttons that need explanation and for icon-only action buttons:

```tsx
<Tooltip.Root positioning={{ placement: "top" }}>
  <Tooltip.Trigger asChild>
    <IconButton disabled ... />
  </Tooltip.Trigger>
  <Tooltip.Positioner>
    <Tooltip.Content>{explanation}</Tooltip.Content>
  </Tooltip.Positioner>
</Tooltip.Root>
```

Prefer tooltips over always-visible hint text to save vertical space, especially on mobile.

## Animations

Uses the shared animation helpers from `theme/animations.ts` — same pattern as the Dashboard.

### Stagger order

| Element | Animation | Delay |
|---------|-----------|-------|
| Page header | `fadeInUp` (via `PageHeader` component) | 0s |
| Operators section card | `delayedFadeInUp(0.1)` | 0.1s |
| Companies section card | `delayedFadeInUp(0.2)` | 0.2s |
| List item rows | `listItem(index)` | 0.05s * index |

### How to apply

Section cards receive an `animationDelay` prop (defaults to `0.1`):

```tsx
<SettingsSectionCard animationDelay={0.2} ... />
```

List items use the index from `.map()`:

```tsx
{items.map((item, index) => (
  <Flex css={animations.listItem(index)} ... />
))}
```

### Available helpers (from `theme/animations.ts`)

- `animations.fadeInUp` — immediate fade-in + slide-up (0.4s)
- `animations.delayedFadeInUp(sec)` — same with a custom delay
- `animations.listItem(index)` — fade-in-up with 0.05s stagger per index
- `animations.cardHover` — lift + shadow on hover, settle on active
- `animations.scaleIn` — scale from 0.95 to 1 (0.3s)
- `animations.pulse` — infinite gentle pulse (2s loop)
