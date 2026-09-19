import { KnowledgeDocument } from "../types";

export const APPROVED_KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  // 1. COMPANY
  {
    id: "kb-company-profile",
    category: "COMPANY",
    title: "IMPACT Enterprise: Company Profile & Positioning",
    source: "IMPACT Enterprise Charter & Corporate Mandate v2.0",
    version: 1,
    content: `IMPACT Enterprise is a premier artificial intelligence, software engineering, and business automation enterprise.
The company transforms business ideas into measurable real-world operational and commercial impact.

Core Brand Positioning Formula:
IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT

Company Philosophy:
- Problem-First: We begin with the operational bottleneck, not the technology.
- Intelligence-First: Deploying state-of-the-art AI models and agents where they yield measurable value.
- Automation-First: Eliminating fragile manual tasks through event-driven automation.
- Product-Minded: Building production-ready, durable software platforms rather than throwaway demos.
- Real-World Impact: Measuring success by conversion velocity, hours reclaimed, and operational efficiency.`,
    metadata: {
      tags: ["company", "about", "positioning", "mission", "vision", "impact", "brand"],
      summary: "Official profile and brand positioning formula for IMPACT Enterprise.",
      keyPoints: [
        "Brand formula: IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT",
        "Focus on production-grade AI, automation, and full-stack software",
        "Measurable operational business outcomes",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 2. SERVICES
  {
    id: "kb-services-catalog",
    category: "SERVICES",
    title: "Official Catalog of Core Services",
    source: "IMPACT Enterprise Solutions Matrix 2026",
    version: 1,
    content: `IMPACT Enterprise exclusively provides 9 official core services:
1. AI models — Domain-tuned foundation models, parameter-efficient fine-tuning, and bespoke neural architectures.
2. AI agents — Autonomous goal-directed software agents with schema-validated tool-calling and API execution.
3. AI automation — Intelligent cognitive automation uniting unstructured document parsing, decision logic, and CRM sync.
4. Make-based lead-conversion automation — High-throughput Make.com enterprise scenarios routing inbound inquiries, scoring intent, and triggering sub-60s cadences.
5. Chat agents — Grounded conversational multi-channel web chat and WhatsApp agents driving qualified discovery appointments.
6. Call agents — Sub-400ms full-duplex conversational voice agents powered by Gemini Live WebSocket architecture with real-time transcription.
7. Custom business applications — Production-grade internal enterprise systems, customer portals, and tailored business workflows.
8. Software development — Full-stack software engineering, high-concurrency Node.js/Next.js backends, and microservice architectures.
9. Business automation — End-to-end operational automation eliminating manual back-office bottlenecks across enterprise pipelines.`,
    metadata: {
      tags: ["services", "catalog", "core-services", "offerings", "capabilities"],
      summary: "Complete authoritative catalog of the 9 official services provided by IMPACT Enterprise.",
      keyPoints: [
        "1. AI models",
        "2. AI agents",
        "3. AI automation",
        "4. Make-based lead-conversion automation",
        "5. Chat agents",
        "6. Call agents",
        "7. Custom business applications",
        "8. Software development",
        "9. Business automation",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 3. SERVICE DESCRIPTIONS
  {
    id: "kb-service-descriptions-deep-dive",
    category: "SERVICE_DESCRIPTIONS",
    title: "Detailed Service Descriptions, Stacks & Timelines",
    source: "IMPACT Engineering Handbook — Service Delivery",
    version: 1,
    content: `Comprehensive technical breakdown and delivery specifications for IMPACT Enterprise services:
1. AI Models:
   - Deliverables: Custom LoRA fine-tuning, retrieval-augmented embeddings, evaluation harnesses.
   - Timeline: 3 to 8 weeks.
2. AI Agents & Intelligent Systems:
   - Deliverables: Autonomous workflow agents, multi-agent orchestration, tool calling with schema validation.
   - Timeline: 2 to 6 weeks.
3. AI Automation:
   - Deliverables: Cognitive pipeline processing, invoice/document parsing, decision trees, CRM sync.
   - Timeline: 1 to 4 weeks.
4. Make-Based Lead-Conversion Automation:
   - Deliverables: Enterprise Make.com scenarios, webhook routing, WhatsApp and email instant triggers.
   - Timeline: 1 to 3 weeks.
5. Chat Agents:
   - Deliverables: Website widgets, WhatsApp Business Cloud API integration, CRM appointment booking.
   - Timeline: 1 to 3 weeks.
6. Call Agents:
   - Deliverables: Gemini Live WebSocket voice engine, telephony SIP trunking, sub-400ms latency, CRM diarization.
   - Timeline: 3 to 6 weeks.
7. Custom Business Applications:
   - Deliverables: Bespoke ERPs, client portals, inventory systems, 8-tier RBAC security.
   - Timeline: 4 to 12 weeks.
8. Software Development:
   - Deliverables: Next.js 14 App Router, TypeScript, Node.js, Python FastAPI, PostgreSQL, Redis.
   - Timeline: 4 to 16 weeks.
9. Business Automation:
   - Deliverables: End-to-end data pipeline automation, dead-letter queue retries, legacy system connectors.
   - Timeline: 2 to 5 weeks.`,
    metadata: {
      tags: ["service-descriptions", "timelines", "deliverables", "tech-stack"],
      summary: "Deep-dive specifications, deliverables, and typical delivery timelines for all 9 services.",
      keyPoints: [
        "Documented delivery timelines from 1 to 16 weeks",
        "Full-stack and AI engineering architectures",
        "Robust enterprise tool integrations",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 4. TARGET INDUSTRIES
  {
    id: "kb-target-industries",
    category: "TARGET_INDUSTRIES",
    title: "Target Industries & Vertical Specializations",
    source: "IMPACT Market Strategy & Industry Alignment 2026",
    version: 1,
    content: `IMPACT Enterprise focuses on industries where automation, conversational intelligence, and custom software deliver outsized operational leverage:
1. E-Commerce & Retail: Omnichannel lead capture, abandoned cart WhatsApp re-engagement, inventory sync.
2. Multi-Branch Food & Hospitality: Digital ordering, kitchen display systems (KDS), branch financial partitioning.
3. B2B Professional & Corporate Services: Lead qualification pipelines, automated proposal drafting, CRM hygiene.
4. Healthcare & Wellness Clinics: Inbound appointment scheduling via voice agents, patient intake automation.
5. Real Estate & Property Development: Automated property inquiry qualification, virtual tour scheduling.
6. Logistics & Commercial Operations: Dispatch tracking, webhook-driven status notifications, operational dashboards.`,
    metadata: {
      tags: ["target-industries", "verticals", "ecommerce", "hospitality", "b2b", "healthcare", "real-estate"],
      summary: "Core industry verticals and use-case focus areas.",
      keyPoints: [
        "Focus on high-volume inquiry and manual workflow verticals",
        "Deep expertise in multi-branch food/hospitality tech",
        "High-intent B2B sales automation",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 5. TARGET CUSTOMERS
  {
    id: "kb-target-customers",
    category: "TARGET_CUSTOMERS",
    title: "Ideal Customer Profile (ICP)",
    source: "IMPACT Commercial Strategy — ICP Guidelines",
    version: 1,
    content: `IMPACT Enterprise delivers maximum value to organizations meeting these profiles:
- Ambitious Founders & Tech Leaders: Building zero-to-one MVPs, proprietary SaaS platforms, or custom software requiring rapid execution and robust architecture.
- Enterprise Sales & Marketing Directors: Organizations struggling with lead response lag, manual CRM data entry, or low conversion rates on high-volume advertising campaigns.
- Multi-Branch Business Operators: Businesses managing multiple physical locations (restaurants, clinics, retail branches) needing centralized visibility, ordering, and dispatch.
- Operations Executives: Companies seeking to eliminate hundreds of monthly hours spent on spreadsheet wrangling, manual invoice entry, and disconnected tools.`,
    metadata: {
      tags: ["target-customers", "icp", "founders", "sales-leaders", "operators"],
      summary: "Customer profiles, decision makers, and organizational criteria best served by IMPACT.",
      keyPoints: [
        "Founders launching new digital platforms",
        "Sales teams needing sub-60s lead response",
        "Multi-branch operators seeking unified dispatch",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 6. FAQS
  {
    id: "kb-corporate-faqs",
    category: "FAQS",
    title: "Frequently Asked Questions: Engagement, Security & Process",
    source: "IMPACT Client Engagement FAQ v2.0",
    version: 1,
    content: `Frequently Asked Questions regarding working with IMPACT Enterprise:

Q: How do we initiate a project with IMPACT?
A: You can start immediately by completing our 2-minute interactive project intake wizard at /start-a-project or connecting with our engineering team via WhatsApp (+92 314 7893907). We schedule a 30-minute technical discovery session and provide a milestone-based scope within 24 business hours.

Q: How does IMPACT ensure data security and tenant privacy?
A: We build with zero-trust principles: database-level tenant isolation, signed JWT session tokens, 8-tier Role-Based Access Control (RBAC), tamper-proof HMAC request signing, and immutable audit logs.

Q: Can IMPACT integrate with our existing software tools?
A: Yes. We regularly build event-driven integrations with HubSpot, Salesforce, PostgreSQL, WhatsApp Cloud API, Stripe, Google Sheets, Make.com, and bespoke legacy internal APIs.

Q: How is project delivery structured?
A: Projects follow milestone-based sprints with continuous staging deployments, weekly video syncs, and direct Slack/WhatsApp developer communication channels.`,
    metadata: {
      tags: ["faqs", "process", "security", "engagement", "integrations"],
      summary: "Client questions on onboarding, project timelines, security, and tool integrations.",
      keyPoints: [
        "2-minute intake at /start-a-project",
        "24-hour scoping turnaround",
        "Zero-trust security and tenant isolation",
        "Milestone-based delivery",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 7. TEAM
  {
    id: "kb-team-leadership",
    category: "TEAM",
    title: "Executive Leadership Team",
    source: "IMPACT Corporate Registry — Leadership Directory",
    version: 1,
    content: `The Executive Leadership of IMPACT Enterprise:
1. MUHAMMAD ZARYAB HASSAN — Chief Executive Officer (CEO):
   - Directs company vision, strategic technology architecture, AI innovation, and enterprise client partnerships.
2. MAHAD AZIZ — Chief Growth Officer (CGO):
   - Leads commercial expansion, strategic marketing, go-to-market distribution, and enterprise relationships.
3. MUHAMMAD ISMAIL — Chief Financial Officer (CFO):
   - Oversees financial governance, capital efficiency, commercial contract structuring, and milestone budgeting.
4. ANSAR ABBAS JAFRI — Branch Manager:
   - Directs regional branch operations, local project execution, on-ground deployments, and client support. Direct contact: +92 333 6457747.`,
    metadata: {
      tags: ["team", "leadership", "ceo", "cgo", "cfo", "branch-manager", "executives"],
      summary: "Verified executive leadership team members and operational roles.",
      keyPoints: [
        "Muhammad Zaryab Hassan (CEO)",
        "Mahad Aziz (CGO)",
        "Muhammad Ismail (CFO)",
        "Ansar Abbas Jafri (Branch Manager)",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 8. PROJECTS
  {
    id: "kb-internal-projects",
    category: "PROJECTS",
    title: "Flagship Platforms & Internal Ventures",
    source: "IMPACT Technology Portfolio 2026",
    version: 1,
    content: `Verified proprietary platforms and technology systems built by IMPACT Enterprise:
1. IMPACT Growth OS:
   - Internal business operating system unifying CRM, AI content generation, multi-channel calendar, automated lead intake, AI qualification, and executive command center.
2. Multi-Branch Hospitality Operating System:
   - Full-stack digital ordering, HMAC QR table ordering, and Redis Pub/Sub kitchen display system (KDS) for multi-location hospitality businesses.
3. Sub-60s Inbound Lead Conversion Engine:
   - Webhook-driven conversion pipeline orchestrating WhatsApp Cloud API, AI lead qualification, and CRM bidirectional synchronization.
4. Enterprise RAG Knowledge Governance Engine:
   - Hallucination-resistant retrieval engine with hybrid vector/keyword search, source citation grounding, and strict negative boundary enforcement.`,
    metadata: {
      tags: ["projects", "growth-os", "platforms", "hospitality", "rag", "automation"],
      summary: "Proprietary platforms, internal systems, and flagship technical achievements.",
      keyPoints: [
        "IMPACT Growth OS",
        "Multi-Branch Hospitality OS",
        "Sub-60s Lead Conversion Engine",
        "Enterprise RAG Governance Engine",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 9. CASE STUDIES
  {
    id: "kb-case-studies-verified",
    category: "CASE_STUDIES",
    title: "Verified Case Studies & Production Outcomes",
    source: "IMPACT Case Studies Archives — Case Studies #1, #2, #3",
    version: 1,
    content: `Verified case studies demonstrating real-world technical implementation:
1. Multi-Branch Restaurant Technology Platform:
   - Challenge: Chaotic paper tickets, 30% third-party aggregator commissions, table spoofing vulnerabilities.
   - Solution: HMAC QR ordering, Redis Pub/Sub kitchen display dispatch under 1 second, 8-tier RBAC security.
   - Outcome: Unified 6 physical branches, eliminated order lag, saved thousands in aggregator commission fees.
2. Automated Lead Capture & Instant WhatsApp Pipeline:
   - Challenge: Sales agents taking hours to reply to inbound leads, losing high-intent customers.
   - Solution: Event-driven webhook ingestion, algorithmic intent scoring, sub-60s WhatsApp follow-up.
   - Outcome: Slashed response latency from hours to under 60 seconds; reclaimed 10+ weekly hours per sales rep.
3. Enterprise RAG Knowledge Governance Agent:
   - Challenge: Staff spending hours searching fragmented manuals; generic AI models hallucinating false procedures.
   - Solution: Hybrid BM25 and vector search with strict source citation grounding and role-scoped access control.
   - Outcome: Reduced document lookup time by 90% with zero hallucinations.`,
    metadata: {
      tags: ["case-studies", "results", "restaurant", "crm", "rag", "outcomes"],
      summary: "Production case studies with verified architectural details and outcomes.",
      keyPoints: [
        "Restaurant tech platform (HMAC QR + KDS)",
        "Sub-60s WhatsApp lead pipeline",
        "Enterprise RAG agent with zero hallucinations",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 10. BRAND GUIDELINES
  {
    id: "kb-brand-guidelines",
    category: "BRAND_GUIDELINES",
    title: "Brand Voice, Tone & Messaging Standards",
    source: "IMPACT Enterprise Brand Identity & Communication Charter",
    version: 1,
    content: `Official Brand Guidelines for IMPACT Enterprise:
1. Brand Formula:
   IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT
2. Tone of Voice:
   - Authoritative, precise, and engineering-driven.
   - Rooted in measurable operational reality, never vague hype or buzzwords.
   - Confident, consultative, and professional.
3. Messaging Principles:
   - Focus on tangible outcomes: hours reclaimed, latency reduced, revenue protected, and process bottlenecks eliminated.
   - Emphasize durability, security, and production readiness over quick throwaway prototypes.
   - Never use inflated, speculative, or unverified claims.`,
    metadata: {
      tags: ["brand", "guidelines", "tone", "voice", "messaging", "identity"],
      summary: "Official tone, voice, brand formula, and communication standards.",
      keyPoints: [
        "Engineering-driven, outcome-focused voice",
        "No buzzwords or theoretical hype",
        "Authoritative consultative positioning",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 11. CONTACT INFORMATION
  {
    id: "kb-contact-information",
    category: "CONTACT_INFORMATION",
    title: "Official Contact Directory & Communication Channels",
    source: "IMPACT Corporate Directory & Communications Desk",
    version: 1,
    content: `Official communication channels for IMPACT Enterprise:
- Headquarters WhatsApp: +92 314 7893907 (Direct enterprise inquiries and executive conversations)
- Branch Operations WhatsApp: +92 333 6457747 (Regional client relations, Managed by Ansar Abbas Jafri)
- Official Email: impactenterprise527@gmail.com
- Project Intake Wizard: https://impact-enterprise.vercel.app/start-a-project (2-minute interactive scoping wizard)
- Official Website: https://impact-enterprise.vercel.app
- Contact Page: https://impact-enterprise.vercel.app/contact

Response SLAs:
- WhatsApp inquiries: Typically responded to within 15 minutes during active business hours.
- Project intake briefings: Followed up with a custom technical scope within 24 business hours.`,
    metadata: {
      tags: ["contact", "email", "phone", "whatsapp", "website", "support", "location"],
      summary: "Verified contact numbers, email addresses, intake URLs, and response SLAs.",
      keyPoints: [
        "HQ WhatsApp: +92 314 7893907",
        "Branch WhatsApp: +92 333 6457747",
        "Email: impactenterprise527@gmail.com",
        "Intake Wizard: /start-a-project",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 12. SALES POLICIES
  {
    id: "kb-sales-policies",
    category: "SALES_POLICIES",
    title: "Commercial Governance & Sales Policies",
    source: "IMPACT Commercial Governance & Sales Charter 2026",
    version: 1,
    content: `Official sales and engagement policies for IMPACT Enterprise:
1. Discovery-First Requirement:
   Every engagement requires structured technical discovery before formal pricing is presented. This prevents cost overruns and architectural misalignments.
2. Rapid Scoping Turnaround:
   Following receipt of project details via the intake wizard or discovery call, a milestone-based technical proposal is delivered within 24 business hours.
3. No Off-the-Cuff Commitments:
   Sales staff and AI agents are strictly prohibited from offering informal, ad-hoc quotes or binding timelines without technical review.
4. Milestone-Based Contracting:
   Projects are structured into discrete, verifiable milestones (Discovery, Architecture, Core Build, Integration, QA, Deployment) with milestone billing.
5. Discount Authorization:
   Discounts are not standard and require written signoff from the CEO or CFO.`,
    metadata: {
      tags: ["sales", "policies", "governance", "scoping", "contracts", "milestones"],
      summary: "Policies governing project discovery, proposal turnaround, contracts, and discounts.",
      keyPoints: [
        "Discovery-first scoping requirement",
        "24-hour proposal delivery SLA",
        "Milestone-based contracting",
        "Executive approval required for discounts",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 13. PRICING RULES
  {
    id: "kb-pricing-rules",
    category: "PRICING_RULES",
    title: "Strict Commercial Pricing Rules & Scoping Standards",
    source: "IMPACT Executive Board — Pricing Policy Directive",
    version: 1,
    content: `Mandatory pricing rules for IMPACT Enterprise:
1. No Fabricated or Flat Pricing:
   IMPACT Enterprise does NOT publish fixed or flat pricing. Enterprise software, AI systems, and automation pipelines vary significantly in integration depth, user concurrency, and data security requirements.
2. Custom Milestone Investment:
   Pricing is calculated strictly based on verified architectural requirements, estimated sprint velocity, and infrastructure scale.
3. How to Obtain Pricing:
   Clients must complete the 2-minute scoping wizard at /start-a-project or schedule an engineering consultation.
4. Zero Off-the-Cuff Discounts:
   AI agents and sales reps are strictly forbidden from inventing price cuts or negotiating speculative budgets.`,
    metadata: {
      tags: ["pricing", "cost", "rates", "quotes", "proposals", "rules", "anti-hallucination"],
      summary: "Strict prohibition of flat/fabricated pricing; custom discovery requirement.",
      keyPoints: [
        "No flat or published price lists",
        "Custom scoping based on architecture and milestones",
        "Take project wizard at /start-a-project",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 14. APPROVED CLAIMS
  {
    id: "kb-approved-claims",
    category: "APPROVED_CLAIMS",
    title: "Verified & Approved Technical Claims",
    source: "IMPACT Engineering Audit & Benchmarks 2026",
    version: 1,
    content: `Approved technical capabilities verified in IMPACT production systems:
1. Voice Agent Latency:
   - Sub-400ms voice conversational latency achieved via Gemini Live WebSocket audio streaming architecture.
2. Automated Inbound Response:
   - Sub-60 second lead ingestion, intent qualification, and WhatsApp follow-up execution.
3. Security & Access Control:
   - 8-tier Role-Based Access Control (RBAC) with bcrypt password hashing, signed JWT tokens, and immutable audit logging.
4. Data Integrity:
   - Dual-engine PostgreSQL relational architecture with tamper-proof HMAC verification for sensitive transactions.
5. Hallucination Resistance:
   - Hybrid vector/keyword retrieval augmented generation (RAG) with strict citation grounding.`,
    metadata: {
      tags: ["approved-claims", "benchmarks", "latency", "security", "performance"],
      summary: "Verified technical benchmarks and capabilities approved for customer communications.",
      keyPoints: [
        "Sub-400ms voice latency with Gemini Live",
        "Sub-60s automated lead follow-up",
        "8-tier RBAC enterprise security",
        "Zero-hallucination citation grounding",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },

  // 15. RESTRICTED CLAIMS (ANTI-HALLUCINATION NEGATIVE BOUNDARY)
  {
    id: "kb-restricted-claims",
    category: "RESTRICTED_CLAIMS",
    title: "Restricted Claims & Mandatory Anti-Hallucination Boundaries",
    source: "IMPACT Legal & Compliance Mandate — Anti-Hallucination Rulebook",
    version: 1,
    content: `CRITICAL ANTI-HALLUCINATION NEGATIVE CONSTRAINTS:
The AI and all representatives must NEVER invent, fabricate, or assume any of the following 9 categories:
1. Customers: Never invent or name unconfirmed client brands, Fortune 500 logos, or customer relationships.
2. Partnerships: Never claim official partnerships with third-party tech giants unless formally confirmed.
3. Revenue: Never invent or disclose unverified company revenue, client billing totals, or financial statistics.
4. Results: Never promise unverified metric gains, 100% ROI, or speculative performance multiples.
5. Certifications: Never claim ISO, SOC-2, or third-party certifications unless officially documented in records.
6. Employees: Never invent staff names, team headcounts, or executive profiles outside the official directory.
7. Prices: Never invent flat rates, hourly rate cards, or off-the-cuff price quotes.
8. Guarantees: Never provide blanket performance guarantees, zero-defect warranties, or risk-free promises.
9. Case Studies: Never invent fictional client case studies or fabricated business scenarios.

MANDATORY FALLBACK RULE:
If information on any of the above topics is requested and unavailable in the verified knowledge base, the system MUST state:
"IMPACT Enterprise does not have confirmed information on this topic."`,
    metadata: {
      tags: ["restricted-claims", "anti-hallucination", "negative-constraints", "prohibited", "rules"],
      summary: "The 9 strictly forbidden hallucination categories and mandatory unavailable information fallback.",
      keyPoints: [
        "Never invent: customers, partnerships, revenue, results, certifications, employees, prices, guarantees, case studies",
        "Mandatory fallback: 'IMPACT Enterprise does not have confirmed information on this topic.'",
        "Strict compliance gate",
      ],
    },
    reviewStatus: "APPROVED",
    isActive: true,
  },
];
