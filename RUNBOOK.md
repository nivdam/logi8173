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

## OAuth Production Domain Setup

### Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials**
2. Select your OAuth 2.0 Client ID (Web Application type)
3. Under **Authorized JavaScript origins**, add:
   - `https://your-app.vercel.app` (your Vercel production domain)
   - If you have a custom domain: `https://your-custom-domain.com`
   - For local dev: `http://localhost:5173`
4. Under **Authorized redirect URIs**, add the same origins
5. Save

### OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. For internal battalion use, **External** user type is fine (Google Workspace is not required)
3. Fill in:
   - App name: "Logi8173" (or battalion-preferred name)
   - User support email: the battalion admin email
   - Authorized domains: add your Vercel domain (e.g., `your-app.vercel.app`)
   - Developer contact: battalion admin email
4. Under **Scopes**, no additional scopes are needed — the app only uses `openid`, `email`, `profile` (default)
5. Under **Test users** (while in testing mode):
   - Add all operator Google accounts
   - Or publish the app to move out of testing mode (no review needed for unverified apps with < 100 users)

### Moving from Testing to Production

While in "Testing" status, only explicitly added test users can log in. To allow any operator to log in:

1. Go to **OAuth consent screen → Publishing status**
2. Click **Publish App**
3. Google will show a warning about verification — for internal apps with < 100 users, you can proceed without verification
4. Users will see a "Google hasn't verified this app" warning on first login — click **Advanced → Go to app (unsafe)** once

### Verifying Production Login

1. Deploy the latest frontend to Vercel
2. Ensure `VITE_GOOGLE_CLIENT_ID` matches the Client ID in Cloud Console
3. Ensure `APPS_SCRIPT_URL` points to the correct Apps Script deployment
4. Open the production URL in an incognito window
5. Click "Sign in with Google"
6. Select an operator account
7. Verify the dashboard loads and `auth.me` returns the operator profile

### Troubleshooting OAuth Errors

| Error | Cause | Fix |
| --- | --- | --- |
| `redirect_uri_mismatch` | Production domain not in Authorized origins | Add exact domain to Cloud Console (no trailing slash) |
| `invalid_client` | Wrong Client ID | Verify `VITE_GOOGLE_CLIENT_ID` matches Cloud Console |
| `access_denied` | App in testing mode, user not in test users list | Add user to test users, or publish the app |
| `popup_closed_by_user` | User closed the Google login popup | Try again; check if popup blocker is active |
| `idpiframe_initialization_failed` | Third-party cookies blocked | User needs to allow cookies for accounts.google.com |
| CORS errors on `/api/gas` | Vercel domain mismatch | Verify `vercel.json` rewrites and env vars |
| `MISSING_TOKEN` from Apps Script | Token not forwarded by proxy | Check `APPS_SCRIPT_URL` env var on Vercel |
| `INVALID_TOKEN` from Apps Script | `WEB_CLIENT_ID` mismatch | Ensure Apps Script `WEB_CLIENT_ID` property matches the frontend Client ID |

### Custom Domain (Optional)

If using a custom domain instead of `*.vercel.app`:

1. Add the domain in Vercel → **Settings → Domains**
2. Configure DNS (CNAME or A record as instructed by Vercel)
3. Add the custom domain to **Authorized JavaScript origins** and **Authorized redirect URIs** in Cloud Console
4. Wait for DNS propagation (can take up to 48 hours, usually minutes)
5. Verify HTTPS works on the custom domain before testing login

## Rollback

Use this when a production deploy regresses critical flows (issuance, return, login, dashboard).

### Trigger — roll back if, within 30 minutes of a deploy:

- 2–3 independent operator reports of stale data, duplicate transactions, or inability to issue/return
- Dashboard or inventory page fails to load for any operator
- Auth flow breaks (login succeeds but `auth.me` fails, or operator is bounced)
- Any data-integrity doubt (e.g., transaction written with wrong `operator_id`)

### Frontend rollback (Vercel)

1. Before deploying, record the current production deployment ID from Vercel dashboard (Deployments → copy the hash)
2. To roll back: `vercel rollback <previous-deployment-url>` from the project root, or click **Promote to Production** on the previous deployment in the Vercel UI
3. Verify: open the app in incognito, confirm version hash changed, run the 10-minute smoke test below

### Apps Script rollback

1. Before deploying a new Apps Script version, **create a new deployment** — never overwrite an existing one
2. Keep the previous deployment's URL stored in a safe place (e.g., a pinned message in the ops Slack / notes app)
3. To roll back: update the Vercel env var `APPS_SCRIPT_URL` to the previous deployment URL and redeploy the frontend (or use Vercel's instant env var update + redeploy)
4. The old Apps Script deployment stays live until explicitly archived — this is the rollback target

### 10-minute smoke test after every deploy

1. Two operators (or two browsers) open the same active activity
2. Operator A issues equipment to a test soldier
3. Operator B refocuses their tab → sees the new transaction
4. Operator A returns the same equipment
5. Operator B refocuses → sees the return
6. Confirm one issuance + one return in the activity transactions sheet — no duplicates
7. Log out operator A, log in operator B on the same device → no flash of operator A's data

If any of the 7 steps fails → roll back immediately, then investigate.

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
