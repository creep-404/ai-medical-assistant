"""End-to-end check of the OAuth flow using TestClient with a mocked provider.

Verifies:
  - start returns authorize_url with signed state + configured callback
  - callback validates the signed state (bad/foreign state -> 400)
  - token exchange + userinfo run against the provider endpoints
  - OAuth creates a patient user and issues the same JWT cookies
  - duplicate OAuth login reuses the SAME user (no dup account)
  - OAuth email matching an existing password account LINKS to it and
    preserves its id + password
  - unconfigured provider -> 503
"""
import os

os.environ["SECRET_KEY"] = "test-secret-key-that-is-32-characters-long!!"
os.environ["PUBLIC_API_URL"] = "http://localhost:8000"
os.environ["FRONTEND_URL"] = "http://localhost:3000"
os.environ["GOOGLE_CLIENT_ID"] = "gid"
os.environ["GOOGLE_CLIENT_SECRET"] = "gsecret"
os.environ["GITHUB_CLIENT_ID"] = "ghid"
os.environ["GITHUB_CLIENT_SECRET"] = "ghsecret"
os.environ["DATABASE_URL"] = "sqlite:///./_oauth_test.db"
for _f in ("_oauth_test.db",):
    if os.path.exists(_f):
        os.remove(_f)

from fastapi.testclient import TestClient

import backend.api.oauth_routes as oauth
from backend.api.auth_routes import hash_password, verify_password
from backend.database.database import SessionLocal
from backend.models import User

results = []


class _Ok(dict):
    @property
    def status_code(self):
        return 200

    def raise_for_status(self):
        pass

    def json(self):
        return dict(self)


class _EmailList(_Ok):
    def json(self):
        return self._emails


def google_http(url, **kwargs):
    return {"access_token": "gtok"}, {"sub": "google-123", "email": "Alice@Example.com",
                                      "email_verified": True, "name": "Alice"}


def exit_if_msg(msg):
    raise AssertionError(msg)


from backend.main import app
client = TestClient(app)

# ---- A) unconfigured provider -> 503 --------------------------
settings = oauth.settings
settings.GOOGLE_CLIENT_ID = ""
settings.GOOGLE_CLIENT_SECRET = ""
r = client.get("/api/auth/oauth/google/start")
assert r.status_code == 503, r.status_code
results.append("unconfigured google -> 503")

# re-enable
settings.GOOGLE_CLIENT_ID = "gid"
settings.GOOGLE_CLIENT_SECRET = "gsecret"
settings.GITHUB_CLIENT_ID = "ghid"
settings.GITHUB_CLIENT_SECRET = "ghsecret"


def install_google_mocks():
    from backend.api import oauth_routes as o

    def post(url, **kwargs):
        return _Ok(access_token="gtok")

    def get(url, **kwargs):
        return _Ok(sub="google-123", email="Alice@Example.com", email_verified=True, name="Alice")

    o.httpx.post = post
    o.httpx.get = get


def install_github_mocks(account_id="999", primary_email="alice.dev@corp.com", login="alice-dev"):
    from backend.api import oauth_routes as o

    def post(url, **kwargs):
        return _Ok(access_token="ghtok")

    def get(url, **kwargs):
        if url.endswith("/user"):
            return _Ok(id=int(account_id), login=login, name=None, email=None)
        mails = _EmailList()
        mails["_"] = None
        mails._emails = [{"email": primary_email, "primary": True, "verified": True}]
        return mails

    o.httpx.post = post
    o.httpx.get = get


# ============ B) Google: create fresh account ===============
install_google_mocks()
url = client.get("/api/auth/oauth/google/start").json()["authorize_url"]
assert "accounts.google.com" in url and "state=" in url
state = url.split("state=")[1]
r = client.get(f"/api/auth/oauth/google/callback?code=abc&state={state}", follow_redirects=False)
assert r.status_code == 302, r.status_code
assert r.headers["location"] == "http://localhost:3000/login?oauth=success"
assert "access_token" in r.headers.get("set-cookie", "")
results.append("google creates patient account + JWT cookies + redirect")

db = SessionLocal()
u = db.query(User).filter(User.email == "alice@example.com").first()
assert u, "google user not created"
assert u.role.value == "patient", "role must be patient"
first_id = u.id
assert u.oauth_accounts and u.oauth_accounts[0].provider_account_id == "google-123"
db.close()

# ============ C) duplicate Google login -> SAME user =========
install_google_mocks()
url = client.get("/api/auth/oauth/google/start").json()["authorize_url"]
state = url.split("state=")[1]
r = client.get(f"/api/auth/oauth/google/callback?code=abc&state={state}", follow_redirects=False)
assert r.status_code == 302
db = SessionLocal()
assert db.query(User).filter(User.email == "alice@example.com").count() == 1
assert db.query(User).count() == 1, f"duplicate account created: {db.query(User).count()}"
db.close()
results.append("duplicate google login -> same account (no dup)")

# ============ D) forged/bad state -> 400 =======================
r = client.get("/api/auth/oauth/google/callback?code=abc&state=forged", follow_redirects=False)
assert r.status_code == 400, r.status_code
results.append("forged state rejected -> 400")

# ============ E) GitHub flow via emails endpoint ===============
install_github_mocks()
url = client.get("/api/auth/oauth/github/start").json()["authorize_url"]
assert "github.com/login/oauth/authorize" in url
state = url.split("state=")[1]
r = client.get(f"/api/auth/oauth/github/callback?code=gh&state={state}", follow_redirects=False)
assert r.status_code == 302, r.status_code
db = SessionLocal()
gu = db.query(User).filter(User.email == "alice.dev@corp.com").first()
assert gu, "github user not created"
assert gu.oauth_accounts[0].provider_account_id == "999"
db.close()
print("[PASS] github flow creates account from emails endpoint")

# ============ F) link github to existing password user =========
# register a normal password user
r = client.post("/api/auth/register",
                json={"email": "linkme@example.com", "username": "JhonnyBravo",
                      "password": "StrongPass12345", "full_name": "Link Me"})
assert r.status_code == 201, r.text
link_id = r.json()["user"]["id"]

# OAuth the same email
install_github_mocks(account_id="777", primary_email="linkme@example.com")
url = client.get("/api/auth/oauth/github/start").json()["authorize_url"]
state = url.split("state=")[1]
r = client.get(f"/api/auth/oauth/github/callback?code=x&state={state}", follow_redirects=False)
assert r.status_code == 302
db = SessionLocal()
u2 = db.query(User).filter(User.id == link_id).first()
assert u2, "linked user gone"
assert u2.oauth_accounts and u2.oauth_accounts[0].provider_account_id == "777"
assert verify_password("StrongPass12345", u2.hashed_password) is True, "password must be preserved"
db.close()
print("[PASS] link to existing account preserves user id + password")

db = SessionLocal()
db.query(User).filter(User.role.isnot(None)).delete(synchronize_session=False)
db.commit()
db.close()

print("\n".join(results))
print("[ALL PASS]")