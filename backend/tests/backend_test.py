"""
Backend regression tests for not4sale API (Phase 2).
Covers:
 - /api/health
 - /api/contact, /api/leads
 - /api/chat (IT + EN), /api/chat/history/{session_id}
 - /api/quote/estimate (Claude Sonnet 4.5 live)
 - /api/articles, /api/articles/{slug}
 - /api/og (PNG 1200x630)
 - /api/sitemap.xml
"""
import io
import os
import uuid
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
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
        assert data["email"] == payload["email"]
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


# ---------------- Chat IT (Claude Sonnet 4.5 live) ----------------
class TestChatIT:
    session_id = f"test-it-{uuid.uuid4().hex[:8]}"

    def test_chat_reply_in_italian(self, client):
        r = client.post(
            f"{API}/chat",
            json={"session_id": TestChatIT.session_id, "message": "Ciao, cosa fate per la SEO?", "locale": "it"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("session_id") == TestChatIT.session_id
        reply = data.get("reply", "")
        assert isinstance(reply, str) and len(reply.strip()) > 0
        lower = reply.lower()
        italian_markers = ["sono", "siamo", "perché", "per", "che", "di", "ciao", "il ", "la ", "n4s", "una", "noi"]
        assert any(m in lower for m in italian_markers), f"Reply not Italian: {reply[:200]}"

    def test_chat_history_persists(self, client):
        time.sleep(1)
        r = client.get(f"{API}/chat/history/{TestChatIT.session_id}", timeout=20)
        assert r.status_code == 200, r.text
        msgs = r.json()
        assert isinstance(msgs, list) and len(msgs) >= 2
        roles = [m.get("role") for m in msgs]
        assert "user" in roles and "assistant" in roles

    def test_chat_invalid_payload(self, client):
        r = client.post(f"{API}/chat", json={"session_id": "", "message": ""}, timeout=10)
        assert r.status_code in (400, 422)


# ---------------- Chat EN ----------------
class TestChatEN:
    session_id = f"test-en-{uuid.uuid4().hex[:8]}"

    def test_chat_reply_in_english(self, client):
        r = client.post(
            f"{API}/chat",
            json={"session_id": TestChatEN.session_id, "message": "Hi, what can you offer?", "locale": "en"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "")
        assert reply and len(reply.strip()) > 0
        lower = reply.lower()
        english_markers = [" the ", " we ", " you ", " our ", " can ", " offer", " help", "hi ", "hello", "marketing"]
        # Italian-only stop signal: if it has 'siamo', 'perché', 'sono' but no english markers, fail
        has_en = any(m in lower for m in english_markers)
        assert has_en, f"Reply not English: {reply[:240]}"


# ---------------- Quote estimate (LLM live) ----------------
class TestQuote:
    lead_id = None

    def test_quote_estimate_it(self, client):
        payload = {
            "objective": "Aumentare lead qualificati dal sito B2B SaaS",
            "services": ["seo", "ai-marketing"],
            "budget": "5-10k",
            "timeline": "3-6 mesi",
            "name": "TEST_QuoteUser",
            "email": f"TEST_quote_{uuid.uuid4().hex[:8]}@example.com",
            "company": "TEST Corp",
            "notes": "Mercato Italia, target IT manager, sito attuale con poco traffico organico.",
            "locale": "it",
        }
        r = client.post(f"{API}/quote/estimate", json=payload, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        # Required fields
        for k in ("lead_id", "estimate_range", "recommended_approach", "next_steps", "fit_score"):
            assert k in data, f"Missing key {k}"
        assert isinstance(data["lead_id"], str) and len(data["lead_id"]) > 0
        assert isinstance(data["estimate_range"], str) and len(data["estimate_range"]) > 0
        assert isinstance(data["recommended_approach"], str) and len(data["recommended_approach"]) > 0
        assert isinstance(data["next_steps"], list)
        assert 1 <= len(data["next_steps"]) <= 5
        assert isinstance(data["fit_score"], int)
        assert 0 <= data["fit_score"] <= 100
        TestQuote.lead_id = data["lead_id"]

    def test_quote_persisted_in_leads(self, client):
        assert TestQuote.lead_id, "lead_id from previous test required"
        r = client.get(f"{API}/leads?limit=100", timeout=20)
        assert r.status_code == 200
        items = r.json()
        ids = [it.get("id") for it in items]
        assert TestQuote.lead_id in ids, "Quote lead not persisted in leads collection"

    def test_quote_invalid_email(self, client):
        r = client.post(
            f"{API}/quote/estimate",
            json={
                "objective": "x", "services": [], "budget": "1k", "timeline": "1m",
                "name": "x", "email": "not-an-email",
            },
            timeout=20,
        )
        assert r.status_code in (400, 422)


# ---------------- Articles ----------------
class TestArticles:
    def test_articles_it_list(self, client):
        r = client.get(f"{API}/articles?locale=it", timeout=20)
        assert r.status_code == 200, r.text
        items = r.json()
        assert isinstance(items, list)
        assert len(items) == 4, f"Expected 4 IT articles, got {len(items)}"
        for a in items:
            assert a.get("locale") == "it"
            assert a.get("title")
            assert a.get("slug")
            assert a.get("content_md")
            assert isinstance(a.get("tags"), list)
            assert isinstance(a.get("read_minutes"), int)

    def test_articles_en_list(self, client):
        r = client.get(f"{API}/articles?locale=en", timeout=20)
        assert r.status_code == 200, r.text
        items = r.json()
        assert len(items) == 4
        for a in items:
            assert a.get("locale") == "en"
            assert a.get("title") and a.get("slug") and a.get("content_md")
            assert isinstance(a.get("tags"), list) and isinstance(a.get("read_minutes"), int)

    def test_article_detail_it(self, client):
        r = client.get(f"{API}/articles/aeo-vs-seo-cosa-cambia?locale=it", timeout=20)
        assert r.status_code == 200, r.text
        a = r.json()
        assert a["slug"] == "aeo-vs-seo-cosa-cambia"
        assert a["locale"] == "it"
        assert "AEO" in a["title"]

    def test_article_detail_en(self, client):
        r = client.get(f"{API}/articles/aeo-vs-seo-whats-changing?locale=en", timeout=20)
        assert r.status_code == 200, r.text
        a = r.json()
        assert a["slug"] == "aeo-vs-seo-whats-changing"
        assert a["locale"] == "en"

    def test_article_404(self, client):
        r = client.get(f"{API}/articles/does-not-exist-xyz?locale=it", timeout=20)
        assert r.status_code == 404


# ---------------- OG image ----------------
class TestOG:
    def test_og_png(self, client):
        r = client.get(
            f"{API}/og",
            params={"title": "Test", "subtitle": "Hello", "kicker": "KICKER"},
            timeout=20,
        )
        assert r.status_code == 200, r.text[:200]
        ctype = r.headers.get("content-type", "")
        assert "image/png" in ctype.lower(), f"content-type={ctype}"
        # Validate it's a real PNG with proper dimensions using Pillow
        from PIL import Image
        img = Image.open(io.BytesIO(r.content))
        assert img.format == "PNG"
        assert img.size == (1200, 630), f"size={img.size}"


# ---------------- Sitemap ----------------
class TestSitemap:
    def test_sitemap_xml(self, client):
        r = client.get(f"{API}/sitemap.xml", timeout=20)
        assert r.status_code == 200, r.text
        ctype = r.headers.get("content-type", "")
        assert "xml" in ctype.lower()
        body = r.text
        assert body.startswith("<?xml")
        for route in ["/", "/servizi", "/contatti", "/preventivo", "/insights", "/en", "/en/quote"]:
            assert f"<loc>https://not4.sale{route}</loc>" in body, f"missing {route}"
        # Article URLs
        assert "/insights/aeo-vs-seo-cosa-cambia" in body
        assert "/en/insights/aeo-vs-seo-whats-changing" in body
