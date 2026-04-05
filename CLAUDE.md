# CLAUDE.md — Logi8173

Digital Logistics Management for IDF Reserve Engineering Battalion 8173.
Replaces paper-based equipment management with digital issuance, signatures, and audit trails.

## Architecture

- **Frontend**: React + TypeScript + Vite + Chakra UI (v3)
- **Backend/API**: Google Apps Script (deployed as Web App)
- **Database**: Google Sheets (append-only ledger, native Google Sheets — not .xlsx)
- **Storage**: Google Drive (signatures, PDFs)
- **Auth**: Google OAuth 2.0 (operators only; soldiers sign on operator's device)
- **AI**: Gemini 2.5 Flash (smart search, anomaly detection)
- **Hosting**: Vercel (free tier)

## Key Principles

- **Append-only**: transactions and audit logs are NEVER edited or deleted
- **Current stock is computed**: initial_qty + SUM(movements), never stored directly
- **Soldiers ≠ Users**: operators authenticate via Google; soldiers only sign (personal ID + canvas signature)
- **Each activity = its own Drive folder** with separate Sheets (snapshot, transactions, incidents, audit)
- **master-inventory = source of truth** — always exists, updated only through reconciliation
- **$0 budget** — everything runs on Google free tier + Vercel free tier

## Language & Style

- Hebrew RTL throughout (all user-facing text)
- `type` only, never `interface`
- `const` by default
- Types at bottom of file
- One component per file
- No `any` or `as`
- No native HTML tags — Chakra UI components only
- No abbreviations in variable names

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm type-check   # TypeScript check
```

## Project Structure

```
src/
├── api/           # React Query hooks per entity (useInventory, useSoldiers, etc.)
├── features/      # Feature modules (inventory, transactions, activities, soldiers, dashboard)
├── pages/         # Route pages
├── components/    # Shared UI components
├── lib/           # Utilities, auth, config, api client
├── types/         # Shared types (7 entities + setup)
└── assets/        # Logo, static files

apps-script/       # Google Apps Script backend (deployed separately to script.google.com)
├── Main.gs        # doGet/doPost entry points
├── Router.gs      # POST-only routing, 17 endpoints
├── Auth.gs        # Token verification (cached) + operator lookup
├── Config.gs      # PropertiesService + CacheService
├── SheetsRepo.gs  # Low-level Sheets read/write
├── DriveRepo.gs   # Folder/file/signature operations
├── AuditLog.gs    # Mandatory audit + sheet protection
├── *Controller.gs # Domain controllers (Setup, Inventory, Soldiers, etc.)
└── appsscript.json
```

## API Pattern

- All requests are POST (idToken in body, never in URL)
- Response: `{ ok: true, data }` or `{ ok: false, error, message }`
- Actions routed via `?action=entity.verb` (e.g., `inventory.list`, `tx.create`)
- LockService on mutations to prevent race conditions
- Token verification cached via CacheService (5-min TTL)
- Audit logging is mandatory — operation fails if audit fails

## Deployment

- **Frontend**: Vercel (auto-deploy from GitHub)
- **Backend**: Google Apps Script (manual deploy from script.google.com)
- **Config**: `SETUP_ADMIN_EMAIL` + `WEB_CLIENT_ID` must be set in Script Properties before first use

## Plan

Full implementation plan: `../PLAN.md`
