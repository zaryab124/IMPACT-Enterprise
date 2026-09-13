# IMPACT AI: Phase-Gated Development Specification

## Core Rules & Governing Principles

### Rule 1 — Never Fake Functionality
During development, no component may return fake API responses, generate mock database records presented as production data, or simulate successful payments, phone calls, or WhatsApp messages without real execution. Mocks are permitted ONLY when explicitly declared as `DEVELOPMENT MOCK`.

### Rule 2 — Verify Before Claiming
Never declare "Implemented successfully" until code is written, built, started, tested, and verified in browser/runtime against actual expected behavior.

### Rule 3 — Security & Secret Isolation
Under no circumstances may `GEMINI_API_KEY`, database credentials, or private tokens be exposed in frontend code, browser bundles, public environment variables, or Git repositories. All AI orchestration and database operations execute server-side.

### Rule 4 — Mandatory Server-Side Authentication
Every protected route and API endpoint must verify authentication server-side. Client-side button hides, localStorage flags, or client redirects are non-acceptable for security.

### Rule 5 — Granular Role-Based Access Control (RBAC)
6 primary roles must be strictly enforced:
- `SUPER_ADMIN`
- `ADMIN`
- `SALES_MANAGER`
- `SALES_AGENT`
- `SUPPORT_AGENT`
- `VIEWER`

### Rule 6 — AI Safety & Grounded Knowledge
The AI must never fabricate services, quote unofficial pricing, invent case studies, claim human identity, or expose private customer records. All knowledge must originate from verified company data chunks.

### Rule 7 — Persuasive & Professional Sales Behavior
The agent conducts active problem discovery, aligns client pain points with verified IMPACT services, qualifies leads across budget/timeline/authority, and routes hot prospects to appointments or human handoff.

---

## 20-Phase Master Roadmap

```
PHASE 0: Discovery & Repository Audit
  ↓
PHASE 1: Application Foundation & Health Endpoint
  ↓
PHASE 2: PostgreSQL Database & Schema Migrations
  ↓
PHASE 3: Authentication & Granular RBAC
  ↓
PHASE 4: IMPACT Knowledge Base & Search System
  ↓
PHASE 5: Gemini AI Engine & Controlled Prompts
  ↓
PHASE 6: Website Chat Agent UI & Real-Time Stream
  ↓
PHASE 7: Lead Qualification & CRM Scoring
  ↓
PHASE 8: AI Tools (Function Calling Execution)
  ↓
PHASE 9: Appointment Booking & Calendar Flow
  ↓
PHASE 10: Multi-Channel Messaging (WhatsApp & Email)
  ↓
PHASE 11: Realtime Voice Agent (Gemini Live API)
  ↓
PHASE 12: Telephony Infrastructure (SIP / Voice Gateway)
  ↓
PHASE 13: Human Handoff Engine (🔴 Urgent Takeover)
  ↓
PHASE 14: Admin Sales & Operations Dashboard
  ↓
PHASE 15: Enterprise Security Audit & Penetration Test
  ↓
PHASE 16: Complete End-to-End Customer Simulation
  ↓
PHASE 17: Production Smoke Test Suite
  ↓
PHASE 18: Staging Deployment Verification
  ↓
PHASE 19: Production Deployment & Health Gate
  ↓
PHASE 20: Post-Deployment Monitoring & Telemetry
```

---

## Phase Breakdown & Gating Criteria

### Phase 0: Project Discovery & Repository Audit
- **Goal**: Audit existing codebase, routes, components, APIs, and dependencies without breaking existing functionality.
- **Deliverables**: `/docs/ARCHITECTURE.md`, `/docs/DEVELOPMENT_PHASES.md`, `/docs/SMOKE_TESTS.md`, `/docs/SECURITY.md`, test report `/docs/test-reports/phase-0.md`.
- **Gate**: Zero TypeScript errors, zero lint errors, successful production build, server starts, all existing routes load cleanly.

### Phase 1: Application Foundation
- **Goal**: Establish core modular architecture, typed environment configuration, structured logger, standard error wrappers, and health check API.
- **Endpoint**: `GET /api/health` returning `{ "status": "ok", "database": "connected" }`.
- **Gate**: Build succeeds, health check responds 200 OK with database connection status.

### Phase 2: PostgreSQL Database
- **Goal**: Implement relational schema (users, roles, permissions, leads, conversations, messages, appointments, audit logs).
- **Gate**: Schema migrations execute cleanly, rollback supported, CRUD verified, foreign key constraints active.

### Phase 3: Authentication + RBAC
- **Goal**: Secure login/logout, session management, password hashing, and server-side RBAC middleware.
- **Gate**: Direct 401 unauthenticated test, 403 unauthorized role test, session invalidation on logout.

### Phase 4: IMPACT Knowledge Base
- **Goal**: Curate approved knowledge documents across all services, case studies, leadership, and policies.
- **Gate**: Zero hallucination on unknown questions; verified exact retrieval on approved questions.

### Phase 5: Gemini AI Engine
- **Goal**: Integrate `@google/genai` with `gemini-2.5-flash`, system prompt guardrails, and conversation service.
- **Gate**: Safe handling of prompt injection, pricing traps, angry users, and confidentiality probes.

### Phase 6: Website Chat Agent
- **Goal**: Interactive floating chat widget on the website with message streaming, history, and lead capture.
- **Gate**: Responsive on mobile and desktop, persists conversation across page navigation, handles network retries.

### Phase 7: Lead Qualification + Sales Engine
- **Goal**: Automated lead scoring and stage transitions (`NEW` → `CONTACTED` → `QUALIFIED` → `PROPOSAL` → `WON`/`LOST`).
- **Gate**: Cold, qualified, and unqualified visitor simulations correctly scored and reflected in CRM.

### Phase 8: AI Tools (Function Calling)
- **Goal**: Deterministic tool execution for lead capture, service lookup, case study query, appointment booking, and handoff.
- **Gate**: Schema validation on all tools; zero direct unauthorized database queries by AI.

### Phase 9: Appointments System
- **Goal**: Calendar slot availability, booking conflict resolution, and confirmation dispatch.
- **Gate**: Never claim appointment booked until backend confirms; handles past dates and timezones cleanly.

### Phase 10: WhatsApp / Messaging
- **Goal**: Multi-channel adapter pattern (`ChannelAdapter`, `WhatsAppAdapter`, `EmailAdapter`, `WebChatAdapter`).
- **Gate**: Delivery verification; never claim message sent if provider fails.

### Phase 11: Realtime Voice Agent (Gemini Live API)
- **Goal**: WebRTC/WebSocket browser voice interaction with Gemini Live API (<500ms voice pipeline).
- **Gate**: Voice streaming, interruption handling, silence detection, and transcript persistence pass browser test.

### Phase 12: Telephony Infrastructure
- **Goal**: Inbound and outbound phone calls via SIP gateway linked to Gemini Live.
- **Gate**: End-to-end call test: greeting, customer speech, AI interruption recovery, transcript saved, lead recorded.

### Phase 13: Human Handoff
- **Goal**: Autonomous escalation engine triggering 🔴 HUMAN HANDOFF REQUIRED dashboard alerts.
- **Gate**: All handoff triggers tested; AI halts autonomous response when human takes control.

### Phase 14: Admin Sales Dashboard
- **Goal**: Full administrative interface for leads, conversations, appointments, call logs, and AI config.
- **Gate**: Strict RBAC enforced on every screen and API endpoint.

### Phase 15: Security Audit
- **Goal**: Complete penetration testing (CSRF, XSS, SQLi, prompt injection, secret leak scans, `npm audit`).
- **Gate**: Zero high/critical vulnerabilities.

### Phases 16 – 20: Staging, Production & Telemetry
- **Goal**: End-to-end simulation across all channels, staging sign-off, production deployment, and 24/7 telemetry alerting.
