import bcrypt from "bcryptjs";
import { db } from "./index";
import { migrator } from "./migrator";
import { logger } from "../logging/logger";
import { ROLE_PERMISSIONS, UserRole } from "../auth/roles";
import { APPROVED_KNOWLEDGE_DOCUMENTS } from "../knowledge/data/approvedKnowledge";
import { CryptoVault } from "../growth-os/publishing/cryptoVault";

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function seedDevelopmentDatabase(): Promise<void> {
  logger.info("Starting development database seeding...", { module: "Seed" });

  // Ensure migrations are applied first
  await migrator.migrateUp();

  // 1. Seed Roles
  const roles: { id: UserRole; name: string; description: string }[] = [
    { id: "SUPER_ADMIN", name: "Super Administrator", description: "Full system administration, audit logs, AI configuration" },
    { id: "CEO", name: "Chief Executive Officer", description: "Full CRM access, analytics, team management, campaigns, content approval" },
    { id: "SALES_MANAGER", name: "Sales Manager", description: "Sales pipeline oversight, appointment assignment, lead scoring" },
    { id: "SALES_AGENT", name: "Sales Agent", description: "Assigned leads, contacts, activities, tasks, deals, communication history" },
    { id: "MARKETING_MANAGER", name: "Marketing Manager", description: "Campaigns, content calendar, social publishing, analytics" },
    { id: "CONTENT_MANAGER", name: "Content Manager", description: "Social media content generation, publishing queue, campaign content" },
    { id: "SUPPORT_AGENT", name: "Support Agent", description: "Inquiry triage, messages, calls, contacts" },
    { id: "VIEWER", name: "Viewer", description: "Strictly read-only access to operational reports and telemetry" },
    { id: "ADMIN", name: "Administrator", description: "Operational management, knowledge base curation, team administration" },
  ];

  for (const r of roles) {
    await db.query(
      `INSERT INTO roles (id, name, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;`,
      [r.id, r.name, r.description]
    );
  }

  // 2. Seed Permissions & Role Mappings
  const allPermissions = new Set<string>();
  Object.values(ROLE_PERMISSIONS).forEach((perms) => perms.forEach((p) => allPermissions.add(p)));

  for (const perm of Array.from(allPermissions)) {
    await db.query(
      `INSERT INTO permissions (id, description)
       VALUES ($1, $2)
       ON CONFLICT (id) DO NOTHING;`,
      [perm, `Permission for ${perm}`]
    );
  }

  for (const [roleId, perms] of Object.entries(ROLE_PERMISSIONS)) {
    for (const perm of perms) {
      await db.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         VALUES ($1, $2)
         ON CONFLICT (role_id, permission_id) DO NOTHING;`,
        [roleId, perm]
      );
    }
  }

  // 3. Seed Development Users for each enterprise role
  const devUsers: { email: string; pass: string; first: string; last: string; role: UserRole }[] = [
    { email: "admin@impact.enterprise", pass: "AdminPassword2026!", first: "System", last: "SuperAdmin", role: "SUPER_ADMIN" },
    { email: "ceo@impact.enterprise", pass: "CeoPassword2026!", first: "Claire", last: "CEO", role: "CEO" },
    { email: "sales.manager@impact.enterprise", pass: "SalesManagerPassword2026!", first: "Sarah", last: "SalesManager", role: "SALES_MANAGER" },
    { email: "manager@impact.enterprise", pass: "ManagerPassword2026!", first: "Sarah", last: "SalesManager", role: "SALES_MANAGER" },
    { email: "sales.agent@impact.enterprise", pass: "SalesAgentPassword2026!", first: "Alex", last: "SalesAgent", role: "SALES_AGENT" },
    { email: "agent@impact.enterprise", pass: "AgentPassword2026!", first: "Alex", last: "SalesAgent", role: "SALES_AGENT" },
    { email: "marketing.manager@impact.enterprise", pass: "MarketingManagerPassword2026!", first: "Maya", last: "MarketingManager", role: "MARKETING_MANAGER" },
    { email: "content.manager@impact.enterprise", pass: "ContentManagerPassword2026!", first: "Chris", last: "ContentManager", role: "CONTENT_MANAGER" },
    { email: "support.agent@impact.enterprise", pass: "SupportAgentPassword2026!", first: "Sam", last: "SupportAgent", role: "SUPPORT_AGENT" },
    { email: "support@impact.enterprise", pass: "SupportPassword2026!", first: "Sam", last: "SupportAgent", role: "SUPPORT_AGENT" },
    { email: "viewer@impact.enterprise", pass: "ViewerPassword2026!", first: "Victor", last: "Viewer", role: "VIEWER" },
  ];

  for (const u of devUsers) {
    const passwordHash = await hashPassword(u.pass);
    const userRes = await db.query<{ id: string }>(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, first_name = EXCLUDED.first_name
       RETURNING id;`,
      [u.email, passwordHash, u.first, u.last]
    );

    const userId = userRes.rows[0].id;
    await db.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, role_id) DO NOTHING;`,
      [userId, u.role]
    );
  }

  // 4. Seed IMPACT Cataloged Services
  const services = [
    {
      id: "ai-agents",
      title: "AI & Intelligent Agents",
      tagline: "Intelligence That Acts.",
      category: "Artificial Intelligence",
      description: "Moving beyond passive chat to autonomous systems that understand goals, plan steps, call APIs, and execute complex business actions.",
      capabilities: JSON.stringify([
        "Customer-service & support triage bots",
        "Sub-400ms voice & telephone call agents",
        "Autonomous sales qualification & CRM sync",
        "Deep research & internal document intelligence",
      ]),
      typical_timeline: "2 to 6 weeks",
      target_audience: "Enterprises, fast-scaling startups, multi-branch service businesses",
    },
    {
      id: "automation",
      title: "Business Process Automation",
      tagline: "Automate The Work. Amplify The Business.",
      category: "Process Automation",
      description: "Replacing repetitive manual workflows with resilient event-driven automations connecting your leads, CRMs, databases, and teams.",
      capabilities: JSON.stringify([
        "Lead capture to CRM synchronization",
        "Automated multi-channel follow-ups (WhatsApp & Email)",
        "Webhook ingestion with dead-letter queue retries",
        "Operational inventory and dispatch alerts",
      ]),
      typical_timeline: "1 to 3 weeks",
      target_audience: "B2B sales teams, agencies, e-commerce, commercial operations",
    },
    {
      id: "software",
      title: "Custom Software & Web Applications",
      tagline: "From Concept to Application.",
      category: "Full-Stack Development",
      description: "Robust digital platforms engineered with modern frameworks, high-throughput APIs, and role-based administrative portals.",
      capabilities: JSON.stringify([
        "Next.js & React custom web applications",
        "Cross-platform iOS and Android mobile apps",
        "Multi-role dashboards & administrative portals",
        "High-performance REST & WebSocket backend services",
      ]),
      typical_timeline: "4 to 12 weeks",
      target_audience: "Founders, enterprises replacing legacy portals, growing tech platforms",
    },
    {
      id: "products",
      title: "Product Studio & Ventures",
      tagline: "We Don't Just Build For Others. We Build Products Too.",
      category: "Venture Development",
      description: "Partnering with ambitious founders and organizations to architect, build, and monetize custom digital platforms and SaaS products.",
      capabilities: JSON.stringify([
        "Zero-to-one rapid MVP commercialization",
        "Multi-tenant SaaS architectures with tenant isolation",
        "Cryptographic ordering & event stream infrastructure",
        "Commercial monetization & scaling roadmaps",
      ]),
      typical_timeline: "6 to 16 weeks",
      target_audience: "Startups, early-stage founders, strategic industry partners",
    },
  ];

  for (const s of services) {
    await db.query(
      `INSERT INTO services (id, title, tagline, category, description, capabilities, typical_timeline, target_audience)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         tagline = EXCLUDED.tagline,
         description = EXCLUDED.description,
         capabilities = EXCLUDED.capabilities;`,
      [s.id, s.title, s.tagline, s.category, s.description, s.capabilities, s.typical_timeline, s.target_audience]
    );
  }

  // 5. Seed Verified Case Studies
  const caseStudies = [
    {
      id: "restaurant-technology-platform",
      title: "Restaurant Technology Platform",
      category: "CUSTOM APPLICATIONS • AUTOMATION • ORDER MANAGEMENT",
      headline: "Commercial multi-branch restaurant management, digital ordering, and kitchen dispatch ecosystem.",
      problem_statement: "Chaotic paper tickets causing kitchen delays, 30% aggregator commission fees, vulnerability to table spoofing in QR ordering, and zero real-time branch P&L visibility.",
      solution_delivered: "A full-stack commercial ordering, kitchen dispatch, delivery, and financial analytics platform uniting 6 isolated branches and 8 RBAC roles in real time.",
      technologies: JSON.stringify(["Next.js 14", "FastAPI", "PostgreSQL", "SQLAlchemy 2", "Redis Pub/Sub", "WebSockets"]),
      capabilities: JSON.stringify([
        "Cryptographic HMAC QR table ordering eliminating spoofing",
        "Redis Pub/Sub WebSocket Kitchen Display Board (KDS)",
        "Server-isolated 6-branch database partitioning",
        "8-tier RBAC security (Owner, Admin, Manager, Chef, Rider)",
        "Deal Engine with 25% max custom discount cutoff",
      ]),
      outcome_summary: "Unified 6 branches with sub-second order dispatch and 0% third-party aggregator commissions.",
    },
    {
      id: "lead-crm-automation-engine",
      title: "Automated Lead Capture & CRM Pipeline",
      category: "AUTOMATION • AI • BUSINESS SYSTEMS",
      headline: "Zero-delay automated conversion pipeline ingesting webhooks and dispatching WhatsApp follow-ups.",
      problem_statement: "Inbound leads waiting hours for manual follow-up, losing momentum to competitors, and sales reps wasting 10+ hours weekly manually typing data into CRMs.",
      solution_delivered: "A zero-delay conversion engine that ingests webhook payloads, scores lead intent, syncs bidirectional CRM contacts, and dispatches WhatsApp follow-ups in under 60 seconds.",
      technologies: JSON.stringify(["Python", "FastAPI", "Webhooks", "CRM APIs", "WhatsApp Cloud API", "PostgreSQL"]),
      capabilities: JSON.stringify([
        "Idempotent multi-channel webhook ingestion",
        "Automated lead intent scoring & qualification",
        "Real-time bidirectional CRM database synchronization",
        "Personalized WhatsApp and email engagement triggers",
      ]),
      outcome_summary: "Accelerated inbound lead response time from hours to under 60 seconds.",
    },
    {
      id: "enterprise-knowledge-agent",
      title: "Enterprise Knowledge & Autonomous Research Agent",
      category: "AI • AGENTS • APPLICATIONS • PRODUCTS",
      headline: "Hallucination-resistant enterprise RAG agent with hybrid vector search and strict citation grounding.",
      problem_statement: "Employees wasting hundreds of hours searching disjointed technical manuals and policy documents, while generic AI chatbots hallucinated facts.",
      solution_delivered: "An enterprise RAG agent with hybrid vector search, strict citation grounding, and role-based access gates to query internal databases safely.",
      technologies: JSON.stringify(["LLM Orchestration", "Python", "FastAPI", "pgvector", "PostgreSQL", "Next.js"]),
      capabilities: JSON.stringify([
        "Dense semantic & sparse keyword hybrid vector search",
        "Zero-hallucination citation grounding on source files",
        "Deterministic JSON-schema tool calling validation",
        "Role-scoped access control preventing data leaks",
      ]),
      outcome_summary: "Reduced technical document query times by 90% while enforcing strict information security.",
    },
  ];

  for (const cs of caseStudies) {
    await db.query(
      `INSERT INTO case_studies (id, title, category, headline, problem_statement, solution_delivered, technologies, capabilities, outcome_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         headline = EXCLUDED.headline,
         problem_statement = EXCLUDED.problem_statement,
         solution_delivered = EXCLUDED.solution_delivered;`,
      [cs.id, cs.title, cs.category, cs.headline, cs.problem_statement, cs.solution_delivered, cs.technologies, cs.capabilities, cs.outcome_summary]
    );
  }

  // 6. Seed Approved Knowledge Documents
  for (const doc of APPROVED_KNOWLEDGE_DOCUMENTS) {
    await db.query(
      `INSERT INTO knowledge_documents (category, title, content, source, version, metadata, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [doc.category, doc.title, doc.content, doc.source, doc.version, JSON.stringify(doc.metadata), doc.isActive]
    );
  }

  // 7. Seed IMPACT Growth OS Modules & Foundation Artifacts
  const { GROWTH_OS_MODULES } = await import("../growth-os/constants");
  for (const mod of GROWTH_OS_MODULES) {
    await db.query(
      `INSERT INTO growth_os_modules (id, code, name, suite, description, icon, is_active, min_permission, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         min_permission = EXCLUDED.min_permission,
         sort_order = EXCLUDED.sort_order;`,
      [mod.id, mod.code, mod.name, mod.suite, mod.description, mod.icon, mod.minPermission, mod.sortOrder]
    );
  }

  // Seed sample foundation campaign
  await db.query(
    `INSERT INTO content_campaigns (id, name, target_service, description, start_date, end_date, status)
     VALUES ('10000000-0000-0000-0000-000000000001', 'Q4 Enterprise AI Deployment & Lead Automation', 'AI automation', 'Strategic content and omnichannel awareness initiative highlighting Make-based lead conversion and custom AI models.', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'active')
     ON CONFLICT (id) DO NOTHING;`
  );

  // Seed sample foundation task
  await db.query(
    `INSERT INTO crm_tasks (id, title, description, priority, status, due_date)
     VALUES ('20000000-0000-0000-0000-000000000001', 'Verify IMPACT Growth OS Foundation Telemetry', 'Perform Phase 0 health checks, verify module registry synchronization, and confirm zero-leakage security posture.', 'HIGH', 'PENDING', NOW() + INTERVAL '2 days')
     ON CONFLICT (id) DO NOTHING;`
  );

  // 8. Seed CRM Default Teams, Sources, Pipelines & Stages (Phase 1)
  // 8.1 Teams
  await db.query(`
    INSERT INTO crm_teams (id, name, description)
    VALUES 
      ('30000000-0000-0000-0000-000000000001', 'Enterprise AI Sales', 'Core commercial team focusing on AI models, chat agents, and call agents.'),
      ('30000000-0000-0000-0000-000000000002', 'Business Automation & Solutions', 'Engineering team delivering custom Make-based lead automations and software.')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 8.2 Lead Sources
  const leadSources = [
    { id: "website", name: "Website Direct" },
    { id: "web_chat", name: "AI Web Chat" },
    { id: "whatsapp", name: "WhatsApp Inbound" },
    { id: "linkedin", name: "LinkedIn Campaign" },
    { id: "referral", name: "Client Referral" },
    { id: "outbound", name: "Outbound SDR" },
    { id: "inbound_call", name: "Voice Inbound Call" },
    { id: "event", name: "Executive Tech Summit" },
  ];
  for (const src of leadSources) {
    await db.query(
      `INSERT INTO crm_lead_sources (id, name, is_active) VALUES ($1, $2, TRUE) ON CONFLICT (id) DO NOTHING;`,
      [src.id, src.name]
    );
  }

  // 8.3 Standard Pipeline & Stages
  const pipelineId = "40000000-0000-0000-0000-000000000001";
  await db.query(`
    INSERT INTO crm_pipelines (id, name, description, is_default)
    VALUES ('${pipelineId}', 'Standard Enterprise Sales Pipeline', 'Default deal progression for IMPACT Enterprise business services.', TRUE)
    ON CONFLICT (id) DO NOTHING;
  `);

  const stages = [
    { code: "NEW", name: "New Lead", order: 1, prob: 10 },
    { code: "CONTACTED", name: "Contacted", order: 2, prob: 20 },
    { code: "QUALIFIED", name: "Qualified (BANT)", order: 3, prob: 40 },
    { code: "PROPOSAL", name: "Proposal Scoped", order: 4, prob: 60 },
    { code: "NEGOTIATION", name: "Negotiation", order: 5, prob: 80 },
    { code: "WON", name: "Closed Won", order: 6, prob: 100 },
    { code: "LOST", name: "Closed Lost", order: 7, prob: 0 },
    { code: "NURTURE", name: "Long-term Nurture", order: 8, prob: 15 },
  ];

  for (const stg of stages) {
    await db.query(`
      INSERT INTO crm_pipeline_stages (pipeline_id, name, code, order_index, probability_percent)
      VALUES ('${pipelineId}', '${stg.name}', '${stg.code}', ${stg.order}, ${stg.prob})
      ON CONFLICT DO NOTHING;
    `);
  }

  // 8.4 Default CRM Tags
  const defaultTags = [
    { name: "Enterprise", color: "#4F46E5" },
    { name: "High Intent", color: "#EF4444" },
    { name: "Make.com Automation", color: "#10B981" },
    { name: "Voice AI Agent", color: "#F59E0B" },
    { name: "Q4 Target", color: "#8B5CF6" },
  ];
  for (const tag of defaultTags) {
    await db.query(
      `INSERT INTO crm_tags (name, color) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING;`,
      [tag.name, tag.color]
    );
  }

  // 8.5 Seed Default Enterprise Social Media Accounts Linked to AI Agent
  const defaultSocialAccounts = [
    {
      platform: "linkedin",
      name: "IMPACT Enterprise Official",
      pageId: "urn:li:organization:impact-enterprise-ai",
      token: "simulated_oauth_linkedin_token_enterprise_live_999",
      metadata: { handle: "impact-enterprise", followers: "14,250", is_ai_agent_linked: true },
    },
    {
      platform: "twitter",
      name: "IMPACT Enterprise AI",
      pageId: "@ImpactEntAI",
      token: "simulated_bearer_twitter_token_enterprise_live_888",
      metadata: { handle: "@ImpactEntAI", followers: "8,900", is_ai_agent_linked: true },
    },
    {
      platform: "instagram",
      name: "impact.enterprise.official",
      pageId: "ig_impact_enterprise_official",
      token: "simulated_graph_instagram_token_enterprise_live_777",
      metadata: { handle: "@impact.enterprise.official", followers: "5,400", is_ai_agent_linked: true },
    },
    {
      platform: "facebook",
      name: "IMPACT Enterprise Global",
      pageId: "fb_impact_enterprise_page_official",
      token: "simulated_graph_facebook_token_enterprise_live_666",
      metadata: { handle: "IMPACTEnterpriseGlobal", followers: "6,100", is_ai_agent_linked: true },
    },
  ];

  for (const sa of defaultSocialAccounts) {
    const existing = await db.query(
      `SELECT id FROM social_accounts WHERE platform = $1 AND account_name = $2;`,
      [sa.platform, sa.name]
    );
    if (existing.rows.length === 0) {
      const encrypted = CryptoVault.encrypt(sa.token);
      await db.query(
        `INSERT INTO social_accounts (
          platform, account_name, account_or_page_id, encrypted_access_token,
          connection_status, metadata
        ) VALUES ($1, $2, $3, $4, 'CONNECTED', $5);`,
        [sa.platform, sa.name, sa.pageId, encrypted, JSON.stringify(sa.metadata)]
      );
    }
  }

  logger.info("Development database seeding completed successfully.", { module: "Seed" });
}


// CLI Entrypoint
if (require.main === module) {
  (async () => {
    try {
      await seedDevelopmentDatabase();
      await db.close();
      console.log("Database seeded successfully.");
      process.exit(0);
    } catch (err) {
      console.error("Seeding failed:", err);
      process.exit(1);
    }
  })();
}
