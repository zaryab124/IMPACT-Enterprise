import { KnowledgeDocument } from "../types";

export const APPROVED_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  // 1. SERVICES
  {
    id: "svc-ai-agents",
    category: "SERVICES",
    title: "AI & Intelligent Agents",
    source: "IMPACT Solutions Matrix — AI Agents",
    version: 1,
    content: `IMPACT Technologies engineers production-grade AI & Autonomous Agents. Moving beyond passive chatbots to proactive intelligent systems that understand business goals, formulate multi-step plans, call external APIs, query knowledge bases, and execute business actions.
Key capabilities include:
- Low-latency sub-400ms voice and telephone agents (powered by Gemini Live WebSocket architecture).
- Autonomous inbound sales qualification and CRM contact synchronization.
- Customer support and automated tier-1 triage agents.
- Deep research agents and internal document intelligence with hybrid vector search.
- Deterministic schema-validated tool and function calling.
Typical delivery timeline: 2 to 6 weeks depending on integration complexity.
Target audience: Enterprises, fast-scaling startups, multi-branch service businesses, and sales operations.`,
    metadata: {
      tags: ["ai", "agents", "voice", "gemini", "gemini-live", "sales-agent", "support", "rag"],
      summary: "Autonomous intelligent agents for voice, chat, sales qualification, and workflow execution.",
      timeline: "2 to 6 weeks",
      targetAudience: "Enterprises, fast-scaling startups, multi-branch businesses",
      keyPoints: [
        "Sub-400ms voice latency",
        "Autonomous lead qualification & CRM sync",
        "Deterministic tool execution",
        "Custom knowledge grounding",
      ],
    },
    isActive: true,
  },
  {
    id: "svc-automation",
    category: "SERVICES",
    title: "Business Process Automation",
    source: "IMPACT Solutions Matrix — Automation",
    version: 1,
    content: `IMPACT replaces fragile, repetitive manual operations with resilient, event-driven automations connecting your leads, CRMs, internal databases, messaging channels, and operations teams.
Key capabilities include:
- Multi-channel webhook ingestion with dead-letter queue (DLQ) retry mechanisms.
- Automated lead capture to CRM synchronization (HubSpot, Salesforce, PostgreSQL, Custom CRMs).
- Instant multi-channel follow-up engagement via WhatsApp Cloud API and transactional email under 60 seconds.
- Operational inventory synchronization, kitchen display dispatch, and order event streams.
Typical delivery timeline: 1 to 3 weeks.
Target audience: B2B sales teams, agencies, e-commerce brands, commercial multi-branch operations.`,
    metadata: {
      tags: ["automation", "crm", "webhooks", "whatsapp", "email", "pipeline", "integration"],
      summary: "End-to-end event-driven business process automation and CRM integrations.",
      timeline: "1 to 3 weeks",
      targetAudience: "B2B sales teams, agencies, e-commerce, commercial operations",
      keyPoints: [
        "Sub-60s follow-up trigger",
        "Idempotent webhook ingestion",
        "Resilient error handling with DLQ",
        "Bidirectional CRM synchronization",
      ],
    },
    isActive: true,
  },
  {
    id: "svc-software",
    category: "SERVICES",
    title: "Custom Software & Web Applications",
    source: "IMPACT Solutions Matrix — Full-Stack Software",
    version: 1,
    content: `IMPACT builds robust, high-performance digital platforms engineered with modern frameworks, high-throughput APIs, and role-based administrative portals.
Key capabilities include:
- Next.js & React custom web applications with responsive Tailwind design and 3D WebGL graphics.
- Cross-platform iOS and Android mobile applications.
- Multi-role administrative dashboards with granular 6-to-8 tier RBAC and audit logging.
- High-throughput backend microservices using Node.js / TypeScript / Python FastAPI / PostgreSQL / Redis.
- Real-time WebSocket streaming architectures.
Typical delivery timeline: 4 to 12 weeks.
Target audience: Founders, enterprise teams modernizing legacy software, platforms requiring bespoke customer workflows.`,
    metadata: {
      tags: ["software", "web", "nextjs", "react", "typescript", "fastapi", "mobile", "fullstack"],
      summary: "Full-stack web and mobile application engineering with modern architecture.",
      timeline: "4 to 12 weeks",
      targetAudience: "Founders, enterprise teams replacing legacy portals, growing platforms",
      keyPoints: [
        "Next.js App Router & React 18+",
        "Role-based security & audit logging",
        "Clean REST & WebSocket APIs",
        "Scalable database modeling",
      ],
    },
    isActive: true,
  },
  {
    id: "svc-products",
    category: "SERVICES",
    title: "Product Studio & Ventures",
    source: "IMPACT Solutions Matrix — Product Studio",
    version: 1,
    content: `IMPACT partners with ambitious founders and enterprise organizations to architect, build, launch, and scale proprietary digital products and SaaS engines.
Key capabilities include:
- Zero-to-one rapid MVP commercialization and technical roadmapping.
- Multi-tenant SaaS architectures with strict database tenant isolation.
- Cryptographic verification mechanisms and real-time transaction processing.
- Long-term technical stewardship, feature velocity, and platform scaling.
Typical delivery timeline: 6 to 16 weeks.
Target audience: Startups, early-stage founders, strategic corporate venture units.`,
    metadata: {
      tags: ["product-studio", "ventures", "saas", "mvp", "multitenant", "startup"],
      summary: "Commercial venture creation, SaaS architecture, and zero-to-one product development.",
      timeline: "6 to 16 weeks",
      targetAudience: "Startups, early-stage founders, corporate venture teams",
      keyPoints: [
        "Rapid commercial MVP build",
        "Multi-tenant tenant isolation",
        "Scalable cloud infrastructure",
        "Strategic product alignment",
      ],
    },
    isActive: true,
  },

  // 2. CASE STUDIES
  {
    id: "cs-restaurant-platform",
    category: "CASE_STUDIES",
    title: "Case Study: Restaurant Technology Platform",
    source: "IMPACT Case Studies — Case Study #1",
    version: 1,
    content: `Commercial multi-branch restaurant management, digital ordering, and kitchen dispatch ecosystem.
Problem: Chaotic paper tickets causing kitchen delays, 30% aggregator commission fees on third-party delivery apps, vulnerability to table spoofing in QR ordering, and lack of unified branch P&L visibility.
Solution Delivered: Full-stack commercial ordering, kitchen dispatch, delivery, and financial analytics platform uniting 6 isolated branches in real time.
Key Technical Highlights:
- Cryptographic HMAC QR table ordering completely eliminating table spoofing.
- Redis Pub/Sub WebSocket Kitchen Display System (KDS) with sub-second order dispatch.
- Server-isolated 6-branch database partitioning with 8 RBAC security roles (Owner, Admin, Branch Manager, Chef, Waiter, Cashier, Rider, Auditor).
- Automated deal engine enforcing a strict 25% maximum custom discount cutoff.
Outcome: Unified 6 physical branches, eliminated paper ticket lag, achieved sub-second kitchen communication, and saved thousands in third-party aggregator commissions.`,
    metadata: {
      tags: ["case-study", "restaurant", "hmac", "kds", "websockets", "redis", "fastapi", "nextjs", "rbac"],
      summary: "Multi-branch restaurant tech platform with HMAC QR ordering and sub-second KDS dispatch.",
      technologies: ["Next.js 14", "FastAPI", "PostgreSQL", "Redis Pub/Sub", "WebSockets", "HMAC"],
      keyPoints: [
        "HMAC QR table ordering",
        "Sub-second KDS dispatch",
        "6 branch server isolation",
        "8-tier RBAC security",
        "0% third-party aggregator commission",
      ],
    },
    isActive: true,
  },
  {
    id: "cs-lead-crm-automation",
    category: "CASE_STUDIES",
    title: "Case Study: Automated Lead Capture & CRM Pipeline",
    source: "IMPACT Case Studies — Case Study #2",
    version: 1,
    content: `Zero-delay automated inbound conversion pipeline ingesting webhooks and dispatching WhatsApp follow-ups.
Problem: High-intent inbound leads waiting hours for sales reps to manually reply, resulting in lost conversions, while sales teams wasted 10+ hours per week typing contact details into CRMs.
Solution Delivered: Automated conversion engine that ingests webhook payloads, scores lead intent, synchronizes bidirectional CRM contacts, and dispatches personalized WhatsApp follow-ups in under 60 seconds.
Key Technical Highlights:
- Idempotent multi-channel webhook ingestion with signature verification.
- Algorithmic lead intent qualification and scoring based on urgency, budget, and authority.
- Real-time bidirectional CRM database synchronization.
- Automated WhatsApp Cloud API and transactional email delivery triggers.
Outcome: Slashed inbound lead response time from hours to under 60 seconds, dramatically lifting conversion rates and reclaiming 10+ hours per week for sales agents.`,
    metadata: {
      tags: ["case-study", "crm", "automation", "whatsapp", "lead-scoring", "webhooks"],
      summary: "Instant lead qualification and WhatsApp follow-up engine under 60 seconds.",
      technologies: ["Python", "FastAPI", "Webhooks", "CRM APIs", "WhatsApp Cloud API", "PostgreSQL"],
      keyPoints: [
        "Sub-60 second follow-up",
        "Idempotent webhook handling",
        "Automated lead intent scoring",
        "Reclaimed 10+ hours/week per agent",
      ],
    },
    isActive: true,
  },
  {
    id: "cs-enterprise-knowledge-agent",
    category: "CASE_STUDIES",
    title: "Case Study: Enterprise Knowledge & Autonomous Research Agent",
    source: "IMPACT Case Studies — Case Study #3",
    version: 1,
    content: `Hallucination-resistant enterprise RAG agent with hybrid vector search and strict citation grounding.
Problem: Enterprise employees wasting hundreds of hours searching disjointed technical manuals, SOPs, and policy documents, while generic AI models hallucinated false operational procedures.
Solution Delivered: Enterprise RAG agent utilizing dense vector embeddings and sparse BM25 keyword hybrid search with strict citation grounding and role-based access gates.
Key Technical Highlights:
- Dense semantic and sparse keyword hybrid vector search.
- Zero-hallucination citation grounding linking every response to verified source paragraphs.
- Deterministic JSON-schema tool calling for database lookups and compliance checks.
- Role-scoped access control preventing lower-tier staff from querying confidential executive data.
Outcome: Reduced internal technical document retrieval time by 90% while enforcing complete information security and zero hallucinations.`,
    metadata: {
      tags: ["case-study", "rag", "knowledge-agent", "vector-search", "embeddings", "citation-grounding"],
      summary: "Enterprise RAG agent with hybrid vector search and zero-hallucination citation grounding.",
      technologies: ["LLM Orchestration", "Python", "FastAPI", "pgvector", "PostgreSQL", "Next.js"],
      keyPoints: [
        "Hybrid dense/sparse search",
        "Strict citation grounding",
        "90% reduction in query times",
        "Zero hallucination guarantee",
      ],
    },
    isActive: true,
  },

  // 3. LEADERSHIP & PILLARS
  {
    id: "lead-team",
    category: "LEADERSHIP",
    title: "Executive Leadership Team & Company Purpose",
    source: "IMPACT Company Overview — Leadership",
    version: 1,
    content: `IMPACT Technologies exists to turn ideas into measurable business impact by combining artificial intelligence, workflow automation, and custom software engineering.
Executive Leadership:
1. MUHAMMAD ZARYAB HASSAN — Chief Executive Officer (CEO):
   Directs company vision, strategic technology positioning, enterprise client partnerships, and intelligent systems innovation. Focus: Vision, Strategy, AI Systems, Enterprise Partnerships.
2. MAHAD AZIZ — Chief Growth Officer (CGO):
   Leads commercial growth, enterprise partnerships, strategic market expansion, and solution distribution. Focus: Growth Strategy, Market Expansion, Solutions, Operations.
3. MUHAMMAD ISMAIL — Chief Financial Officer (CFO):
   Oversees financial governance, capital efficiency, commercial structuring, and operational planning. Focus: Finance, Commercial Strategy, Capital Allocation.
4. ANSAR ABBAS JAFRI — Branch Manager:
   Manages regional branch operations, on-ground client relationships, deployment coordination, and local project execution. Focus: Branch Operations, Client Relations, Regional Support. Direct contact: +92 333 6457747.

Core Engineering Pillars:
1. Problem-First: Start with the business problem, not the technology.
2. Intelligence-First: Identify where AI creates tangible, measurable value.
3. Automation-First: Eliminate unnecessary manual processes.
4. Product-Minded: Build complete, usable products, not isolated throwaway demos.
5. Scalable Engineering: Design modular architectures that evolve with business growth.
6. Real-World Impact: Success is measured by operational improvement, not theoretical demos.`,
    metadata: {
      tags: ["leadership", "executives", "ceo", "cgo", "cfo", "branch-manager", "pillars", "culture"],
      summary: "Executive leadership profiles, engineering pillars, and company purpose.",
      keyPoints: [
        "Muhammad Zaryab Hassan (CEO)",
        "Mahad Aziz (CGO)",
        "Muhammad Ismail (CFO)",
        "Ansar Abbas Jafri (Branch Manager)",
        "6 Core Engineering Pillars",
      ],
    },
    isActive: true,
  },

  // 4. COMMERCIAL & PRICING POLICIES (ANTI-HALLUCINATION)
  {
    id: "policy-pricing-scoping",
    category: "POLICIES",
    title: "Commercial & Pricing Policy: Custom Scoping & Proposals",
    source: "IMPACT Commercial Governance — Pricing Policy",
    version: 1,
    content: `IMPACT Technologies adheres to a strict commercial transparency and custom engineering policy.
CRITICAL PRICING RULES:
1. No Fabricated or Flat Pricing: IMPACT does NOT publish fixed or one-size-fits-all prices for custom software, AI agents, or automation pipelines. Every enterprise client has unique requirements, data volumes, security needs, and third-party integrations.
2. Custom Technical Proposal: Pricing is calculated exclusively through structured technical discovery. Clients receive a comprehensive, milestone-based proposal outlining exact deliverables, architecture, timeline, and investment.
3. How to Get a Proposal:
   - Option A: Complete the 2-minute interactive project scoping wizard at /start-a-project.
   - Option B: Schedule a 30-minute discovery consultation with the engineering leadership team.
   - Option C: Connect directly with the team via WhatsApp (+92 314 7893907) or Email (impactenterprise527@gmail.com).
4. No Unauthorized Discounts: AI agents and sales representatives are strictly prohibited from inventing discounts or promising off-the-cuff price cuts. Any commercial discounts must be formally authorized by executive leadership (CEO or CFO).
5. Delivery Timelines Reference:
   - Business Process Automation: 1 to 3 weeks.
   - AI & Intelligent Agents: 2 to 6 weeks.
   - Custom Web & Software Platforms: 4 to 12 weeks.
   - Product Studio & SaaS Ventures: 6 to 16 weeks.`,
    metadata: {
      tags: ["pricing", "cost", "quote", "proposal", "budget", "policy", "scoping", "discount"],
      summary: "Strict custom scoping policy; zero fabricated pricing; guided discovery requirement.",
      keyPoints: [
        "No flat or fabricated pricing",
        "Proposals scoped via technical discovery",
        "Take project intake at /start-a-project",
        "Discounts require CEO/CFO authorization",
      ],
    },
    isActive: true,
  },

  // 5. CONTACT & REACHABILITY
  {
    id: "contact-channels",
    category: "CONTACT",
    title: "Official Contact Channels & Global Operations",
    source: "IMPACT Contact Directory",
    version: 1,
    content: `IMPACT Technologies operates globally with headquarters and regional offices in Pakistan.
Official Contact Points:
- Headquarters WhatsApp: +92 314 7893907 (Direct enterprise inquiries and sales conversations)
- Branch Operations WhatsApp: +92 333 6457747 (Regional client relations, Managed by Ansar Abbas Jafri)
- Official Email: impactenterprise527@gmail.com
- Project Intake Wizard: https://impact-enterprise.vercel.app/start-a-project (2-minute interactive scoping)
- Inquiry Form: https://impact-enterprise.vercel.app/contact
Response Times:
- WhatsApp inquiries: Typically responded to within 15 minutes during active business hours.
- Project intake briefings: Reviewed and followed up with a technical scope within 24 business hours.
- Emergency / high-priority clients: Immediate escalation to executive leadership.`,
    metadata: {
      tags: ["contact", "whatsapp", "email", "phone", "location", "hours", "support"],
      summary: "Official communication channels, WhatsApp numbers, email, and response SLAs.",
      keyPoints: [
        "HQ WhatsApp: +92 314 7893907",
        "Branch WhatsApp: +92 333 6457747",
        "Email: impactenterprise527@gmail.com",
        "Response time: <15 mins WhatsApp, <24h project scope",
      ],
    },
    isActive: true,
  },

  // 6. FAQ & TECHNICAL GOVERNANCE
  {
    id: "faq-technical-stack",
    category: "FAQ",
    title: "Frequently Asked Questions: Technology Stack & Security",
    source: "IMPACT Technical Whitepaper & Client FAQs",
    version: 1,
    content: `Frequently Asked Questions regarding IMPACT's technology stack, architecture, and security posture:
Q: What technology stack does IMPACT specialize in?
A: IMPACT specializes in modern, production-grade stacks:
- Frontend: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Three.js 3D graphics.
- Backend & APIs: Node.js, TypeScript, Python FastAPI, RESTful & WebSocket real-time servers.
- AI & Voice: Google Gemini API (gemini-2.5-flash / gemini-2.5-pro), Gemini Live WebSocket audio streaming, pgvector RAG.
- Databases: PostgreSQL, Redis (Pub/Sub & caching).
- Cloud & Infrastructure: Vercel, Docker, AWS, Cloudflare, Linux environments.

Q: How does IMPACT ensure security and data confidentiality?
A: We implement zero-trust enterprise security standards:
- Cryptographic authentication with bcrypt and signed JWT tokens.
- Strict 6-tier to 8-tier Role-Based Access Control (RBAC).
- Complete tenant data isolation preventing cross-customer data access.
- Tamper-proof HMAC verification for critical transaction flows.
- Immutable security audit logging for all sensitive user and system events.

Q: Can IMPACT integrate with existing enterprise tools?
A: Yes. We build custom connectors and event-driven automations for CRM platforms (HubSpot, Salesforce, Zoho), communication APIs (WhatsApp Cloud API, SendGrid, Twilio), and bespoke internal legacy databases.`,
    metadata: {
      tags: ["faq", "tech-stack", "security", "nextjs", "gemini", "fastapi", "postgresql", "redis", "rbac"],
      summary: "Technical stack details, security architecture, and system integration capabilities.",
      keyPoints: [
        "Modern stack: Next.js, FastAPI, PostgreSQL, Redis, Gemini",
        "Zero-trust security with RBAC and HMAC",
        "Enterprise CRM and WhatsApp API integrations",
        "Immutable audit logging",
      ],
    },
    isActive: true,
  },
];
