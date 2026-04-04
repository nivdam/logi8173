# General Rules

## Budget Constraint
$0 budget — everything must run on free tiers (Google, Vercel). Never suggest paid services.

## Language
- All user-facing text in Hebrew (RTL)
- Code (variables, comments, commits) in English
- Use `dir="rtl"` as the app default

## Data Integrity
- Transactions and audit logs are **append-only** — never edit, never delete rows
- Current stock is always **computed** (initial_qty + SUM of movements), never stored directly
- Every write operation must log to audit-log

## Auth Model
- Operators authenticate via Google OAuth
- Soldiers do NOT log in — they sign on the operator's device (personal ID + signature)
- One hardcoded dev admin email that always has access (prevents lockout)

## Git Workflow
- Work on feature branches, PR to `dev`
- `main` and `dev` are protected — no direct push
- Conventional Commits style
