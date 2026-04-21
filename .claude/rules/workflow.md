# Workflow Rules

Quality comes from small scope, proper testing, and a clear threshold for what gets fixed now — not from more review rounds.

## Before any task — 2 minutes of thinking

Answer these 4 questions before touching code:

1. **What exactly changes?**
2. **Which files are expected to be affected?**
3. **What could break for the user?**
4. **How will I verify it works?**

If the answers are trivial → skip to implementation. If they're not → write a short plan first.

## When to write a plan

Write a plan (not just think) for tasks that touch:

- Auth / session / login
- API client / request envelope
- Persistence (localStorage, drafts, sessions)
- Global state / React Query
- Permissions / roles
- More than 2–3 files
- Anything with unclear scope

## When NOT to plan

- Copy changes (i18n strings, labels)
- Small UI tweaks
- Type fixes
- Single-file bug fixes
- Small CSS adjustments

## Review policy

**One review round per PR.** Not five.

After the first review, fix **only** items that match:

- Build or test failure
- User-facing bug (a real user would hit it)
- Security / permissions / data leak
- Backend contract breach

Everything else → follow-up ticket. Including:

- Naming nits
- "Could be cleaner"
- Speculative edge cases the reviewer can't demonstrate
- Duplicate code that isn't causing bugs

## Severity threshold

Not every `Medium` gets fixed now.

**Fix now:**
- Session stuck / user can't proceed
- Data leak between users (e.g. drafts visible across accounts)
- Auth bypass
- Data corruption

**Follow-up:**
- Edge case that requires private mode / quota exhausted / rare browser state
- UX confusion that backend still protects against (e.g. stale role in UI — server still enforces)
- "What if 1% of users do X" without evidence 1% actually do

## Before commit

- `pnpm build` passes
- Run lint when practical, especially for larger changes
- Happy path tested manually in browser when UI/auth/API behavior changed
- No unrelated files in the diff

## After first review

Fix only blocker findings from the review policy, then commit.
Anything else becomes a follow-up — not a blocker for this PR.

## The one sentence to remember

> Quality doesn't come from more review rounds. It comes from small scope, proper testing, and a clear threshold for what gets fixed now.
