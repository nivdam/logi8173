# Logi8173 — ניהול לוגיסטיקה דיגיטלית

מערכת לניהול ציוד לוגיסטי עבור גדוד הנדסה 8173 (מילואים).
מחליפה ניהול נייר בתהליך דיגיטלי: הנפקה → חתימה דיגיטלית → מעקב → התאמה → דוח חוסרים.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| UI | Chakra UI v3 |
| Backend/API | Google Apps Script |
| Database | Google Sheets (append-only ledger) |
| Storage | Google Drive (signatures, PDFs) |
| Auth | Google OAuth 2.0 |
| Data Fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Signatures | react-signature-canvas |
| AI | Gemini 2.5 Flash |
| Hosting | Vercel (free tier) |

## Architecture

```
React App (Vercel)
  ↕ fetch / React Query polling
Google Apps Script (validation + API)
  ↕ read/write
Google Drive
  ├── master-inventory (Google Sheet)    ← בטן הימ"ח
  ├── operators / soldiers / companies   ← נתוני בסיס
  ├── activities/                        ← תיקייה לכל פעילות
  │   └── {activity-name}/
  │       ├── inventory-snapshot         ← מלאי בתחילת פעילות
  │       ├── transactions               ← הנפקות/החזרות (append-only)
  │       ├── incidents                  ← חוסרים
  │       └── audit-log                  ← יומן אירועים
  └── signatures/                        ← תמונות חתימות
```

## Getting Started

```bash
pnpm install
pnpm dev
```

## Key Principles

- **Append-only** — transactions and audit logs are never edited or deleted
- **Current stock is computed** — initial_qty + SUM(movements)
- **Soldiers are not users** — operators authenticate via Google; soldiers sign on operator's device
- **$0 budget** — Google free tier + Vercel free tier
- **Hebrew RTL** throughout

## License

Private — for internal IDF reserve unit use only.
