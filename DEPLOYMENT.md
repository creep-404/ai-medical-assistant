# MediAssist AI — Production Deployment Guide

This guide deploys the MediAssist AI stack to production:

| Component | Platform | Domain |
|-----------|----------|--------|
| Frontend (Next.js) | **Vercel** | `https://mediassist.dpdns.org` |
| Backend (FastAPI) | **Railway** | `https://api.mediassist.dpdns.org` |
| Database | **PostgreSQL (Railway plugin)** | internal |

---

## 1. Overview of what changed for production

1. **PostgreSQL support** — `DATABASE_URL` is read from the environment. SQLite remains the
   automatic local fallback when `DATABASE_URL` is unset, so `npm run dev` and
   `uvicorn backend.main:app --reload` still work unchanged.
2. **Alembic migrations** — fully configured (`backend/alembic/`, `alembic.ini`). Initial
   migration `dd0c2604dca8` creates all 13 tables and both enum types (`userrole`,
   `appointmentstatus`). Verified to compile for PostgreSQL.
3. **Railway config** — `railway.json` + `Procfile` + fixed `Dockerfile`. Startup runs
   `alembic upgrade head && uvicorn`. Seed data is NEVER created in production.
4. **Vercel config** — production build verified (32 static pages), `NEXT_PUBLIC_API_URL`
   is env-driven, dev-only `console.log` debug output removed.
5. **CORS** — origins now come from the `CORS_ORIGINS` env var (was hardcoded).
6. **Health endpoint** — `/health` now also checks database connectivity (used by Railway).

---

## 2. Prerequisites

- A GitHub repo hosting this project (e.g. `creep-404/ai-medical-assistant`).
- Accounts on [vercel.com](https://vercel.com) and [railway.app](https://railway.app).
- DNS control of `dpdns.org` (or the subdomain registrar/zone where
  `mediassist.dpdns.org` is managed).

---

## 3. Backend → Railway

### 3.1 Create the PostgreSQL database (on Railway)

1. In Railway, create a **New Project** and add a **PostgreSQL** plugin (free tier is fine).
2. Railway auto-generates a connection string. Open the plugin → **Variables** and copy
   `DATABASE_URL` (format `postgresql://user:password@host:port/railway`).
3. Keep this project — the backend service will join it.

### 3.2 Deploy the backend service

1. In the same Railway project, click **+ New** → **GitHub Repo** and pick your repo.
2. Railway reads `railway.json` at the repo root:
   - **Build**: `DOCKERFILE` at `Dockerfile`
   - **Start**: `alembic upgrade head && uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Healthcheck**: `/health`
3. If Railway doesn't auto-detect the Dockerfile, set **Settings → Root Directory** to `/`
   (repo root) and **Build Command** to `dockerfile`.
4. **Attach the database**: Variables tab → **Add Reference** → select the PostgreSQL
   plugin's `DATABASE_URL`. This injects the connection string automatically.
5. Add the remaining variables (Section 3.3).
6. Click **Deploy**. Railway builds the image and runs migrations, then starts the API.

> On first deploy, create the administrator account by setting `BOOTSTRAP_ADMIN_EMAIL`,
> `BOOTSTRAP_ADMIN_USERNAME`, and `BOOTSTRAP_ADMIN_PASSWORD`. The app creates that admin
> once on startup. Remove those variables afterwards.

### 3.3 Backend environment variables (Railway)

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...` (from plugin) | Add as a **reference** to the Postgres plugin |
| `SECRET_KEY` | `<64-char random string>` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `ALGORITHM` | `HS256` | |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | |
| `CORS_ORIGINS` | `https://mediassist.dpdns.org,https://mediassist-ai.vercel.app` | Include the Vercel preview domain too if desired |
| `COOKIE_SECURE` | `true` | Set to `true` in production over HTTPS |
| `COOKIE_SAMESITE` | `lax` | Set `none` only if frontend/API are on different sites AND you accept the extra risk; requires `COOKIE_SECURE=true` |
| `FRONTEND_URL` | `https://mediassist.dpdns.org` | Used to build password-reset links in emails |
| `BOOTSTRAP_ADMIN_EMAIL` | `admin@example.com` | Creates the first admin on startup; remove after use |
| `BOOTSTRAP_ADMIN_USERNAME` | `admin` | see above |
| `BOOTSTRAP_ADMIN_PASSWORD` | `<strong password>` | see above |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` / `SMTP_TLS` | (optional) | Needed for password-reset emails; without them reset links are generated but not delivered |
| `PORT` | `8000` | Railway sets this automatically |

> Never commit secrets. `backend/.env` is git-ignored; Railway variables are set in the
> dashboard.

### 3.4 Verify the backend is live

After deploy, open the service's **Settings → Networking → Public Networking** and copy the
Railway URL (e.g. `https://mediassist-backend.up.railway.app`). Confirm:

```bash
curl https://<railway-url>/health
# {"status":"healthy","database":"ok","version":"1.0.0"}

curl https://<railway-url>/docs        # Swagger UI
```

---

## 4. Frontend → Vercel

### 4.1 Deploy

1. In Vercel, **Add New → Project**, import the GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Vercel auto-detects Next.js (framework preset `Next.js`). Keep the default build
   (`next build`) and output settings.

### 4.2 Frontend environment variables (Vercel)

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.mediassist.dpdns.org` | **Inlined at build time**; set it in Vercel **Production** environment |

> `NEXT_PUBLIC_*` vars are baked into the JS bundle at build time. After changing them,
> redeploy the project. Local dev continues to use `http://localhost:8000` via
> `frontend/.env.local`.

### 4.3 Verify the frontend

After deploy, Vercel gives you a URL like `https://mediassist-ai.vercel.app`:

```bash
curl -I https://mediassist-ai.vercel.app/login   # 200
```

---

## 5. Connect custom domains

### 5.1 Frontend: `mediassist.dpdns.org`

1. Vercel → Project → **Settings → Domains** → **Add** → enter `mediassist.dpdns.org`.
2. Vercel will instruct you to add a DNS record (below).

### 5.2 Backend: `api.mediassist.dpdns.org`

1. Railway → Service → **Settings → Networking → Custom Domain** → **Add Custom Domain** →
   enter `api.mediassist.dpdns.org`.
2. Railway will instruct you to add a DNS record (below).

---

## 6. DNS records (EXACT)

Add these at your DNS provider for `dpdns.org`. **Vercel and Railway give you the target
values after you add the domain in their dashboards** — replace the placeholders below with
the exact targets they display.

| Type  | Name (Host)              | Value (Target)                          | Purpose |
|-------|--------------------------|-----------------------------------------|---------|
| CNAME | `mediassist`             | `cname.vercel-dns.com`                  | Frontend apex → Vercel |
| CNAME | `api.mediassist`         | `<railway-provided>.up.railway.app`     | Backend → Railway |

**Details & variants:**

- **Frontend (`mediassist.dpdns.org`)** — Vercel requires a `CNAME` record:
  ```
  CNAME  mediassist.dpdns.org  ->  cname.vercel-dns.com
  ```
  Vercel may show `cname.vercel-dns.com` or a project-specific value; use exactly what
  Vercel displays. TTL: 300 s (or provider default).

- **Backend (`api.mediassist.dpdns.org`)** — Railway requires a `CNAME` pointing at your
  Railway service URL (or a `CNAME.verify` record first, then the service CNAME):
  ```
  CNAME  api.mediassist.dpdns.org  ->  <your-railway-service>.up.railway.app
  ```
  Railway may first request:
  ```
  CNAME  api.mediassist.dpdns.org  ->  cname.verify.railway.app
  ```
  then swap it for the service target after verification. Use exactly what Railway displays.

- **SSL/TLS**: after DNS propagates (minutes to a few hours), enable **HTTPS** in Vercel and
  Railway (both auto-provision Let's Encrypt certificates). No `TXT` records are needed
  unless your DNS host uses TXT-based verification (some do not for CNAME; follow the
  platform's prompt if it asks for a `TXT` — it will show the exact host and value).

- **Optional (Vercel)**: a `TXT` record is **not** required for standard Vercel deployment.
  Only add `TXT` records if Vercel explicitly shows them for domain verification.

**Verify DNS propagation:**

```bash
nslookup mediassist.dpdns.org
nslookup api.mediassist.dpdns.org
```

---

## 7. Post-deployment checklist

- [ ] `https://mediassist.dpdns.org` loads (frontend)
- [ ] `https://api.mediassist.dpdns.org/health` returns `{"status":"healthy",...}`
- [ ] `https://api.mediassist.dpdns.org/docs` opens Swagger
- [ ] Register a user → login works (HttpOnly cookie session issued)
- [ ] Symptom Checker returns a prediction
- [ ] Log in as the bootstrap admin → create + approve a doctor account
- [ ] Book an appointment with that doctor; accept it from the doctor account
- [ ] Generate & download a PDF report
- [ ] Nearby doctors / emergency hospitals return data
- [ ] `CORS_ORIGINS` includes your frontend domain (otherwise browser blocks API calls)
- [ ] `COOKIE_SECURE=true` is set (otherwise cookies are dropped on HTTPS)

---

## 8. Keeping local development working

```bash
# Backend (uses SQLite fallback; tables auto-create. No seed runs automatically.)
cd backend
python -m uvicorn backend.main:app --reload

# Frontend
cd frontend
npm run dev
```

To seed demo doctors/symptoms locally (SQLite only), run explicitly:

```bash
cd backend
python -m backend.services.seed_service
```

To run locally against PostgreSQL instead of SQLite:

```bash
cd backend
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mediassist"   # Windows
alembic upgrade head
python -m uvicorn backend.main:app --reload
```

---

## 9. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Railway deploy fails at `alembic upgrade head` | Confirm `DATABASE_URL` reference is attached and the Postgres plugin is running. Check deploy logs. |
| `ModuleNotFoundError: backend` in container | `PYTHONPATH=/app` is set in the Dockerfile; ensure `railway.json` start command is used (not a custom one) and Root Directory is `/`. |
| `/health` returns `unhealthy` | DB is unreachable — check the `DATABASE_URL` variable and Postgres plugin status. |
| Frontend API calls blocked by CORS | Add your exact frontend origin to `CORS_ORIGINS` on Railway and redeploy. |
| Custom domain not resolving | Confirm the exact CNAME target from Vercel/Railway dashboards; allow DNS propagation time; enable HTTPS. |
| `next build` fails locally after `next dev` | `.next` is shared; run build only when the dev server is stopped. |
| PDF reports disappear after redeploy | Generated PDFs live on the local filesystem (`backend/generated_reports/`), which is ephemeral on Railway. For persistence, add a Railway **Volume** mounted at `/app/backend/generated_reports`. |

---

## 10. Security notes

- `SECRET_KEY` must be a long random value; the app refuses to start otherwise.
- Auth uses short-lived access tokens (15 min) + rotating refresh tokens (7 days), both
  delivered as **HttpOnly, SameSite cookies** (not readable by JavaScript). Refresh-token
  reuse is detected and revokes the whole session; logout invalidates all tokens.
- Passwords are bcrypt-hashed (with a SHA-256 pre-hash so long passwords are never
  silently truncated) and must meet a strength policy (min 12 chars, no common/weak values).
- Self-registration always creates a `patient`. Doctors are created and approved only by
  admins; admins are bootstrapped via env config.
- Password-reset tokens are random, single-use, stored only as hashes, and expire in 30
  minutes.
- Login/register/refresh/forgot/predict/nearby are rate-limited per IP with account lockout.
- All API routes (except public doctor lookup and auth) require authentication.
- Keep `DATABASE_URL` credentials out of source control.
