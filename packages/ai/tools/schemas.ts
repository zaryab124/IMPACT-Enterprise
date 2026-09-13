import { FunctionDeclaration, Type } from "@google/genai";
import { z } from "zod";

// Zod Validation Schemas
export const captureLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("A valid email address is required").max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(100).optional(),
  problem: z.string().max(1000).optional(),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
});

export const lookupServiceSchema = z.object({
  serviceName: z.string().min(2, "Service name must be at least 2 characters").max(100),
  specificQuery: z.string().max(300).optional(),
});

export const queryCaseStudySchema = z.object({
  slug: z.enum([
    "restaurant-technology-platform",
    "lead-crm-automation-engine",
    "enterprise-knowledge-agent",
    "all",
  ]),
});

export const checkAppointmentAvailabilitySchema = z.object({
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  timezone: z.string().max(50).optional().default("UTC"),
});

export const triggerHumanHandoffSchema = z.object({
  reason: z.string().min(3, "Handoff reason must be at least 3 characters").max(500),
  preferredChannel: z.enum(["whatsapp", "phone", "email"]).optional().default("whatsapp"),
});

export const bookAppointmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("A valid email address is required").max(255),
  startTime: z.string().min(10, "startTime ISO string is required"),
  phone: z.string().max(50).optional(),
  timezone: z.string().max(50).optional().default("UTC"),
  notes: z.string().max(1000).optional(),
});

// Official Google GenAI Function Declarations
export const captureLeadDeclaration: FunctionDeclaration = {
  name: "captureLead",
  parameters: {
    type: Type.OBJECT,
    description: "Captures and synchronizes verified prospect contact information and requirements into the PostgreSQL CRM.",
    properties: {
      name: {
        type: Type.STRING,
        description: "Full name of the prospect or customer contact.",
      },
      email: {
        type: Type.STRING,
        description: "Business email address of the prospect.",
      },
      phone: {
        type: Type.STRING,
        description: "Direct telephone or WhatsApp number with country code.",
      },
      company: {
        type: Type.STRING,
        description: "Company or organization name.",
      },
      problem: {
        type: Type.STRING,
        description: "Business bottleneck, pain point, or desired automation requirement.",
      },
      budget: {
        type: Type.STRING,
        description: "Allocated budget or investment range (e.g. $25k, $50,000+).",
      },
      timeline: {
        type: Type.STRING,
        description: "Target implementation delivery timeframe (e.g. 3 weeks, 1-2 months).",
      },
    },
    required: ["name", "email"],
  },
};

export const lookupServiceDeclaration: FunctionDeclaration = {
  name: "lookupService",
  parameters: {
    type: Type.OBJECT,
    description: "Queries the verified IMPACT Enterprise service catalog for engineering capabilities, tech stacks, and delivery timelines.",
    properties: {
      serviceName: {
        type: Type.STRING,
        description: "Name of the service (e.g. 'AI Agents', 'AI Voice Systems', 'Workflow Automation', 'Custom Software').",
      },
      specificQuery: {
        type: Type.STRING,
        description: "Optional specific question or technical aspect to research.",
      },
    },
    required: ["serviceName"],
  },
};

export const queryCaseStudyDeclaration: FunctionDeclaration = {
  name: "queryCaseStudy",
  parameters: {
    type: Type.OBJECT,
    description: "Retrieves detailed enterprise case studies, production metrics, and architecture patterns from IMPACT portfolio.",
    properties: {
      slug: {
        type: Type.STRING,
        description: "Case study slug: 'restaurant-technology-platform', 'lead-crm-automation-engine', 'enterprise-knowledge-agent', or 'all'.",
      },
    },
    required: ["slug"],
  },
};

export const checkAppointmentAvailabilityDeclaration: FunctionDeclaration = {
  name: "checkAppointmentAvailability",
  parameters: {
    type: Type.OBJECT,
    description: "Checks real consultation calendar slot availability with IMPACT engineering directors. Never claims an unconfirmed booking.",
    properties: {
      preferredDate: {
        type: Type.STRING,
        description: "Target consultation date in YYYY-MM-DD format.",
      },
      timezone: {
        type: Type.STRING,
        description: "Client local timezone (e.g. 'UTC', 'America/New_York', 'Asia/Beirut').",
      },
    },
  },
};

export const bookAppointmentDeclaration: FunctionDeclaration = {
  name: "bookAppointment",
  parameters: {
    type: Type.OBJECT,
    description: "Books and confirms a technical discovery consultation with IMPACT Engineering Directors in PostgreSQL and generates Google Calendar / ICS invites.",
    properties: {
      name: {
        type: Type.STRING,
        description: "Full name of the client contact.",
      },
      email: {
        type: Type.STRING,
        description: "Email address of the client contact.",
      },
      startTime: {
        type: Type.STRING,
        description: "Target appointment start time in ISO 8601 format (e.g. '2026-10-15T10:00:00.000Z').",
      },
      phone: {
        type: Type.STRING,
        description: "Direct telephone or WhatsApp contact number.",
      },
      timezone: {
        type: Type.STRING,
        description: "Client timezone (default 'UTC').",
      },
      notes: {
        type: Type.STRING,
        description: "Project context or specific agenda topics for the consultation.",
      },
    },
    required: ["name", "email", "startTime"],
  },
};

export const triggerHumanHandoffDeclaration: FunctionDeclaration = {
  name: "triggerHumanHandoff",
  parameters: {
    type: Type.OBJECT,
    description: "Escalates the conversation to an executive human sales consultant, sets CRM status to 'human_handoff_requested', and returns direct contact channels.",
    properties: {
      reason: {
        type: Type.STRING,
        description: "Detailed reason for human escalation (e.g. custom pricing request, complex contract, user request).",
      },
      preferredChannel: {
        type: Type.STRING,
        description: "Preferred communication channel: 'whatsapp', 'phone', or 'email'.",
      },
    },
    required: ["reason"],
  },
};

export const allToolDeclarations: FunctionDeclaration[] = [
  captureLeadDeclaration,
  lookupServiceDeclaration,
  queryCaseStudyDeclaration,
  checkAppointmentAvailabilityDeclaration,
  bookAppointmentDeclaration,
  triggerHumanHandoffDeclaration,
];
