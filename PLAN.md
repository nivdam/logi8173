# Logi8173 — Day-1 Unit Rollout Plan

## Goal

Deliver a battalion-usable system where a small operator team can set up, import data, open activities, and perform full issuance and return workflows — all without developer intervention.

## Delivery Model

- Initial setup is performed once by a battalion-owned Google account.
- That account owns the Drive/Sheets structure and the Apps Script deployment.
- Operators log in with their own Google accounts after setup.
- A persistent break-glass admin (`BREAK_GLASS_ADMIN_EMAIL`) keeps remote recovery access available.

## What already works

### Infrastructure
- React 19 + Vite + Chakra UI v3 frontend, hosted on Vercel
- Google Apps Script backend with 17 endpoints
- Vercel proxy (`api/gas.ts`) forwarding requests to Apps Script
- SPA routing via `vercel.json` rewrites
- Google OAuth 2.0 login with token refresh and session recovery

### Setup & Auth
- Setup wizard creates the full Drive/Sheets structure from scratch
- Break-glass admin (`BREAK_GLASS_ADMIN_EMAIL`) for remote recovery
- Invalid session recovery with re-auth flow
- Role-based access control (admin, warehouse_operator, commander, viewer)

### Activities
- List, open, view detail, close activities
- Activity opening creates a dedicated Drive folder + inventory snapshot
- Partial inventory snapshot from manually selected master-inventory items
- Activity detail page with metadata, snapshot items, search/filter

### Issuance
- Full issuance form (IDF 1008 layout) with:
  - Soldier selection (combobox autocomplete)
  - Line items with inventory binding
  - Dual signature capture (receiver + giver)
  - Date/time picker
- Transaction creation with stock validation and audit logging

### Data Management
- Dashboard with stat cards, recent transactions, activity list, company breakdown
- Inventory list with search, filter by category/status, sort
- Soldiers list with search, filter by company/platoon, sort
- Backend CRUD for all entities (inventory, soldiers, companies, operators)

### Code Quality (recent)
- Activity detail page split into focused sub-components (orchestrator pattern)
- Named handlers, no `as` casts, flat control flow across pages
- Composition architecture documented in frontend rules

## What's next — Rollout Milestones

### Milestone 0 — Go-Live Validation Gate

Validate before rollout that critical flows are reliable end-to-end:

- Setup, operator management, company management, activity creation, issuance, return, and transaction writing all work against real Sheets.
- Import of inventory and soldiers can ingest a real unit dataset without manual one-by-one entry.
- Establish official import format: paste from Excel/Google Sheets as TSV/CSV.
- Define clear fallback for partial import failure: error summary, retry, clarity on what was saved.

This gate fails if:
- Cannot ingest realistic data volume for day 1
- Critical writes to Sheets are unreliable

### Milestone 1 — Settings for Admin Onboarding

Build basic but usable admin UI:

- Operators: list, add, edit role
- Companies: list, add, edit
- Use existing `/settings` route as entry point
- Don't expand beyond what blocks go-live

Backend already exists: `operators.list`, `operators.upsert`, `companies.list`, `companies.upsert`.
API hooks already exist: `useOperators()`, `useUpsertOperator()`, `useCompanies()`, `useUpsertCompany()`.

### Milestone 2 — Inventory + Soldiers Import

Import is a go-live requirement, not a post-rollout enhancement.

Add import flow for:
- `master-inventory`
- `soldiers`

Approach:
- Paste from Excel / Google Sheets into textarea
- Parse TSV → preview rows → confirm → bulk create
- Validation per row with error summary
- Write through existing backend endpoints
- If per-row write proves too slow on real datasets, add bulk endpoint

### Milestone 3 — Activity-Aware Issuance + Full Return Flow

Complete the operational workflow:

- Remove hardcoded `activityId: "act1"` from issuance
- Add activity selector (active activities only) at top of form
- Load inventory from selected activity's snapshot
- Block issuance/return without activity context

Return flow must be operationally complete:
- Select activity → select soldier's issued equipment → mark returned
- Update stock/transactions correctly
- Audit trail
- Clear UX for operators
- Basic validation for expected failure modes

Assumption: no go-live without both issuance and return working end-to-end.

### Milestone 4 — Rollout Readiness

Before handoff to the unit:

- Short admin checklist: setup, add operators, add companies, import inventory, import soldiers, open activity
- Short operator checklist: login, select activity, issue, return, error recovery
- Full dry-run with realistic scenario: setup → operators → import → open activity → issue → return
- Test with 2+ different users
- Test on mobile

## Acceptance Criteria for Unit Handoff

- A battalion admin can initialize the system from scratch.
- `nivdam@gmail.com` can recover admin access remotely through `BREAK_GLASS_ADMIN_EMAIL`.
- An admin can onboard operators and companies through Settings UI.
- An admin can import inventory and soldiers from Excel/Sheets data.
- Operators can open an activity with only relevant inventory items.
- Operators can issue and return gear within that activity.
- Each activity stores its own Drive folder and Sheets.
- Refreshing any frontend route works in production.
- System works on mobile devices.
- Operational checklists exist for admin and operator workflows.

## Key Implementation Notes

- Import is part of go-live scope, not post-rollout.
- Settings for first wave includes operators + companies.
- No separate gate to "prove Sheets work" — the backend already uses Sheets; the gate is flow reliability.
- If paste-to-backend import is too slow on real data, switch to bulk endpoint.
- Return flow is part of the first operational milestone, not a follow-up.
