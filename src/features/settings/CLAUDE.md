# CLAUDE.md

## Purpose

This folder owns admin-facing settings UI for operators, companies, and import flows.

## Invariants

- Settings mutations are admin-sensitive and should stay operationally conservative
- Dialog shell stays mounted; state reset happens inside keyed dialog content
- List states should be clear on mobile and desktop
- Import should show preview, per-row status, and failure summary

## Do

- Follow the dialog pattern documented in `DESIGN.md`
- Reuse section card patterns and shared actions
- Keep import parsing pure and testable
- Keep import execution progress visible to the user

## Don't

- Do not put reset keys on Chakra dialog roots
- Do not mix parsing, preview shaping, and mutation execution into one large component
- Do not hide permission-sensitive actions behind unclear iconography
- Do not swallow partial import failures

## Key Files

- `DESIGN.md`
- `OperatorsSettingsSection.tsx`
- `CompaniesSettingsSection.tsx`
- `OperatorDialog.tsx`
- `CompanyDialog.tsx`
- `import/`
