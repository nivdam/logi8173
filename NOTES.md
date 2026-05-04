# Project Notes

Last reviewed: 2026-05-04

This file complements `CLAUDE.md`. `CLAUDE.md` = always-loaded rules; `NOTES.md` = doc map + style.

Default to direct, concise answers for factual questions. For complex tasks (auth, API, persistence, multi-file changes), follow the plan-before-coding workflow in `.claude/rules/workflow.md`. Do not sacrifice correctness for brevity.

Doc map:

- `README.md` — setup, install, run
- `ARCHITECTURE.md` — before structural changes or new modules
- `DOMAIN.md` — before changing transactions, audit, or business invariants
- `BACKEND_CONTRACTS.md` — before changing `api/gas.ts` or Apps Script endpoints
- `FRONTEND_PATTERNS.md` — before adding new components or hooks
- `PLAN.md` — current priorities; sync with issue tracker
- `RUNBOOK.md` — incidents, rollback, recovery
- `TESTING.md` — before adding tests or changing test strategy

Critical reminders:

- Keep auth trust on Google ID tokens, not local client state.
- Preserve backend response shape: `{ ok, data, error, message }`.
- Keep changes small, focused, and aligned with existing patterns.
