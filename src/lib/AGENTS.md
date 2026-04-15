# AGENTS.md

## Purpose

This folder owns shared application infrastructure: API client, auth session handling, config, i18n, and cross-feature utilities.

## Invariants

- API errors should preserve server messages when possible
- Auth session storage is a transport detail, not a trust boundary
- Shared utilities should stay generic enough for reuse across features
- Mock fallback behavior must not redefine production contracts

## Do

- Keep `api.ts` as the central place for request envelope handling
- Normalize infrastructure failures into stable app errors
- Keep auth helpers focused on session mechanics and token lifecycle
- Add shared utilities here only when at least two features truly need them

## Don't

- Do not embed feature-specific business rules in `lib/`
- Do not duplicate API error parsing in feature hooks
- Do not make mock-mode behavior the implicit default
- Do not spread environment access across the codebase without need

## Key Files

- `api.ts`
- `api-error.ts`
- `auth-context.tsx`
- `auth-helpers.ts`
- `config.ts`
- `i18n/`
