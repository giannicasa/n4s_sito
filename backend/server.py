from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# ---- App init ----
app = FastAPI(title="not4sale API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# ---- Models ----
class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default=None, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=40)
    service: Optional[str] = Field(default=None, max_length=80)
    budget: Optional[str] = Field(default=None, max_length=40)
    message: str = Field(..., min_length=1, max_length=4000)
    source: Optional[str] = Field(default="website")


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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=120)
    message: str = Field(..., min_length=1, max_length=4000)


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # 'user' | 'assistant'
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatResponse(BaseModel):
    session_id: str
    reply: str


# ---- System prompt for AI Assistant ----
SYSTEM_PROMPT_IT = (
    "Sei N4S, l'assistente AI dello studio di marketing not4sale con sede a Cattolica (Italia). "
    "Lo studio è guidato da 4 soci fondatori e offre: Growth Hacking, SEO, AEO (Answer Engine Optimization), "
    "GEO (Generative Engine Optimization), Brand Strategy, Performance Marketing, Social Media, Content, "
    "Web Design e AI Marketing. "
    "La filosofia di not4sale è 'costruiamo la macchina giusta per ogni cliente': niente Ferrari per chi vuole una 500, "
    "niente strategie copia-incolla. Tono: ribelle, diretto, confidente, mai vendutissimo. "
    "Rispondi SEMPRE in italiano, in modo conciso (max 4-6 frasi), incisivo e creativo. "
    "Aiuta il visitatore a capire quale servizio gli serve, qualifica il lead facendo 1-2 domande mirate "
    "quando ha senso (settore, obiettivo, budget indicativo) e invitalo a lasciare una richiesta dalla pagina /contatti "
    "o tramite il form qui sul sito. Mai promesse impossibili, mai numeri inventati, mai prezzi precisi. "
    "Se la domanda è fuori scope (es. ricette, gossip), riportala con leggerezza al marketing."
)


# ---- Routes ----
@api_router.get("/")
async def root():
    return {"name": "not4sale API", "status": "ok"}


@api_router.get("/health")
async def health():
    try:
        await db.command("ping")
        return {"status": "ok", "db": "ok"}
    except Exception as e:
        return {"status": "degraded", "db_error": str(e)}


# Leads
@api_router.post("/contact", response_model=Lead)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)
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


# Chat
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
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    session_id = payload.session_id.strip() or str(uuid.uuid4())

    # Persist user message
    user_msg = ChatMessage(session_id=session_id, role="user", content=payload.message)
    udoc = user_msg.model_dump()
    udoc['created_at'] = udoc['created_at'].isoformat()
    await db.chat_messages.insert_one(udoc)

    # Build chat - LlmChat handles history per session_id when reused. Create fresh
    # instance each call but rely on a single system prompt; we pass only the new
    # user message, since the lib does not auto-load DB history. To preserve context
    # across turns we manually replay the saved history as a single concatenated user
    # turn would be hacky; instead we instantiate LlmChat with a session_id (library
    # tracks its own in-memory history) and prepend a short transcript in the system
    # prompt for stateless calls.
    history = await _get_history(session_id)
    transcript_lines = []
    for h in history[:-1][-10:]:  # last 10 turns excluding the just-saved user msg
        role = "Utente" if h.get('role') == 'user' else "N4S"
        transcript_lines.append(f"{role}: {h.get('content', '')}")
    transcript = "\n".join(transcript_lines)

    system_prompt = SYSTEM_PROMPT_IT
    if transcript:
        system_prompt = (
            SYSTEM_PROMPT_IT
            + "\n\n[STORICO CONVERSAZIONE RECENTE]\n"
            + transcript
            + "\n[FINE STORICO]"
        )

    chat_client = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_prompt,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        reply_text = await chat_client.send_message(UserMessage(text=payload.message))
    except Exception as e:
        logger.exception("LLM call failed")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")

    if not isinstance(reply_text, str):
        reply_text = str(reply_text)

    # Persist assistant message
    assistant_msg = ChatMessage(session_id=session_id, role="assistant", content=reply_text)
    adoc = assistant_msg.model_dump()
    adoc['created_at'] = adoc['created_at'].isoformat()
    await db.chat_messages.insert_one(adoc)

    return ChatResponse(session_id=session_id, reply=reply_text)


# SEO helpers served from backend
SITE_URL = "https://not4.sale"

SITE_ROUTES = [
    "/",
    "/servizi",
    "/servizi/seo",
    "/servizi/aeo",
    "/servizi/geo",
    "/servizi/growth-hacking",
    "/servizi/brand-strategy",
    "/servizi/performance-marketing",
    "/servizi/social",
    "/servizi/content",
    "/servizi/web-design",
    "/servizi/ai-marketing",
    "/case-studies",
    "/chi-siamo",
    "/contatti",
]


@api_router.get("/sitemap.xml")
async def sitemap():
    today = datetime.now(timezone.utc).date().isoformat()
    urls = "\n".join(
        f"  <url><loc>{SITE_URL}{r}</loc><lastmod>{today}</lastmod><changefreq>weekly</changefreq>"
        f"<priority>{'1.0' if r == '/' else '0.8'}</priority></url>"
        for r in SITE_ROUTES
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{urls}\n"
        '</urlset>\n'
    )
    return Response(content=xml, media_type="application/xml")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
