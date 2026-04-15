# AGENTS.md

## Purpose

This folder owns activity-scoped issuance UI: selecting context, building the issue form, validating lines, collecting signatures, and submitting the transaction.

## Invariants

- Issuance is invalid without an active activity context
- Activity context sits above the form, not buried inside line items
- Snapshot inventory is the source of truth for available stock in this flow
- Changing activity after the user entered data requires confirmation
- Loading, error, empty, and ready states must be explicit

## Do

- Keep orchestration in the form hook and top-level form component
- Use feature components to keep sections focused
- Keep success UI separate from the active editable form
- Preserve mobile-first interaction rules from `DECISIONS.md`

## Don't

- Do not read from global `useInventory()` for issuance stock checks
- Do not hide prerequisite problems behind disabled opaque UI
- Do not silently clear user-entered data when activity changes
- Do not spread activity selection logic across unrelated child components

## Key Files

- `IssuanceForm.tsx`
- `ActivityContextCard.tsx`
- `SwitchActivityDialog.tsx`
- `hooks/useIssuanceForm.ts`
- `issuance.utils.ts`

## Related Docs

- `/DECISIONS.md`
- `/FRONTEND_PATTERNS.md`
- `/DOMAIN.md`
