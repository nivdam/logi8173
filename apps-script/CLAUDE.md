# CLAUDE.md

## Purpose

This folder owns the Google Apps Script backend: routing, auth, permissions, Sheets access, Drive access, and operational writes.

## Invariants

- Every request passes through `Router.gs`
- Role checks are enforced in the backend even if the UI hides actions
- Response envelope stays consistent: success returns `data`, failure returns `error` and `message`
- Operational writes should preserve auditability

## Do

- Keep the route table explicit in `Router.gs`
- Validate request fields in controllers before touching Sheets or Drive
- Keep Google service access inside shared helpers where possible
- Return short, operator-readable error messages for expected failures

## Don't

- Do not bypass auth or role checks
- Do not leak internal implementation details in response messages
- Do not introduce response shape drift between controllers
- Do not rename actions casually

## Key Files

- `Router.gs`
- `Auth.gs`
- `Errors.gs`
- `SheetsRepo.gs`
- `DriveRepo.gs`
- `AuditLog.gs`
