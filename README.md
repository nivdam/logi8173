# 8173 לוגיסטיקה

מערכת לניהול ציוד לוגיסטי עבור גדוד הנדסה 8173 (מילואים).
מחליפה ניהול נייר בתהליך דיגיטלי: הנפקה → חתימה דיגיטלית → מעקב → התאמה → דוח חוסרים.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| UI | Chakra UI v3 + Lucide Icons |
| Font | Heebo (Hebrew-optimized) |
| Backend/API | Google Apps Script |
| Database | Google Sheets (append-only ledger) |
| Storage | Google Drive (signatures, PDFs) |
| Auth | Google OAuth 2.0 (GIS) |
| Data Fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Signatures | react-signature-canvas |
| AI | Gemini 2.5 Flash |
| Hosting | Vercel (free tier) |

## Getting Started

```bash
pnpm install
cp .env.example .env.local   # fill in your Google OAuth Client ID
pnpm dev                      # http://localhost:5173
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth Client ID |
| `VITE_APPS_SCRIPT_URL` | Yes | Google Apps Script Web App URL |

## Project Structure

```
src/
├── api/                    ← React Query hooks per entity
│   ├── useInventory.ts      ← Inventory CRUD hooks
│   ├── useSoldiers.ts       ← Soldiers CRUD hooks
│   ├── useActivities.ts     ← Activity lifecycle hooks
│   ├── useTransactions.ts   ← Transaction hooks (with stock validation)
│   ├── useOperators.ts      ← Operator management hooks
│   ├── useCompanies.ts      ← Company CRUD hooks
│   ├── useDashboard.ts      ← Dashboard summary hook
│   └── useSetup.ts          ← System initialization hooks
├── features/               ← Feature modules
│   ├── dashboard/           ← Bento dashboard with stat cards
│   ├── inventory/           ← Equipment table with search/filter/sort
│   └── soldiers/            ← Soldier directory with search/filter
├── components/             ← Shared UI components
│   ├── PageHeader.tsx       ← Consistent page title
│   ├── SearchInput.tsx      ← Debounced search
│   ├── FilterSelect.tsx     ← Styled dropdown filter
│   ├── SortableHeader.tsx   ← Table column sort
│   ├── StatusBadge.tsx      ← Colored status pill
│   ├── EmptyState.tsx       ← No data state
│   ├── ErrorBanner.tsx      ← Error modal overlay
│   ├── UserAvatar.tsx       ← Google avatar + fallback
│   ├── AppLayout.tsx        ← Header + sidebar + outlet
│   ├── AppNav.tsx           ← Desktop sidebar
│   └── BottomNav.tsx        ← Mobile floating bottom nav
├── types/                  ← TypeScript types per entity
├── mocks/                  ← Mock data (Hebrew, realistic)
├── lib/
│   ├── auth-context.tsx     ← Auth provider + hooks
│   ├── auth-helpers.ts      ← Session storage, role checks
│   ├── config.ts            ← Env var validation
│   ├── api.ts               ← Apps Script API client (POST-only, token retry)
│   ├── filters.ts           ← Pure filter/sort functions
│   ├── formatters.ts        ← Date, status, label formatters
│   └── i18n/                ← Hebrew + English translations
├── theme/
│   ├── index.ts             ← Chakra system config
│   ├── animations.ts        ← Micro-animation helpers
│   ├── animations.css       ← Global keyframes
│   └── foundation/          ← Colors, text styles, shadows
└── pages/                  ← Login, Settings, Activities (stubs)

apps-script/               ← Google Apps Script backend
├── Main.gs                  ← doGet/doPost entry points
├── Router.gs                ← Request routing + response helpers
├── Auth.gs                  ← Token verification (cached) + operator lookup
├── Config.gs                ← PropertiesService + CacheService
├── Constants.gs             ← Sheet column headers
├── SheetsRepo.gs            ← Low-level Sheets read/write
├── DriveRepo.gs             ← Folder/file/signature operations
├── AuditLog.gs              ← Mandatory audit logging + sheet protection
├── SetupController.gs       ← System initialization (creates all Drive resources)
├── InventoryController.gs   ← Inventory CRUD with computed stock
├── SoldiersController.gs    ← Soldiers CRUD
├── CompaniesController.gs   ← Companies CRUD
├── ActivitiesController.gs  ← Activity lifecycle (open/close with Drive folders)
├── TransactionsController.gs← Transactions with LockService + stock validation
├── OperatorsController.gs   ← Operator management + auth.me
├── DashboardController.gs   ← Aggregated dashboard data
├── Errors.gs                ← Structured error creation
└── appsscript.json          ← Apps Script manifest
```

## Architecture

```
React App (Vercel, free)           Google Apps Script (free)
┌──────────────────────┐           ┌──────────────────────────┐
│ Static SPA           │           │ API Layer                │
│ React + Chakra UI    │──POST───▶│ Router → Auth → Controller│
│ React Query (10s)    │◀──JSON───│ → SheetsRepo / DriveRepo │
└──────────────────────┘           └──────────────────────────┘
                                     ↕ read/write
                                   Google Drive (free)
                                   ├── master-inventory
                                   ├── operators / soldiers / companies
                                   ├── activities-registry
                                   ├── activities/
                                   │   └── {name}/
                                   │       ├── inventory-snapshot
                                   │       ├── transactions (append-only)
                                   │       ├── incidents
                                   │       └── audit-log (protected)
                                   └── signatures/ (private)
```

## Security

- **All requests are POST** — ID tokens never exposed in URLs
- **Token verification cached** — Google tokeninfo + CacheService (5-min TTL)
- **LockService** on mutations — prevents race conditions and stock overselling
- **Audit logs are mandatory** — if logging fails, the operation fails
- **Audit sheets are protected** — only the script owner can edit
- **Signatures are private** — not shared via public URLs
- **Setup restricted** — only pre-configured admin email can initialize

## Key Principles

- **Append-only** — transactions and audit logs are never edited or deleted
- **Current stock is computed** — initial_qty + SUM(movements)
- **Soldiers are not users** — operators authenticate via Google; soldiers sign on operator's device
- **$0 budget** — Google free tier + Vercel free tier, no paid services
- **Hebrew RTL** — Heebo font, semantic RTL tokens throughout
- **Mobile first** — floating bottom nav, card layouts, 44px touch targets

## Design

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for colors, typography, components, animations, and patterns.

## License

Private — for internal IDF reserve unit use only.
