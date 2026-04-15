# Logi8173 Domain Model

## Core Entities

### Operator

An app user with a Google account and a role.

- Authenticates through Google
- Must exist in `operators` to use the app after setup
- Roles control backend access

### Soldier

A battalion person who receives or returns equipment.

- Not an application user
- Used in issuance and return workflows
- Belongs to a company or sub-unit context

### Company

A battalion organizational unit used for grouping soldiers and activities.

### Inventory Item

A battalion equipment record in `master-inventory`.

- Global source data
- Used to seed activities
- Should not be treated as live activity stock after an activity is opened

### Activity

An operational context such as training, deployment, or exercise.

- Has metadata in `activities-registry`
- Gets its own Drive folder
- Gets its own snapshot data and transaction history
- Can be open or closed

### Activity Snapshot

A selected subset of battalion inventory copied into an activity context.

- This is the source of truth for activity-scoped issuance and return
- It starts from selected `master-inventory` items
- It changes effectively through recorded transactions

### Transaction

An operational stock movement record.

Examples:

- issue to soldier
- return from soldier
- damage or incident-linked adjustment

Transactions should be treated as history, not transient UI state.

### Audit Log

An append-only record of important actions for accountability and recovery.

## Domain Rules

- A soldier can receive equipment only inside an activity context.
- Activity-scoped stock checks use snapshot inventory plus transaction history, not global inventory.
- Closing an activity should stop future operational use of that activity.
- Operators and soldiers are different concepts and should not share types or screens casually.
- Setup creates the system baseline. It is not a reusable import mechanism.

## Domain Confusions To Avoid

- `master-inventory` is not the same as activity inventory.
- `operator` is not the same as `soldier`.
- `activity registry` metadata is not the same as activity transaction data.
- UI selection state is not the same as backend operational state.

## Practical Invariants

- Issuance without activity context is invalid.
- Return without activity context is invalid.
- Mutations that affect operational state should leave a readable audit trail.
- Permission checks belong to the backend even if the UI already hides actions.

## Key Files

- [src/types/activity.ts](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/src/types/activity.ts)
- [src/types/inventory.ts](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/src/types/inventory.ts)
- [src/types/transaction.ts](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/src/types/transaction.ts)
- [apps-script/ActivitiesController.gs](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/apps-script/ActivitiesController.gs)
- [apps-script/TransactionsController.gs](/Users/nivdamianovich/BizoDam/Logi8173/_logi8173_/apps-script/TransactionsController.gs)
