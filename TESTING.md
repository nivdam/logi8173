# Testing Guide

## What To Protect First

- setup flow
- auth recovery
- activity open and close flows
- issuance with activity context
- return flow
- import parsing and import execution behavior
- backend permission gates on write actions

## Test Layers

### Unit Tests

Use for:

- parsers
- pure formatters
- reducers
- stock calculation helpers
- row normalization helpers

Current examples:

- `src/features/return/return.utils.test.ts`
- `src/features/settings/import/import-parsers.test.ts`

### Component Or Feature Tests

Use for:

- form prerequisite behavior
- dirty-state confirmation behavior
- loading, error, and empty states
- mutation success and failure handling

Best targets:

- issuance flow
- settings dialogs
- import review and execution states

### Manual End-To-End Validation

Required for:

- Google login
- setup
- role-based permissions
- Apps Script writes to Sheets
- Drive folder creation
- real activity issue and return flows

## Manual Regression Checklist

- Login with a valid operator
- Refresh an authenticated route
- Open an activity with selected inventory
- Load activity detail and snapshot items
- Issue items to a soldier inside the selected activity
- Return issued items inside the same activity
- Add or edit operator and company data
- Run inventory or soldier import with mixed valid and invalid rows

## Risk Areas

- Anything that depends on real Google services
- Any response shape change in Apps Script
- Async flows with partial failure and retry
- Dirty-form resets caused by activity switching

## Testing Heuristics

- Prefer narrow unit tests for parsing and transformation logic
- Add feature tests where UX rules matter more than rendering details
- Use manual validation for real integrations instead of fake confidence from mocks alone
