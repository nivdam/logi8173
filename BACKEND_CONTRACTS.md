# Backend Contracts

## Response Envelope

Apps Script responses should follow one of these shapes:

```json
{ "ok": true, "data": {} }
```

```json
{ "ok": false, "error": "ERROR_CODE", "message": "Human-readable message" }
```

Frontend code already assumes this envelope in `src/lib/api.ts`.

## Request Shape

- Requests are action-based
- The frontend calls `/api/gas?action=...`
- Request body is JSON
- `idToken` is expected in the request payload
- The normal runtime path is direct POST body parsing
- Backend parsing also supports `payload` fallback parsing for compatibility

## Auth And Roles

- `auth.me` resolves the current operator from a Google ID token
- `route.roles = null` means authenticated operator required, but no role restriction
- Route role arrays are enforced in `Router.gs`

## Current Actions

### Setup

- `setup.status`
- `setup.initialize`

### Auth

- `auth.me`

### Operators

- `operators.list`
- `operators.upsert`
- `operators.delete`

### Inventory

- `inventory.list`
- `inventory.upsert`

### Soldiers

- `soldiers.list`
- `soldiers.upsert`

### Companies

- `companies.list`
- `companies.upsert`

### Activities

- `activities.list`
- `activities.get`
- `activities.open`
- `activities.close`
- `activities.addItems`

### Transactions

- `tx.list`
- `tx.create`

### Dashboard

- `dashboard.summary`

## Contract Rules

- Keep action names stable. UI hooks are written against them directly.
- Keep user-facing backend errors short and intentional.
- Throw typed known errors for expected business failures.
- Do not leak internal stack or implementation details in `message`.
- If a response shape must change, update the consuming frontend hook in the same change.

## Known Normalization

`activities.open` may currently return either a single activity or an array. The frontend normalizes this in `src/api/useActivities.ts`.

That inconsistency should not spread further.

## Key Files

- [apps-script/Router.gs](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/apps-script/Router.gs)
- [apps-script/Errors.gs](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/apps-script/Errors.gs)
- [src/lib/api.ts](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/src/lib/api.ts)
- [src/api/useActivities.ts](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/src/api/useActivities.ts)
