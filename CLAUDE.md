# CLAUDE.md — Logi8173

Logi8173 is a digital logistics system for IDF Reserve Engineering Battalion 8173. It replaces paper issuance and reconciliation with a web app backed by Google Apps Script, Google Sheets, and Google Drive.

## Current Architecture

- Frontend: React 19 + TypeScript + Vite + Chakra UI v3
- Frontend hosting: Vercel
- Backend: Google Apps Script Web App
- Data: Google Sheets
- File storage: Google Drive
- Auth: Google OAuth 2.0 ID tokens, verified server-side in Apps Script

## Important Runtime Notes

- The frontend does not call Apps Script directly.
- Vercel proxies requests through [`api/gas.ts`](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/api/gas.ts).
- The frontend contract is `POST /api/gas?action=...`.
- The proxy forwards requests to Apps Script as `POST` with a JSON body.
- Apps Script still supports a `payload` query-param fallback path for compatibility.
- Vercel SPA routing depends on [`vercel.json`](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/vercel.json) rewrites.

## System Model

- `master-inventory` is the battalion source of truth.
- Each activity gets its own Drive folder and its own Sheets.
- Transactions and audit logs are append-only.
- Operators authenticate with their own Google accounts.
- Soldiers are not app users; they are participants/receivers inside activity workflows.

## Admin Model

- Initial setup should be run once by a battalion-owned admin Google account.
- That account becomes the primary system owner and creates the Drive/Sheets structure.
- A persistent remote support admin can also be configured through the Script Property `BREAK_GLASS_ADMIN_EMAIL`.
- When `BREAK_GLASS_ADMIN_EMAIL` is set to a configured email (value stored only in Script Properties), that account is always allowed to regain admin access and is auto-seeded as an admin operator during setup if needed.

## Required Script Properties

- `SETUP_ADMIN_EMAIL`
- `WEB_CLIENT_ID`
- Optional but recommended: `BREAK_GLASS_ADMIN_EMAIL`

After setup, the script also stores generated resource IDs such as:

- `ROOT_FOLDER_ID`
- `OPERATORS_SHEET_ID`
- `SOLDIERS_SHEET_ID`
- `COMPANIES_SHEET_ID`
- `ACTIVITIES_REGISTRY_ID`

## Required Apps Script OAuth Scopes

- `https://www.googleapis.com/auth/script.external_request`
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/spreadsheets`

## Repo Guidance

- The canonical project plan should live inside this repo as `PLAN.md`.
- If an external copy exists, keep it synchronized from the repo version.
- Prefer documenting operational setup and rollout details in the repo, not one directory above it.
- Frontend error handling should preserve the server-returned error message by default.
- Query failures should prefer a shared inline error-state component.
- Mutation failures should prefer a shared API error toast helper that includes both the failed action label and the server message.

## Near-Term Product Priorities

1. Validate issuance and return end-to-end against real Sheets and Drive data.
2. Harden import for real unit datasets, especially throughput and retry behavior.
3. Validate retry and duplicate-protection behavior against the live backend.
4. Sync any live Apps Script changes back into `apps-script/`.
