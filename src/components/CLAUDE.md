# CLAUDE.md

## Purpose

Shared, reusable UI components used across multiple features. These are the building blocks of the app — layout shells, form primitives, feedback states, and navigation.

## Invariants

- Every component here is used by 2+ features or by the app shell
- Chakra Dialog/Drawer must always be mounted; control via `open` prop, reset state in `onOpenChange` — never conditional-render
- No feature-specific business logic belongs here

## Do

- Use Chakra components exclusively (no native HTML tags)
- Keep components generic — accept data via props, no internal API calls
- Match mobile-first patterns (44px touch targets, responsive props)

## Don't

- Don't add components used by only one feature — put those in the feature folder
- Don't use `style={{}}` — use Chakra props or `css={{}}`
- Don't use `any`, `as`, or `interface`

## Key Files

- `AppLayout.tsx` — main app shell (header, nav, outlet, bottom nav, profile dialog)
- `RequireOperatorProfile.tsx` — blocks app until operator profile is filled
- `RequireAuth.tsx` / `RequireSetup.tsx` — auth and setup guards
- `OperatorProfileDialog.tsx` — operator profile form (name, rank, personalId, phone, signature)
- `ApiErrorState.tsx` / `EmptyState.tsx` / `ErrorBanner.tsx` — shared feedback states
- `PageHeader.tsx` / `SearchInput.tsx` / `FilterSelect.tsx` / `SortableHeader.tsx` — shared page primitives
