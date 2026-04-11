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
