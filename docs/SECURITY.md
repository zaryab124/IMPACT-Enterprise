# IMPACT Enterprise AI Sales & Communication Agent — Security Specification

## 1. Core Security Principles

### Rule 1: Zero Secret Exposure
- `GEMINI_API_KEY` is an enterprise secret. It MUST NEVER be placed in:
  - Client-side React components
  - `NEXT_PUBLIC_*` environment variables
  - Git repository files or commit messages
  - Browser JavaScript bundles or localStorage
  - Network responses to the browser
- All AI operations, Gemini API invocations, and live voice token exchanges occur strictly on the backend.
- Ephemeral tokens or secure backend WebSocket proxies are used for real-time client audio streaming.

### Rule 2: Server-Side Authorization & RBAC
- Client-side UI element hiding and URL redirects are purely decorative UX helpers, NOT security boundaries.
- Every API endpoint and server action MUST independently verify:
  1. The presence and validity of an authenticated session or JWT.
  2. The user's assigned role and granular permissions.
- Direct URL manipulation or unauthorized API calls must strictly return:
  - `401 Unauthorized` for unauthenticated requests.
  - `403 Forbidden` for authenticated users lacking required permissions.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Permission / Action | SUPER_ADMIN | ADMIN | SALES_MANAGER | SALES_AGENT | SUPPORT_AGENT | VIEWER |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| View Public Website & Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access Admin Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Read-Only) |
| View Assigned Leads | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Company Leads | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Edit / Reassign Leads | ✅ | ✅ | ✅ | ✅ (Own only) | ❌ | ❌ |
| Manage Appointments | ✅ | ✅ | ✅ | ✅ (Own only) | ✅ | ❌ |
| Trigger Human Handoff | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update Knowledge Base | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Security Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage User Roles & Accounts | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configure AI Engine & Prompts | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Threat Mitigation & Defensive Architecture

### 3.1 Prompt Injection & Jailbreak Defense
- Controlled System Prompts are sealed server-side and never concatenated directly with unvalidated user input without escaping.
- Input filters scan for known jailbreak heuristics (`"ignore all previous instructions"`, `"system override"`, `"reveal developer prompt"`).
- Tool definitions specify strict Zod schemas with regex-validated types.
- The AI has no autonomous database write capability outside validated tool handlers.

### 3.2 SQL Injection & Data Sanitization
- All SQL queries must use parameterized placeholders (`$1, $2, ...`) via the database abstraction layer.
- Raw string interpolation into SQL queries is forbidden and blocked by static code analysis.

### 3.3 Webhook Integrity (WhatsApp / Communications)
- Inbound webhooks from WhatsApp or other providers must validate the `X-Hub-Signature-256` header against `WHATSAPP_VERIFY_TOKEN` using HMAC SHA-256 before processing.
- Requests failing signature verification are rejected immediately with HTTP 401.

### 3.4 Rate Limiting & Denial of Service
- API endpoints (`/api/chat`, `/api/auth/*`) are protected by sliding-window rate limiters (Redis or in-memory fallback):
  - Auth endpoints: Maximum 5 attempts per IP per minute.
  - Chat endpoints: Maximum 30 messages per minute per session.
  - Health check: Maximum 60 requests per minute per IP.

### 3.5 Cross-Site Scripting (XSS) & CSRF
- Markdown rendering in chat and admin views is sanitized using `rehype-sanitize` or DOMPurify.
- Cookies use `HttpOnly; Secure; SameSite=Lax`.

---

## 4. Audit Logging & Compliance
- Every critical security and business event is recorded in the `audit_logs` table:
  - User logins, logouts, and failed authentication attempts.
  - AI tool invocations with input parameters, tool name, and caller ID.
  - Lead stage mutations and sensitive customer record modifications.
  - Human handoff triggers.
- Logs include `id`, `user_id`, `action`, `resource`, `ip_address`, `user_agent`, `status`, and `created_at`.
