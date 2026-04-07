# Logi8173 — Delivery Plan

## Goal

Deliver a battalion-usable first version of Logi8173 that supports a small operator team, shared battalion data, activity-specific inventory workflows, and reliable remote administration.

## Delivery Model

- Initial setup is performed once by a battalion-owned Google account.
- That account owns the Drive/Sheets structure and the Apps Script deployment.
- Operators log in with their own Google accounts after setup.
- A persistent break-glass admin (`BREAK_GLASS_ADMIN_EMAIL`) keeps remote recovery access available.

## What already works

- Setup flow creates the shared Drive/Sheets structure.
- Google OAuth login works against the deployed backend.
- Vercel proxies requests to Apps Script correctly.
- Dashboard, inventory list, soldiers list, and issue form are present.
- Activities can be listed, opened, viewed, and closed from the frontend.
- Activity opening creates a dedicated Drive folder and activity-specific files.
- Activity opening now creates a partial inventory snapshot from manually selected `master-inventory` items.

## Priority 1 — Align repo, deployment, and docs

- Keep the Vercel proxy implementation in `api/gas.ts`.
- Keep SPA rewrites in `vercel.json`.
- Keep `README.md`, `CLAUDE.md`, and this `PLAN.md` aligned with the real architecture.
- Sync any manual Apps Script fixes back into `apps-script/`.
- Keep production Apps Script free of temporary debug functions and stack-leaking error handlers.

## Priority 2 — Make Activities the operational core

- Replace the current activities stub page with a real activity management screen.
- Support:
  - list activities
  - open activity
  - close activity
  - view activity folder link
- Open activity with:
  - name
  - type
  - start date
  - manually selected inventory items from `master-inventory`
- Do not default to cloning the entire battalion inventory into every activity.

## Priority 3 — Make issuance activity-aware

- Require an active activity context for issue/return operations.
- Read available inventory from the selected activity snapshot, not directly from `master-inventory`.
- Complete the return flow alongside the existing issue flow.
- Preserve signature capture and audit trail requirements.

## Priority 4 — Minimum admin tooling for first rollout

- Build a basic Settings area for operator management.
- Support:
  - list operators
  - add operator
  - edit operator role
- Keep company management minimal unless blocked by operational workflows.
- Target first rollout for a small team of 2–5 operators.

## Priority 5 — Inventory bootstrap

- Add inventory import support for existing Excel/CSV data.
- Keep manual add/edit available as a fallback and for ongoing maintenance.
- Scope first import to battalion `master-inventory`.
- Keep activity inventory selection manual at activity-open time.

## Acceptance criteria for unit handoff

- A battalion admin can initialize the system from scratch.
- `nivdam@gmail.com` can recover admin access remotely through `BREAK_GLASS_ADMIN_EMAIL`.
- An admin can onboard a small operator team.
- Operators can open an activity with only relevant inventory items.
- Operators can issue and return gear within that activity.
- Each activity stores its own Drive folder and Sheets.
- Refreshing any frontend route works in production.
- Operational documentation is sufficient for another battalion operator to continue using the system.

## Immediate implementation order

1. Sync and clean Apps Script production code in the repo.
2. Add/verify break-glass admin support.
3. Build the real Activities UI and selected-inventory activity creation flow.
4. Make issuance/returns activity-scoped.
5. Add operator management UI.
6. Add inventory import.
7. Final cleanup, validation, and rollout documentation.
