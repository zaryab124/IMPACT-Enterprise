export type ChannelType = "web_chat" | "whatsapp" | "email" | "phone";

export interface ChannelMetrics {
  channel: ChannelType;
  label: string;
  conversationCount: number;
  messageCount: number;
  leadCount: number;
  conversionRate: number; // percentage (0 - 100)
  percentageOfTotal: number; // percentage of total inbound conversations (0 - 100)
}

export type FunnelStageId =
  | "interactions"
  | "leads_captured"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won";

export interface FunnelStageMetric {
  id: FunnelStageId;
  label: string;
  count: number;
  conversionRateFromPrevious: number; // percentage (0 - 100)
  overallConversionRate: number; // percentage from top of funnel (0 - 100)
  dropoffCount: number;
  color: string;
}

export interface FunnelData {
  stages: FunnelStageMetric[];
  totalInbound: number;
  totalWon: number;
  overallConversionRate: number;
  topDropoffStage: string;
}

export interface SLAMetrics {
  aiFirstResponseTimeAvgMs: number;
  aiFirstResponseTimeP95Ms: number;
  humanHandoffPickupAvgSec: number;
  humanHandoffResolutionAvgSec: number;
  omnichannelDeliveryRate: number; // percentage (0 - 100)
  omnichannelAvgDeliverySec: number;
}

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  conversations: number;
  leads: number;
  proposals: number;
  won: number;
}

export interface AnalyticsSummary {
  timeRange: "7d" | "30d" | "all";
  generatedAt: string;
  totalInteractions: number;
  totalLeads: number;
  totalQualified: number;
  totalProposals: number;
  totalWon: number;
  overallConversionRate: number;
  channels: ChannelMetrics[];
  funnel: FunnelData;
  sla: SLAMetrics;
  trends: TrendPoint[];
}

export type ExportType = "leads" | "conversations" | "appointments" | "voice";
export type ExportFormat = "csv" | "json";

export interface ExportResult {
  filename: string;
  mimeType: string;
  content: string;
  rowCount: number;
}
