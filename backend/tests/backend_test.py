"""
Backend regression tests for not4sale API.
Covers: /api/health, /api/contact, /api/leads, /api/chat,
/api/chat/history/{session_id}, /api/sitemap.xml
"""
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fall back to frontend .env (test runs inside container)
    from pathlib import Path
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().strip('"')
                break
BASE_URL = (BASE_URL or "").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------------- Health ----------------
class TestHealth:
    def test_health_ok(self, client):
        r = client.get(f"{API}/health", timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("status") == "ok"
        assert data.get("db") == "ok"


# ---------------- Contact / Leads ----------------
class TestLeads:
    created_id = None
    created_email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"

    def test_create_lead(self, client):
        payload = {
            "name": "TEST_User",
            "email": TestLeads.created_email,
            "message": "Vorrei una consulenza SEO per il mio e-commerce.",
            "service": "seo",
        }
        r = client.post(f"{API}/contact", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert "created_at" in data
        assert data["email"] == payload["email"]
        assert data["name"] == payload["name"]
        assert data["message"] == payload["message"]
        TestLeads.created_id = data["id"]

    def test_create_lead_invalid_email(self, client):
        r = client.post(
            f"{API}/contact",
            json={"name": "x", "email": "not-an-email", "message": "hi"},
            timeout=10,
        )
        assert r.status_code in (400, 422)

    def test_list_leads_contains_created(self, client):
        r = client.get(f"{API}/leads", timeout=20)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list) and len(items) > 0
        emails = [it.get("email") for it in items]
        assert TestLeads.created_email in emails
        # Most recent first: created lead should be near top
        top_idx = emails.index(TestLeads.created_email)
        assert top_idx < 10, f"Lead not at top of recent list (idx={top_idx})"


# ---------------- Chat (Claude Sonnet 4.5 live) ----------------
class TestChat:
    session_id = f"test-session-{uuid.uuid4().hex[:8]}"

    def test_chat_reply_in_italian(self, client):
        payload = {
            "session_id": TestChat.session_id,
            "message": "Ciao, cosa fate per la SEO?",
        }
        r = client.post(f"{API}/chat", json=payload, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("session_id") == TestChat.session_id
        reply = data.get("reply", "")
        assert isinstance(reply, str) and len(reply.strip()) > 0
        # Crude Italian heuristic: contains italian-typical chars/words or is at least non-trivial
        lower = reply.lower()
        italian_markers = ["sono", "siamo", "perché", "per", "che", "di", "ciao", "seo", "marketing", "il ", "la ", "n4s"]
        assert any(m in lower for m in italian_markers), f"Reply does not look Italian: {reply[:200]}"

    def test_chat_history_persists(self, client):
        # Small delay to ensure write finished
        time.sleep(1)
        r = client.get(f"{API}/chat/history/{TestChat.session_id}", timeout=20)
        assert r.status_code == 200, r.text
        msgs = r.json()
        assert isinstance(msgs, list) and len(msgs) >= 2
        roles = [m.get("role") for m in msgs]
        assert "user" in roles and "assistant" in roles
        # First should be user, then assistant (chronological order)
        assert msgs[0]["role"] == "user"
        assert msgs[1]["role"] == "assistant"
        assert msgs[0]["content"] == "Ciao, cosa fate per la SEO?"

    def test_chat_invalid_payload(self, client):
        r = client.post(f"{API}/chat", json={"session_id": "", "message": ""}, timeout=10)
        assert r.status_code in (400, 422)


# ---------------- Sitemap ----------------
class TestSitemap:
    def test_sitemap_xml(self, client):
        r = client.get(f"{API}/sitemap.xml", timeout=20)
        assert r.status_code == 200, r.text
        ctype = r.headers.get("content-type", "")
        assert "xml" in ctype.lower()
        body = r.text
        assert body.startswith("<?xml")
        for route in ["/", "/servizi", "/servizi/seo", "/contatti"]:
            assert f"<loc>https://not4.sale{route}</loc>" in body, f"missing {route}"
