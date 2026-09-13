import bcrypt from "bcryptjs";
import { db } from "./index";
import { migrator } from "./migrator";
import { logger } from "../logging/logger";
import { ROLE_PERMISSIONS, UserRole } from "../auth/roles";
import { APPROVED_KNOWLEDGE_DOCUMENTS } from "../knowledge/data/approvedKnowledge";

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
    { id: "ADMIN", name: "Administrator", description: "Operational management, knowledge base curation, team administration" },
    { id: "SALES_MANAGER", name: "Sales Manager", description: "Sales pipeline oversight, appointment assignment, lead scoring" },
    { id: "SALES_AGENT", name: "Sales Agent", description: "Direct customer conversations, assigned lead qualification, human handoff" },
    { id: "SUPPORT_AGENT", name: "Support Agent", description: "Inquiry triage and customer assistance" },
    { id: "VIEWER", name: "Viewer", description: "Read-only access to operational reports and telemetry" },
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
    { email: "manager@impact.enterprise", pass: "ManagerPassword2026!", first: "Sarah", last: "SalesManager", role: "SALES_MANAGER" },
    { email: "agent@impact.enterprise", pass: "AgentPassword2026!", first: "Alex", last: "SalesAgent", role: "SALES_AGENT" },
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
