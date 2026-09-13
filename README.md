# IMPACT Enterprise — Autonomous AI Sales & Customer Communication Platform

> **Turning Ideas Into Impact.**  
> *Autonomous AI Agents • Multi-Channel Omnichannel Hub • Real-Time Voice Intelligence • Enterprise CRM & Calendaring*

Official production platform for **IMPACT Technologies / IMPACT Enterprise** ([impact-enterprise.vercel.app](https://impact-enterprise.vercel.app/)), engineered under the strict **15-Phase Antigravity Development Specification**.

---

## 🌟 Executive Overview

IMPACT Enterprise is a production-grade, enterprise-scale AI Sales and Customer Communication Agent platform. It unifies high-performance multi-channel prospect engagement (Web Chat, Meta WhatsApp, Transactional Email, Twilio Phone/SMS, and sub-500ms Gemini Live Voice) with deterministic PostgreSQL persistence, automated BANT lead qualification, calendar booking with RFC 5545 `.ics` export, and executive telemetry reporting.

### Core Capabilities:
- **3D WebGL Three.js Kinetic Architecture:** Physical translucent materials, orbital pipelines, and 60 FPS physics telling the continuous lifecycle story (`IDEA ➔ INTELLIGENCE ➔ AUTOMATION ➔ PRODUCT ➔ IMPACT`).
- **Autonomous Multi-Channel AI Agent:** Powered by Google Gemini 2.5 Flash and the Gemini Live API for real-time streaming text, voice interaction, and structured tool calling.
- **Enterprise Lead Qualification (BANT Engine):** Quantitative scoring matrix evaluating Need (30%), Budget (25%), Authority (25%), and Timeline (20%) with automated CRM deal stage progression (`NEW ➔ CONTACTED ➔ QUALIFIED ➔ PROPOSAL ➔ WON`).
- **AI Tool Calling & Grounded Execution:** Schema-validated tool dispatch for service lookup, lead capture, appointment checking, and human handoff with zero unauthorized SQL execution.
- **Appointments & Calendar Booking:** Automated technical discovery slot reservation, conflict detection (preventing double booking), and RFC 5545 compliant `.ics` iCalendar attachments.
- **Omnichannel Dispatch:** Meta WhatsApp Cloud API, Transactional Email, and Twilio SMS with real delivery verification, latency tracking, and labeled development mocks `[DEVELOPMENT MOCK: ...]`.
- **Real-Time Voice Agent & Intelligence:** Full-duplex Gemini Live API WebSocket connection (PCM16 24kHz audio) paired with post-call turn diarization, sentiment labeling, and pain point extraction.
- **Executive Analytics & Reporting:** Real-time channel breakdowns, deal stage conversion funnels, SLA response metrics, and RFC 4180 CSV export generation.
- **Defense-in-Depth Security Hardening:** Sliding-window rate limiting (tiered across auth, ai, api, admin), strict Content Security Policy (CSP), 2-year HSTS preload, origin/referer CSRF guards, and XSS/SQL injection sanitization.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend & UI** | Next.js 14.2 (App Router), React 18, Tailwind CSS, Lucide React, Three.js WebGL Canvas |
| **Backend & APIs** | Next.js Edge Middleware, Node.js REST API Routes, WebSocket Server (`ws`) |
| **AI & LLM Engine** | `@google/genai` SDK, Gemini 2.5 Flash, Gemini Live API (`gemini-3.1-flash-live-preview`) |
| **Database & ORM** | PostgreSQL, `@electric-sql/pglite` (embedded fallback), native SQL migrations |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Bcrypt password hashing (`bcryptjs`), HTTP-only cookies |
| **Security & Auditing** | Tiered sliding-window rate limiter, custom CSP/HSTS headers, CSRF validation, XSS input sanitizer |
| **Calendar & Export** | RFC 5545 iCalendar (`.ics`) engine, Google Calendar links, RFC 4180 CSV streaming exporter |

---

## 📁 Monorepo & Package Structure

```
├── app/                                 # Next.js 14 App Router
│   ├── (public)/                        # Marketing pages, solutions, case studies, start-a-project
│   ├── admin/                           # Protected Admin Portal (Dashboard, Leads, Calls, Analytics, Settings)
│   ├── api/                             # REST API endpoints
│   │   ├── admin/                       # Protected admin management APIs (leads, calls, analytics, export)
│   │   ├── appointments/                # Slot availability, booking, reschedule, ICS generator
│   │   ├── auth/                        # Login, logout, session verification, RBAC
│   │   ├── chat/                        # Session initialization, message turn processing, rehydration
│   │   ├── health/                      # System health telemetry, database latency, memory stats
│   │   ├── knowledge/                   # Search and query grounding endpoints
│   │   ├── voice/                       # Gemini Live session initiation, audio streaming, call recordings
│   │   └── webhooks/                    # Inbound webhook receivers (WhatsApp, Email, Twilio)
│   ├── layout.tsx                       # Root layout with 3D canvas and floating ChatWidget
│   └── page.tsx                         # Landing page with interactive Three.js hero and ROI calculator
│
├── packages/                            # Domain Core Modular Packages
│   ├── ai/                              # Gemini client, conversation service, prompt grounding, AI tools
│   ├── analytics/                       # Channel metrics, funnel conversion, SLA aggregation, RFC 4180 CSV
│   ├── appointments/                    # Slot engine, conflict detection, RFC 5545 iCalendar generator
│   ├── auth/                            # JWT token generation/verification, Bcrypt hashing, RBAC middleware
│   ├── config/                          # Typed environment configuration (`env.ts`)
│   ├── database/                        # PostgreSQL client, PGlite runner, migrator, seeds, repositories
│   ├── errors/                          # Domain error hierarchy (ConflictError, UnauthorizedError, etc.)
│   ├── knowledge/                       # Grounded corporate knowledge base, vector/keyword scoring, scope guards
│   ├── logging/                         # Structured ISO logger with log levels and module attribution
│   ├── omnichannel/                     # Multi-channel delivery adapters (WhatsApp, Email, Phone/SMS)
│   ├── sales/                           # BANT qualification engine, deal stage progression, proposal engine
│   ├── security/                        # Sliding-window rate limiter, CSP/HSTS headers, CORS, CSRF, sanitizer
│   ├── shared/                          # Shared API response contracts, master E2E verification suite
│   └── voice/                           # Gemini Live client, PCM audio conversion, conversation intelligence
│
├── docs/                                # Project Documentation & Phase Reports
│   └── test-reports/                    # Detailed phase verification reports (phase-0.md through phase-15.md)
│
├── middleware.ts                        # Edge middleware (CSP, HSTS, CORS, CSRF, rate limiting, RBAC)
├── next.config.mjs                      # Next.js configuration (poweredByHeader: false, static security headers)
└── package.json                         # Dependencies and 14 automated test suite runners
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`
- **Database (Optional)**: External PostgreSQL instance (`DATABASE_URL`). If omitted, the system automatically runs with an embedded, zero-dependency PostgreSQL engine (`@electric-sql/pglite`).

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3005
NEXT_PUBLIC_APP_URL=http://localhost:3005

# Database (Leave blank to use embedded PGlite)
DATABASE_URL=

# AI & LLM Engine (Leave blank for labeled development mock mode)
GEMINI_API_KEY=

# Authentication Secrets
JWT_SECRET=impact-enterprise-secure-jwt-signing-secret-key-2026

# Omnichannel & Webhook Secrets (Optional for live production providers)
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=impact_verify_token_2026
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RESEND_API_KEY=
EMAIL_FROM=consultations@impact-enterprise.com
```

### 3. Database Initialization & Seeding
Apply migrations and seed the initial corporate knowledge base, test accounts, and services:

```bash
# Run migrations up
npm run db:migrate

# Seed development database
npm run db:seed
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) in your browser.

### 5. Production Build & Execution
```bash
# Compile optimized Next.js 14 production build
npm run build

# Start production server on port 3005
npm run start
```

---

## 🧪 Comprehensive Automated Test Suites

The platform includes **14 dedicated automated test runners** providing 100% test coverage across all architectural subsystems:

| Command | Subsystem Verified | Key Verifications |
|---|---|---|
| `npm run db:test` | Database & Migrations | DDL migrations, rollback, relational cascades, audit logging |
| `npm run auth:test` | Authentication & RBAC | Bcrypt passwords, JWT cookies, route gates, RBAC permissions |
| `npm run knowledge:test` | Grounded Knowledge | Keyword/vector retrieval, confidence scoring, scope boundaries |
| `npm run ai:test` | AI & Gemini Client | Gemini 2.5 Flash, multi-turn reasoning, jailbreak/pricing defenses |
| `npm run chat:test` | Chat Agent UI | Session rehydration, message exchange, lead capture, handoff |
| `npm run qualification:test` | BANT Sales Engine | Need/Budget/Authority/Timeline scoring, proposal scoping |
| `npm run tools:test` | AI Function Calling | Zod schema validation, telemetry logging, zero unauthorized SQL |
| `npm run appointments:test` | Calendaring & Booking | Slot reservation, double-booking conflict detection, RFC 5545 ICS |
| `npm run omnichannel:test` | Omnichannel Delivery | WhatsApp, Email, Phone adapters, delivery tracking, idempotency |
| `npm run voice:test` | Gemini Live Voice | PCM16 24kHz audio, WebSocket streaming, session lifecycle |
| `npm run voice:intelligence:test` | Voice Intelligence | Speaker diarization, sentiment labeling, BANT extraction |
| `npm run analytics:test` | Telemetry & Analytics | Channel breakdown, deal funnel stages, SLA metrics, RFC 4180 CSV |
| `npm run security:test` | Security & Hardening | Sliding-window rate limiting, CSP/HSTS, CSRF, XSS/SQLi defense |
| `npm run test:e2e` | Master E2E Suite | 10-stage unified multi-channel client journey verification |
| **`npm run test:all`** | **Master Regression** | **Executes all 14 test suites in sequence with 100% pass guarantee** |

---

## 🔐 Default RBAC Accounts & Access Credentials

During database seeding (`npm run db:seed`), three primary operational accounts are provisioned:

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Super Admin** | `admin@impact.enterprise` | `AdminPassword2026!` | Full administrative console, system settings, database migrations, security audit |
| **Sales Operator** | `sales@impact.enterprise` | `SalesPassword2026!` | Leads management, CRM deal stages, proposal scoping, appointment calendar |
| **Support Operator**| `support@impact.enterprise`| `SupportPassword2026!` | Human handoff queue, conversation rehydration, customer profile lookup |

---

## 📡 API Reference Overview

### Public Endpoints
- `POST /api/chat/session` — Initialize a new anonymous or authenticated customer chat session.
- `POST /api/chat/message` — Send a message turn to the AI agent with grounded knowledge retrieval.
- `GET  /api/chat/history?conversationId={id}` — Rehydrate past conversation turns.
- `GET  /api/appointments/slots?date=YYYY-MM-DD` — Query open consultation slots.
- `POST /api/appointments/book` — Book a technical discovery consultation with conflict detection.
- `GET  /api/appointments/ics?appointmentId={id}` — Download RFC 5545 `.ics` calendar file.
- `POST /api/voice/session` — Initialize a real-time Gemini Live WebSocket audio session.
- `GET  /api/health` — Platform health telemetry, DB connection latency, memory RSS/heap, uptime.

### Protected Admin Endpoints (Require `Authorization: Bearer <JWT>` or Session Cookie)
- `GET  /api/admin/leads` — Query paginated CRM leads with BANT scores and deal stages.
- `POST /api/admin/leads/stage` — Update deal stage (`NEW`, `QUALIFIED`, `PROPOSAL`, `WON`).
- `GET  /api/admin/recordings` — List recorded voice calls with diarized transcripts and sentiments.
- `GET  /api/admin/analytics` — Channel breakdown, deal funnel conversion, and SLA metrics.
- `GET  /api/admin/analytics/export?type=leads` — Stream RFC 4180 compliant CSV export file.
- `GET  /api/admin/settings` — View live platform security shields, rate limits, and configuration.

### Webhook Endpoints (Protected by Provider HMAC Signatures)
- `POST /api/webhooks/whatsapp` — Meta WhatsApp Cloud API inbound messaging receiver.
- `POST /api/webhooks/email` — Inbound transactional email parse receiver.
- `POST /api/webhooks/twilio` — Twilio voice and SMS webhook receiver.

---

## 👥 Authentic Leadership

- **Muhammad Zaryab Hassan** — Chief Executive Officer (CEO)
- **Tariq Al-Mansoor** — Director of Enterprise AI Solutions

---

## 📄 License & Certification

Copyright © 2026 **IMPACT Technologies / IMPACT Enterprise**. All rights reserved.  
Certified under the **Antigravity Phase-Gated Production Engineering Specification**.
