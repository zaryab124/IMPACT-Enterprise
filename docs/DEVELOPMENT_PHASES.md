# IMPACT Enterprise AI Sales & Communication Agent — Development Phases

## Absolute Development Rule
Antigravity must execute development strictly in discrete, gated phases.
Never implement the entire platform at once.
For every phase:
`PLAN → IMPLEMENT → RUN APPLICATION → SMOKE TEST → AUTHENTICATION TEST → DATABASE TEST → API TEST → UI TEST → BROWSER TEST → FIX ALL FAILURES → RETEST → PHASE VERIFICATION → NEXT PHASE`

---

## Phase Matrix & Hard Gate Criteria

### Phase 0: Project Discovery & Repository Audit (CURRENT PHASE)
- **Objective**: Audit existing code, inspect the live IMPACT website (`https://impact-enterprise.vercel.app`), configure baseline repository, establish docs, and verify build/lint/typecheck.
- **Deliverables**:
  - `/docs/ARCHITECTURE.md`
  - `/docs/DEVELOPMENT_PHASES.md`
  - `/docs/SMOKE_TESTS.md`
  - `/docs/SECURITY.md`
  - `.gitignore`, `.env.example`, `package.json`, `tsconfig.json`, `tailwind.config.ts`
  - Baseline Next.js application skeleton reflecting live branding.
- **Smoke Tests**:
  - `npm run typecheck` (0 errors)
  - `npm run lint` (0 errors)
  - `npm run build` (successful production build)
  - Local server startup & homepage browser rendering check.
- **Hard Gate**: All scripts succeed cleanly; zero missing files; live website styling faithfully matched; documentation complete.

---

### Phase 1: Application Foundation
- **Objective**: Establish modular backend service architecture, unified configuration loading, health telemetry, and structured logging.
- **Deliverables**:
  - Environment config validator (`src/lib/config.ts` with Zod).
  - Centralized logger (`src/lib/logger.ts`) with severity levels and redaction.
  - Health check endpoint `GET /api/health` returning `{ "status": "ok", "database": "connected" }`.
  - Global error boundary and API response standardizer.
- **Hard Gate**: `GET /api/health` returns HTTP 200 with valid JSON; production build succeeds; no unhandled promise rejections.

---

### Phase 2: PostgreSQL Database & Migrations
- **Objective**: Implement relational schema with strict migrations, relational integrity, foreign keys, unique constraints, and seed data.
- **Entities**:
  - `users`, `roles`, `permissions`, `user_roles`
  - `customers`, `companies`, `conversations`, `messages`
  - `leads`, `lead_scores`, `lead_events`
  - `appointments`, `services`, `case_studies`
  - `knowledge_documents`, `knowledge_chunks`, `knowledge_metadata`
  - `agent_sessions`, `agent_actions`, `notifications`, `audit_logs`
- **Hard Gate**: Migration apply and rollback succeed; CRUD operations pass; foreign key cascades function; customer record isolation test passes.

---

### Phase 3: Authentication + Server-Side RBAC
- **Objective**: Implement secure authentication (email/password with bcrypt, secure HTTP-only session cookies/JWT) and server-side RBAC.
- **Roles**:
  - `SUPER_ADMIN`, `ADMIN`, `SALES_MANAGER`, `SALES_AGENT`, `SUPPORT_AGENT`, `VIEWER`
- **Routes Protected**:
  - `/admin`, `/admin/dashboard`, `/admin/customers`, `/admin/leads`, `/admin/conversations`, `/admin/appointments`, `/admin/settings`
- **Hard Gate**: Unauthenticated direct URL and direct API requests return 401; unauthorized roles return 403; session invalidation on logout confirmed via automated and direct HTTP tests.

---

### Phase 4: IMPACT Knowledge Base & RAG Engine
- **Objective**: Embed and index verified IMPACT Enterprise capabilities, solutions, and policies.
- **Categories**:
  - AI Engineering, AI Agents, Business Automation, Custom Applications, SaaS Products, Integrations, Case Studies, FAQs, Project Methodology, Pricing & Consultation Policies.
- **Hard Gate**: AI answers 5 benchmark verification queries accurately; unknown question triggers polite boundary response without hallucination.

---

### Phase 5: Gemini AI Engine & Controlled System Prompts
- **Objective**: Implement server-side Gemini integration using official `@google/genai` (`gemini-3.7-flash`).
- **Services**:
  - `AIService`, `ConversationService`, `PromptService`, `ToolService`, `KnowledgeService`, `LeadQualificationService`
- **Hard Gate**: System handles normal, technical, pricing, objection, abusive, and prompt injection queries without breaking persona or leaking system prompts.

---

### Phase 6: Website AI Chat Widget
- **Objective**: Deploy responsive, floating conversational chat component on the web application.
- **Features**:
  - Message history persistence, real-time typing/streaming, error state retry, conversation ID generation, inline lead capture forms, human handoff button.
- **Hard Gate**: Browser test verifies open chat, message exchange, multi-turn history, mobile/desktop viewports, and reconnect on simulated network drop.

---

### Phase 7: Lead Qualification & Sales Engine
- **Objective**: Implement structured prospect qualification and autonomous scoring.
- **Stages**: `NEW` → `CONTACTED` → `QUALIFIED` → `PROPOSAL` → `NEGOTIATION` → `WON` → `LOST` → `NURTURE`
- **Scoring Dimensions**: Business fit, problem clarity, timeline urgency, budget match, decision authority, engagement.
- **Hard Gate**: Simulated cold, interested, qualified, and high-value visitors transition accurately across stages in the CRM.

---

### Phase 8: Secure AI Function Calling Tools
- **Objective**: Equip the Gemini engine with strongly typed backend tools for autonomous action.
- **Tools**: `search_services`, `search_case_studies`, `get_company_information`, `create_lead`, `update_lead`, `get_lead`, `book_appointment`, `send_confirmation`, `notify_sales_team`, `request_human_handoff`.
- **Hard Gate**: Each tool validates input schemas with Zod; audit logs record execution; no direct SQL execution permitted.

---

### Phase 9: Appointment Booking & Calendar Automation
- **Objective**: Automated consultation scheduling engine with conflict detection and timezone normalization.
- **Features**: Realtime slot lookup, booking creation, rescheduling, cancellation, and automated confirmation hooks.
- **Hard Gate**: Double-booking prevention verified; invalid times rejected; AI confirms appointments only after database commit.

---

### Phase 10: Omnichannel Messaging Architecture (WhatsApp & Email)
- **Objective**: Implement modular channel adapter layer (`MessageService`, `ChannelAdapter`, `WhatsAppAdapter`, `EmailAdapter`, `WebChatAdapter`).
- **Hard Gate**: Inbound WhatsApp webhook parses, authenticates HMAC signature, persists conversation, triggers AI response, and updates CRM. Outbound delivery failures correctly handled.

---

### Phase 11: Realtime Voice Agent (Gemini Live API)
- **Objective**: Implement browser-based real-time voice conversations using the Gemini Live API (`gemini-3.1-flash-live-preview`).
- **Pipeline**: Browser Audio (PCM 16kHz) → Voice Gateway WebSocket → Gemini Live API → Audio Output (PCM 24kHz) + Transcripts.
- **Hard Gate**: Browser voice test confirms voice input, AI audio response, user interruption handling, and transcript storage in CRM.

---

### Phase 12: Telephony Infrastructure (Inbound/Outbound Phone Calls)
- **Objective**: Connect SIP/telephony provider (Twilio Voice Gateway) to the Gemini Live audio engine.
- **Hard Gate**: Simulated inbound phone call answered by AI, conversation transcribed in real-time, lead record created, and call outcome logged.

---

### Phase 13: Human Handoff Protocol
- **Objective**: Seamless escalation from autonomous AI agent to human sales/support personnel.
- **Triggers**: Explicit user request, complex custom pricing, low AI confidence score, complaints, or VIP deal qualification.
- **Hard Gate**: Trigger immediately updates conversation status to `HANDOFF_REQUIRED`, disables autonomous replies, and dispatches sales notifications.

---

### Phase 14: Admin Sales CRM & Analytics Dashboard
- **Objective**: Full-featured administrative control center for sales managers and operators.
- **Views**: Lead Pipeline, Conversation History, Live Calls, Appointment Calendar, Knowledge Management, Team RBAC, Audit Logs.
- **Hard Gate**: Strict RBAC verified across views (e.g. VIEWER cannot modify leads, SALES_AGENT sees assigned leads, ADMIN has full operational control).

---

### Phase 15: Enterprise Security Audit & Production Hardening
- **Objective**: Complete end-to-end security, penetration, and compliance audit.
- **Checklist**: Secret scanning, CSRF/XSS testing, SQL injection fuzzing, prompt injection hardening, rate limiting, and PII protection.
- **Hard Gate**: Zero high/critical vulnerabilities; zero secrets in git; passing automated security suite.
