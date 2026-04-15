# AGENTS.md

## Purpose

This folder owns the Google Apps Script backend: routing, auth, permissions, Sheets access, Drive access, and operational writes.

## Invariants

- Every request passes through `Router.gs`
- Known failures should use typed app errors, not raw thrown strings
- Role checks are enforced in the backend even if the UI already hides actions
- Response envelope stays consistent: success returns `data`, failure returns `error` and `message`
- Operational writes should preserve auditability

## Do

- Keep the route table explicit in `Router.gs`
- Validate request body fields in controllers before touching Sheets or Drive
- Keep Google service access inside repo-style helpers where possible
- Return short, operator-readable error messages for expected failures

## Don't

- Do not bypass `requireOperator_()` or `assertRole_()`
- Do not leak internal implementation details in response messages
- Do not introduce response shape drift between controllers
- Do not move business rules into random utility files without clear ownership

## Key Files

- `Router.gs`
- `Auth.gs`
- `Errors.gs`
- `SheetsRepo.gs`
- `DriveRepo.gs`
- `AuditLog.gs`

## Common Pitfalls

- Request parsing currently supports more than one payload path. Keep docs and code aligned when changing it.
- A route marked with `roles: null` still expects an authenticated operator.
- Frontend hooks often depend on stable action names. Renames are breaking changes.
