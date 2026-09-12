# IMPACT Enterprise AI Sales & Communication Agent — Smoke Tests Runbook

## 1. Phase-by-Phase Smoke Test Suite

### Phase 0: Baseline Repository & Build Smoke Test
```bash
# 1. Typecheck validation
npm run typecheck

# 2. Linter validation
npm run lint

# 3. Production build validation
npm run build

# 4. Server startup test
npm run dev
```
**Verification Checklist**:
- [ ] TypeScript compilation exits with code 0.
- [ ] ESLint passes without errors or warnings.
- [ ] Next.js production build completes and outputs static/dynamic pages cleanly.
- [ ] `http://localhost:3000` loads the homepage matching IMPACT branding.
- [ ] Browser console has 0 unhandled runtime errors.

---

### Phase 1: Application Foundation & Health Telemetry
```bash
# Health Endpoint Check
curl -s -i http://localhost:3000/api/health
```
**Expected Response**:
- HTTP 200 OK
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-09-13T..."
}
```

---

### Phase 2: Database Schema & Migration Smoke Test
```bash
# Apply migrations
npm run db:migrate

# Check status
npm run db:status

# Test seed data insertion
npm run db:seed

# Verify test queries
npm run test:db
```
**Verification Checklist**:
- [ ] All 16 core entities created with foreign key and index constraints.
- [ ] Seed data inserts without unique constraint violations.
- [ ] Cross-tenant / customer isolation query test returns 0 data leakage.
- [ ] Data persists cleanly across service restarts.

---

### Phase 3: Authentication & RBAC Direct API & UI Test
```bash
# 1. Unauthenticated request to protected API -> Expect 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/leads
# Expected: 401

# 2. Authenticated request with VIEWER role trying to mutate -> Expect 403
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/admin/leads \
  -H "Authorization: Bearer <VIEWER_TOKEN>"
# Expected: 403

# 3. Authenticated request with ADMIN role -> Expect 200/201
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/leads \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
# Expected: 200
```
**Direct URL Navigation Checks**:
- Navigate directly in browser to `/admin/dashboard` while logged out → Redirects to `/login`.
- Log in as `SALES_AGENT` → Access granted to `/admin/leads`, but `/admin/settings` displays 403 Forbidden.

---

### Phase 4: Knowledge Retrieval Verification Test
```bash
npm run test:knowledge
```
**Automated Queries Tested**:
1. "What services does IMPACT Enterprise provide?"
2. "What type of AI solutions does IMPACT build?"
3. "How can IMPACT help a restaurant?"
4. "How can IMPACT help a startup?"
5. "How can IMPACT automate business processes?"
6. Unrelated question: "What is the capital of Mars?" → Assert AI politely states out-of-scope response without inventing facts.

---

### Phase 5: Gemini AI Engine Behavioral Test
```bash
npm run test:ai
```
**Test Matrix**:
- [ ] Standard consultative sales inquiry.
- [ ] Price inquiry (AI explains problem-first scoping and offers consultation, never invents fixed price).
- [ ] Aggressive or adversarial prompt injection attempt (AI remains in character).
- [ ] Confidential data probing (AI strictly denies internal architecture secrets).

---

### Phase 6: Web Chat Widget Browser Test
- Open `http://localhost:3000` in desktop browser (Chrome/Edge).
- Open chat widget floating button.
- Send message: *"Hi, I need an AI call agent for my business."*
- Verify typing indicator, streaming tokens, and qualification prompt.
- Refresh page: verify conversation history persists.
- Switch to mobile viewport (375px width): verify responsive layout and ease of touch interaction.

---

### Phase 7: Lead Qualification Pipeline Test
```bash
npm run test:leads
```
- Ingest mock cold prospect → Stage: `NEW`, Score: 20.
- Ingest budget ($15,000+), timeline (2 weeks), decision maker status → Stage: `QUALIFIED`, Score: 85.
- Assert record updates in CRM database.

---

### Phase 8: Function Calling Tool Execution Test
```bash
npm run test:tools
```
- Validate Zod schema enforcement on `book_appointment`, `create_lead`, etc.
- Verify audit log entry is written for every simulated tool execution.

---

### Phase 9: Appointment Engine Smoke Test
```bash
npm run test:appointments
```
- Create valid appointment slot.
- Attempt duplicate booking for same timestamp → Expect 409 Conflict.
- Reschedule appointment → Verify updated timestamp and audit log.

---

### Phase 10: WhatsApp Webhook & Message Pipeline Test
```bash
npm run test:whatsapp
```
- Dispatch valid HMAC signed payload to `/api/webhooks/whatsapp` → Expect 200 OK.
- Dispatch invalid signature → Expect 401 Unauthorized.
- Dispatch message when external provider is unavailable → Verify message queued as `PENDING`, never falsely reported as `DELIVERED`.

---

### Phase 11: Realtime Voice Smoke Test
- Navigate to `/voice` or activate voice modal in chat widget.
- Connect WebSocket.
- Stream microphone audio chunk → Verify speech recognition and sub-second synthesized audio response.
- Interrupt AI speech → Verify audio playback halts immediately.

---

### Phase 12: Telephony Integration Smoke Test
- Trigger simulated inbound SIP invite.
- Verify session creation, bidirectional media stream, real-time transcription, and call outcome logged.

---

### Phase 13: Human Handoff Test
- Send trigger phrase: *"I want to talk to a human right now."*
- Verify conversation state changes to `HANDOFF_REQUIRED`.
- Verify admin dashboard immediately displays alert banner and notification.

---

### Phase 14: Admin Dashboard RBAC & Data Test
- Sign in as `SUPER_ADMIN` → Verify full visibility into all metrics and logs.
- Sign in as `SALES_AGENT` → Verify view restricted to assigned leads.
- Verify metric calculations (Total Leads, Conversion Rate, Won Deals) match database counts.

---

### Phase 15: Security & Vulnerability Scan
```bash
# Secret leak scan
npm run security:scan-secrets

# Dependency vulnerability audit
npm audit --production
```
- Assert zero unencrypted secrets committed in repo.
- Assert all inputs sanitized against XSS and SQL injection.

---

## 2. Failure Triage Protocol
When any smoke test fails:
1. **STOP**: Halt all forward progression. Do not create subsequent phase code.
2. **IDENTIFY**: Inspect console logs, network response payloads, and database query logs.
3. **REPRODUCE**: Isolate the test case into a minimal reproduction.
4. **FIX**: Apply targeted correction to root cause.
5. **RETEST**: Run failed test, followed by the entire phase smoke suite.
