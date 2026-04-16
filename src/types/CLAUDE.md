# CLAUDE.md

## Purpose

Shared TypeScript types for all domain entities. These types represent the data shapes returned by the backend (Google Apps Script / Sheets).

## Invariants

- Use `type` only, never `interface`
- Types match the column structure of the Google Sheets backend
- `personalId` comes as a number from Sheets — always wrap with `String()` at the boundary
- All types are re-exported from `index.ts`

## Do

- Derive sub-types via indexed access when possible (e.g., `Transaction["type"]`)
- Keep types minimal — only fields that the backend actually returns
- Add new entity types here when new Sheets/endpoints are created

## Don't

- Don't use `any` or `as` in type definitions
- Don't manually rewrite types that can be derived from existing ones
- Don't add UI-only state types here — those belong in the feature folder

## Key Files

- `activity.ts` — Activity, ActivityType, ActivityStatus
- `transaction.ts` — Transaction, TransactionType, IssuedItem
- `inventory.ts` — InventoryItem, ItemCategory, ItemStatus, UnitOfMeasure
- `soldier.ts` — Soldier
- `company.ts` — Company
- `dashboard.ts` — DashboardData, DamageSummary
- `setup.ts` — SetupStatus
- `index.ts` — barrel export
