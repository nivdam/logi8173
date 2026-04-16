# CLAUDE.md

## Purpose

Return equipment flow — soldiers return previously issued equipment back to the activity's inventory. Mirror of the issuance flow but in reverse direction.

## Invariants

- Return form follows the same activity-first selection as issuance
- Issued items checklist is auto-populated from `transactions.issuedItems` endpoint
- Manual lines can be added alongside auto-populated items
- Dual signatures required (returner + receiver)
- Reducer pattern for form state (same approach as issuance)

## Do

- Show remaining quantities (issued - already returned) for each item
- Allow partial returns (not all items need to be returned at once)
- Preserve manual lines when toggling select/deselect all
- Use the shared `SignatureCanvas` component for signatures

## Don't

- Don't allow returning more than the remaining quantity
- Don't remove manual lines when deselecting all auto-populated items
- Don't skip the issued items checklist step

## Key Files

- `ReturnForm.tsx` — main orchestrator (activity → soldier → items → signatures)
- `IssuedItemsChecklist.tsx` — auto-populated items from issued transactions
- `IssuedItemRow.tsx` — individual issued item with quantity controls
- `ReturnHeader.tsx` — activity + soldier selection header
- `ReturnFooter.tsx` — signatures + submit
- `ReturnSuccess.tsx` — success state after submission
- `hooks/` — useReturnForm reducer, useIssuedItems query
- `return.utils.ts` — pure helpers (tested in `return.utils.test.ts`)
