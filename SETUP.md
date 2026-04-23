# Calgary Trusted Cleaners — Sales Funnel App
## Complete Setup Guide

---

## STEP 1 — Create a Supabase Project

1. Go to **https://supabase.com** and sign up (free)
2. Click **New Project**
3. Name it `calgary-trusted-cleaners`, choose a strong DB password, select region **US West** or **Canada** (closest)
4. Wait ~2 minutes for provisioning

---

## STEP 2 — Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase-schema.sql` from this folder
4. Paste the entire contents into the editor
5. Click **Run** — you should see "Success. No rows returned."

This creates all 5 tables with Row Level Security.

---

## STEP 3 — Get Your API Keys

In your Supabase project:

1. Go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public key** (long JWT string)

---

## STEP 4 — Configure Environment Variables

Open `.env.local` in this folder and fill in your keys:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## STEP 5 — Create the Admin Account

1. In Supabase, go to **Authentication → Users**
2. Click **Invite User** (or **Add User**)
3. Enter your admin email and a strong password
4. After the user is created, click on it → **Edit**
5. In **User Metadata**, paste exactly this JSON:
   ```json
   { "role": "admin" }
   ```
6. Click Save

---

## STEP 6 — Create the Viewer Account (Client Access)

1. In Supabase → **Authentication → Users → Add User**
2. Enter the client's email and a password (e.g. `viewer@calgarytrustedcleaners.com`)
3. In **User Metadata**, paste:
   ```json
   { "role": "viewer" }
   ```
4. Share the app URL + those credentials with your client

The viewer sees ALL data but has **zero** edit/add/delete buttons visible. It's purely read-only.

---

## STEP 7 — Test Locally (optional)

```bash
cd calgary-trusted-cleaners
npm install
npm run dev
```

Open http://localhost:5173 and sign in with your admin credentials.

---

## STEP 8 — Deploy to Vercel

### Option A: GitHub (recommended)

1. Push this folder to a **GitHub repo**:
   ```bash
   cd calgary-trusted-cleaners
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create calgary-trusted-cleaners --public --push
   ```

2. Go to **https://vercel.com** → Sign up / Log in with GitHub
3. Click **New Project** → Import your `calgary-trusted-cleaners` repo
4. Framework preset: **Vite** (auto-detected)
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
6. Click **Deploy**

Vercel will give you a URL like: `https://calgary-trusted-cleaners.vercel.app`

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel
# Follow prompts, add env vars when asked
```

---

## STEP 9 — Enable Supabase Realtime

1. In Supabase → **Database → Replication**
2. Under **Supabase Realtime**, click **0 tables** → toggle ON all 5 tables:
   - `gc_pipeline`
   - `communication_log`
   - `working_log`
   - `tenders`
   - `contacts`

This enables live sync — changes on one device appear instantly on all others.

---

## SHARING THE APP

- **Admin URL**: `https://your-app.vercel.app` — sign in with admin credentials
- **Viewer URL**: Same URL — sign in with viewer credentials (read-only mode)

You can share the Vercel URL with anyone. Unauthenticated users are redirected to the login page.

---

## TROUBLESHOOTING

| Issue | Fix |
|---|---|
| "Invalid login credentials" | Double-check email/password in Supabase Auth |
| Data not saving | Confirm user metadata has `"role": "admin"` |
| Realtime not working | Enable tables in Supabase → Database → Replication |
| Viewer sees edit buttons | Confirm user metadata has `"role": "viewer"` (not admin) |
| Build fails on Vercel | Ensure both env vars are set in Vercel project settings |

---

## ENVIRONMENT VARIABLES REFERENCE

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
