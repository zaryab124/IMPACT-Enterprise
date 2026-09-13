export interface ToolExecutionContext {
  conversationId?: string;
  sessionId?: string;
  customerId?: string;
  channel?: string;
}

export interface ToolExecutionResult<T = unknown> {
  toolName: string;
  success: boolean;
  data?: T;
  error?: string;
  durationMs: number;
}

export interface CaptureLeadArgs {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  problem?: string;
  budget?: string;
  timeline?: string;
}

export interface LookupServiceArgs {
  serviceName: string;
  specificQuery?: string;
}

export interface QueryCaseStudyArgs {
  slug: "restaurant-technology-platform" | "lead-crm-automation-engine" | "enterprise-knowledge-agent" | "all";
}

export interface CheckAppointmentAvailabilityArgs {
  preferredDate?: string; // YYYY-MM-DD
  timezone?: string;
}

export interface BookAppointmentArgs {
  name: string;
  email: string;
  startTime: string;
  phone?: string;
  timezone?: string;
  notes?: string;
}

export interface TriggerHumanHandoffArgs {
  reason: string;
  preferredChannel?: "whatsapp" | "phone" | "email";
}
