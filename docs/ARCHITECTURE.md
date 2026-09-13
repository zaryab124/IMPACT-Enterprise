# IMPACT Enterprise: System Architecture Specification

## 1. System Overview
IMPACT Enterprise is an enterprise-grade AI, automation, and custom software product studio. This document describes the existing architectural landscape and defines the target production architecture for the **IMPACT AI — Sales & Customer Communication Agent**.

---

## 2. Current Architecture (As-Is)

### 2.1 Technology Stack
- **Framework**: Next.js 14.2.15 (React 18.3.1) with App Router.
- **Language**: TypeScript 5.6.3 (strict mode enabled).
- **Styling**: Tailwind CSS 3.4.14 with brand design system:
  - `#FAF9F6` (Off-white / Warm canvas)
  - `#3B38F5` (Electric Indigo / Brand Accent)
  - `#10B981` (Emerald / Production Health)
  - `#F59E0B` (Warm Gold / Highlights)
- **Interactive Visuals**: Three.js 0.186.0 WebGL canvas (`ImpactEngine3D`, `NeuralCanvas`).
- **Icons**: Lucide React.
- **Data Persistence**: File-backed JSON stores in `/data/` (`inquiries.json`, `intake_submissions.json`) with in-memory buffer fallbacks.
- **Hosting & Edge**: Vercel serverless deployment (`https://impact-enterprise.vercel.app`).

### 2.2 Existing Routes & Pages
- `/` — Homepage: Hero with Three.js 3D dynamic sculpture, living telemetry benchmark console, 7-step AI Agent workflow visualization, 6-step Automation pipeline, 3D application showcases, Idea Builder, and Case Studies preview.
- `/about` — Executive leadership profiles (CEO Muhammad Zaryab Hassan, CGO Mahad Aziz, CFO Muhammad Ismail, Branch Manager Ansar Abbas Jafri) and company core engineering pillars.
- `/solutions` — Solutions Matrix.
- `/solutions/ai-agents` — Autonomous agents, voice dispatch, document intelligence.
- `/solutions/automation` — Event-driven automation pipelines and CRM synchronizers.
- `/solutions/software` — Full-stack web, mobile, and administrative portal engineering.
- `/products` — Product Studio and venture co-development (Restaurant Technology Platform, Multi-tenant SaaS).
- `/projects` — Case studies portfolio with dynamic category filtering.
- `/projects/[slug]` — Case study details (including Restaurant Technology Platform with 8 RBAC tiers, HMAC QR tables, and real-time KDS).
- `/contact` — Client inquiry intake.
- `/start-a-project` — 7-step interactive project scoping wizard with unique project reference IDs.
- `/requests` — Internal inspection dashboard for submitted inquiries and intake requests.

### 2.3 Existing APIs
- `POST /api/contact`, `GET /api/contact` — Validates and appends inquiries to `data/inquiries.json`.
- `POST /api/intake`, `GET /api/intake` — Validates and persists project intake briefs to `data/intake_submissions.json`.

---

## 3. Proposed Target Architecture (To-Be)

```
                       ┌──────────────────────────────────────────────┐
                       │          Client Interaction Channels         │
                       ├──────────────┬───────────────┬───────────────┤
                       │ Website Chat │   WhatsApp    │ Voice / Phone │
                       │ (WebSockets) │ (Cloud API)   │ (Gemini Live) │
                       └───────┬──────┴───────┬───────┴───────┬───────┘
                               │              │               │
                               ▼              ▼               ▼
                       ┌──────────────────────────────────────────────┐
                       │        Multi-Channel Ingestion Gateway       │
                       │   - WebChatAdapter     - WhatsAppAdapter     │
                       │   - EmailAdapter       - VoiceGateway (SIP)  │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │           Security & RBAC Boundary           │
                       │  - Server-side Session / JWT Auth            │
                       │  - 6-Tier RBAC Guard:                        │
                       │    SUPER_ADMIN, ADMIN, SALES_MANAGER,        │
                       │    SALES_AGENT, SUPPORT_AGENT, VIEWER        │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │             IMPACT AI Engine Core            │
                       ├──────────────────────────────────────────────┤
                       │ - AIService (Gemini 2.5 Flash / Pro)         │
                       │ - Gemini Live API (Bidirectional Audio)      │
                       │ - Controlled System Prompt & Guardrails      │
                       │ - PromptService & Context Builder            │
                       │ - LeadQualificationService & Scoring         │
                       │ - ToolService (Function Calling Engine)      │
                       └───────┬──────────────────────────────┬───────┘
                               │                              │
                ┌──────────────┴──────────────┐ ┌─────────────┴─────────────┐
                ▼                             ▼ ▼                           ▼
   ┌──────────────────────────┐   ┌──────────────────────────┐  ┌──────────────────────────┐
   │ Knowledge Base & Search  │   │  CRM & Execution Tools   │  │  Human Handoff Engine    │
   ├──────────────────────────┤   ├──────────────────────────┤  ├──────────────────────────┤
   │ - knowledge_documents    │   │ - search_services()      │  │ - 🔴 Realtime Alert     │
   │ - knowledge_chunks       │   │ - create_lead()          │  │ - Sales Agent Takeover   │
   │ - Vector/Keyword hybrid  │   │ - book_appointment()     │  │ - Conversation Lock      │
   │ - Strict anti-hallucin.  │   │ - notify_sales_team()    │  │ - Audit Logging          │
   └──────────────────────────┘   └──────────────────────────┘  └──────────────────────────┘
                │                             │                             │
                └─────────────────────────────┼─────────────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │       Relational Data & Cache Layer          │
                       ├──────────────────────────────────────────────┤
                       │ - PostgreSQL (Prisma / Drizzle ORM)          │
                       │   Users, Roles, Leads, Conversations,        │
                       │   Appointments, Services, Audit Logs         │
                       │ - Redis (Pub/Sub, Caching, Voice Sessions)   │
                       └──────────────────────────────────────────────┘
```

---

## 4. Key Subsystems & Components

### 4.1 IMPACT AI Engine & Prompt System
- **SDK**: `@google/genai` (official Google Gen AI SDK).
- **Core Reasoning**: `gemini-2.5-flash` for high-velocity real-time conversational chat, customer qualification, and function calling.
- **Voice Pipeline**: Gemini Live API over WebSockets for bi-directional sub-second voice discussions with interruption detection.
- **Guardrails**: Zero-hallucination boundary enforcement; AI refuses to invent pricing, nonexistent features, or fictitious clients; strictly grounded in verified knowledge base entries.

### 4.2 Lead Qualification & CRM Scoring Engine
- **Captured Attributes**: Full name, company, industry, phone, email, core problem, desired solution, budget range, timeline, decision-maker status.
- **Lifecycle Stages**: `NEW` → `CONTACTED` → `QUALIFIED` → `PROPOSAL` → `NEGOTIATION` → `WON` / `LOST` / `NURTURE`.
- **Scoring Matrix**: Multi-factor weighted algorithm (0–100) assessing business fit, budget clarity, urgency, and decision authority.

### 4.3 Controlled Tool Calling (Function Execution)
AI operates via deterministic, schema-validated server tools:
1. `search_services(query, category)`
2. `search_case_studies(slug, industry)`
3. `get_company_information()`
4. `create_lead(leadData)`
5. `update_lead(leadId, patchData)`
6. `get_lead(leadId)`
7. `book_appointment(appointmentData)`
8. `send_confirmation(channel, recipient, payload)`
9. `notify_sales_team(priority, details)`
10. `request_human_handoff(reason, urgency)`

### 4.4 Multi-Channel Communication Adapters
- **WebChatAdapter**: Real-time streaming over SSE/WebSockets for web clients with session resumption.
- **WhatsAppAdapter**: Webhook ingestion and outbound messaging via Meta WhatsApp Cloud API.
- **EmailAdapter**: Transactional notifications via verified provider (Resend / SendGrid).
- **VoiceGateway**: WebRTC/SIP bridge to Gemini Live API with automated recording, transcription, and call tagging.

### 4.5 Security & Role-Based Access Control (RBAC)
- 6 predefined roles:
  1. `SUPER_ADMIN`: Full administrative control, system settings, AI configuration, audit logs.
  2. `ADMIN`: Operational oversight, user management, knowledge base curation.
  3. `SALES_MANAGER`: Team lead management, pipeline analytics, appointment oversight.
  4. `SALES_AGENT`: Assigned leads, conversation handling, human takeover, manual follow-up.
  5. `SUPPORT_AGENT`: Inquiries, customer communications, escalation handling.
  6. `VIEWER`: Read-only access to reporting dashboards.
- Every protected route enforces server-side authentication and role permission checks.

---

## 5. Architectural Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **AI Hallucinations** | High (inaccurate quotes or promises) | Strict citation grounding against approved knowledge docs; fallback to human handoff for unknown questions. |
| **Secret Exposure** | Critical | Server-side execution only for all Gemini and database calls; zero client-side credentials; repository secret scans. |
| **Existing UI Regression** | High | Strict zero-breakage rule; modular packaging; regression smoke tests on every phase. |
| **Voice Latency** | Medium | Gemini Live native audio streaming; direct WebSocket connection; sub-500ms target response. |
| **External Channel Outage** | Medium | Asynchronous retry queues with dead-letter monitoring; never report false delivery status. |

---

## 6. Dependency & Package Roadmap
- `@google/genai` — Official Gemini API & Live API SDK.
- `prisma` / `@prisma/client` (or `pg` + `drizzle-orm`) — PostgreSQL relational database layer.
- `zod` — Schema validation for APIs and tool calling.
- `bcryptjs` / `argon2` & `jsonwebtoken` (or NextAuth / Auth.js) — Secure authentication and session management.
- `ws` — Real-time WebSocket gateway for streaming chat and voice.
