# Frontend Patterns

## Goals

- Keep screens usable on mobile first
- Keep data flow readable
- Make async states explicit
- Keep feature code close to the domain that owns it

## Structure

- `pages/` for route entry points
- `features/` for domain UI and orchestration
- `api/` for React Query hooks by backend action
- `lib/` for auth, API client, config, shared helpers
- `components/` for cross-feature UI pieces

## Data Fetching

- Use React Query hooks from `src/api/`
- Keep hooks thin: action call, invalidation, minimal response normalization
- Query keys should be stable and explicit
- Enable queries only when required input exists

Examples:

- `["activities"]`
- `["activities", activityId]`
- `["dashboard"]`

## API Error Handling

- Preserve backend `message` when available
- Use shared inline error-state UI for blocking query failures
- Use toasts for mutation failures
- Treat invalid or non-JSON responses as infrastructure errors, not business errors

Reference:

- [src/lib/api.ts](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/src/lib/api.ts)

## Form Pattern

- Keep prerequisite context above the form, not hidden inside a field
- Show empty state instead of a disabled broken-looking form
- If a user action would wipe entered data, require confirmation
- Keep success states separate from the active form body

Reference:

- [src/features/issuance/IssuanceForm.tsx](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/src/features/issuance/IssuanceForm.tsx)
- [DECISIONS.md](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/DECISIONS.md)

## Component Boundaries

- Page component: fetch route-level context and assemble sections
- Feature component: own domain-specific rendering and local interactions
- Hook: own state transitions and side-effectful actions for one feature flow
- Shared component: avoid domain-specific assumptions unless reused intentionally

## State Rules

- Prefer derived state over duplicated synced state
- Keep dirty-state and confirmation rules close to the form hook that owns them
- Keep selection state local unless multiple routes or features truly share it

## Loading, Error, Empty

Every async dependency should have an intentional UI for:

- loading
- error
- empty
- ready

Do not let `[]` quietly stand in for all failure modes.

## Mutations

- Invalidate the smallest useful query set
- Also invalidate dashboard summaries when operational data changes
- Normalize inconsistent backend responses in one place, close to the mutation hook

## Styling

- Follow Chakra UI v3 patterns already used in the repo
- Keep mobile tap targets comfortable
- Use shared animation helpers instead of ad hoc timing values
- Prefer visual consistency over clever one-off styling

## Related Local Guides

- `src/features/issuance/AGENTS.md`
- `src/features/settings/AGENTS.md`
- `src/lib/AGENTS.md`
