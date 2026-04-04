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
| `VITE_DEV_ADMIN_EMAIL` | No | Dev-only admin bypass (stripped from prod builds) |

## Project Structure

```
src/
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
│   ├── api.ts               ← Apps Script API client
│   ├── filters.ts           ← Pure filter/sort functions
│   ├── formatters.ts        ← Date, status, label formatters
│   └── i18n/                ← Hebrew + English translations
├── theme/
│   ├── index.ts             ← Chakra system config
│   ├── animations.ts        ← Micro-animation helpers
│   ├── animations.css       ← Global keyframes
│   └── foundation/          ← Colors, text styles, shadows
└── pages/                  ← Login, Settings, Activities (stubs)
```

## Architecture

```
React App (Vercel)
  ↕ fetch / React Query polling
Google Apps Script (validation + API)
  ↕ read/write
Google Drive
  ├── master-inventory       ← בטן הימ"ח
  ├── operators / soldiers   ← נתוני בסיס
  ├── activities/            ← תיקייה לכל פעילות
  │   └── {name}/
  │       ├── snapshot       ← מלאי בתחילת פעילות
  │       ├── transactions   ← הנפקות/החזרות (append-only)
  │       └── audit-log      ← יומן אירועים
  └── signatures/            ← תמונות חתימות
```

## Key Principles

- **Append-only** — transactions and audit logs are never edited or deleted
- **Current stock is computed** — initial_qty + SUM(movements)
- **Soldiers are not users** — operators authenticate via Google; soldiers sign on operator's device
- **$0 budget** — Google free tier + Vercel free tier
- **Hebrew RTL** — Heebo font, semantic RTL tokens throughout
- **Mobile first** — floating bottom nav, card layouts, 44px touch targets

## Design

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for colors, typography, components, animations, and patterns.

## License

Private — for internal IDF reserve unit use only.
