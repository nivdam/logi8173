# Logi8173 — Architecture & UX Decisions

Non-design-system decisions that shape how the app behaves. Design system rules live in `DESIGN_SYSTEM.md`.

---

## Form Prerequisites — Empty State Over Disabled Form

When a form requires a prerequisite (e.g., selecting an activity before issuance), show an empty state message instead of a dimmed/disabled form. Disabled forms with `opacity` tricks look broken, not intentional, and create cognitive load on mobile.

**Applied in:** Issuance form (`/issue`) — activity selection gates the entire accordion.

## Small-Set Selection — Radio Cards Over Dropdowns

When the user chooses from 1-5 options on mobile, use full-width tappable radio cards (48-56px height, 8px gap) instead of `NativeSelect` or dropdowns. Radio cards are one-tap, more legible in RTL, and better for non-technical users.

**Applied in:** Activity selection in issuance form.

## Destructive Mid-Form Changes — Confirmation Dialog

When a user action resets form data they already entered (e.g., switching activity after adding items), show a confirmation dialog. Never reset silently — mobile operators make accidental taps.

If the form is clean (nothing entered), switch immediately without dialog.

**Applied in:** Activity change in issuance form.

## Activity as Form Context — Above the Form, Not Inside

Activity selection is a prerequisite that scopes the entire form (inventory, transactions, audit). It belongs above the form sections as a persistent context card, not inside a form field. This makes the dependency visible and prevents users from missing it.

**Applied in:** `ActivityContextCard` renders above the accordion in `/issue`.

## Snapshot Inventory — No Global Inventory in Activity-Scoped Flows

When operating within an activity context, always use the activity's snapshot inventory (adjusted by transactions), never the global master inventory. This ensures stock validation matches what the backend enforces.

**Applied in:** Issuance form loads `snapshotItems` from `useActivity()` instead of `useInventory()`.

## Explicit Loading and Error States

Every async dependency in a form must have explicit UI states: loading, error, empty. Generic spinners or silent empty arrays are not acceptable — operators need to know what is loading and why the form isn't ready.

**Applied in:** Activity snapshot loading state in issuance form.

## No URL-Driven Activity Selection

The issuance route stays `/issue` without activity ID in the URL. Activity selection is form state, not routing state. This keeps the routing simple and avoids stale URL bookmarks pointing to closed activities.

## Three Color Modes — Light / Dark / Combat

We ship three themes instead of only light/dark. Combat is a red-on-black night-vision mode specifically for operators on night activities — an always-white screen ruins dark adaptation in the field.

Implementation:
- A semantic `primary` palette resolves to forest green in light/dark and a red scale in combat. Components use `colorPalette="primary"` so Chakra handles the swap automatically.
- Chakra custom conditions group combat under `_dark`: every unspecified combat token inherits the dark value, and only targeted overrides (bg, fg, primary, status colors) are declared under `_combat`. This keeps the semantic token table small.
- `useColorMode()` is a module-level singleton using `useSyncExternalStore` — every component reads the same state, so toggling in the header re-renders the signature canvas, status badges, and anything else that reads the mode.
- The stored mode is applied via an inline script in `index.html` before React hydrates to prevent a flash of the default theme on reload.

**Not in scope yet:** auto-combat on signature screens (#83), print CSS to force light, palette picker, density tweaks. Tracked in Epic #86.

## Signature Rendering Adapts to the Active Theme

Saved signatures are stored as base-64 SVG on Drive. Before this change they baked a near-black stroke into the SVG, which disappeared against a dark/combat background.

`SignatureImage` now parses every saved SVG through a `<path>`-only whitelist, strips scripts and event handlers, rewrites the stroke to `currentColor`, and renders inline — so the same stored signature reads correctly in every mode. The live `SignatureCanvas` picks pen/background colors from the current mode, and clears the parent form state when the mode changes so a visually-empty canvas can't submit as signed.

**Applied in:** Profile dialog, issuance footer, return footer, shared form — all use `SignatureImage` for previews.
