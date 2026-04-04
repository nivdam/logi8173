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
├── api/           # Google Apps Script API client + React Query hooks
├── features/      # Feature modules (inventory, transactions, activities, soldiers, dashboard)
├── pages/         # Route pages
├── components/    # Shared UI components
├── lib/           # Utilities, auth, config
├── types/         # Shared types
└── assets/        # Logo, static files
```

## Plan

Full implementation plan: `../PLAN.md`
