
# EscalateAI – Complaint Writer & Escalation Generator

EscalateAI is a full-stack Generative AI web app that helps users quickly write **professional complaint messages** and **escalation drafts** for real-world situations (college/hostel, internet issues, refunds, banking disputes, landlord problems, etc.).

The goal is simple: **write the right message in the right tone**, so issues get resolved faster.

---

## Live Links
https://escalate-ai.vercel.app/
---

## What it Generates

For every complaint, the app generates:

* **WhatsApp complaint message**
* **Formal email complaint** (subject + body)
* **Escalation email** (subject + body)
* **Follow-up reminder message**
* **Quick tips** to improve chances of resolution

---

## Key Features

* Multi-step form with a clear user flow
* Tone selection: **Polite / Firm / Strict**
* Clean UI with proper loading + error states
* Copy buttons for all generated drafts

---

## Tech Stack

**Frontend:** Next.js + TailwindCSS
**Backend:** FastAPI
**LLM Provider:** OpenRouter

---

## Pydantic Usage (Important)

Pydantic is used in the backend for:

* **Validating user inputs** (category, tone, title, description, etc.)
* **Enforcing clean API request/response schemas**
* Preventing bad/empty data from reaching the AI generation step

---
