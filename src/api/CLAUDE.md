# CLAUDE.md

## Purpose

React Query hooks for all backend API calls. Each file wraps one domain (activities, soldiers, inventory, etc.) with query and mutation hooks.

## Invariants

- All hooks call through `api.ts` in `lib/` — never call fetch directly
- Queries use `useQuery` or `useSuspenseQuery`; mutations use `useMutation`
- Cache invalidation after mutations uses the same query keys
- Error handling: queries show inline error state, mutations use `showApiErrorToast`

## Do

- Export all hooks from `index.ts` barrel file
- Use generated types from `src/types/` for request/response shapes
- Invalidate related queries after successful mutations

## Don't

- Don't put UI logic or components in this folder
- Don't duplicate error parsing — use `showApiErrorToast` from `lib/api-error`
- Don't create hooks for endpoints that don't exist in the backend

## Key Files

- `index.ts` — barrel export
- `useActivities.ts` — activity CRUD + snapshot
- `useTransactions.ts` — issuance, return, issued-items queries
- `useInventory.ts` — master inventory queries + add item mutation
- `useOperators.ts` — operator CRUD + auth.me
- `useSoldiers.ts` — soldiers list + upsert
- `useDashboard.ts` — dashboard stats
- `useCompanies.ts` — companies list + mutations
- `useSetup.ts` — system setup
