from fastapi import FastAPI, APIRouter, HTTPException, Query, BackgroundTasks
from fastapi.responses import Response, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import re
import base64
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, HttpUrl
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone
import httpx
import resend

from openai import AsyncOpenAI
from PIL import Image, ImageDraw, ImageFont


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Logger config (early so we can use it from anywhere)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
LLM_MODEL = os.environ.get('LLM_MODEL', 'qwen/qwen3-8b')
LLM_VISION_MODEL = os.environ.get('LLM_VISION_MODEL', 'qwen/qwen3-vl-8b-instruct')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
AUDIT_SITE_URL = os.environ.get('AUDIT_SITE_URL', 'https://not4.sale')

llm_client = AsyncOpenAI(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)

_THINK_RE = re.compile(r"<think>[\s\S]*?</think>\s*")


async def llm_complete(system_message: str, user_text: str, image_b64: Optional[str] = None) -> str:
    """Single-turn completion via OpenRouter. With image_b64 uses the vision model."""
    if image_b64 is None:
        content = user_text
        model = LLM_MODEL
    else:
        content = [
            {"type": "text", "text": user_text},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
        ]
        model = LLM_VISION_MODEL
    resp = await llm_client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": content},
        ],
    )
    text = resp.choices[0].message.content or ""
    # Qwen thinking-mode può includere blocchi <think> nel testo
    return _THINK_RE.sub("", text).strip()


if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

app = FastAPI(title="not4sale API", version="1.1.0")
api_router = APIRouter(prefix="/api")


# ============ MODELS ============
class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=40)
    service: Optional[str] = Field(default=None, max_length=80)
    budget: Optional[str] = Field(default=None, max_length=40)
    message: str = Field(..., min_length=1, max_length=4000)
    source: Optional[str] = Field(default="website")
    locale: Optional[str] = Field(default="it")


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    service: Optional[str] = None
    budget: Optional[str] = None
    message: str
    source: Optional[str] = "website"
    locale: Optional[str] = "it"
    extra: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=120)
    message: str = Field(..., min_length=1, max_length=4000)
    locale: Optional[str] = Field(default="it")


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatResponse(BaseModel):
    session_id: str
    reply: str


class QuoteRequest(BaseModel):
    objective: str = Field(..., max_length=200)
    services: List[str] = Field(default_factory=list)
    budget: str = Field(..., max_length=40)
    timeline: str = Field(..., max_length=80)
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default=None, max_length=120)
    website_url: Optional[str] = Field(default=None, max_length=500)
    notes: Optional[str] = Field(default=None, max_length=2000)
    locale: Optional[str] = Field(default="it")


class QuoteResponse(BaseModel):
    lead_id: str
    estimate_range: str
    recommended_approach: str
    next_steps: List[str]
    fit_score: int  # 0-100
    audit_scheduled: bool = False


class Article(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    locale: str = "it"
    title: str
    subtitle: Optional[str] = None
    excerpt: str
    content_md: str
    author: str = "not4sale"
    tags: List[str] = Field(default_factory=list)
    read_minutes: int = 5
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============ SYSTEM PROMPTS ============
SYSTEM_PROMPT_IT = (
    "Sei N4S, l'assistente AI dello studio di marketing not4sale con sede a Cattolica (Italia). "
    "Lo studio è guidato da 3 soci fondatori e offre: Growth Hacking, SEO, AEO, GEO, "
    "Brand Strategy, Performance Marketing, Social, Content, Web Design, AI Marketing. "
    "La filosofia di not4sale è 'costruiamo la macchina giusta per ogni cliente': niente Ferrari per chi vuole una 500. "
    "Tono: ribelle, diretto, confidente. Rispondi SEMPRE in italiano, conciso (max 4-6 frasi), incisivo. "
    "Qualifica il lead con 1-2 domande mirate (settore, obiettivo, budget) e invitalo a /contatti o al form. "
    "Mai promesse impossibili, mai numeri inventati, mai prezzi precisi. Se off-topic, riporta al marketing."
)

SYSTEM_PROMPT_EN = (
    "You are N4S, the AI assistant of not4sale, a marketing studio based in Cattolica (Italy). "
    "The studio is run by 4 co-founders and offers Growth Hacking, SEO, AEO, GEO, Brand Strategy, "
    "Performance Marketing, Social, Content, Web Design, AI Marketing. "
    "Philosophy: 'we build the right machine for each client'; no Ferraris for someone who wants a Fiat 500. "
    "Tone: bold, direct, confident. Always reply in English, concise (4-6 sentences), sharp. "
    "Qualify the lead with 1-2 targeted questions and invite them to /en/contact. "
    "Never promise impossible outcomes, never invent numbers or precise pricing. Steer off-topic back to marketing."
)


# ============ ROUTES ============
@api_router.get("/")
async def root():
    return {"name": "not4sale API", "status": "ok", "version": app.version}


@api_router.get("/health")
async def health():
    try:
        await db.command("ping")
        return {"status": "ok", "db": "ok"}
    except Exception as e:
        return {"status": "degraded", "db_error": str(e)}


# ---------- Leads ----------
@api_router.post("/contact", response_model=Lead)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)

    # Booking detection: mark any prior quote-calculator lead with same email as has_booked
    # so the follow-up worker skips it.
    try:
        await db.leads.update_many(
            {"email": payload.email, "source": "quote-calculator", "has_booked": {"$ne": True}},
            {"$set": {"has_booked": True, "booked_at": datetime.now(timezone.utc).isoformat()}}
        )
    except Exception:
        logger.exception("booking detection update failed")
    return lead


@api_router.get("/leads", response_model=List[Lead])
async def list_leads(limit: int = 100):
    cursor = db.leads.find({}, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    for it in items:
        if isinstance(it.get('created_at'), str):
            try:
                it['created_at'] = datetime.fromisoformat(it['created_at'])
            except Exception:
                pass
    return items


# ---------- Chat ----------
async def _get_history(session_id: str) -> List[dict]:
    cursor = db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1)
    return await cursor.to_list(length=1000)


@api_router.get("/chat/history/{session_id}", response_model=List[ChatMessage])
async def get_chat_history(session_id: str):
    items = await _get_history(session_id)
    for it in items:
        if isinstance(it.get('created_at'), str):
            try:
                it['created_at'] = datetime.fromisoformat(it['created_at'])
            except Exception:
                pass
    return items


@api_router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    session_id = payload.session_id.strip() or str(uuid.uuid4())

    user_msg = ChatMessage(session_id=session_id, role="user", content=payload.message)
    udoc = user_msg.model_dump()
    udoc['created_at'] = udoc['created_at'].isoformat()
    await db.chat_messages.insert_one(udoc)

    history = await _get_history(session_id)
    transcript_lines = []
    for h in history[:-1][-10:]:
        role = ("User" if h.get('role') == 'user' else "N4S")
        transcript_lines.append(f"{role}: {h.get('content', '')}")
    transcript = "\n".join(transcript_lines)

    base_sys = SYSTEM_PROMPT_EN if (payload.locale or 'it') == 'en' else SYSTEM_PROMPT_IT
    system_prompt = base_sys
    if transcript:
        tag = "[RECENT TRANSCRIPT]" if (payload.locale or 'it') == 'en' else "[STORICO CONVERSAZIONE RECENTE]"
        end_tag = "[END]" if (payload.locale or 'it') == 'en' else "[FINE STORICO]"
        system_prompt = f"{base_sys}\n\n{tag}\n{transcript}\n{end_tag}"

    try:
        reply_text = await llm_complete(system_prompt, payload.message)
    except Exception as e:
        logger.exception("LLM call failed")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    if not isinstance(reply_text, str):
        reply_text = str(reply_text)

    assistant_msg = ChatMessage(session_id=session_id, role="assistant", content=reply_text)
    adoc = assistant_msg.model_dump()
    adoc['created_at'] = adoc['created_at'].isoformat()
    await db.chat_messages.insert_one(adoc)

    return ChatResponse(session_id=session_id, reply=reply_text)


# ---------- Quote calculator ----------
QUOTE_SYSTEM_IT = (
    "Sei un senior strategist di not4sale. Analizza la richiesta e produci una stima onesta. "
    "Rispondi SOLO in JSON valido con: estimate_range (stringa: range mensile in €), "
    "recommended_approach (stringa di 2-3 frasi sul mix di servizi consigliato), "
    "next_steps (array di 3 stringhe brevi), fit_score (int 0-100, quanto questo lead è in target per noi). "
    "Sii realistico: budget bassi → fit_score basso, servizi disallineati → fit_score basso. "
    "Niente prezzi precisi: solo range coerenti col budget dichiarato. Mai outliers irrealistici."
)

QUOTE_SYSTEM_EN = (
    "You are a senior strategist at not4sale. Analyze the request and produce an honest estimate. "
    "Reply ONLY with valid JSON: estimate_range (string: monthly € range), "
    "recommended_approach (2-3 sentences on the recommended service mix), "
    "next_steps (array of 3 short strings), fit_score (int 0-100, how aligned this lead is). "
    "Be realistic: low budget → low fit_score, misaligned services → low fit_score. "
    "Never give precise prices, only coherent ranges. No unrealistic outliers."
)

# Email per lead SENZA sito da auditare (es. brand nuovo): consigli personalizzati.
QUOTE_TIPS_SYSTEM_IT = (
    "Sei un senior strategist di not4sale. Un potenziale cliente ha appena richiesto un preventivo "
    "dal nostro calcolatore ma NON ha un sito da analizzare (spesso è un brand o progetto nuovo). "
    "Scrivi contenuti per un'email di benvenuto con consigli CONCRETI e personalizzati sul suo progetto, "
    "basati su obiettivo, servizi richiesti, budget e timeline. Tono not4sale: diretto, ribelle, zero fuffa, "
    "niente frasi da venditore. Rispondi SOLO con JSON valido: "
    "headline (1-2 frasi di apertura che agganciano il suo obiettivo specifico), "
    "observations (array di ESATTAMENTE 3 oggetti {title, body}: 3 consigli pratici e specifici per il suo caso, "
    "title max 6 parole, body 2-3 frasi operative), "
    "quick_win ({title, body}: la PRIMA cosa da fare questa settimana, ancora prima di firmare con noi)."
)

QUOTE_TIPS_SYSTEM_EN = (
    "You are a senior strategist at not4sale. A potential client just requested a quote from our calculator "
    "but has NO website to analyze (often a brand-new project). "
    "Write content for a welcome email with CONCRETE, personalized advice on their project, "
    "based on their goal, requested services, budget and timeline. not4sale tone: direct, rebellious, zero fluff, "
    "no salesy phrases. Reply ONLY with valid JSON: "
    "headline (1-2 opening sentences hooking their specific goal), "
    "observations (array of EXACTLY 3 objects {title, body}: 3 practical, case-specific tips, "
    "title max 6 words, body 2-3 actionable sentences), "
    "quick_win ({title, body}: the FIRST thing to do this week, even before signing with us)."
)


@api_router.post("/quote/estimate", response_model=QuoteResponse)
async def estimate_quote(payload: QuoteRequest, background_tasks: BackgroundTasks):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    # Persist as lead first
    lead = Lead(
        name=payload.name,
        email=payload.email,
        company=payload.company,
        service=", ".join(payload.services) if payload.services else None,
        budget=payload.budget,
        message=(payload.notes or "") + f"\n\n[OBIETTIVO] {payload.objective}\n[TIMELINE] {payload.timeline}\n[URL] {payload.website_url or '-'}",
        source="quote-calculator",
        locale=payload.locale or "it",
        extra={
            "objective": payload.objective,
            "services": payload.services,
            "timeline": payload.timeline,
            "website_url": payload.website_url,
        },
    )
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)

    base_sys = QUOTE_SYSTEM_EN if (payload.locale or 'it') == 'en' else QUOTE_SYSTEM_IT
    user_prompt = (
        f"Obiettivo: {payload.objective}\n"
        f"Servizi richiesti: {', '.join(payload.services) if payload.services else 'da definire'}\n"
        f"Budget mensile: {payload.budget}\n"
        f"Timeline: {payload.timeline}\n"
        f"Note: {payload.notes or '-'}"
    )

    try:
        raw = await llm_complete(base_sys, user_prompt)
    except Exception as e:
        logger.exception("Quote LLM failed")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    import json as _json
    import re as _re

    text = raw if isinstance(raw, str) else str(raw)
    m = _re.search(r"\{[\s\S]*\}", text)
    if not m:
        result = QuoteResponse(
            lead_id=lead.id,
            estimate_range=_default_range(payload.budget),
            recommended_approach=_default_approach(payload),
            next_steps=_default_steps(payload.locale or 'it'),
            fit_score=_default_fit(payload),
        )
    else:
        try:
            data = _json.loads(m.group(0))
            result = QuoteResponse(
                lead_id=lead.id,
                estimate_range=str(data.get('estimate_range', _default_range(payload.budget))),
                recommended_approach=str(data.get('recommended_approach', _default_approach(payload))),
                next_steps=[str(x) for x in (data.get('next_steps') or _default_steps(payload.locale or 'it'))][:5],
                fit_score=int(data.get('fit_score', _default_fit(payload))),
            )
        except Exception:
            result = QuoteResponse(
                lead_id=lead.id,
                estimate_range=_default_range(payload.budget),
                recommended_approach=_default_approach(payload),
                next_steps=_default_steps(payload.locale or 'it'),
                fit_score=_default_fit(payload),
            )

    # Schedule the auto-audit email if we have a URL + Resend configured
    audit_scheduled = False
    if payload.website_url and RESEND_API_KEY:
        background_tasks.add_task(
            _run_audit_job,
            lead_id=lead.id,
            name=payload.name,
            email=payload.email,
            website_url=_normalize_url(payload.website_url),
            company=payload.company,
            objective=payload.objective,
            services=payload.services,
            budget=payload.budget,
            locale=payload.locale or "it",
            quote=result.model_dump(),
        )
        audit_scheduled = True
    elif RESEND_API_KEY:
        # Nessun sito da auditare (es. brand nuovo): email immediata con stima + consigli AI
        background_tasks.add_task(
            _run_quote_email_job,
            lead_id=lead.id,
            name=payload.name,
            email=payload.email,
            objective=payload.objective,
            services=payload.services,
            budget=payload.budget,
            timeline=payload.timeline,
            notes=payload.notes,
            locale=payload.locale or "it",
            quote=result.model_dump(),
        )

    result.audit_scheduled = audit_scheduled
    return result


def _normalize_url(u: str) -> str:
    u = (u or "").strip()
    if not u:
        return u
    if not u.startswith("http://") and not u.startswith("https://"):
        return "https://" + u
    return u


def _default_range(budget: str) -> str:
    return budget or "Da definire"


def _default_approach(p: QuoteRequest) -> str:
    base = ", ".join(p.services) if p.services else "un mix multi-servizio"
    return f"Costruiremmo un programma centrato su {base}, calibrato sull'obiettivo '{p.objective}'."


def _default_steps(locale: str) -> List[str]:
    if locale == 'en':
        return ["30-min discovery call", "Diagnostic audit", "Tailored proposal"]
    return ["Call di discovery 30 min", "Audit diagnostico", "Proposta su misura"]


def _default_fit(p: QuoteRequest) -> int:
    # Heuristic
    score = 50
    if 'k' in (p.budget or '').lower() and any(x in p.budget for x in ['15', '40', '50', '60', '80', '100']):
        score += 25
    if p.services:
        score += 15
    if p.notes and len(p.notes) > 80:
        score += 5
    return max(0, min(100, score))


# ============ AUTO-AUDIT JOB ============

AUDIT_SYSTEM_IT = (
    "Sei un senior strategist di not4sale. Stai analizzando lo screenshot della homepage di un potenziale cliente. "
    "Produci un mini-audit ONESTO e CONCRETO. NON essere generico. Riferisci dettagli che vedi davvero nello screenshot. "
    "Rispondi SOLO con JSON valido contenente: "
    "  observations: array di esattamente 3 oggetti { title (max 60 char), body (max 200 char, concreto, fa riferimento a cosa vedi) }, "
    "  quick_win: { title (max 60 char), body (max 250 char, 1 azione che possono mettere a terra in 7 giorni) }, "
    "  headline (1 frase di 12-18 parole che riassume il problema principale). "
    "Tono diretto, ribelle, mai 'leccaculo'. Niente complimenti vuoti, niente 'il vostro brand è straordinario'. "
    "Niente promesse di numeri. Mai inventare. Se lo screenshot è povero/illeggibile, dillo onestamente."
)

AUDIT_SYSTEM_EN = (
    "You are a senior strategist at not4sale. You're analyzing the homepage screenshot of a prospect. "
    "Produce an HONEST, CONCRETE mini-audit. Do NOT be generic. Refer to details you actually see in the screenshot. "
    "Reply ONLY with valid JSON: "
    "  observations: array of exactly 3 objects { title (max 60 chars), body (max 200 chars, concrete, references what you see) }, "
    "  quick_win: { title (max 60 chars), body (max 250 chars, 1 action they can ship in 7 days) }, "
    "  headline (1 sentence, 12-18 words, summarizing the main issue). "
    "Tone: direct, bold, never sycophantic. No empty compliments, no 'your brand is amazing'. "
    "No promises of numbers. Never invent. If the screenshot is poor/unreadable, say so honestly."
)


async def _microlink_screenshot(url: str) -> Optional[bytes]:
    """Fetch a screenshot of `url` via Microlink free API. Returns PNG/JPG bytes or None."""
    api = "https://api.microlink.io/"
    params = {
        "url": url,
        "screenshot": "true",
        "meta": "false",
        "embed": "screenshot.url",
        "viewport.width": "1280",
        "viewport.height": "720",
        "waitForTimeout": "1500",
    }
    try:
        async with httpx.AsyncClient(timeout=45) as hc:
            # First request returns redirect to image when embed=screenshot.url
            r = await hc.get(api, params=params, follow_redirects=True)
            if r.status_code != 200 or not r.content:
                logger.warning(f"Microlink screenshot failed status={r.status_code} url={url}")
                return None
            return r.content
    except Exception as e:
        logger.exception(f"Microlink screenshot error: {e}")
        return None


def _safe_b64_image(data: bytes, max_bytes: int = 3_500_000) -> Optional[str]:
    """Resize/recompress the image so it fits within Anthropic image size limits."""
    try:
        im = Image.open(io.BytesIO(data)).convert("RGB")
        # Resize to max 1280x900 keeping aspect
        im.thumbnail((1280, 900))
        buf = io.BytesIO()
        quality = 82
        while quality >= 55:
            buf.seek(0)
            buf.truncate(0)
            im.save(buf, format="JPEG", quality=quality, optimize=True)
            if buf.tell() <= max_bytes:
                break
            quality -= 8
        return base64.b64encode(buf.getvalue()).decode("ascii")
    except Exception:
        logger.exception("Image encode failed")
        return None


def _audit_email_html(name: str, website_url: str, screenshot_url: str, audit: dict, locale: str, quote: dict) -> str:
    """Render branded HTML email with screenshot + 3 observations + quick win + CTA."""
    L = lambda it, en: en if locale == "en" else it  # noqa: E731
    obs_html = ""
    for i, o in enumerate(audit.get("observations", [])[:3]):
        obs_html += f'''
        <tr>
          <td style="padding:18px 0;border-top:1px solid rgba(255,255,255,0.08);">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="42" valign="top" style="font-family:'JetBrains Mono', monospace; font-size:11px; color:#9D4CDD; letter-spacing:0.18em; padding-top:4px;">0{i+1}</td>
                <td valign="top">
                  <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:800; font-size:18px; color:#ffffff; text-transform:uppercase; letter-spacing:-0.01em; line-height:1.15; margin-bottom:6px;">{o.get('title','')}</div>
                  <div style="font-family:Arial, sans-serif; font-size:15px; line-height:1.6; color:#cfcfcf;">{o.get('body','')}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        '''
    qw = audit.get("quick_win") or {}
    headline = audit.get("headline") or L("Una prima lettura della tua homepage.", "A first read of your homepage.")
    estimate = quote.get("estimate_range") or "-"
    fit = quote.get("fit_score") or 0

    site_link = website_url

    return f"""<!doctype html>
<html lang="{locale}"><head><meta charset="utf-8" />
<title>not4sale · mini-audit</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial, sans-serif;color:#ffffff;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#050505" style="background:#050505;">
  <tr><td align="center" style="padding:40px 16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;background:#0a0a0a;border:1px solid rgba(157,76,221,0.25);">

      <tr><td style="padding:32px 32px 8px 32px;">
        <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:900; letter-spacing:0.16em; font-size:18px; color:#ffffff;">
          <span style="color:#9D4CDD;">[</span>NOT4SALE<span style="color:#9D4CDD;">]</span>
        </div>
        <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#9D4CDD; letter-spacing:0.28em; text-transform:uppercase; margin-top:18px;">
          {L('Mini-audit · gratuito', 'Mini-audit · free')}
        </div>
      </td></tr>

      <tr><td style="padding:8px 32px 24px 32px;">
        <h1 style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:900; font-size:34px; line-height:1.05; color:#ffffff; margin:8px 0 16px; text-transform:uppercase; letter-spacing:-0.02em;">
          {L('Ciao', 'Hi')} {name.split(' ')[0]}<span style="color:#9D4CDD;">.</span>
        </h1>
        <p style="font-family:Arial, sans-serif; font-size:16px; line-height:1.65; color:#cfcfcf; margin:0;">
          {headline}
        </p>
      </td></tr>

      <tr><td style="padding:0 32px 24px 32px;">
        <a href="{site_link}" target="_blank" style="display:block;">
          <img src="{screenshot_url}" alt="Screenshot {site_link}" width="576" style="display:block;width:100%;max-width:576px;border:1px solid rgba(255,255,255,0.1);" />
        </a>
        <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#737373; letter-spacing:0.18em; text-transform:uppercase; margin-top:10px;">
          {site_link}
        </div>
      </td></tr>

      <tr><td style="padding:8px 32px 16px 32px;">
        <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#9D4CDD; letter-spacing:0.28em; text-transform:uppercase; padding-bottom:8px;">
          {L('3 osservazioni', '3 observations')}
        </div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          {obs_html}
        </table>
      </td></tr>

      <tr><td style="padding:24px 32px;">
        <div style="border:1px solid #9D4CDD; padding:22px; background:rgba(157,76,221,0.08);">
          <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#9D4CDD; letter-spacing:0.28em; text-transform:uppercase;">
            {L('Quick win · 7 giorni', 'Quick win · 7 days')}
          </div>
          <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:800; font-size:22px; line-height:1.15; color:#ffffff; text-transform:uppercase; letter-spacing:-0.01em; margin:10px 0 8px;">
            {qw.get('title', L('Una mossa subito attuabile.', 'One immediate move.'))}
          </div>
          <div style="font-family:Arial, sans-serif; font-size:15px; line-height:1.65; color:#e5e5e5;">
            {qw.get('body','')}
          </div>
        </div>
      </td></tr>

      <tr><td style="padding:8px 32px 24px 32px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:14px 0;border-top:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);" align="left">
              <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#737373; letter-spacing:0.24em; text-transform:uppercase;">{L('Range stima', 'Estimate range')}</div>
              <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:800; font-size:22px; color:#ffffff;">{estimate}</div>
            </td>
            <td style="padding:14px 0;border-top:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);" align="right">
              <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#737373; letter-spacing:0.24em; text-transform:uppercase;">{L('Fit score', 'Fit score')}</div>
              <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:800; font-size:22px; color:#9D4CDD;">{fit}/100</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:8px 32px 36px 32px;" align="center">
        <a href="{AUDIT_SITE_URL}{('/en/contact' if locale=='en' else '/contatti')}?utm_source=email&utm_medium=audit&utm_campaign=quote" target="_blank"
           style="display:inline-block;background:#ffffff;color:#050505;font-family:'Cabinet Grotesk', Arial, sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;font-size:13px;padding:18px 28px;text-decoration:none;">
          {L('Prenota una call · 30 min', 'Book a call · 30 min')}
        </a>
        <div style="font-family:Arial, sans-serif; font-size:13px; color:#737373; margin-top:18px; line-height:1.6;">
          {L("Questa email è un mini-assaggio. L'audit completo è dentro la call.", 'This email is a quick taste. The full audit lives inside the call.')}
        </div>
      </td></tr>

      <tr><td style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.08);background:#050505;">
        <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#737373; letter-spacing:0.24em; text-transform:uppercase;">
          not4sale · Cattolica (RN), {L('Italia', 'Italy')} · 43.962°N · 12.737°E
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>"""


def _audit_email_text(name: str, audit: dict, quote: dict, locale: str, website_url: str) -> str:
    L = lambda it, en: en if locale == "en" else it  # noqa: E731
    obs = "\n\n".join([f"0{i+1}  {o.get('title','')}\n    {o.get('body','')}" for i, o in enumerate(audit.get("observations", [])[:3])])
    qw = audit.get("quick_win") or {}
    return f"""[NOT4SALE] {L('Mini-audit gratuito', 'Free mini-audit')}

{L('Ciao', 'Hi')} {name.split(' ')[0]},

{audit.get('headline','')}

{L('Sito analizzato', 'Analyzed site')}: {website_url}

— {L('3 osservazioni', '3 observations')} —

{obs}

— {L('Quick win · 7 giorni', 'Quick win · 7 days')} —
{qw.get('title','')}
{qw.get('body','')}

{L('Range stima', 'Estimate range')}: {quote.get('estimate_range','-')}
{L('Fit score', 'Fit score')}: {quote.get('fit_score',0)}/100

{L('Prenota una call', 'Book a call')}: {AUDIT_SITE_URL}{('/en/contact' if locale=='en' else '/contatti')}

—
not4sale · Cattolica (RN), {L('Italia', 'Italy')}
"""


async def _claude_vision_audit(image_b64: str, website_url: str, locale: str, context: dict) -> Optional[dict]:
    import json as _json
    import re as _re
    sys_p = AUDIT_SYSTEM_EN if locale == 'en' else AUDIT_SYSTEM_IT

    user_text = (
        f"Sito analizzato: {website_url}\n"
        f"Settore/contesto dichiarato dall'utente: {context.get('objective','-')}\n"
        f"Servizi che vorrebbe attivare: {', '.join(context.get('services') or []) or '-'}\n"
        f"Budget indicativo: {context.get('budget','-')}\n\n"
        "Analizza lo screenshot allegato della homepage e produci il JSON come da istruzioni di sistema."
    ) if locale != 'en' else (
        f"Analyzed site: {website_url}\n"
        f"User-stated context/goal: {context.get('objective','-')}\n"
        f"Services they want: {', '.join(context.get('services') or []) or '-'}\n"
        f"Indicative budget: {context.get('budget','-')}\n\n"
        "Analyze the attached homepage screenshot and produce the JSON per system instructions."
    )

    try:
        raw = await llm_complete(sys_p, user_text, image_b64=image_b64)
    except Exception as e:
        logger.exception(f"Vision audit failed: {e}")
        return None

    text = raw if isinstance(raw, str) else str(raw)
    m = _re.search(r"\{[\s\S]*\}", text)
    if not m:
        return None
    try:
        return _json.loads(m.group(0))
    except Exception:
        logger.warning("Audit JSON parse failed; raw=%s", text[:300])
        return None


def _quote_email_html(name: str, tips: dict, locale: str, quote: dict) -> str:
    """Email brandizzata per lead senza sito: stima + 3 consigli + quick win + CTA."""
    L = lambda it, en: en if locale == "en" else it  # noqa: E731
    obs_html = ""
    for i, o in enumerate(tips.get("observations", [])[:3]):
        obs_html += f'''
        <tr>
          <td style="padding:18px 0;border-top:1px solid rgba(255,255,255,0.08);">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td width="42" valign="top" style="font-family:'JetBrains Mono', monospace; font-size:11px; color:#9D4CDD; letter-spacing:0.18em; padding-top:4px;">0{i+1}</td>
                <td valign="top">
                  <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:800; font-size:18px; color:#ffffff; text-transform:uppercase; letter-spacing:-0.01em; line-height:1.15; margin-bottom:6px;">{o.get('title','')}</div>
                  <div style="font-family:Arial, sans-serif; font-size:15px; line-height:1.6; color:#cfcfcf;">{o.get('body','')}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        '''
    qw = tips.get("quick_win") or {}
    headline = tips.get("headline") or L("La tua stima è pronta. E ti abbiamo preparato qualche consiglio.", "Your estimate is ready. And we prepared some advice.")
    estimate = quote.get("estimate_range") or "-"
    fit = quote.get("fit_score") or 0
    approach = quote.get("recommended_approach") or ""

    return f"""<!doctype html>
<html lang="{locale}"><head><meta charset="utf-8" />
<title>not4sale · {L('la tua stima', 'your estimate')}</title></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial, sans-serif;color:#ffffff;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#050505" style="background:#050505;">
  <tr><td align="center" style="padding:40px 16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;background:#0a0a0a;border:1px solid rgba(157,76,221,0.25);">

      <tr><td style="padding:32px 32px 8px 32px;">
        <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:900; letter-spacing:0.16em; font-size:18px; color:#ffffff;">
          <span style="color:#9D4CDD;">[</span>NOT4SALE<span style="color:#9D4CDD;">]</span>
        </div>
        <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#9D4CDD; letter-spacing:0.28em; text-transform:uppercase; margin-top:18px;">
          {L('La tua stima · preventivo', 'Your estimate · quote')}
        </div>
      </td></tr>

      <tr><td style="padding:8px 32px 24px 32px;">
        <h1 style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:900; font-size:34px; line-height:1.05; color:#ffffff; margin:8px 0 16px; text-transform:uppercase; letter-spacing:-0.02em;">
          {L('Ciao', 'Hi')} {name.split(' ')[0]}<span style="color:#9D4CDD;">.</span>
        </h1>
        <p style="font-family:Arial, sans-serif; font-size:16px; line-height:1.65; color:#cfcfcf; margin:0;">
          {headline}
        </p>
      </td></tr>

      <tr><td style="padding:8px 32px 24px 32px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:14px 0;border-top:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);" align="left">
              <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#737373; letter-spacing:0.24em; text-transform:uppercase;">{L('Range stima', 'Estimate range')}</div>
              <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:800; font-size:22px; color:#ffffff;">{estimate}</div>
            </td>
            <td style="padding:14px 0;border-top:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);" align="right">
              <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#737373; letter-spacing:0.24em; text-transform:uppercase;">{L('Fit score', 'Fit score')}</div>
              <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:800; font-size:22px; color:#9D4CDD;">{fit}/100</div>
            </td>
          </tr>
        </table>
        {f'<p style="font-family:Arial, sans-serif; font-size:15px; line-height:1.65; color:#cfcfcf; margin:16px 0 0;">{approach}</p>' if approach else ''}
      </td></tr>

      <tr><td style="padding:8px 32px 16px 32px;">
        <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#9D4CDD; letter-spacing:0.28em; text-transform:uppercase; padding-bottom:8px;">
          {L('3 consigli per partire', '3 tips to get started')}
        </div>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          {obs_html}
        </table>
      </td></tr>

      <tr><td style="padding:24px 32px;">
        <div style="border:1px solid #9D4CDD; padding:22px; background:rgba(157,76,221,0.08);">
          <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#9D4CDD; letter-spacing:0.28em; text-transform:uppercase;">
            {L('Quick win · questa settimana', 'Quick win · this week')}
          </div>
          <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:800; font-size:22px; line-height:1.15; color:#ffffff; text-transform:uppercase; letter-spacing:-0.01em; margin:10px 0 8px;">
            {qw.get('title', L('Una mossa subito attuabile.', 'One immediate move.'))}
          </div>
          <div style="font-family:Arial, sans-serif; font-size:15px; line-height:1.65; color:#e5e5e5;">
            {qw.get('body','')}
          </div>
        </div>
      </td></tr>

      <tr><td style="padding:8px 32px 36px 32px;" align="center">
        <a href="{AUDIT_SITE_URL}{('/en/contact' if locale=='en' else '/contatti')}?utm_source=email&utm_medium=quote&utm_campaign=quote_no_site" target="_blank"
           style="display:inline-block;background:#ffffff;color:#050505;font-family:'Cabinet Grotesk', Arial, sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;font-size:13px;padding:18px 28px;text-decoration:none;">
          {L('Prenota una call · 30 min', 'Book a call · 30 min')}
        </a>
        <div style="font-family:Arial, sans-serif; font-size:13px; color:#737373; margin-top:18px; line-height:1.6;">
          {L('La stima è indicativa: il piano vero lo costruiamo in call, sul tuo progetto.', 'The estimate is indicative: the real plan gets built in the call, on your project.')}
        </div>
      </td></tr>

      <tr><td style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.08);background:#050505;">
        <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#737373; letter-spacing:0.24em; text-transform:uppercase;">
          not4sale · Cattolica (RN), {L('Italia', 'Italy')} · 43.962°N · 12.737°E
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>"""


def _quote_email_text(name: str, tips: dict, quote: dict, locale: str) -> str:
    L = lambda it, en: en if locale == "en" else it  # noqa: E731
    obs = "\n\n".join([f"0{i+1}  {o.get('title','')}\n    {o.get('body','')}" for i, o in enumerate(tips.get("observations", [])[:3])])
    qw = tips.get("quick_win") or {}
    return f"""[NOT4SALE] {L('La tua stima + 3 consigli', 'Your estimate + 3 tips')}

{L('Ciao', 'Hi')} {name.split(' ')[0]},

{tips.get('headline','')}

{L('Range stima', 'Estimate range')}: {quote.get('estimate_range','-')}
{L('Fit score', 'Fit score')}: {quote.get('fit_score',0)}/100
{quote.get('recommended_approach','')}

— {L('3 consigli per partire', '3 tips to get started')} —

{obs}

— {L('Quick win · questa settimana', 'Quick win · this week')} —
{qw.get('title','')}
{qw.get('body','')}

{L('Prenota una call', 'Book a call')}: {AUDIT_SITE_URL}{('/en/contact' if locale=='en' else '/contatti')}

—
not4sale · Cattolica (RN), {L('Italia', 'Italy')}
"""


async def _run_quote_email_job(
    lead_id: str,
    name: str,
    email: str,
    objective: str,
    services: List[str],
    budget: str,
    timeline: str,
    notes: Optional[str],
    locale: str,
    quote: dict,
):
    """Email immediata con stima + consigli AI per lead senza sito da auditare."""
    import json as _json
    import re as _re

    job_id = str(uuid.uuid4())
    await db.quote_email_jobs.insert_one({
        "id": job_id,
        "lead_id": lead_id,
        "email": email,
        "locale": locale,
        "status": "running",
        "started_at": datetime.now(timezone.utc).isoformat(),
    })

    email_id = None
    error_msg = None
    tips = None
    try:
        sys_p = QUOTE_TIPS_SYSTEM_EN if locale == "en" else QUOTE_TIPS_SYSTEM_IT
        user_text = (
            f"Nome: {name}\n"
            f"Obiettivo: {objective}\n"
            f"Servizi richiesti: {', '.join(services) if services else 'da definire'}\n"
            f"Budget mensile: {budget}\n"
            f"Timeline: {timeline}\n"
            f"Note del lead: {notes or '-'}\n"
            f"Range stima già comunicato a video: {quote.get('estimate_range','-')}\n"
            "Il lead NON ha un sito web da analizzare. Produci il JSON come da istruzioni."
        )
        raw = await llm_complete(sys_p, user_text)
        m = _re.search(r"\{[\s\S]*\}", raw)
        if m:
            try:
                tips = _json.loads(m.group(0))
            except Exception:
                tips = None
        if not tips or not tips.get("observations"):
            error_msg = "tips_generation_failed"
        else:
            subject = (
                f"{name.split(' ')[0]}, la tua stima not4sale + 3 consigli per partire"
                if locale != "en"
                else f"{name.split(' ')[0]}, your not4sale estimate + 3 tips to start"
            )
            html = _quote_email_html(name=name, tips=tips, locale=locale, quote=quote)
            text = _quote_email_text(name=name, tips=tips, quote=quote, locale=locale)
            email_id = await asyncio.to_thread(_send_resend, email, subject, html, text, "hello@not4.sale")
            if not email_id:
                error_msg = "email_failed"
    except Exception as e:
        logger.exception(f"Quote email job failed for lead={lead_id}: {e}")
        error_msg = str(e)[:200]
    finally:
        await db.quote_email_jobs.update_one(
            {"id": job_id},
            {"$set": {
                "status": "sent" if email_id else "failed",
                "email_id": email_id,
                "tips": tips,
                "error": error_msg,
                "finished_at": datetime.now(timezone.utc).isoformat(),
            }}
        )

        # Email consegnata → follow-up 24h anche per i lead senza sito
        if email_id and tips:
            await _schedule_followup(
                lead_id=lead_id,
                name=name,
                email=email,
                website_url="",
                locale=locale,
                audit_data=tips,
                quote=quote,
                kind="no_site",
            )


def _send_resend(to_email: str, subject: str, html: str, text: str, reply_to: Optional[str] = None) -> Optional[str]:
    """Synchronous send (called from asyncio.to_thread). Returns email id or None."""
    if not RESEND_API_KEY:
        return None
    params = {
        "from": f"not4sale <{SENDER_EMAIL}>",
        "to": [to_email],
        "subject": subject,
        "html": html,
        "text": text,
    }
    if reply_to:
        params["reply_to"] = reply_to
    try:
        res = resend.Emails.send(params)
        return res.get("id") if isinstance(res, dict) else None
    except Exception as e:
        logger.exception(f"Resend send failed: {e}")
        return None


async def _run_audit_job(
    lead_id: str,
    name: str,
    email: str,
    website_url: str,
    company: Optional[str],
    objective: str,
    services: List[str],
    budget: str,
    locale: str,
    quote: dict,
):
    job_id = str(uuid.uuid4())
    job_doc = {
        "id": job_id,
        "lead_id": lead_id,
        "email": email,
        "website_url": website_url,
        "locale": locale,
        "status": "running",
        "started_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.audit_jobs.insert_one(job_doc)

    error_msg = None
    screenshot_bytes = None
    audit_data = None
    email_id = None
    screenshot_remote_url = None

    try:
        # 1) Screenshot
        screenshot_bytes = await _microlink_screenshot(website_url)
        if not screenshot_bytes:
            error_msg = "screenshot_failed"
        else:
            # Try to also get a hosted URL for embedding in the email
            # Microlink also returns JSON with a public URL when called without embed=
            try:
                async with httpx.AsyncClient(timeout=30) as hc:
                    r = await hc.get("https://api.microlink.io/", params={
                        "url": website_url, "screenshot": "true", "meta": "false",
                        "viewport.width": "1280", "viewport.height": "720",
                        "waitForTimeout": "1500",
                    })
                    if r.status_code == 200:
                        payload = r.json()
                        screenshot_remote_url = (
                            payload.get("data", {}).get("screenshot", {}).get("url")
                        )
            except Exception:
                pass

        # 2) Claude vision
        if screenshot_bytes:
            b64 = _safe_b64_image(screenshot_bytes)
            if b64:
                audit_data = await _claude_vision_audit(
                    image_b64=b64,
                    website_url=website_url,
                    locale=locale,
                    context={"objective": objective, "services": services, "budget": budget},
                )
            if not audit_data:
                error_msg = error_msg or "vision_failed"

        # 3) Build + send email
        if audit_data and screenshot_remote_url:
            subject = (
                f"[NOT4SALE] Mini-audit · {website_url}" if locale != "en"
                else f"[NOT4SALE] Mini-audit · {website_url}"
            )
            html = _audit_email_html(
                name=name,
                website_url=website_url,
                screenshot_url=screenshot_remote_url,
                audit=audit_data,
                locale=locale,
                quote=quote,
            )
            text = _audit_email_text(
                name=name, audit=audit_data, quote=quote, locale=locale, website_url=website_url,
            )
            email_id = await asyncio.to_thread(
                _send_resend, email, subject, html, text, "hello@not4.sale"
            )
            if not email_id:
                error_msg = error_msg or "email_failed"
        elif not error_msg:
            error_msg = "no_data"

    except Exception as e:
        logger.exception(f"Audit job failed for lead={lead_id}: {e}")
        error_msg = str(e)[:200]

    finally:
        await db.audit_jobs.update_one(
            {"id": job_id},
            {"$set": {
                "status": "sent" if email_id else "failed",
                "email_id": email_id,
                "screenshot_url": screenshot_remote_url,
                "audit_data": audit_data,
                "error": error_msg,
                "finished_at": datetime.now(timezone.utc).isoformat(),
            }}
        )

        # If audit email was actually delivered, schedule a follow-up
        if email_id and audit_data:
            await _schedule_followup(
                lead_id=lead_id,
                name=name,
                email=email,
                website_url=website_url,
                locale=locale,
                audit_data=audit_data,
                quote=quote,
            )


# ============ FOLLOW-UP AGENT ============
FOLLOWUP_DELAY_SECONDS = int(os.environ.get('FOLLOWUP_DELAY_SECONDS', '86400'))  # 24h default

FOLLOWUP_SYSTEM_IT = (
    "Sei un senior strategist di not4sale che scrive una SHORT, PERSONALE email di follow-up 24 ore "
    "dopo aver inviato un mini-audit. Il destinatario non ha ancora prenotato la call. "
    "Ti rivolgi a lui per nome, riferisci IN MODO SPECIFICO ad UNA delle 3 osservazioni dell'audit precedente "
    "(non un riassunto generico — cita un dettaglio concreto), e proponi UN'AZIONE pratica alternativa o un'evoluzione. "
    "Tono: diretto, ribelle, mai 'leccaculo', senza spam phrases ('per non perdere tempo', 'rapida chiacchierata'). "
    "Niente promesse di numeri. Lunghezza email: 90-140 parole MAX nel body, in italiano. "
    "Rispondi SOLO JSON valido: { subject (max 60 char, NESSUN emoji), preview (max 90 char), "
    "body_paragraphs: array di 3-4 stringhe (paragrafi) — ogni paragrafo NON deve superare 60 parole, "
    "cta_label (max 30 char), ps (1 frase opzionale, max 120 char, di chiusura ironica e umana — NON 'P.S.:'). "
    "L'ultimo paragrafo deve proporre uno slot concreto: 'Martedì o Giovedì prossimi, 30 minuti, ti propongo io 3 orari.'"
)

FOLLOWUP_SYSTEM_EN = (
    "You are a senior strategist at not4sale writing a SHORT, PERSONAL follow-up email 24 hours after sending a mini-audit. "
    "The recipient has not booked the call yet. Address them by first name, refer SPECIFICALLY to ONE of the 3 audit observations "
    "(no generic summary — cite a concrete detail), and propose ONE practical alternative action or evolution. "
    "Tone: direct, bold, never sycophantic, no spam phrases ('quick chat', 'jump on a call'). "
    "No number promises. Email length: 90-140 words MAX in body, in English. "
    "Reply ONLY valid JSON: { subject (max 60 chars, NO emoji), preview (max 90 chars), "
    "body_paragraphs: array of 3-4 strings (paragraphs) — each paragraph 60 words MAX, "
    "cta_label (max 30 chars), ps (1 optional closing line, max 120 chars, ironic and human — NOT 'P.S.:'). "
    "Final paragraph must propose a concrete slot: 'Next Tuesday or Thursday, 30 minutes, I'll send 3 time options.'"
)


FOLLOWUP_NOSITE_SYSTEM_IT = (
    "Sei un senior strategist di not4sale che scrive una SHORT, PERSONALE email di follow-up 24 ore "
    "dopo aver inviato una stima con 3 consigli a un lead che NON ha ancora un sito (brand/progetto nuovo). "
    "Il destinatario non ha ancora prenotato la call. "
    "Ti rivolgi a lui per nome, riferisci IN MODO SPECIFICO ad UNO dei 3 consigli inviati ieri "
    "(non un riassunto generico — cita un dettaglio concreto) e chiedi a che punto è col progetto, "
    "proponendo UN'AZIONE pratica successiva. "
    "Tono: diretto, ribelle, mai 'leccaculo', senza spam phrases ('per non perdere tempo', 'rapida chiacchierata'). "
    "Niente promesse di numeri. Lunghezza email: 90-140 parole MAX nel body, in italiano. "
    "Rispondi SOLO JSON valido: { subject (max 60 char, NESSUN emoji), preview (max 90 char), "
    "body_paragraphs: array di 3-4 stringhe (paragrafi) — ogni paragrafo NON deve superare 60 parole, "
    "cta_label (max 30 char), ps (1 frase opzionale, max 120 char, di chiusura ironica e umana — NON 'P.S.:'). "
    "L'ultimo paragrafo deve proporre uno slot concreto: 'Martedì o Giovedì prossimi, 30 minuti, ti propongo io 3 orari.'"
)

FOLLOWUP_NOSITE_SYSTEM_EN = (
    "You are a senior strategist at not4sale writing a SHORT, PERSONAL follow-up email 24 hours after sending "
    "an estimate with 3 tips to a lead who does NOT have a website yet (brand-new project). "
    "The recipient has not booked the call yet. Address them by first name, refer SPECIFICALLY to ONE of the 3 tips "
    "sent yesterday (no generic summary — cite a concrete detail), ask how the project is going, "
    "and propose ONE practical next action. "
    "Tone: direct, bold, never sycophantic, no spam phrases ('quick chat', 'jump on a call'). "
    "No number promises. Email length: 90-140 words MAX in body, in English. "
    "Reply ONLY valid JSON: { subject (max 60 chars, NO emoji), preview (max 90 chars), "
    "body_paragraphs: array of 3-4 strings (paragraphs) — each paragraph 60 words MAX, "
    "cta_label (max 30 chars), ps (1 optional closing line, max 120 chars, ironic and human — NOT 'P.S.:'). "
    "Final paragraph must propose a concrete slot: 'Next Tuesday or Thursday, 30 minutes, I'll send 3 time options.'"
)


async def _schedule_followup(lead_id: str, name: str, email: str, website_url: str, locale: str, audit_data: dict, quote: dict, kind: str = "audit"):
    # Skip if a follow-up is already scheduled or sent for this lead
    existing = await db.followup_jobs.find_one({"lead_id": lead_id, "status": {"$in": ["scheduled", "sent"]}})
    if existing:
        return
    scheduled_for = datetime.now(timezone.utc).timestamp() + FOLLOWUP_DELAY_SECONDS
    doc = {
        "id": str(uuid.uuid4()),
        "lead_id": lead_id,
        "name": name,
        "email": email,
        "website_url": website_url,
        "locale": locale,
        "audit_data": audit_data,
        "quote": quote,
        "kind": kind,
        "status": "scheduled",
        "scheduled_for_ts": scheduled_for,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.followup_jobs.insert_one(doc)
    logger.info(f"Follow-up scheduled for lead={lead_id} in {FOLLOWUP_DELAY_SECONDS}s")


async def _claude_followup(lead_name: str, locale: str, audit_data: dict, website_url: str, quote: dict, kind: str = "audit") -> Optional[dict]:
    import json as _json
    import re as _re
    if kind == "no_site":
        sys_p = FOLLOWUP_NOSITE_SYSTEM_EN if locale == 'en' else FOLLOWUP_NOSITE_SYSTEM_IT
    else:
        sys_p = FOLLOWUP_SYSTEM_EN if locale == 'en' else FOLLOWUP_SYSTEM_IT

    obs_block = "\n".join([f"- {o.get('title','')}: {o.get('body','')}" for o in (audit_data.get('observations') or [])[:3]])
    qw = audit_data.get('quick_win') or {}
    headline = audit_data.get('headline') or ''

    sent_label = "CONSIGLI GIA' INVIATI 24h FA" if kind == "no_site" else "AUDIT GIA' INVIATO 24h FA"
    obs_label = "3 consigli" if kind == "no_site" else "3 osservazioni"
    user_text = (
        f"Destinatario: {lead_name}\n"
        f"Sito: {website_url or 'nessuno — brand/progetto nuovo'}\n"
        f"Lingua: {locale}\n\n"
        f"{sent_label}:\n"
        f"Headline: {headline}\n\n"
        f"{obs_label}:\n{obs_block}\n\n"
        f"Quick win: {qw.get('title','')} — {qw.get('body','')}\n\n"
        f"Range stima dato: {quote.get('estimate_range','-')}\n"
        f"Fit score: {quote.get('fit_score',0)}/100\n\n"
        "Scrivi l'email di follow-up rispettando tutti i vincoli del system prompt. JSON valido obbligatorio."
    )

    try:
        raw = await llm_complete(sys_p, user_text)
    except Exception:
        logger.exception("LLM follow-up failed")
        return None

    text = raw if isinstance(raw, str) else str(raw)
    m = _re.search(r"\{[\s\S]*\}", text)
    if not m:
        return None
    try:
        return _json.loads(m.group(0))
    except Exception:
        logger.warning("Follow-up JSON parse failed; raw=%s", text[:300])
        return None


def _followup_email_html(name: str, locale: str, data: dict, website_url: str, audit_data: dict, lead_id: str) -> str:
    L = lambda it, en: en if locale == 'en' else it  # noqa: E731
    para_html = "\n".join([
        f'<p style="font-family:Arial, sans-serif; font-size:16px; line-height:1.7; color:#e5e5e5; margin:0 0 16px;">{p}</p>'
        for p in (data.get('body_paragraphs') or [])
    ])
    ps = data.get('ps') or ''
    contact_link = f"{AUDIT_SITE_URL}{('/en/contact' if locale=='en' else '/contatti')}?ref=followup&lead_id={lead_id}"

    return f"""<!doctype html>
<html lang="{locale}"><head><meta charset="utf-8"/><title>{data.get('subject','not4sale')}</title>
<meta name="x-preview" content="{data.get('preview','')}"/></head>
<body style="margin:0;padding:0;background:#050505;font-family:Arial,sans-serif;color:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;color:#050505;">{data.get('preview','')}</div>
<table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#050505" style="background:#050505;">
  <tr><td align="center" style="padding:40px 16px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:#0a0a0a;border:1px solid rgba(157,76,221,0.18);">

      <tr><td style="padding:28px 32px 8px 32px;">
        <div style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:900; letter-spacing:0.16em; font-size:16px;">
          <span style="color:#9D4CDD;">[</span>NOT4SALE<span style="color:#9D4CDD;">]</span>
        </div>
        <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#9D4CDD; letter-spacing:0.28em; text-transform:uppercase; margin-top:14px;">
          {L('Follow-up · 24h dopo', 'Follow-up · 24h later')}
        </div>
      </td></tr>

      <tr><td style="padding:8px 32px 0;">
        <h1 style="font-family:'Cabinet Grotesk', Arial, sans-serif; font-weight:900; font-size:30px; line-height:1.1; color:#ffffff; margin:8px 0 24px; letter-spacing:-0.02em;">
          {L('Ciao', 'Hi')} {name.split(' ')[0]}<span style="color:#9D4CDD;">.</span>
        </h1>
      </td></tr>

      <tr><td style="padding:0 32px 8px 32px;">
        {para_html}
      </td></tr>

      <tr><td style="padding:8px 32px 24px 32px;">
        <a href="{contact_link}" target="_blank"
           style="display:inline-block;background:#9D4CDD;color:#ffffff;font-family:'Cabinet Grotesk', Arial, sans-serif;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;font-size:13px;padding:16px 26px;text-decoration:none;">
          {data.get('cta_label') or L('Vediamoci 30 min', "Let's chat 30 min")}
        </a>
      </td></tr>

      {f'''<tr><td style="padding:0 32px 24px 32px;">
        <div style="font-family:Arial, sans-serif; font-size:14px; color:#a3a3a3; font-style:italic; border-top:1px solid rgba(255,255,255,0.08); padding-top:14px;">
          — {ps}
        </div>
      </td></tr>''' if ps else ''}

      <tr><td style="padding:16px 32px 22px;border-top:1px solid rgba(255,255,255,0.06);">
        <div style="font-family:'JetBrains Mono', monospace; font-size:10px; color:#737373; letter-spacing:0.22em; text-transform:uppercase;">
          not4sale · {(L('Mini-audit del', 'Mini-audit of') + ' ' + website_url) if website_url else L('Il tuo progetto', 'Your project')}<br/>
          Cattolica (RN) · 43.962°N 12.737°E
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>"""


def _followup_email_text(name: str, locale: str, data: dict, website_url: str, lead_id: str) -> str:
    L = lambda it, en: en if locale == 'en' else it  # noqa: E731
    paragraphs = "\n\n".join(data.get('body_paragraphs') or [])
    link = f"{AUDIT_SITE_URL}{('/en/contact' if locale=='en' else '/contatti')}?ref=followup&lead_id={lead_id}"
    if website_url:
        header = L("Follow-up sull'audit di", "Follow-up on the audit of") + " " + website_url
    else:
        header = L("Follow-up sul tuo progetto", "Follow-up on your project")
    out = f"""[NOT4SALE] {header}

{L('Ciao', 'Hi')} {name.split(' ')[0]},

{paragraphs}

{data.get('cta_label') or L('Prenota', 'Book')}: {link}
"""
    if data.get('ps'):
        out += f"\n— {data['ps']}\n"
    out += "\n—\nnot4sale · Cattolica (RN), Italia"
    return out


async def _run_followup(job: dict):
    job_id = job["id"]
    lead_id = job["lead_id"]
    await db.followup_jobs.update_one({"id": job_id}, {"$set": {"status": "running", "started_at": datetime.now(timezone.utc).isoformat()}})

    # Re-check booking state (the lead may have submitted /contatti in the meantime)
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if lead and lead.get("has_booked"):
        await db.followup_jobs.update_one({"id": job_id}, {"$set": {"status": "skipped_booked", "finished_at": datetime.now(timezone.utc).isoformat()}})
        logger.info(f"Follow-up SKIPPED (booked) lead={lead_id}")
        return

    locale = job.get("locale") or "it"
    audit_data = job.get("audit_data") or {}
    quote = job.get("quote") or {}

    email_id = None
    error_msg = None
    followup_data = None

    kind = job.get("kind") or "audit"
    try:
        followup_data = await _claude_followup(
            lead_name=job["name"], locale=locale, audit_data=audit_data,
            website_url=job["website_url"], quote=quote, kind=kind,
        )
        if not followup_data or not followup_data.get("body_paragraphs"):
            error_msg = "generation_failed"
        else:
            if kind == "no_site" or not job.get("website_url"):
                default_subject = "A che punto sei col progetto?" if locale != 'en' else "How is the project going?"
            else:
                default_subject = (
                    f"Ho riguardato {job['website_url']}" if locale != 'en' else f"I had another look at {job['website_url']}"
                )
            subject = followup_data.get("subject") or default_subject
            html = _followup_email_html(
                name=job["name"], locale=locale, data=followup_data,
                website_url=job["website_url"], audit_data=audit_data, lead_id=lead_id,
            )
            text = _followup_email_text(name=job["name"], locale=locale, data=followup_data, website_url=job["website_url"], lead_id=lead_id)
            email_id = await asyncio.to_thread(_send_resend, job["email"], subject, html, text, "hello@not4.sale")
            if not email_id:
                error_msg = "email_failed"
    except Exception as e:
        logger.exception(f"Follow-up failed lead={lead_id}: {e}")
        error_msg = str(e)[:200]

    await db.followup_jobs.update_one(
        {"id": job_id},
        {"$set": {
            "status": "sent" if email_id else "failed",
            "email_id": email_id,
            "followup_data": followup_data,
            "error": error_msg,
            "finished_at": datetime.now(timezone.utc).isoformat(),
        }}
    )


async def _process_due_followups() -> int:
    now_ts = datetime.now(timezone.utc).timestamp()
    cursor = db.followup_jobs.find({"status": "scheduled", "scheduled_for_ts": {"$lte": now_ts}}, {"_id": 0})
    jobs = await cursor.to_list(length=50)
    for j in jobs:
        await _run_followup(j)
    return len(jobs)


async def _followup_worker_loop():
    await asyncio.sleep(20)  # small delay on startup
    while True:
        try:
            await _process_due_followups()
        except Exception:
            logger.exception("follow-up worker loop error")
        await asyncio.sleep(60)


# ============ END FOLLOW-UP ============


@api_router.get("/quote/audit/{lead_id}")
async def get_audit_status(lead_id: str):
    job = await db.audit_jobs.find_one({"lead_id": lead_id}, {"_id": 0}, sort=[("started_at", -1)])
    if not job:
        return {"status": "none"}
    return job


@api_router.get("/quote/followup/{lead_id}")
async def get_followup_status(lead_id: str):
    job = await db.followup_jobs.find_one({"lead_id": lead_id}, {"_id": 0}, sort=[("created_at", -1)])
    if not job:
        return {"status": "none"}
    return job


@api_router.post("/admin/followups/run-due")
@api_router.get("/admin/followups/run-due")
async def admin_run_due_followups():
    """Manual trigger to process all due follow-ups. Used for testing or as a cron hook (Vercel Cron uses GET)."""
    n = await _process_due_followups()
    return {"processed": n}


# ---------- Articles ----------
ARTICLES_SEED = [
    # Italian
    {
        "slug": "aeo-vs-seo-cosa-cambia",
        "locale": "it",
        "title": "AEO vs SEO: cosa cambia davvero per il tuo brand",
        "subtitle": "Risposte vs ranking. Le AI hanno spostato il gioco.",
        "excerpt": "La SEO non è morta, ma non è più sola. AEO ottimizza per ChatGPT, Perplexity e AI Overviews. Ecco cosa fare oggi.",
        "content_md": "## La SEO non è morta. È mutata.\n\nFino a ieri la SEO era una gara a posizionarsi sui motori. Oggi la query non è più solo digitata: viene chiesta. ChatGPT, Perplexity, Gemini, Google AI Overviews rispondono direttamente.\n\nAEO (Answer Engine Optimization) è la disciplina di **essere la risposta**, non il primo link.\n\n## I 3 livelli del gioco oggi\n\n1. **SEO tradizionale** — crawl, render, ranking. Resta la base.\n2. **AEO** — strutturazione contenuti, FAQ, schema, brand entity per essere citati nelle risposte AI.\n3. **GEO** — Generative Engine Optimization: influenzare la 'conoscenza' che i modelli hanno del tuo brand.\n\n## Cosa fare adesso\n\n- Audit della visibilità su ChatGPT + Perplexity (prompt set)\n- Strutturare FAQ + schema.org sui contenuti chiave\n- Brand entity hardening: knowledge panel, Wikipedia/Wikidata, citazioni autoritative\n- Misurare share-of-voice nelle risposte AI\n\nNon serve abbandonare la SEO. Serve estenderla.",
        "tags": ["AEO", "SEO", "AI"],
        "read_minutes": 5
    },
    {
        "slug": "growth-hacking-perche-funziona",
        "locale": "it",
        "title": "Growth hacking: perché funziona davvero (e perché spesso no)",
        "subtitle": "Il problema non è il metodo, è il rituale.",
        "excerpt": "Il growth hacking funziona quando diventa abitudine ogni settimana. Senza, sono solo trick.",
        "content_md": "## Non è una tattica. È un rituale.\n\nLa parola 'growth hacking' è stata svuotata. Oggi significa tutto e niente.\n\nL'unica versione che funziona è quella **rituale**: ogni settimana ipotesi, test, dati, decisione.\n\n## Il ciclo che fa la differenza\n\n1. **Ipotesi** — partita da un insight, non da un like su LinkedIn\n2. **Test** — il più piccolo possibile, in 48-72h\n3. **Dato** — pulito, non vanity\n4. **Decisione** — kill, iterate, scale\n\n## Perché spesso fallisce\n\n- Niente sponsor in azienda (il team marketing da solo non basta)\n- Sprint troppo lunghi (mensili, non bi-settimanali)\n- KPI sbagliati (vanity metric)\n- Nessuna disciplina nel chiudere gli esperimenti\n\n## Come iniziare\n\n- North Star Metric chiarissima\n- Backlog di 20+ esperimenti pronto\n- Sprint da 2 settimane, riti fissi\n- Dashboard unica\n\nIn 90 giorni vedi il trend. In 6 mesi hai una macchina.",
        "tags": ["Growth", "Strategy"],
        "read_minutes": 6
    },
    {
        "slug": "brand-strategy-non-e-il-logo",
        "locale": "it",
        "title": "Brand strategy non è il tuo logo",
        "subtitle": "Il logo è la conseguenza, non la causa.",
        "excerpt": "Confondere brand strategy con identità visiva è il modo più rapido di buttare soldi.",
        "content_md": "## Il logo è l'ultima cosa\n\nLa brand strategy non è un esercizio creativo. È un esercizio di **posizionamento**.\n\nPrima di un logo servono risposte chiare a:\n- Chi sei davvero?\n- Per chi sei?\n- Contro chi sei?\n- Perché esisti?\n- Cosa cambieresti del tuo mercato?\n\n## I tre layer\n\n1. **Strategy** — posizionamento, audience, manifesto\n2. **Identity** — naming, sistema visivo, tono di voce\n3. **Experience** — come tutto questo vive in ogni touchpoint\n\nUn brand senza il layer 1 è un bel guscio vuoto. Un brand senza il layer 3 è una promessa tradita.\n\n## Errori comuni\n\n- Partire dal logo\n- Copiare i big del settore\n- Comunicare tutto a tutti\n- Cambiare brand ogni 18 mesi perché 'non funziona'\n\nUn brand non funziona quando non c'è strategia, non quando il logo non piace.",
        "tags": ["Brand"],
        "read_minutes": 4
    },
    {
        "slug": "ai-marketing-cosa-automatizzare",
        "locale": "it",
        "title": "AI marketing: cosa automatizzare oggi (e cosa no)",
        "subtitle": "Il delta competitivo è qui. Tre framework pratici.",
        "excerpt": "Non tutto va automatizzato. Ma quello che va automatizzato, va automatizzato bene.",
        "content_md": "## Non è hype, è leva\n\nL'AI nel marketing non sostituisce le persone. Le libera dalle attività ripetitive che bruciano ore senza creare valore.\n\n## I 3 livelli pratici\n\n### Livello 1 — Generazione\nDraft di contenuti, prima bozza di brief, prima versione di ad copy. Sempre revisionata da umano.\n\n### Livello 2 — Workflow\nLead qualification automatica, scoring, routing. Agenti che pre-elaborano e portano in agenda solo lead caldi.\n\n### Livello 3 — Sistema\nAgenti permanenti che monitorano competitor, mercato, trend e producono insight settimanali.\n\n## Cosa NON automatizzare\n\n- Conversazioni che chiudono budget importanti\n- Creative direction su progetti hero\n- Decisioni strategiche\n- Reazioni a crisi\n\n## Come iniziare\n\n1. Mappa i processi marketing per ore/settimana\n2. Identifica i 3 più ripetitivi e a basso valore aggiunto\n3. Prototipa un agente per il primo\n4. Misura il tempo recuperato\n5. Itera\n\nIl vantaggio competitivo dell'AI non è 'usare ChatGPT'. È **avere processi**.",
        "tags": ["AI", "Automation"],
        "read_minutes": 6
    },
    # English
    {
        "slug": "aeo-vs-seo-whats-changing",
        "locale": "en",
        "title": "AEO vs SEO: what's really changing for your brand",
        "subtitle": "Answers vs rankings. AI shifted the game.",
        "excerpt": "SEO isn't dead, but it's no longer alone. AEO optimizes for ChatGPT, Perplexity and AI Overviews. Here's what to do now.",
        "content_md": "## SEO isn't dead. It mutated.\n\nUntil yesterday SEO was a race for ranking. Today, queries aren't just typed — they're asked. ChatGPT, Perplexity, Gemini, Google AI Overviews answer directly.\n\nAEO (Answer Engine Optimization) is the discipline of **being the answer**, not the first link.\n\n## The 3 layers of the game today\n\n1. **Traditional SEO** — crawl, render, ranking. Still the base.\n2. **AEO** — content structure, FAQ, schema, brand entity to be cited in AI answers.\n3. **GEO** — Generative Engine Optimization: influencing how LLMs represent your brand.\n\n## What to do now\n\n- Audit visibility on ChatGPT + Perplexity (prompt set)\n- Structure FAQ + schema.org on key content\n- Brand entity hardening: knowledge panel, Wikipedia/Wikidata, authoritative citations\n- Measure share-of-voice in AI answers\n\nDon't abandon SEO. Extend it.",
        "tags": ["AEO", "SEO", "AI"],
        "read_minutes": 5
    },
    {
        "slug": "growth-hacking-why-it-works",
        "locale": "en",
        "title": "Growth hacking: why it really works (and why it often doesn't)",
        "subtitle": "The issue isn't the method, it's the ritual.",
        "excerpt": "Growth hacking works when it becomes a weekly ritual. Without it, they're just tricks.",
        "content_md": "## Not a tactic. A ritual.\n\nThe term 'growth hacking' has been emptied. Today it means everything and nothing.\n\nThe only version that works is the **ritual** one: every week — hypothesis, test, data, decision.\n\n## The cycle that makes the difference\n\n1. **Hypothesis** — born from insight, not a LinkedIn like\n2. **Test** — as small as possible, in 48-72h\n3. **Data** — clean, no vanity\n4. **Decision** — kill, iterate, scale\n\n## Why it often fails\n\n- No internal sponsor (marketing alone isn't enough)\n- Sprints too long (monthly, not bi-weekly)\n- Wrong KPIs (vanity metrics)\n- No discipline closing experiments\n\n## How to start\n\n- Crystal-clear North Star Metric\n- Backlog of 20+ experiments ready\n- 2-week sprints, fixed rituals\n- Single dashboard\n\nIn 90 days you see the trend. In 6 months you have a machine.",
        "tags": ["Growth", "Strategy"],
        "read_minutes": 6
    },
    {
        "slug": "brand-strategy-isnt-your-logo",
        "locale": "en",
        "title": "Brand strategy isn't your logo",
        "subtitle": "The logo is consequence, not cause.",
        "excerpt": "Confusing brand strategy with visual identity is the fastest way to burn money.",
        "content_md": "## The logo is the last thing\n\nBrand strategy isn't a creative exercise. It's a **positioning** exercise.\n\nBefore a logo, you need clear answers to:\n- Who are you really?\n- Who are you for?\n- Who are you against?\n- Why do you exist?\n- What would you change in your market?\n\n## The three layers\n\n1. **Strategy** — positioning, audience, manifesto\n2. **Identity** — naming, visual system, tone of voice\n3. **Experience** — how all this lives in every touchpoint\n\nA brand without layer 1 is a pretty empty shell. A brand without layer 3 is a broken promise.\n\n## Common mistakes\n\n- Starting from the logo\n- Copying the big players\n- Communicating everything to everyone\n- Changing brand every 18 months because 'it doesn't work'\n\nA brand doesn't work when there's no strategy, not when you don't like the logo.",
        "tags": ["Brand"],
        "read_minutes": 4
    },
    {
        "slug": "ai-marketing-what-to-automate",
        "locale": "en",
        "title": "AI marketing: what to automate today (and what not)",
        "subtitle": "The competitive delta is here. Three practical frameworks.",
        "excerpt": "Not everything should be automated. But what should be, must be done well.",
        "content_md": "## It's not hype, it's leverage\n\nAI in marketing doesn't replace people. It frees them from repetitive tasks that burn hours without creating value.\n\n## The 3 practical levels\n\n### Level 1 — Generation\nContent drafts, first brief versions, first ad copy versions. Always human-reviewed.\n\n### Level 2 — Workflow\nAutomatic lead qualification, scoring, routing. Agents that pre-process and bring only warm leads to your calendar.\n\n### Level 3 — System\nPermanent agents that monitor competitors, market, trends, and produce weekly insights.\n\n## What NOT to automate\n\n- Conversations that close big budgets\n- Creative direction on hero projects\n- Strategic decisions\n- Crisis reactions\n\n## How to start\n\n1. Map your marketing processes by hours/week\n2. Identify the 3 most repetitive, low-value ones\n3. Prototype an agent for the first\n4. Measure recovered time\n5. Iterate\n\nThe AI competitive advantage isn't 'using ChatGPT'. It's **having processes**.",
        "tags": ["AI", "Automation"],
        "read_minutes": 6
    }
]


async def _seed_articles():
    count = await db.articles.count_documents({})
    if count > 0:
        return
    docs = []
    for a in ARTICLES_SEED:
        art = Article(**a)
        d = art.model_dump()
        d['published_at'] = d['published_at'].isoformat()
        docs.append(d)
    if docs:
        await db.articles.insert_many(docs)
        logger.info(f"Seeded {len(docs)} articles")


@api_router.get("/articles", response_model=List[Article])
async def list_articles(locale: str = "it", limit: int = 50):
    cursor = db.articles.find({"locale": locale}, {"_id": 0}).sort("published_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    for it in items:
        if isinstance(it.get('published_at'), str):
            try:
                it['published_at'] = datetime.fromisoformat(it['published_at'])
            except Exception:
                pass
    return items


@api_router.get("/articles/{slug}", response_model=Article)
async def get_article(slug: str, locale: str = "it"):
    art = await db.articles.find_one({"slug": slug, "locale": locale}, {"_id": 0})
    if not art:
        raise HTTPException(status_code=404, detail="Article not found")
    if isinstance(art.get('published_at'), str):
        try:
            art['published_at'] = datetime.fromisoformat(art['published_at'])
        except Exception:
            pass
    return art


# ---------- OG image generation ----------
@api_router.get("/og")
async def generate_og(
    title: str = Query(..., max_length=200),
    subtitle: Optional[str] = Query(None, max_length=200),
    kicker: Optional[str] = Query(None, max_length=80),
):
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), color="#050505")
    draw = ImageDraw.Draw(img)

    # Try to load fonts (fall back to default if missing)
    def _font(size):
        for path in [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]:
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
        return ImageFont.load_default()

    f_brand = _font(36)
    f_title = _font(86)
    f_sub = _font(34)
    f_kicker = _font(22)

    # Subtle violet glow rectangle
    for i in range(40, 0, -2):
        a = max(0, int(60 - i))
        # ellipse glow
        draw.ellipse(
            [W // 2 - 360 - i, H + 100 - i, W // 2 + 360 + i, H + 320 + i],
            fill=(157, 76, 221, a),
        )

    # Brand mark "[NOT4SALE]" top-left
    bracket_color = "#9D4CDD"
    brand_x, brand_y = 70, 70
    draw.text((brand_x, brand_y), "[", font=f_brand, fill=bracket_color)
    bracket_w = draw.textlength("[", font=f_brand)
    draw.text((brand_x + bracket_w + 4, brand_y), "NOT4SALE", font=f_brand, fill="#FFFFFF")
    n4s_w = draw.textlength("NOT4SALE", font=f_brand)
    draw.text((brand_x + bracket_w + 4 + n4s_w + 4, brand_y), "]", font=f_brand, fill=bracket_color)

    # Kicker pill (mono uppercase) top-right
    if kicker:
        k = kicker.upper()
        kw = draw.textlength(k, font=f_kicker)
        draw.rectangle([W - 80 - kw - 28, 76, W - 80, 76 + 36], outline="#9D4CDD", width=1)
        draw.text((W - 80 - kw - 14, 84), k, font=f_kicker, fill="#9D4CDD")

    # Title (wrap manually)
    def wrap(text, font, max_w):
        words = text.split()
        lines = []
        cur = ""
        for w in words:
            test = (cur + " " + w).strip()
            if draw.textlength(test, font=font) <= max_w:
                cur = test
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines

    title_lines = wrap(title, f_title, W - 140)[:3]
    y = H - 60 - len(title_lines) * 96 - (60 if subtitle else 20)
    for line in title_lines:
        draw.text((70, y), line, font=f_title, fill="#FFFFFF")
        y += 96

    if subtitle:
        sub_lines = wrap(subtitle, f_sub, W - 140)[:2]
        for line in sub_lines:
            draw.text((70, y + 10), line, font=f_sub, fill="#9D4CDD")
            y += 42

    # Bottom rule
    draw.rectangle([70, H - 50, 200, H - 48], fill="#9D4CDD")
    draw.text((220, H - 60), "not4.sale · CATTOLICA, IT", font=f_kicker, fill="#A3A3A3")

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png", headers={"Cache-Control": "public, max-age=3600"})


# ---------- Sitemap ----------
SITE_URL = "https://not4.sale"
SITE_ROUTES = [
    "/", "/servizi",
    "/servizi/seo", "/servizi/aeo", "/servizi/geo",
    "/servizi/growth-hacking", "/servizi/brand-strategy",
    "/servizi/performance-marketing", "/servizi/social",
    "/servizi/content", "/servizi/web-design", "/servizi/ai-marketing",
    "/case-studies", "/chi-siamo", "/contatti",
    "/preventivo", "/insights",
    # EN
    "/en", "/en/services", "/en/case-studies", "/en/about", "/en/contact",
    "/en/quote", "/en/insights",
]


@api_router.get("/sitemap.xml")
async def sitemap():
    today = datetime.now(timezone.utc).date().isoformat()
    urls_xml = []
    for r in SITE_ROUTES:
        urls_xml.append(
            f"  <url><loc>{SITE_URL}{r}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>weekly</changefreq>"
            f"<priority>{'1.0' if r == '/' else '0.8'}</priority></url>"
        )
    # Articles
    arts_it = await db.articles.find({"locale": "it"}, {"_id": 0, "slug": 1}).to_list(200)
    arts_en = await db.articles.find({"locale": "en"}, {"_id": 0, "slug": 1}).to_list(200)
    for a in arts_it:
        urls_xml.append(f"  <url><loc>{SITE_URL}/insights/{a['slug']}</loc><lastmod>{today}</lastmod><priority>0.6</priority></url>")
    for a in arts_en:
        urls_xml.append(f"  <url><loc>{SITE_URL}/en/insights/{a['slug']}</loc><lastmod>{today}</lastmod><priority>0.6</priority></url>")

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls_xml) + "\n"
        '</urlset>\n'
    )
    return Response(content=xml, media_type="application/xml")


# ============ APP WIRE ============
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    try:
        await _seed_articles()
    except Exception:
        logger.exception("Article seed failed")
    if os.environ.get("VERCEL"):
        # Serverless: niente loop in background, i follow-up li processa il
        # Vercel Cron che chiama /api/admin/followups/run-due
        logger.info("Serverless environment: follow-up worker disabled (cron-driven)")
    else:
        asyncio.create_task(_followup_worker_loop())
        logger.info("Follow-up worker scheduled (poll every 60s)")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
