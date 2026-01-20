"""
EscalateAI Backend - FastAPI application for complaint generation (OpenRouter)
"""

import os
import logging
import uuid
from typing import Optional
from enum import Enum
import json
import asyncio
import re

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# -----------------------------
# Load environment variables
# -----------------------------
_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(_BASE_DIR, ".env"), override=False)

# -----------------------------
# Logging
# -----------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("escalateai")

# -----------------------------
# FastAPI App
# -----------------------------
app = FastAPI(title="EscalateAI API", version="1.0.0")

# CORS (allow all for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: set your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Enums
# -----------------------------
class Category(str, Enum):
    COLLEGE_HOSTEL = "college_hostel"
    INTERNET_NETWORK = "internet_network"
    ECOMMERCE_REFUND = "ecommerce_refund"
    BANKING_UPI = "banking_upi"
    RENT_LANDLORD = "rent_landlord"
    WORKPLACE_HR = "workplace_hr"
    COURIER_DELIVERY = "courier_delivery"
    HOSPITAL_BILLING = "hospital_billing"


class Tone(str, Enum):
    POLITE = "polite"
    FIRM = "firm"
    STRICT = "strict"


# -----------------------------
# Request/Response Models
# -----------------------------
class GenerateRequest(BaseModel):
    category: Category
    tone: Tone

    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=5000)

    incident_date: Optional[str] = None
    location: Optional[str] = None

    company_or_institution: Optional[str] = None
    recipient_name: Optional[str] = None
    order_or_ticket_id: Optional[str] = None

    desired_resolution: str = Field(..., min_length=5, max_length=1000)
    proof_available: Optional[bool] = False


class GenerateResponse(BaseModel):
    request_id: str
    whatsapp_message: str
    email_subject: str
    email_body: str
    escalation_subject: str
    escalation_body: str
    followup_message: str
    tips: list[str]
    required_placeholders: list[str]


# -----------------------------
# OpenRouter Config
# -----------------------------
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL_PRIMARY = os.getenv("OPENROUTER_MODEL_PRIMARY", "openai/gpt-4o-mini")
OPENROUTER_MODEL_FALLBACK = os.getenv(
    "OPENROUTER_MODEL_FALLBACK", "meta-llama/llama-3.1-8b-instruct"
)

if not OPENROUTER_API_KEY:
    logger.warning("OPENROUTER_API_KEY not set. API will not work properly.")


# -----------------------------
# System Prompt
# -----------------------------
SYSTEM_PROMPT = """You are a professional complaint and escalation writing assistant.
You help users create clear, professional, and actionable complaints.

Guidelines:
1. Always maintain professionalism - never generate abusive, threatening, or inappropriate content
2. Structure content clearly with proper paragraphs and formatting
3. Use placeholders like {{DATE}}, {{ORDER_ID}}, {{RECIPIENT_NAME}}, {{COMPANY_NAME}} when specific information is missing
4. Adapt tone appropriately:
   - Polite: Courteous, respectful, seeking cooperation
   - Firm: Direct, clear expectations, setting boundaries
   - Strict: Formal, demanding, indicating potential consequences (still professional, no threats)
5. Make complaints actionable with specific requests and deadlines
6. Include relevant details but keep messages concise and readable
7. For escalations, emphasize urgency and reference previous communications
8. For follow-ups, be professional and reference the timeline

Output Rules:
- Return ONLY valid JSON (no markdown fences)
- JSON keys must be exactly:
  whatsapp_message, email_subject, email_body, escalation_subject, escalation_body, followup_message, tips
"""


# -----------------------------
# Helpers
# -----------------------------
def _extract_json(text: str) -> dict:
    """
    Extract the first JSON object from model output.
    Handles cases where model adds extra text or ```json fences.
    """
    t = (text or "").strip()

    # Remove code fences if present
    if t.startswith("```"):
        t = re.sub(r"^```(?:json)?\s*", "", t, flags=re.IGNORECASE).strip()
        t = re.sub(r"\s*```$", "", t).strip()

    start = t.find("{")
    end = t.rfind("}")

    if start == -1 or end == -1 or end <= start:
        raise json.JSONDecodeError("No JSON object found in model output", t, 0)

    return json.loads(t[start : end + 1])


async def call_openrouter(prompt: str, model: str, max_retries: int = 2) -> dict:
    """
    Calls OpenRouter Chat Completions API and returns parsed JSON dict.
    Includes retries with exponential backoff.
    """
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not configured")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        # Optional headers recommended by OpenRouter
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "EscalateAI",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
    }

    timeout = httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=10.0)

    async with httpx.AsyncClient(timeout=timeout) as client:
        last_err = None

        for attempt in range(max_retries):
            try:
                resp = await client.post(url, headers=headers, json=payload)

                if resp.status_code >= 400:
                    logger.error(f"OpenRouter HTTP {resp.status_code}: {resp.text[:800]}")
                    resp.raise_for_status()

                data = resp.json()
                text = data["choices"][0]["message"]["content"]
                return _extract_json(text)

            except Exception as e:
                last_err = e
                backoff = min(6.0, 0.8 * (2**attempt))
                logger.warning(f"OpenRouter call failed (attempt {attempt+1}/{max_retries}) model={model}: {e}")
                await asyncio.sleep(backoff)

        raise RuntimeError(f"OpenRouter failed after retries (model={model})") from last_err


# -----------------------------
# Routes
# -----------------------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "primary_model": OPENROUTER_MODEL_PRIMARY,
        "fallback_model": OPENROUTER_MODEL_FALLBACK,
        "api_key_configured": bool(OPENROUTER_API_KEY),
    }


@app.post("/generate", response_model=GenerateResponse)
async def generate_complaint(request: GenerateRequest):
    request_id = str(uuid.uuid4())
    logger.info(
        f"[{request_id}] category={request.category.value} tone={request.tone.value} title={request.title[:60]}"
    )

    # Placeholders logic
    required_placeholders = []
    if not request.incident_date:
        required_placeholders.append("DATE")
    if not request.location:
        required_placeholders.append("LOCATION")
    if not request.company_or_institution:
        required_placeholders.append("COMPANY_NAME")
    if not request.recipient_name:
        required_placeholders.append("RECIPIENT_NAME")
    if not request.order_or_ticket_id:
        required_placeholders.append("ORDER_ID")

    context = {
        "category": request.category.value,
        "tone": request.tone.value,
        "title": request.title,
        "description": request.description,
        "incident_date": request.incident_date or "{{DATE}}",
        "location": request.location or "{{LOCATION}}",
        "company_or_institution": request.company_or_institution or "{{COMPANY_NAME}}",
        "recipient_name": request.recipient_name or "{{RECIPIENT_NAME}}",
        "order_or_ticket_id": request.order_or_ticket_id or "{{ORDER_ID}}",
        "desired_resolution": request.desired_resolution,
        "proof_available": bool(request.proof_available),
    }

    prompt = f"""
Generate professional complaint drafts for the following scenario:

Category: {context['category']}
Tone: {context['tone']}

Title: {context['title']}
Description: {context['description']}

Incident Date: {context['incident_date']}
Location: {context['location']}
Company/Institution: {context['company_or_institution']}
Recipient Name: {context['recipient_name']}
Order/Ticket ID: {context['order_or_ticket_id']}
Desired Resolution: {context['desired_resolution']}
Proof Available: {context['proof_available']}

Return valid JSON with these keys:
1) whatsapp_message (short and clear)
2) email_subject
3) email_body
4) escalation_subject
5) escalation_body
6) followup_message
7) tips (2 to 4 short actionable tips)
"""

    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI models are not available. Please check API configuration.",
        )

    models_to_try = [OPENROUTER_MODEL_PRIMARY, OPENROUTER_MODEL_FALLBACK]

    parsed = None
    last_error = None

    for model in models_to_try:
        try:
            logger.info(f"[{request_id}] Trying model={model}")
            parsed = await call_openrouter(prompt, model=model)
            break
        except Exception as e:
            last_error = e
            logger.warning(f"[{request_id}] Model failed model={model}: {e}")

    if parsed is None:
        logger.error(f"[{request_id}] All models failed. Last error: {last_error}")
        raise HTTPException(
            status_code=502,
            detail="Failed to generate complaint (all models failed). Please try again later.",
        )

    # Extract fields with defaults
    whatsapp_message = parsed.get("whatsapp_message", "No message generated")
    email_subject = parsed.get("email_subject", f"Complaint Regarding: {request.title}")
    email_body = parsed.get("email_body", "No email body generated")
    escalation_subject = parsed.get("escalation_subject", f"Escalation: {request.title}")
    escalation_body = parsed.get("escalation_body", "No escalation body generated")
    followup_message = parsed.get("followup_message", "No follow-up message generated")
    tips = parsed.get(
        "tips",
        [
            "Review the message before sending.",
            "Keep proof documents ready (screenshots, receipts, emails).",
        ],
    )

    if not isinstance(tips, list):
        tips = [str(tips)] if tips else []

    logger.info(f"[{request_id}] Generated successfully")
    return GenerateResponse(
        request_id=request_id,
        whatsapp_message=whatsapp_message,
        email_subject=email_subject,
        email_body=email_body,
        escalation_subject=escalation_subject,
        escalation_body=escalation_body,
        followup_message=followup_message,
        tips=tips,
        required_placeholders=required_placeholders,
    )


# -----------------------------
# Local Run
# -----------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
