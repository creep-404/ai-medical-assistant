# Independent Production Security Assessment — MediAssist AI

**Date:** 2026-08-07
**Scope:** Full repository re-audit (backend FastAPI, frontend Next.js 14, Docker/CI configs)
**Method:** Static code review of every module + live penetration tests against the running app (TestClient) + `pip-audit` dependency scan.
**Assumption:** Will store real patient medical information; will be externally pen-tested.

Prior fixes were NOT trusted. Every control was re-verified in source and by live attack.

---

# Executive Summary

The hardening pass fixed the headline vulnerabilities (role escalation, weak JWT secret, forgeable reset tokens, localStorage token theft, production seeding, root containers). **However, independent review found the hardening incomplete and introduced several regressions.** The most serious issues are that **account lockout is broken** (per-user failures are recorded but never enforced) and **rate limiting can be bypassed** via spoofed `X-Forwarded-For`, so credential-stuffing/brute-force protection is effectively absent. The pinned dependencies (including the JWT library) carry known CVEs, and medical responses are served without `Cache-Control: no-store`. The appointment **reschedule feature is completely broken** (a pydantic 2.11 bug makes `AppointmentUpdate.date` unusable), the patient **reminders feature has no backend**, and the admin/doctor UI pages are static mock-ups that do not call the live API.

Core authentication/authorization (JWT integrity, role enforcement, ownership/IDOR, refresh rotation + replay detection, logout invalidation, password reset) was re-verified and **held up under attack** — that is the strongest part of this codebase.

## Overall Security Score: **5.5 / 10**

## Production Readiness: **❌ Not Ready for Production** for real patient data.

---

# Findings

Legend — Severity / CVSS / Confidence (Confirmed / Potential) / Exploitable remotely (Y/N).

---

## HIGH

### H-1. Account lockout is broken; brute-force protection bypassable via spoofed X-Forwarded-For
- **CVSS:** 8.1 (brute force / credential stuffing, targeted account)
- **Confidence:** Confirmed (live test)
- **Files:** `backend/api/auth_routes.py:195,204-207`; `backend/auth/rate_limiter.py:15-20`
- **Code:**
```python
# auth_routes.py — login
limiter.check(ip)                                        # only the IP key is ever checked
user = ...
if not user or not verify_password(...):
    limiter.register_failure(ip)
    if user:
        limiter.register_failure(f"user:{user.id}")      # recorded but NEVER consulted
```
```python
# rate_limiter.py
def client_ip(request):                                   # trusts attacker-controlled header
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()            # leftmost = attacker-influenced
```
- **Why vulnerable:** `LockoutTracker.register_failure(f"user:{id}")` records failures per account, but `RateLimiter.check()` is only ever called with the IP key. The user-key lockout is never evaluated before password verification. Meanwhile the per-IP limit uses the first value of a client-supplied header.
- **Exploit / PoC (live):** 6 wrong passwords for user `xavier` from IP A; login with the **correct** password from IP B → **HTTP 200** (account not locked). 12 wrong attempts with rotating `X-Forwarded-For: 10.9.9.{i}` → zero 429s. The user-key failure count accumulated to 6+ but was ignored.
- **Impact:** An attacker who knows the password, or who credential-stuffs a leaked password list, is never locked out. Distributed brute force over many IPs defeats per-IP limits. Directly relevant to a healthcare app.
- **Recommended fix:** enforce the account key in `check()` and/or check `user:{id}` before verifying; only trust XFF from a known proxy and take the rightmost hop.
```python
def _login_failed(user, limiter, ip):
    limiter.register_failure(ip)
    if user:
        limiter.register_failure(f"user:{user.id}")

# in login(), after looking up user:
limiter.check(ip)
if user:
    limiter.check(f"user:{user.id}")     # enforce account lockout BEFORE bcrypt
```
- **Remotely exploitable:** Yes.

### H-2. Medical responses served without `Cache-Control: no-store`
- **CVSS:** 6.5 (sensitive data exposure via shared/browser caches)
- **Confidence:** Confirmed (code)
- **Files:** `backend/main.py` (security headers middleware, lines 40-54)
- **Why vulnerable:** No `Cache-Control` header is set anywhere. Authenticated endpoints returning PHI/medical data (`/api/history`, `/api/predict`, `/api/appointments*`, `/api/reports*`, `/api/reminders*`) may be cached by browsers and any intermediary/proxy.
- **Exploit:** An attacker with access to a shared machine, corporate proxy cache, or browser history/disk can recover another user's cached medical data. `Referrer-Policy`/HSTS do not address caching.
- **Recommended fix:** set `Cache-Control: no-store` (and `Pragma: no-cache`) on all authenticated responses, or globally except `/health`, `/api/doctors`, `/api/symptoms`, `/api/medicines`, `/api/diseases`.
```python
if request.url.path.startswith("/api/") and not request.url.path.startswith(("/api/doctors","/api/symptoms","/api/medicines","/api/diseases")):
    response.headers["Cache-Control"] = "no-store"
```
- **Remotely exploitable:** Yes (indirectly, via cache).

---

## MEDIUM

### M-1. Pinned dependencies have known CVEs — "dependency upgrade" claim is stale
- **CVSS:** 6.5 (dependency hygiene; partial exploitability)
- **Confidence:** Confirmed (`pip-audit`: 37 findings in 6 packages)
- **Files:** `backend/requirements.txt`
- **Findings (pip-audit):**
  - `PyJWT 2.10.1` — PYSEC-2025-183, PYSEC-2026-120 (crit header not validated), PYSEC-2026-175 (JWKS `PyJWKClient` SSRF), 176 (alg allow-list bypass w/ PyJWK), 177 (JWKS no rate limit), 178 (detached-JWS payload decode), 179 (JWK-HMAC). Fix: **2.13.0**. *Mitigating:* this app uses symmetric HS256 with a static key and never calls `PyJWKClient`, so 175-179 are not reachable as written; 120 (crit) is not exercised. Still, the auth library is EOL-ish and must be bumped.
  - `starlette 0.46.2` (transitive via `fastapi 0.115.12`) — PYSEC-2026-161 (Host header injection into `request.url`), 248 (path not validated before URL reconstruction), 249 (form parsing limits). Fix: ≥1.3.1. *Mitigating:* app does not reflect Host; only one form-parsing path is used by the framework. Requires a FastAPI bump to pull patched Starlette.
  - `python-multipart 0.0.20` — PYSEC-2026-3036/3037/3038/3039/3040 (form parsing DoS / negative Content-Length read-until-EOF / part-header exhaustion). Fix: ≥0.0.31. *Mitigating:* no `multipart/form-data` endpoints exist, but the parser is shipped.
  - `requests 2.32.3` — PYSEC-2026-1872 (netrc credential leak via crafted URL), 2275. Fix: ≥2.33.0. *Mitigating:* outbound URLs are hardcoded (Nomination/Overpass), not user-controlled.
  - `setuptools 65.5.0`, `python-dotenv 1.0.1` — build/dev-time; not runtime.
- **Recommended fix:** `PyJWT>=2.13.0`, `fastapi>=0.119` (or pin `starlette>=1.3.1`), `python-multipart>=0.0.31`, `requests>=2.33.0`.
- **Remotely exploitable:** Not directly in current usage; do not rely on that.

### M-2. Rate limiting trusts client-supplied `X-Forwarded-For`
- **CVSS:** 6.5
- **Confidence:** Confirmed (code + live test showed rotating XFF yields no 429)
- **Files:** `backend/auth/rate_limiter.py:15-20`; used in login/register/refresh/forgot/predict/nearby
- **Why vulnerable:** `client_ip()` reads `X-Forwarded-For` and takes the **leftmost** value. If the app is ever reachable without a strict edge proxy that overwrites this header, an attacker rotates the header per request to reset every limiter bucket. Behind a proxy that *appends*, the leftmost value is also the attacker-influenced hop.
- **Exploit:** repeatedly POST `/api/auth/login` with `X-Forwarded-For: <rotating>` → no 429 ever (live-verified). Combined with H-1, brute force is unmitigated.
- **Recommended fix:** configure uvicorn proxy trust (`--forwarded-allow-ips`), and use the rightmost hop: `request.headers.get("x-forwarded-for", "").split(",")[-1].strip()` when behind a trusted proxy; otherwise fall back to `request.client.host`. Additionally bound the `_hits`/`_failures` dicts (evict old keys) to prevent unbounded memory growth from unique keys.
- **Remotely exploitable:** Yes (deployment dependent).

### M-3. Request body-size limit bypassable
- **CVSS:** 5.9 (memory-exhaustion DoS)
- **Confidence:** Confirmed (live test: lying `content-length: 10` with a large body → 200)
- **Files:** `backend/main.py:57-66`
- **Why vulnerable:** the limit only checks the client-declared `Content-Length`. A request with no header, a non-numeric header, or chunked transfer-encoding bypasses it; FastAPI then reads the entire body into memory before validation.
- **Exploit:** send `POST /api/predict` with `Transfer-Encoding: chunked` and ~500 MB of data → memory spike / OOM. Predict schema caps symptoms but only after the full body is buffered.
- **Recommended fix:** enforce the cap on the actual read (e.g., a streaming consumer that aborts once N bytes are read) or rely on the proxy; don't trust the client header.
- **Remotely exploitable:** Yes.

### M-4. CSRF: login CSRF confirmed; logout/refresh/appointment CSRF when `SameSite=None`
- **CVSS:** 5.3
- **Confidence:** Login CSRF Confirmed (live test); the rest Potential (config-dependent)
- **Files:** `backend/api/auth_routes.py` (`login`, `logout`, `refresh_token`, appointment mutations); `backend/config.py:45-46`
- **Why vulnerable:** Cookie-based auth with **no CSRF token and no Origin/Host verification.** Under the default `SameSite=Lax` and the current CORS allow-list, cross-site *top-level* form POSTs to `/api/auth/login` still work: the response `Set-Cookie` is honored by the browser even though the request carried no cookies → **login CSRF** (victim's browser logged into an attacker account; victim then enters PII there). If the operator sets `COOKIE_SAMESITE=none` (the only way a cross-site Vercel→Railway deployment works, per docs), the same primitive turns into **logout CSRF** and state-changing CSRF on appointments (cancel/accept) and `/refresh`.
- **Exploit (login CSRF):** attacker hosts `<form action="https://api.../api/auth/login" method=POST>` with attacker creds; victim visits → victim's browser now holds attacker's session cookies.
- **Recommended fix:** reject requests whose `Origin` is not in the CORS allow-list for all cookie-bearing mutations; or add a double-submit CSRF token; or prefer `SameSite=Strict`. For login, requiring a CSRF token or Origin check closes login CSRF without breaking UX.
- **Remotely exploitable:** Yes.

### M-5. Frontend CSP is ineffective and hardcoded to localhost:8000
- **CVSS:** 5.3 (XSS protection weakened + functional break risk)
- **Confidence:** Confirmed (config)
- **Files:** `frontend/next.config.js:16`; also `backend/main.py:50` (API CSP with `unsafe-inline`/`unsafe-eval`)
- **Why vulnerable:** `script-src 'self' 'unsafe-inline' 'unsafe-eval'` provides almost no XSS mitigation (attacker-injected inline scripts are allowed). `connect-src 'self' http://localhost:8000` hardcodes the dev origin; in a production cross-site deployment (frontend on Vercel, API on Railway) the browser **blocks all API calls**, and over HTTPS the scheme `http://` is also wrong. No `base-uri`, `object-src 'none'`, `frame-ancestors`, or `form-action`.
- **Recommended fix:** remove `unsafe-inline`/`unsafe-eval` for production builds; set `connect-src 'self' <API_ORIGIN>` via `NEXT_PUBLIC_API_URL`; add `object-src 'none'; base-uri 'self'; frame-ancestors 'none'`.
- **Remotely exploitable:** n/a (hardening + functional).

### M-6. Unverified doctors are publicly listed and bookable
- **CVSS:** 5.3 (workflow/authorization gap)
- **Confidence:** Confirmed (live test: "Unverified Dr" appears in `/api/doctors` and could be booked)
- **Files:** `backend/api/doctor_routes.py:26-33,42-50`; `backend/api/appointment_routes.py:73-77`
- **Why vulnerable:** `list_doctors`/`get_doctor`/`search_doctors` filter only `User.is_active`/`role`; they never check `DoctorProfile.is_verified`. `book_appointment` likewise. The approval workflow (`is_verified=False` until admin approves) is therefore cosmetic.
- **Impact:** patients can consult/enter PHI with doctors who were never approved; undermines the documented "approved doctor workflow."
- **Recommended fix:** add `DoctorProfile.is_verified == True` to the public queries and to `book_appointment`'s doctor lookup.
- **Remotely exploitable:** Yes.

### M-7. docker-compose publishes Postgres with default credentials
- **CVSS:** 7.5 if the host is Internet-reachable; 5.3 otherwise
- **Confidence:** Confirmed (file)
- **Files:** `docker-compose.yml:41-46`
- **Why vulnerable:** `ports: "5432:5432"` maps the DB to the host with `POSTGRES_PASSWORD=postgres` hardcoded. This directly contradicts the documented fix ("DB not published"). Any process on the host network (or, on a public host, the Internet) can log in with `postgres:postgres` and read/write all patient data.
- **Recommended fix:** remove the `ports:` block for `db`; inject a strong `POSTGRES_PASSWORD` from env with a `${VAR:?}` guard; add `POSTGRES_HOST_AUTH_METHOD` hardening.
- **Remotely exploitable:** Yes if the host is exposed.

### M-8. Tokens returned in response bodies (dual-channel bearer+cookie auth)
- **CVSS:** 5.0
- **Confidence:** Confirmed (live test: login/register/refresh return `access_token`/`refresh_token` in JSON)
- **Files:** `backend/schemas/user.py:40-44`; `backend/api/auth_routes.py:130-135,183,228,304`
- **Why vulnerable:** although the frontend switched to HttpOnly cookies, the API still emits raw JWTs in response bodies. A refresh token valid for 7 days can be exfiltrated from logs, proxy captures, or browser devtools, and used via the still-supported `Authorization: Bearer` path — bypassing every cookie-based protection (HttpOnly, SameSite, XSS isolation).
- **Recommended fix:** stop returning `access_token`/`refresh_token` in bodies; return only the user + a status. Keep cookies as the sole channel. If API compatibility requires it, gate the fields behind an explicit opt-in.
- **Remotely exploitable:** Yes (requires reading a response body or log).

### M-9. Public unauthenticated endpoints expose medical/pharma reference data with no rate limiting
- **CVSS:** 5.3
- **Confidence:** Confirmed (live test: `/api/symptoms`, `/api/medicines`, `/api/diseases`, `/api/doctors` all 200 unauthenticated)
- **Files:** `backend/api/medicine_routes.py`, `disease_routes.py`, `symptom_routes.py`, `doctor_routes.py`
- **Why vulnerable:** `/api/medicines/{id}`, `/api/diseases/{id}` (with nested medicines incl. `dosage`, `side_effects`, `usage_instructions`), `/api/symptoms` are fully public, no auth, no rate limit, no pagination on `/diseases/symptoms` and `/diseases/1`-style lookups. An attacker can scrape all reference data and hammer `ilike` scans.
- **Impact:** unlimited scrape/DoS surface; exposes dosage/side-effect reference data (sensitive for a medical context) to anyone.
- **Recommended fix:** rate-limit public endpoints (e.g., 60/min/IP); consider requiring auth for medicine/disease detail endpoints.
- **Remotely exploitable:** Yes.

---

## LOW

### L-1. `reset-password` endpoint has no rate limiting
- **CVSS:** 3.7 — **Files:** `backend/api/auth_routes.py:348-390`. Live test: 30 rapid reset attempts, zero 429s. Token entropy (48 bytes url-safe) makes guessing infeasible, but the endpoint is an unauthenticated DB-write surface with no throttle. Fix: apply the forgot-limiter or a dedicated reset limiter.

### L-2. Account/email enumeration via register
- **CVSS:** 3.7 — **Files:** `backend/api/auth_routes.py:147-154`. `register` returns a distinct 400 "User with this email or username already exists" → confirms account existence. Login and forgot are already equalized. Fix: return a generic message.

### L-3. Default `COOKIE_SECURE=false`; HSTS only when `request.url.scheme == "https"`
- **CVSS:** 4.0 — **Files:** `backend/config.py:45`, `backend/main.py:52-53`. Any deployment that forgets `COOKIE_SECURE=true` sends session cookies over plaintext HTTP. HSTS depends on uvicorn's `--proxy-headers` honoring `X-Forwarded-Proto`; a TLS-terminating proxy that does not forward the proto silently disables HSTS. Fix: make `COOKIE_SECURE` default to `True` and add a startup guard that refuses `COOKIE_SECURE=false` in production; compute HSTS from forwarded proto.

### L-4. Report generation not rate limited; files accumulate on ephemeral storage
- **CVSS:** 3.7 — **Files:** `backend/api/report_routes.py:16-39`, `backend/services/report_service.py:19-20`. Any authenticated user can POST `/api/reports/generate/{id}` repeatedly → PDFs written to the container FS. No rate limit; on Railway (no persistent volume) reports are also lost on redeploy (functional). Fix: rate-limit; store reports in object storage.

### L-5. Emails logged
- **CVSS:** 3.0 — **Files:** `backend/services/email_service.py:21,53`. `logger.warning("...reset email to %s ...", to_email)` and the error path log recipient email addresses (PII) to logs. Fix: redact.

### L-6. Case-insensitive duplicate-email edge (register check not lowercased)
- **CVSS:** 2.6 — **Files:** `backend/api/auth_routes.py:147-148`. Stored emails are lowercased but the duplicate check compares the raw input; on case-sensitive DBs `Alice@X.dev` can be registered after `alice@x.dev`, creating a shadow account that login (which lowercases) resolves to the first account. Fix: compare `user_data.email.lower()`.

### L-7. Bootstrap admin password not strength-checked
- **CVSS:** 3.1 — **Files:** `backend/main.py:69-97`. `BOOTSTRAP_ADMIN_PASSWORD` is accepted as-is; a weak/known value creates a weak admin with no warning. Fix: run `validate_password_strength` on it.

### L-8. `/api/specialist` reflects user query parameters
- **CVSS:** 3.1 — **Files:** `backend/api/nearby_routes.py:132-138`, `backend/services/specialist_service.py:78-89`. `disease`/`symptom` are reflected into `reason`. React renders it escaped (no `dangerouslySetInnerHTML` found), so no confirmed XSS — Potential only.

### L-9. Unbounded in-memory growth in limiter and nearby cache
- **CVSS:** 3.7 — **Files:** `backend/auth/rate_limiter.py:25,48` (`_hits`/`_failures` keyed by attacker-controlled IPs, never evicted); `backend/services/nearby_service.py:26` (`_CACHE` never evicts). Long-running workers will grow memory. Fix: cap dict sizes or use an eviction policy.

### L-10. Case-insensitive email/username; username uniqueness is case-sensitive
- Same family as L-6; usernames `Bob`/`bob` are distinct. Low.

---

## INFORMATIONAL & REGRESSIONS (functional, non-security)

### R-1. Appointment rescheduling is completely broken
- **CVSS:** n/a — **Confidence:** Confirmed (live test)
- **Files:** `backend/schemas/medical.py:111`
- **Code:** `date: Optional[date] = None` — a field whose *name equals its type name* under `Optional` resolves to `NoneType` in pydantic 2.11 (reproduced in isolation: `AppointmentUpdate(date='2026-11-02')` → `none_required`). Any PUT reschedule with a new date → **422 "Input should be None"** for patient and admin alike.
- **Impact:** rescheduling broken end-to-end.
- **Fix:** `from datetime import date as _Date` and type the field `Optional[_Date]`, or use `dt.date | None`.

### R-2. `/api/diseases/symptoms` is unreachable
- **Confidence:** Confirmed (live test: any `symptom_ids` count → 422)
- **Files:** `backend/api/disease_routes.py:25,36` — `/diseases/{disease_id}` is registered before `/diseases/symptoms`, so `disease_id="symptoms"` fails int parsing. The endpoint (and its unbounded-`IN` DoS risk) is dead. Fix: register `/diseases/symptoms` before `/diseases/{disease_id}`.

### R-3. Patient reminders feature has no backend
- **Confidence:** Confirmed (live test: GET/POST `/api/reminders` → 404)
- **Files:** `frontend/services/medical.service.ts:74-92`, `frontend/pages/patient/reminders.tsx`. `MedicineReminder` model exists; no API router implements it. The page always errors.

### R-4. Admin appointment actions fail in the UI
- **Confidence:** Confirmed (live test: admin DELETE and PUT on another user's appointment → 403)
- **Files:** `frontend/pages/admin/appointments.tsx:100,114`; backend `appointment_routes.py` cancel (patient-only) and update (patient-or-doctor) exclude admins. Admin cancel/reschedule always fails.

### R-5. Admin and doctor pages are static mock-ups
- **Files:** `admin/users.tsx`, `admin/doctors.tsx`, `admin/dashboard.tsx`, `admin/analytics.tsx`, `doctor/medical-notes.tsx`, `doctor/patient-history.tsx`, `doctor/patients.tsx` contain hardcoded fake user data (including names/emails) and never call the live API. No backend route exists for doctors to view patient records. The real admin endpoints (`/admin/users`, `/admin/doctors`) are unreachable from the UI.

### R-6. Docs overstate coverage
- `PROOF-README.md` and `DEPLOYMENT.md` claim "All API routes (except public doctor lookup and auth) require authentication" — false: `/medicines`, `/diseases`, `/symptoms` are public. Also claim compose DB port closed — false.

### R-7. Reports stored on ephemeral container storage
- Reports are lost on Railway redeploys and never backed up. Store in object storage.

---

# Live Penetration Test Results (summary)

| Test | Result |
|---|---|
| JWT `alg=none` forgery | Blocked (401) |
| JWT signed with wrong secret | Blocked (401) |
| Refresh token used as access token | Blocked (401) |
| Register with `role:"admin"` in body | Blocked — role stays `patient` |
| Tokens in login/register/refresh body | **Present (M-8)** |
| Bearer-header auth still accepted | Yes (M-8) |
| Logout invalidates access token (token_version) | Works |
| Refresh rotation + replay → session revoked | Works |
| IDOR: cross-user prediction/delete/report | Blocked (404/403) |
| IDOR: cross-user appointment view/cancel | Blocked (403) |
| Doctor accept of own appointment | Works |
| Same-IP lockout after 6 failures | Works (429) |
| **Per-user lockout enforced** | **Broken — correct password succeeds from new IP (H-1)** |
| **Rate limit via rotating X-Forwarded-For** | **Bypassed (H-1/M-2)** |
| reset-password rate limiting | Absent (L-1) |
| Public medical/pharma endpoints | Unauthenticated (M-9) |
| Unverified doctor listed/bookable | Yes (M-6) |
| Admin cancel/reschedule appointment | 403 (R-4) |
| Reminders endpoints | 404 (R-3) |
| Login CSRF (arbitrary Origin) | Possible (M-4) |
| Body-limit bypass (lying Content-Length) | Yes (M-3) |
| HSTS header over http | Absent (by design; proxy-dependent in prod) (L-3) |

# Regression Check

- Auth flow: **OK** (register→login→/me→predict verified).
- Refresh flow: **OK** (rotation + replay detection verified).
- Logout: **OK** (all tokens dead immediately).
- Roles: **OK** (server-side, DB-backed; token role not trusted).
- Ownership / IDOR: **OK** across predictions, reports, appointments.
- **Appointment workflow: REGRESSED** — reschedule 422 (R-1); unverified doctors bookable (M-6); admin actions 403 (R-4).
- **Report/PDF generation: OK** (escaped output, ownership enforced; but no rate limit / persistence).
- **Nearby search: OK** (rate-limited, escaped URLs, fixed outbound endpoints).
- **Reminders: REGRESSED** (no backend).

---

# Mapping

## OWASP Top 10 (2021)
| # | Control | Findings |
|---|---|---|
| A01 | Broken Access Control | M-6 (unverified doctors), M-7 (DB exposure), M-9 (public data) |
| A02 | Cryptographic Failures | L-3 (COOKIE_SECURE/HSTS), M-1 (PyJWT CVEs) |
| A03 | Injection | none confirmed (ORM, HTML-escaped PDFs) |
| A04 | Insecure Design | H-1 (broken lockout), M-3 (body limit) |
| A05 | Security Misconfiguration | M-4 (CSRF), M-5 (CSP), M-7, L-3 |
| A06 | Vulnerable Components | M-1 (37 CVEs in 6 packages) |
| A07 | ID/As Failed | none (IDOR checks solid) |
| A08 | Software/Data Integrity | seed guard OK, dockerignore OK |
| A09 | Logging & Monitoring | L-5 (emails in logs) |
| A10 | SSRF | none (fixed outbound URLs) |

## OWASP API Top 10
- **API1** Broken Object Level Authz — no confirmed IDOR (good).
- **API2** Broken User Auth — H-1 (lockout), L-2 (enumeration).
- **API4** Resource Consumption — M-3, L-9, M-9.
- **API5** Broken Function Level Authz — M-6 (unverified doctors).
- **API6** Unrestricted Access to Sensitive Business Flows — M-9 (public medical data).
- **API8** Security Misconfiguration — M-4, M-5, M-7.
- **API9** Improper Inventory Management — R-3/R-4/R-5 (dead/mock UI vs backend).

## CWE Top 25
CWE-287 (auth) — H-1; CWE-307 (brute force) — H-1/M-2; CWE-352 (CSRF) — M-4; CWE-770 (resource exhaustion) — M-3/M-9/L-9; CWE-522 (credentials exposure) — M-8; CWE-525 (Cache-Control) — H-2; CWE-937 (components) — M-1; CWE-200 (info exposure) — L-1/L-2/L-5.

## Dependency Findings
37 known-CVE records across PyJWT, starlette, python-multipart, requests, setuptools, python-dotenv. See M-1.

## Deployment Risks
- Compose publishes Postgres w/ default creds (M-7).
- COOKIE_SECURE=false default + HSTS proxy-dependence (L-3).
- CSP hardcodes `http://localhost:8000` (M-5).
- Reports on ephemeral storage (R-7).
- No persistent volume for generated PDFs.
- Cross-site cookie deployment (SameSite=None) increases CSRF surface (M-4).

---

# Positive Security Improvements (verified)

- Server-assigned roles; role escalation **blocked**.
- `SECRET_KEY` required, min 32 chars, forbidden defaults → fail-fast.
- Refresh-token **rotation + replay detection** revokes the whole session (verified).
- Logout bumps `token_version` → immediate global invalidation (verified).
- HttpOnly + SameSite cookies; no `localStorage` tokens anywhere.
- IDOR/ownership enforced on predictions, reports, appointments (verified).
- Password reset: random one-time hashed tokens, 30-min expiry, single-use, session revocation.
- Password policy (min 12, complexity, common-list) + SHA-256 pre-hash defeats bcrypt 72-byte truncation.
- No SQL injection (ORM params); no SSRF (fixed URLs); no `dangerouslySetInnerHTML` (no stored/reflected XSS sink); PDF content HTML-escaped.
- Security headers present (CSP/XFO/XCTO/Referrer/Permissions/HSTS-conditional).
- Non-root Docker users; no prod seeding; seed refuses non-SQLite; `.dockerignore` excludes `.env`.
- Input bounds on predict (≤10 symptoms ≤100 chars), nearby (lat/lng/radius).

---

# Production Checklist

1. **Fix H-1 / M-2:** enforce per-user lockout in `check()`; stop trusting leftmost XFF (use rightmost + proxy trust). Re-run brute-force test.
2. **Bump deps (M-1):** PyJWT≥2.13, fastapi≥0.119/starlette≥1.3.1, python-multipart≥0.0.31, requests≥2.33.0; re-run `pip-audit` to zero findings.
3. **Add `Cache-Control: no-store`** on authenticated endpoints (H-2).
4. **Fix reschedule bug** (R-1, `Optional[date]` → distinct type name).
5. **Implement or mount the reminders backend** (R-3), or remove the page.
6. **Unshadow `/diseases/symptoms`** (R-2).
7. **Add Origin/CSRF protection** for cookie mutations (M-4); prefer `SameSite=Strict` or CSRF tokens; close login CSRF.
8. **Fix compose DB exposure** (M-7) and document bootstrap admin setup for compose.
9. **Stop returning tokens in bodies** (M-8) or gate behind opt-in.
10. **Harden CSP** (M-5): drop `unsafe-inline`/`unsafe-eval` in prod, correct `connect-src`.
11. **Filter unverified doctors** from public list + booking (M-6).
12. **Harden body-size limit** to the actual read (M-3).
13. **Rate-limit reset-password + report generation** (L-1, L-4).
14. **Force COOKIE_SECURE in production; add forwarded-proto HSTS** (L-3).
15. **Store reports in persistent/object storage** (R-7).
16. **Validate bootstrap admin password** (L-7).
17. Wire real admin/doctor pages to the API or remove mock data (R-5).

---

# Final Verdict

## ❌ Not Ready for Production

Core authentication, authorization, and ownership controls are **strong and held up under live attack** — no privilege escalation, token forgery, or IDOR was achieved. But a healthcare application that stores real patient data cannot ship with: a **broken account-lockout and bypassable rate limiting** (credential stuffing), **known CVEs in the JWT library and framework**, **no cache-busting on PHI responses**, **CSRF gaps**, an **exposed database with default credentials** in the shipped compose config, and a **reschedule feature that returns 422**. Resolve High items (H-1, H-2) and the dependency bump (M-1), fix the regression set (R-1..R-4), then re-assess.

Target after fixes: **8+/10**.
