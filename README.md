# Logi8173

Digital logistics management for IDF Reserve Engineering Battalion 8173.

The system replaces paper-based equipment workflows with a shared battalion system for:

- activity creation
- battalion inventory management
- soldier directory management
- operator access management
- equipment issue/return with signatures
- activity audit trail and reconciliation

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite 8 |
| UI | Chakra UI v3 |
| Backend | Google Apps Script Web App |
| Data | Google Sheets |
| File storage | Google Drive |
| Auth | Google OAuth 2.0 ID tokens |
| Hosting | Vercel |

## Runtime Architecture

The frontend does not call Apps Script directly.

Flow:

1. Browser sends `POST /api/gas?action=...` to Vercel.
2. [`api/gas.ts`](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/api/gas.ts) forwards the request to Apps Script.
3. The Vercel proxy sends Apps Script a `POST` request with a JSON body.
4. Apps Script reads the request body, verifies the Google ID token, and executes the controller.
5. Apps Script also keeps a `payload` query-param fallback path for compatibility with redirect-based flows.

The frontend contract is `POST /api/gas?action=...`. The backend parser currently supports both direct POST bodies and the older `payload` fallback.

## Core Data Model

### Battalion-level data

- `master-inventory`: permanent battalion inventory
- `operators`: allowed app users and roles
- `soldiers`: battalion soldier directory
- `companies`: battalion companies
- `activities-registry`: registry of all activities

### Activity-level data

Each activity gets its own Google Drive folder and its own Google Sheets:

- `inventory-snapshot`
- `transactions`
- `incidents`
- `audit-log`

Current backend behavior already supports a dedicated folder per activity. The intended product direction is to open each activity with a manually selected inventory subset from `master-inventory`, not a full-clone battalion inventory by default.

## Auth and Admin Model

- Initial setup should be run once by a battalion-owned Google account.
- That account becomes the primary owner of the Drive structure and Apps Script deployment.
- After setup, each operator logs in with their own Google account.
- Access is controlled through the `operators` sheet.

### Remote recovery admin

This repo supports a persistent break-glass admin through the Script Property:

- `BREAK_GLASS_ADMIN_EMAIL`

If set to `nivdam@gmail.com`, that account can regain admin access remotely if the operator sheet or permissions become misconfigured. During setup, that email is also auto-seeded as an admin operator if it is different from the primary setup admin.

## Environment Variables

### Frontend / Vercel

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID used by the frontend |
| `APPS_SCRIPT_URL` | Yes | Apps Script Web App `/exec` URL used by the Vercel proxy |
| `VITE_APP_PROXY_TARGET` | Local dev only | Apps Script Web App `/exec` URL used by the Vite dev server proxy |

## Apps Script Configuration

### Required Script Properties before first use

- `SETUP_ADMIN_EMAIL`
- `WEB_CLIENT_ID`
- `BREAK_GLASS_ADMIN_EMAIL` (recommended)

### Script Properties created during setup

- `ROOT_FOLDER_ID`
- `SIGNATURES_FOLDER_ID`
- `ACTIVITIES_FOLDER_ID`
- `MASTER_INVENTORY_ID`
- `OPERATORS_SHEET_ID`
- `SOLDIERS_SHEET_ID`
- `COMPANIES_SHEET_ID`
- `ACTIVITIES_REGISTRY_ID`

### Required OAuth scopes

The Apps Script manifest must include:

- `https://www.googleapis.com/auth/script.external_request`
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/spreadsheets`

## Local Development

Copy `.env.example` to `.env.local` and set the real values:

```bash
cp .env.example .env.local
```

Minimal local setup for `pnpm dev`:

```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APP_PROXY_TARGET=https://script.google.com/macros/s/your_deployment_id/exec
```

Then run:

```bash
pnpm install
pnpm dev
```

In local dev, Vite handles `POST /api/gas?action=...` and forwards it to `VITE_APP_PROXY_TARGET` using the same POST-based contract as the Vercel proxy. This lets you work locally against the real Apps Script backend without pushing to Vercel.

### Environment variable usage by mode

- `pnpm dev`:
  Uses `VITE_APP_PROXY_TARGET` from `.env.local`.
- `vercel dev`:
  Uses `APPS_SCRIPT_URL`.
- Vercel production:
  Uses `APPS_SCRIPT_URL`.

### Useful commands

```bash
pnpm build
pnpm lint
```

## Deployment

### Apps Script

1. Update the code in `apps-script/` or sync with clasp/manual editor workflow.
2. Ensure `appsscript.json` contains the required OAuth scopes.
3. Set Script Properties:
   - `SETUP_ADMIN_EMAIL`
   - `WEB_CLIENT_ID`
   - `BREAK_GLASS_ADMIN_EMAIL`
4. Deploy as a Web App:
   - Execute as: `USER_DEPLOYING`
   - Access: `ANYONE`
5. Authorize all required scopes once.

### Vercel

1. Set `VITE_GOOGLE_CLIENT_ID`
2. Set `APPS_SCRIPT_URL`
3. Deploy

SPA route refreshes depend on [`vercel.json`](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/vercel.json).

## First-Time Initialization Flow

1. Open the deployed app with the battalion-owned admin account.
2. Run the setup flow once.
3. The system creates the shared Google Drive/Sheets structure.
4. Add additional operators.
5. Each operator then uses their own Google account.

## Current Product Status

### Working foundation

- setup flow
- Google login
- dashboard
- inventory list
- soldiers list
- Activities list and activity detail flow
- open activity with manually selected inventory subset
- close activity and open activity Drive folder
- issue form with signatures
- activity-aware issuance with explicit activity selection and snapshot-backed stock
- return flow with activity selection and issued-item reconstruction from transactions
- settings UI for operators and companies
- spreadsheet paste import for inventory and soldiers
- Apps Script backend for inventory, operators, soldiers, companies, activities, transactions
- Vercel proxy + SPA rewrites

### Still needed for handoff-ready rollout

- end-to-end go-live validation against real Sheets, Drive, and deployed Apps Script
- import hardening for real unit datasets, especially speed and retry behavior
- end-to-end validation of retry and duplicate-protection behavior
- ~~day-1 rollout checklist and rehearsal flow~~ — delivered: `CHECKLIST_ADMIN.md`, `CHECKLIST_OPERATOR.md`, `REHEARSAL.md`
- cleanup/sync between repo and Apps Script live deployment

## Repo Notes

- The canonical implementation plan should live in this repo as `PLAN.md`.
- [`CLAUDE.md`](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/CLAUDE.md) should stay aligned with the actual runtime architecture and operational model.

## License

Private internal-use project.
