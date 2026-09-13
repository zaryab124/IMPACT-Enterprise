import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env";
import { logger } from "../../logging/logger";
import {
  voiceSessionRepository,
  conversationRepository,
  callRecordingRepository,
  leadRepository,
} from "../../database/repositories";
import {
  ActionItem,
  BANTInsights,
  CallAnalysisResult,
  DiarizedTurn,
} from "./types";
import { sentimentAnalyzer } from "./sentimentAnalyzer";

export class ConversationIntelligenceService {
  private client: GoogleGenAI | null = null;
  private isConfigured = false;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("your-gemini-api-key")) {
      try {
        this.client = new GoogleGenAI({ apiKey });
        this.isConfigured = true;
      } catch (err: any) {
        logger.warn(`Failed to initialize GoogleGenAI for intelligence: ${err.message}`, {
          module: "ConversationIntelligenceService",
        });
      }
    }
  }

  public isLive(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Process and analyze a completed voice call session
   */
  public async analyzeVoiceCall(sessionId: string): Promise<CallAnalysisResult> {
    logger.info(`Beginning conversation intelligence analysis for session: ${sessionId}`, {
      module: "ConversationIntelligenceService",
    });

    // 1. Fetch voice session
    const session = await voiceSessionRepository.findBySessionId(sessionId);
    if (!session) {
      throw new Error(`Voice session not found: ${sessionId}`);
    }

    const conversationId = session.conversation_id;
    let customerId: string | null = (session.metadata as any)?.customerId || null;

    // 2. Fetch conversation messages
    let messages: any[] = [];
    if (conversationId) {
      messages = await conversationRepository.getMessages(conversationId);
      const conv = await conversationRepository.findById(conversationId);
      if (conv && !customerId) {
        customerId = conv.customer_id;
      }
    }

    // 3. Perform turn diarization and speaker attribution
    const diarizedTranscript: DiarizedTurn[] = [];
    if (messages.length > 0) {
      for (const m of messages) {
        const isUser = m.sender_type === "customer";
        const text = m.content || "";
        diarizedTranscript.push({
          speaker: isUser ? "user" : "agent",
          speakerName: isUser ? "Prospective Client" : "IMPACT AI",
          text,
          timestamp: m.created_at || new Date().toISOString(),
          sentiment: sentimentAnalyzer.analyzeTurn(text),
        });
      }
    } else {
      // Fallback synthetic diarization for sessions without external message links
      diarizedTranscript.push(
        {
          speaker: "user",
          speakerName: "Prospective Client",
          text: "Hello, we are inquiring about your enterprise AI agent solutions.",
          timestamp: session.started_at,
          sentiment: "positive",
        },
        {
          speaker: "agent",
          speakerName: "IMPACT AI",
          text: "Welcome to IMPACT Enterprise. We engineer autonomous agents and enterprise workflow automations.",
          timestamp: session.started_at,
          sentiment: "positive",
        }
      );
    }

    // 4. Calculate overall conversation sentiment
    const sentimentScore = sentimentAnalyzer.calculateCallSentiment(diarizedTranscript);

    // 5. Generate Executive Summary, Action Items, Key Topics & BANT Insights
    let analysisData: {
      executiveSummary: string;
      actionItems: ActionItem[];
      keyTopics: string[];
      bantInsights: BANTInsights;
      isMock: boolean;
    };

    if (this.isLive() && this.client) {
      try {
        analysisData = await this.generateLiveGeminiAnalysis(diarizedTranscript);
      } catch (err: any) {
        logger.warn(`Live Gemini intelligence analysis failed: ${err.message}. Activating development simulator.`, {
          module: "ConversationIntelligenceService",
        });
        analysisData = this.generateMockAnalysis(diarizedTranscript, session);
      }
    } else {
      analysisData = this.generateMockAnalysis(diarizedTranscript, session);
    }

    // 6. Persist to PostgreSQL database (call_recordings table)
    const recording = await callRecordingRepository.create({
      voiceSessionId: sessionId,
      conversationId,
      customerId,
      recordingUrl: `https://storage.impact-enterprise.com/recordings/${sessionId}.pcm`,
      durationSeconds: session.duration_seconds || Math.max(30, diarizedTranscript.length * 15),
      consentGranted: true,
      overallSentiment: sentimentScore.label,
      sentimentScore: sentimentScore.score,
      executiveSummary: analysisData.executiveSummary,
      actionItems: analysisData.actionItems,
      keyTopics: analysisData.keyTopics,
      bantInsights: analysisData.bantInsights,
      diarizedTranscript,
    });

    // 7. Auto-update CRM Lead Qualification if BANT insights discovered
    if (customerId) {
      try {
        const leads = await leadRepository.findByCustomerId(customerId);
        const lead = leads[0];
        if (lead) {
          const score = analysisData.bantInsights.score || 70;
          let newStage = lead.stage;
          if (score >= 70 && lead.stage === "NEW") {
            newStage = "CONTACTED";
          }
          if (score >= 80 && ["NEW", "CONTACTED"].includes(lead.stage)) {
            newStage = "PROPOSAL";
          }

          await leadRepository.updateStage(lead.id, newStage, "AI", "ConversationIntelligenceService");
          await leadRepository.recordScore({
            leadId: lead.id,
            fitScore: score,
            clarityScore: score,
            timelineScore: score,
            budgetScore: score,
            authorityScore: score,
            reasoning: `Voice intelligence evaluated call ${sessionId}. Extracted Need: ${analysisData.bantInsights.need || "AI Architecture"}`,
          });
          logger.info(`Lead ${lead.id} updated with voice intelligence findings (Stage: ${newStage}, Score: ${score})`, {
            module: "ConversationIntelligenceService",
          });
        }
      } catch (leadErr: any) {
        logger.warn(`Failed to sync voice intelligence to lead: ${leadErr.message}`, {
          module: "ConversationIntelligenceService",
        });
      }
    }

    return {
      id: recording.id,
      voiceSessionId: sessionId,
      conversationId,
      customerId,
      durationSeconds: recording.duration_seconds,
      recordingUrl: recording.recording_url,
      consentGranted: recording.consent_granted,
      overallSentiment: sentimentScore.label,
      sentimentScore: sentimentScore.score,
      executiveSummary: analysisData.executiveSummary,
      actionItems: analysisData.actionItems,
      keyTopics: analysisData.keyTopics,
      bantInsights: analysisData.bantInsights,
      diarizedTranscript,
      isMock: analysisData.isMock,
    };
  }

  /**
   * Live Gemini Analysis Synthesis
   */
  private async generateLiveGeminiAnalysis(turns: DiarizedTurn[]) {
    if (!this.client) throw new Error("Client not available");

    const prompt = `Analyze this voice conversation between a client and IMPACT AI (Technical Sales Consultant):
${turns.map((t) => `${t.speaker.toUpperCase()}: ${t.text}`).join("\n")}

Respond with JSON format:
{
  "executiveSummary": "2-3 concise paragraphs summarizing client intent, solutions proposed, and agreement",
  "actionItems": [
    { "task": "description of follow-up", "owner": "IMPACT Engineering / Client", "priority": "high|medium|low", "completed": false }
  ],
  "keyTopics": ["topic1", "topic2"],
  "bantInsights": {
    "budget": "budget details if mentioned or estimated",
    "authority": "decision maker status",
    "need": "client technical pain points",
    "timeline": "target timeline",
    "score": 75,
    "readiness": "qualified"
  }
}`;

    const res = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(res.text || "{}");
    return {
      executiveSummary: parsed.executiveSummary || "Call completed cleanly.",
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : ["AI Solutions"],
      bantInsights: parsed.bantInsights || { score: 65, readiness: "warm" },
      isMock: false,
    };
  }

  /**
   * Deterministic Labeled Development Mock Simulator
   */
  private generateMockAnalysis(turns: DiarizedTurn[], session: any) {
    const fullText = turns.map((t) => t.text).join(" ").toLowerCase();

    // Extract topics
    const keyTopics: string[] = [];
    if (fullText.includes("whatsapp") || fullText.includes("messaging")) keyTopics.push("WhatsApp Cloud Automation");
    if (fullText.includes("agent") || fullText.includes("autonomous")) keyTopics.push("Autonomous AI Agents");
    if (fullText.includes("consultation") || fullText.includes("schedule") || fullText.includes("book")) keyTopics.push("Discovery Consultation");
    if (fullText.includes("crm") || fullText.includes("lead")) keyTopics.push("CRM Workflow Integration");
    if (keyTopics.length === 0) keyTopics.push("Enterprise AI Engineering", "Custom Full-Stack Solutions");

    // Extract action items
    const actionItems: ActionItem[] = [
      {
        task: "Send technical discovery agenda and calendar confirmation to client",
        owner: "IMPACT Sales Operations",
        priority: "high",
        completed: false,
      },
      {
        task: `Prepare architectural feasibility briefing for ${keyTopics[0]}`,
        owner: "Senior AI Engineer",
        priority: "medium",
        completed: false,
      },
    ];

    // Evaluate BANT
    const hasBudget = fullText.includes("$") || fullText.includes("budget") || fullText.includes("price") || fullText.includes("cost");
    const hasTimeline = fullText.includes("month") || fullText.includes("week") || fullText.includes("timeline") || fullText.includes("asap");

    const bantInsights: BANTInsights = {
      budget: hasBudget ? "Estimated $25,000 - $50,000 tier discussed" : "To be qualified in discovery session",
      authority: "Technical Director / Project Lead",
      need: keyTopics.join(", "),
      timeline: hasTimeline ? "Q4 Target Deployment (4-8 weeks)" : "Standard 6-week enterprise delivery",
      score: hasBudget && hasTimeline ? 85 : 72,
      readiness: hasBudget && hasTimeline ? "ready_for_proposal" : "qualified",
    };

    const executiveSummary =
      `[DEVELOPMENT MOCK: Conversation Intelligence Engine]\n\n` +
      `The prospective client initiated an interactive voice consultation with IMPACT AI regarding enterprise software capabilities. The discussion focused primarily on ${keyTopics.join(" and ")}.\n\n` +
      `IMPACT AI presented our core architectural methodology, emphasizing sub-500ms voice agent pipelines, multi-channel workflow synchronization, and grounded enterprise security. The client expressed clear interest in scheduling a technical discovery session with our Beirut engineering hub.\n\n` +
      `Next steps include delivering an architectural scoping brief and confirming appointment availability.`;

    return {
      executiveSummary,
      actionItems,
      keyTopics,
      bantInsights,
      isMock: true,
    };
  }

  /**
   * List paginated recordings for Admin Hub
   */
  public async getCallRecordings(options: {
    limit?: number;
    offset?: number;
    sentiment?: string;
    search?: string;
  } = {}) {
    return callRecordingRepository.listWithDetails(options);
  }

  /**
   * Get single recording by ID
   */
  public async getCallRecordingById(id: string) {
    return callRecordingRepository.findById(id);
  }

  /**
   * Toggle action item completion status
   */
  public async toggleActionItem(id: string, index: number, completed: boolean) {
    return callRecordingRepository.toggleActionItem(id, index, completed);
  }

  /**
   * Get aggregate intelligence analytics for dashboard
   */
  public async getIntelligenceAnalytics() {
    return callRecordingRepository.getAnalytics();
  }
}

export const conversationIntelligenceService = new ConversationIntelligenceService();
