/**
 * IMPACT Enterprise — Growth OS Platform Constants
 * 
 * Strict Grounding Rules:
 * 1. Brand positioning: IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT
 * 2. Core services: strictly the 9 authorized services.
 * 3. Growth OS Modules: strictly the 14 defined business capabilities.
 */

export const IMPACT_ENTERPRISE = {
  name: "IMPACT Enterprise",
  brandPositioning: "IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT",
  tagline: "Turning Ideas Into Impact Through Intelligent Automation",
  websiteUrl: "https://impact-enterprise.vercel.app",
} as const;

export interface CoreServiceDefinition {
  id: string;
  name: string;
  category: "Intelligence" | "Automation" | "Engineering";
  description: string;
}

export const CORE_SERVICES: readonly CoreServiceDefinition[] = [
  {
    id: "ai-models",
    name: "AI models",
    category: "Intelligence",
    description: "Domain-tuned foundation models, parameter-efficient fine-tuning, and bespoke neural architectures.",
  },
  {
    id: "ai-agents",
    name: "AI agents",
    category: "Intelligence",
    description: "Autonomous goal-directed software agents with schema-validated tool-calling and API execution.",
  },
  {
    id: "ai-automation",
    name: "AI automation",
    category: "Automation",
    description: "Intelligent cognitive automation uniting unstructured document parsing, decision logic, and CRM sync.",
  },
  {
    id: "make-lead-conversion-automation",
    name: "Make-based lead-conversion automation",
    category: "Automation",
    description: "High-throughput Make.com enterprise scenarios routing inbound inquiries, scoring intent, and triggering cadences.",
  },
  {
    id: "chat-agents",
    name: "Chat agents",
    category: "Intelligence",
    description: "Grounded conversational multi-channel web chat and WhatsApp agents driving qualified discovery appointments.",
  },
  {
    id: "call-agents",
    name: "Call agents",
    category: "Intelligence",
    description: "Sub-500ms full-duplex conversational voice agents powered by Gemini Live API with post-call diarization.",
  },
  {
    id: "custom-business-applications",
    name: "Custom business applications",
    category: "Engineering",
    description: "Production-grade internal enterprise systems, customer portals, and tailored business workflows.",
  },
  {
    id: "software-development",
    name: "Software development",
    category: "Engineering",
    description: "Full-stack software engineering, high-concurrency Node.js/Next.js backends, and microservice architectures.",
  },
  {
    id: "business-automation",
    name: "Business automation",
    category: "Automation",
    description: "End-to-end operational automation eliminating manual back-office bottlenecks across enterprise pipelines.",
  },
] as const;

export const IMPACT_SERVICES: string[] = CORE_SERVICES.map((s) => s.name);
export const IMPACT_SERVICE_DEFINITIONS = CORE_SERVICES;

export type GrowthOsSuite = "marketing" | "revenue" | "operations";

export interface GrowthOsModuleDef {
  number: number;
  id: string;
  code: string;
  name: string;
  suite: GrowthOsSuite;
  description: string;
  icon: string;
  phasePlanned: number;
  minPermission: string;
  sortOrder: number;
}

export const GROWTH_OS_MODULES: readonly GrowthOsModuleDef[] = [
  // 1-4: Marketing Suite
  {
    number: 1,
    id: "ai-social-content-agent",
    code: "MKT_AI_CONTENT",
    name: "AI Social Media Content Agent",
    suite: "marketing",
    description: "Autonomous generation of multi-channel social copy, thought leadership, and campaign assets grounded in IMPACT services.",
    icon: "Sparkles",
    phasePlanned: 1,
    minPermission: "leads:create",
    sortOrder: 1,
  },
  {
    number: 2,
    id: "content-calendar",
    code: "MKT_CALENDAR",
    name: "Content Calendar",
    suite: "marketing",
    description: "Multi-platform visual scheduling grid with timeline slot allocation and cross-channel release synchrony.",
    icon: "Calendar",
    phasePlanned: 2,
    minPermission: "dashboard:view",
    sortOrder: 2,
  },
  {
    number: 3,
    id: "content-approval-system",
    code: "MKT_APPROVALS",
    name: "Content Approval System",
    suite: "marketing",
    description: "Multi-tier editorial review workflow with feedback tracking, revision history, and audit logging.",
    icon: "CheckSquare",
    phasePlanned: 3,
    minPermission: "leads:edit",
    sortOrder: 3,
  },
  {
    number: 4,
    id: "social-media-publishing",
    code: "MKT_PUBLISHING",
    name: "Social Media Publishing",
    suite: "marketing",
    description: "Multi-channel publishing engine targeting LinkedIn, Twitter/X, and Meta with retry queues and idempotency keys.",
    icon: "Share2",
    phasePlanned: 3,
    minPermission: "leads:edit",
    sortOrder: 4,
  },

  // 5-10: Revenue Suite (CRM & Sales)
  {
    number: 5,
    id: "lead-capture",
    code: "REV_LEAD_CAPTURE",
    name: "Lead Capture",
    suite: "revenue",
    description: "Omnichannel prospect ingestion from web forms, consultation modals, conversational chat turns, and inbound webhooks.",
    icon: "UserPlus",
    phasePlanned: 4,
    minPermission: "leads:create",
    sortOrder: 5,
  },
  {
    number: 6,
    id: "crm",
    code: "REV_CRM",
    name: "CRM",
    suite: "revenue",
    description: "Unified relationship manager tracking accounts, customer contacts, engagement stages, and deal associations.",
    icon: "Building2",
    phasePlanned: 4,
    minPermission: "leads:view_all",
    sortOrder: 6,
  },
  {
    number: 7,
    id: "ai-lead-qualification",
    code: "REV_AI_QUALIFICATION",
    name: "AI Lead Qualification",
    suite: "revenue",
    description: "Quantitative BANT scoring engine analyzing Need (30%), Budget (25%), Authority (25%), and Timeline (20%).",
    icon: "Target",
    phasePlanned: 5,
    minPermission: "leads:view_all",
    sortOrder: 7,
  },
  {
    number: 8,
    id: "ai-lead-follow-up",
    code: "REV_AI_FOLLOWUP",
    name: "AI Lead Follow-up",
    suite: "revenue",
    description: "Automated cadence orchestrator generating context-aware follow-up email and WhatsApp messages.",
    icon: "Send",
    phasePlanned: 6,
    minPermission: "leads:edit",
    sortOrder: 8,
  },
  {
    number: 9,
    id: "customer-communication-history",
    code: "REV_COMM_HISTORY",
    name: "Customer communication history",
    suite: "revenue",
    description: "Unified chronological audit trail linking Web Chat, WhatsApp, Email, Phone/SMS, and Gemini Live voice calls.",
    icon: "MessageSquare",
    phasePlanned: 6,
    minPermission: "conversations:view",
    sortOrder: 9,
  },
  {
    number: 10,
    id: "sales-pipeline",
    code: "REV_PIPELINE",
    name: "Sales pipeline",
    suite: "revenue",
    description: "Visual Kanban pipeline managing deal stage progression from NEW through QUALIFIED to WON or LOST.",
    icon: "Kanban",
    phasePlanned: 5,
    minPermission: "leads:view_all",
    sortOrder: 10,
  },

  // 11-14: Operations & Governance Suite
  {
    number: 11,
    id: "tasks-and-reminders",
    code: "OPS_TASKS",
    name: "Tasks and reminders",
    suite: "operations",
    description: "Operational task manager with priority tiers, SLA alarms, customer/lead linkages, and team assignment.",
    icon: "CheckCircle2",
    phasePlanned: 7,
    minPermission: "dashboard:view",
    sortOrder: 11,
  },
  {
    number: 12,
    id: "analytics",
    code: "OPS_ANALYTICS",
    name: "Analytics",
    suite: "operations",
    description: "Executive business intelligence reporting channel breakdowns, deal velocity, SLA responses, and CSV exports.",
    icon: "BarChart3",
    phasePlanned: 8,
    minPermission: "dashboard:view",
    sortOrder: 12,
  },
  {
    number: 13,
    id: "team-management",
    code: "OPS_TEAM",
    name: "Team management",
    suite: "operations",
    description: "Role-based access administration, team provisioning, capacity planning, and permission enforcement.",
    icon: "Users",
    phasePlanned: 7,
    minPermission: "team:manage",
    sortOrder: 13,
  },
  {
    number: 14,
    id: "admin-controls",
    code: "OPS_CONTROLS",
    name: "Admin controls",
    suite: "operations",
    description: "Platform security center, sliding-window rate limit monitors, immutable audit trail, and system telemetry.",
    icon: "ShieldAlert",
    phasePlanned: 8,
    minPermission: "system:manage",
    sortOrder: 14,
  },
] as const;
