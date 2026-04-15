# AGENTS.md

## Purpose

This repo is a battalion logistics system with a React frontend, a Vercel proxy, and a Google Apps Script backend over Sheets and Drive.

Use this file as the repo-level guide. Folder-level `AGENTS.md` files hold stricter local rules.

## Source Of Truth

- `README.md`: setup, env, run, deploy
- `ARCHITECTURE.md`: system shape and boundaries
- `DOMAIN.md`: domain language and invariants
- `BACKEND_CONTRACTS.md`: API actions and response rules
- `FRONTEND_PATTERNS.md`: frontend structure and UI/data conventions
- `DECISIONS.md`: notable product and UX decisions
- `PLAN.md`: current priorities and rollout scope
- `RUNBOOK.md`: operational recovery and maintenance steps
- `TESTING.md`: test strategy and manual validation

## Global Invariants

- Frontend code does not call Apps Script directly. It goes through `api/gas.ts` or the local dev proxy.
- Auth is based on Google ID tokens. Do not move auth trust to local client state.
- `master-inventory` is battalion-wide source data. Activity flows use activity snapshot data, not the global list.
- Transactions and audit records are operational records. Prefer append-only writes over silent mutation of history.
- Operator permissions are enforced in Apps Script route handling, not only in the UI.

## Do

- Keep business rules close to the feature or controller that owns them.
- Preserve server error messages unless there is a strong reason to mask them.
- Add or update local `AGENTS.md` only for folders with real local rules or pitfalls.
- Prefer small focused components and hooks over large multipurpose files.

## Don't

- Do not duplicate the same guidance across `README.md`, `CLAUDE.md`, and local docs.
- Do not treat mock data as a contract reference.
- Do not read from battalion inventory inside an activity-scoped issuance or return flow.
- Do not change backend response shape casually. The frontend assumes `{ ok, data, error, message }`.

## Local Guides

- `apps-script/AGENTS.md`
- `src/features/issuance/AGENTS.md`
- `src/features/settings/AGENTS.md`
- `src/lib/AGENTS.md`
