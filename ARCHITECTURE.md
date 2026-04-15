# Logi8173 Architecture

## System Shape

The system has four runtime layers:

1. React frontend in `src/`
2. Vercel serverless proxy in `api/gas.ts`
3. Google Apps Script web app in `apps-script/`
4. Google Sheets and Google Drive as persistent storage

## Request Flow

Normal production flow:

1. The browser sends `POST /api/gas?action=...`
2. `api/gas.ts` validates method and `action`
3. The proxy forwards the request to `APPS_SCRIPT_URL` as `POST` with a JSON body
4. Apps Script routes the request in `apps-script/Router.gs`
5. The controller reads or writes Sheets and Drive
6. Apps Script returns JSON shaped as `{ ok, data }` or `{ ok, error, message }`
7. The frontend turns errors into inline states or toasts

Notes:

- The frontend contract is POST to the proxy.
- The Apps Script parser supports both POST body parsing and `payload` fallback parsing.
- Do not document the fallback parser path as if it is the primary runtime path.

## Frontend Boundaries

- `src/pages/`: route entry points and page composition
- `src/features/`: domain feature UI and local orchestration
- `src/api/`: React Query hooks over the backend actions
- `src/lib/`: API client, auth, config, shared utilities
- `src/components/`: shared UI pieces used by multiple pages or features
- `src/types/`: shared TypeScript types

Recommended direction:

- Pages orchestrate route-level data and layout.
- Features own domain UI and local state transitions.
- API hooks stay thin and action-focused.
- Shared components stay generic enough to reuse across features.

## Backend Boundaries

- `Router.gs`: action table, auth gate, role gate, response envelope
- `*Controller.gs`: action handlers and request validation
- `SheetsRepo.gs`: sheet access and persistence helpers
- `DriveRepo.gs`: Drive folder and file operations
- `Auth.gs`: Google token verification and operator resolution
- `AuditLog.gs`: append-only logging for operational actions
- `Errors.gs`: typed application errors for safe user-facing messages

Recommended direction:

- Routing stays declarative in `Router.gs`.
- Controllers enforce request shape and business rules.
- Repo files hide Google service details from controllers.
- Shared invariants live in helper functions, not copied between controllers.

## Data Ownership

- `master-inventory`: battalion-wide catalog and stock source
- `operators`: app users, roles, access control
- `soldiers`: participant directory, not application users
- `companies`: battalion structure used by soldiers and activities
- `activities-registry`: metadata for all activities
- Activity snapshot sheets: activity-scoped inventory state and transactions

## Critical Constraints

- Setup is a one-time system bootstrap, not a daily flow.
- The battalion-owned Google account is the primary owner of Drive and Sheets.
- `BREAK_GLASS_ADMIN_EMAIL` exists for remote recovery and should survive normal operator mistakes.
- Activity issuance and return must read from activity snapshot state, adjusted by transactions.
- Refreshing SPA routes in production depends on `vercel.json`.

## Key Files

- [api/gas.ts](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/api/gas.ts)
- [apps-script/Router.gs](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/apps-script/Router.gs)
- [src/lib/api.ts](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/src/lib/api.ts)
- [src/api/useActivities.ts](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/src/api/useActivities.ts)
