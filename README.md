
# EscalateAI — Complaint Writer & Escalation Generator (GenAI Agent)

EscalateAI is a full-stack Generative AI web app that helps users create **professional complaint messages** and **escalation drafts** for common real-world problems like UPI disputes, refunds, delivery issues, hostel complaints, internet downtime, workplace concerns, and more.

The goal is simple: **write the right complaint in the right tone**, faster.

---

## Live Demo

Deployed Link:https://escalate-ai.vercel.app/

---

## What the App Generates

For every complaint, the app generates:

* WhatsApp complaint message
* Formal email complaint (subject + body)
* Escalation email draft (subject + body)
* Follow-up reminder message
* 2–4 quick actionable tips

---

## Key Features

* Clean multi-step user flow
* Tone selection: **Polite / Firm / Strict**
* Missing detail handling using placeholders like `{{DATE}}`, `{{ORDER_ID}}`
* Copy-to-clipboard for all generated drafts
* Proper loading + error states for smooth UX

---

## Tech Stack

**Frontend:** Next.js + TailwindCSS
**Backend:** FastAPI
**Agent System:** PydanticAI
**LLM Provider:** OpenRouter (primary + fallback model support)

---

Sure Sanjay ✅ here’s a **better + more “agent-like” PydanticAI section** (sounds professional and matches what evaluators expect):

---

## PydanticAI Usage (Agent System)

This project implements the complaint generation logic as a **PydanticAI Agent**.

The agent layer is responsible for:

* **Structured output enforcement** using a Pydantic result model (WhatsApp draft, email subject/body, escalation draft, follow-up, tips)
* **Consistent formatting** across different tones (polite / firm / strict)
* **Validation-safe generation**, ensuring the backend always returns predictable fields to the frontend
* **Reliability improvements** through retry handling and a fallback model when the primary model fails

This makes the system more robust, production-friendly, and easier to scale with additional tools or workflows in the future.

---

