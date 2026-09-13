# IMPACT AI: Security, RBAC & AI Safety Guidelines

## 1. Zero-Trust Security Foundation
The IMPACT AI system operates on a zero-trust model. All requests from browsers, mobile clients, WebSockets, or third-party webhooks are treated as untrusted and must undergo cryptographic verification, authentication, and role authorization.

---

## 2. Secret Management & Credential Isolation

### 2.1 Forbidden Operations
- Never commit `.env`, `.env.local`, or any private credential to source control.
- Never prefix secrets with `NEXT_PUBLIC_` (which exposes them to client browser bundles).
- Never pass `GEMINI_API_KEY`, database connection strings, or JWT signing secrets to client-side code.

### 2.2 Server-Side Execution Guarantee
All AI orchestration (Google Gemini API, Gemini Live WebSockets), database queries, and external messaging adapters execute strictly inside server-side Node.js / Next.js server components and route handlers.

### 2.3 Required Environment Variables
```ini
# Gemini API & AI Engine
GEMINI_API_KEY="your-gemini-api-key"

# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/impact_enterprise"

# Authentication & Session
SESSION_SECRET="cryptographically-random-64-char-string"
JWT_SECRET="cryptographically-random-64-char-string"

# Multi-Channel Messaging (Phase 10+)
WHATSAPP_API_TOKEN="meta-cloud-api-token"
WHATSAPP_PHONE_NUMBER_ID="meta-phone-id"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="custom-secure-verify-token"
RESEND_API_KEY="re_123456789"
```

---

## 3. Role-Based Access Control (RBAC) Matrix

### 3.1 Role Hierarchy
```
SUPER_ADMIN (Full control, audit logs, AI prompts)
  ├── ADMIN (Operational oversight, team management, knowledge base)
  │     ├── SALES_MANAGER (Lead pipeline, appointments, team metrics)
  │     │     ├── SALES_AGENT (Assigned leads, direct chats, human handoff)
  │     │     └── SUPPORT_AGENT (Inquiries, customer support tickets)
  │     └── VIEWER (Read-only reports & telemetry)
  └── [UNAUTHENTICATED] (Public website, intake wizard, public chat agent)
```

### 3.2 Endpoint Permissions Matrix

| Resource / Action | SUPER_ADMIN | ADMIN | SALES_MANAGER | SALES_AGENT | SUPPORT_AGENT | VIEWER |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| View Public Website & Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access `/admin` Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Read) |
| View All Leads | ✅ | ✅ | ✅ | ⚠️ (Assigned) | ❌ | ✅ (Read) |
| Edit / Re-score Leads | ✅ | ✅ | ✅ | ✅ (Assigned) | ❌ | ❌ |
| Manage Appointments | ✅ | ✅ | ✅ | ✅ | ⚠️ (View) | ✅ (Read) |
| Perform Human Handoff | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Curate Knowledge Base | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configure AI System Prompts | ✅ | ⚠️ (Review) | ❌ | ❌ | ❌ | ❌ |
| View Immutable Audit Logs | ✅ | ⚠️ (Filter) | ❌ | ❌ | ❌ | ❌ |
| User & Role Administration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. AI Safety & Defensive Prompting

### 4.1 Anti-Hallucination Boundaries
The AI agent is programmatically constrained by strict system prompts:
1. **Never invent services**: Only services cataloged in the knowledge base may be offered.
2. **Never invent pricing**: The agent explains that project pricing depends on technical discovery and scope, inviting prospects to complete intake or schedule a meeting.
3. **Never guarantee business results**: The agent emphasizes high-quality engineering and reliability without making speculative revenue claims.
4. **Never claim human identity**: If asked, the agent immediately confirms it is IMPACT AI.

### 4.2 Prompt Injection Defense
- Input text is sanitized and length-capped before ingestion.
- The system prompt is partitioned from user input using isolated content envelopes.
- Deliberate attempts to extract system instructions or API keys are detected and rejected with standard neutral responses:
  > *"I am IMPACT AI, specialized in understanding your engineering requirements and matching them to IMPACT Enterprise solutions. How can I assist your project?"*

---

## 5. Tool Calling Security

Every AI function call is bounded by:
- **Zod Schema Validation**: Strict type checking on every argument. Unknown parameters trigger rejection.
- **Backend Access Controls**: Tools verify session authorization before performing database updates.
- **Audit Logging**: Every tool execution, its input arguments, timestamp, and result status are recorded in `audit_logs`.
- **No Direct SQL**: The AI has zero capability to construct or execute raw SQL queries.

---

## 6. Repository Secret Scanning
Before any release or production gate:
```bash
# Verify no secret keywords exist in source code
grep -rn "GEMINI_API_KEY\|SESSION_SECRET\|DATABASE_URL\|PRIVATE_KEY" --exclude-dir={.git,.next,node_modules,docs} .
```
`npm audit` is run periodically to catch vulnerabilities in third-party packages.
