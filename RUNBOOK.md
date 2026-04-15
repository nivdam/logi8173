# Runbook

## Initial Setup

1. Configure Apps Script properties:
   - `SETUP_ADMIN_EMAIL`
   - `WEB_CLIENT_ID`
   - `BREAK_GLASS_ADMIN_EMAIL`
2. Deploy the Apps Script web app
3. Configure Vercel env vars:
   - `VITE_GOOGLE_CLIENT_ID`
   - `APPS_SCRIPT_URL`
4. Open the app with the battalion-owned admin account
5. Run the setup flow once
6. Verify operators, companies, and core sheets were created

## Local Development

1. Copy `.env.example` to `.env.local`
2. Set `VITE_GOOGLE_CLIENT_ID`
3. Set `VITE_APP_PROXY_TARGET`
4. Run `pnpm install`
5. Run `pnpm dev`

## Deploy Checklist

- Frontend build succeeds
- `APPS_SCRIPT_URL` points to the intended deployment
- `appsscript.json` includes required scopes
- SPA rewrites still work through `vercel.json`
- A real operator can log in after deploy

## Recovery

### Operator Access Broken

- Use `BREAK_GLASS_ADMIN_EMAIL`
- Sign in with that Google account
- Restore operator roles through the admin UI or backend data

### Backend Responds With Auth Errors

- Verify `WEB_CLIENT_ID`
- Verify the frontend is using the expected Google client ID
- Verify the ID token is reaching Apps Script

### Activity Flow Looks Wrong

- Confirm the selected activity is open
- Confirm snapshot items exist for that activity
- Check transaction history before trusting current stock assumptions

## Operational Checks Before Real Use

- Open a new activity
- Issue gear to a test soldier
- Return the same gear
- Confirm transaction and audit data were written
- Confirm a second operator can use the system
- Confirm mobile layout is usable
