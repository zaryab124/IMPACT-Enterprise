import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import { logger } from "../logging/logger";
import { AICompletionOptions, AIResponse, ChatMessage, GeminiModel, ToolCall } from "./types";
import { allToolDeclarations } from "./tools/schemas";

export class GeminiClient {
  private client: GoogleGenAI | null = null;
  private isConfigured = false;
  private defaultModel: GeminiModel = "gemini-2.5-flash";

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("your-gemini-api-key")) {
      try {
        this.client = new GoogleGenAI({ apiKey });
        this.isConfigured = true;
        logger.info("GoogleGenAI client initialized successfully with live API key", { module: "GeminiClient" });
      } catch (err: any) {
        logger.warn(`Failed to initialize GoogleGenAI client: ${err.message}. Falling back to development mock.`, {
          module: "GeminiClient",
        });
      }
    } else {
      logger.info("No valid GEMINI_API_KEY configured. Running in DEVELOPMENT MOCK mode.", {
        module: "GeminiClient",
      });
    }
  }

  public isLive(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Execute model completion with Gemini API or development simulator
   */
  public async generateContent(
    messages: ChatMessage[],
    options: AICompletionOptions = {}
  ): Promise<AIResponse> {
    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.2;
    const systemInstruction = options.systemInstruction || "You are IMPACT AI, Technical Sales Consultant for IMPACT Enterprise.";

    // If live API key is present, call Google Gemini API with tool declarations
    if (this.isLive() && this.client) {
      try {
        const contents = messages.map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

        const response = await this.client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature,
            tools: [{ functionDeclarations: allToolDeclarations }],
          },
        });

        const rawFunctionCalls = response.functionCalls || [];
        const toolCalls: ToolCall[] = rawFunctionCalls.map((fc, idx) => ({
          id: (fc as any).id || `call-${Date.now()}-${idx}`,
          name: fc.name || "",
          args: (fc.args as Record<string, unknown>) || {},
        }));

        const text = response.text || "";
        return {
          content: text,
          model,
          isMock: false,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        };
      } catch (err: any) {
        logger.error(`Live Gemini API call failed: ${err.message}. Falling back to labeled development mock.`, err, {
          module: "GeminiClient",
        });
      }
    }

    // Labeled Development Simulator
    return this.generateMockResponse(messages, options, model);
  }

  /**
   * Deterministic Development Sales Consultant Mock (Explicitly labeled)
   */
  private generateMockResponse(
    messages: ChatMessage[],
    options: AICompletionOptions,
    model: GeminiModel
  ): AIResponse {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const lower = lastUserMessage.toLowerCase();

    let content = "";
    let toolCalls: ToolCall[] | undefined = undefined;

    const emailMatch = lastUserMessage.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const dateMatch = lastUserMessage.match(/\b\d{4}-\d{2}-\d{2}\b/);

    // 0. Tool Execution Intent Interceptors (Simulation Mode)
    if (
      lower.includes("speak with a human") ||
      lower.includes("talk to a human") ||
      lower.includes("talk to human") ||
      lower.includes("human agent") ||
      lower.includes("escalate to human") ||
      lower.includes("human handoff") ||
      lower.includes("triggerhumanhandoff")
    ) {
      toolCalls = [
        {
          id: `mock-call-handoff-${Date.now()}`,
          name: "triggerHumanHandoff",
          args: {
            reason: "Client explicitly requested human escalation",
            preferredChannel: "whatsapp",
          },
        },
      ];
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        "I am escalating your request directly to our executive engineering directors. You can reach our headquarters immediately on WhatsApp at +961 81 221 829 or expect a callback within business hours.";
    } else if (
      lower.includes("bookappointment") ||
      ((lower.includes("book") || lower.includes("confirm booking")) &&
        (lower.includes("appointment") || lower.includes("consultation")) &&
        emailMatch)
    ) {
      let name = "Enterprise Prospect";
      const nameMatch = lastUserMessage.match(/(?:my name is|i am|i'm|name:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }

      const isoMatch = lastUserMessage.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      const startTime = isoMatch ? (isoMatch[0].endsWith("Z") ? isoMatch[0] : isoMatch[0] + "Z") : (dateMatch ? `${dateMatch[0]}T14:00:00.000Z` : new Date(Date.now() + 86400000 * 3).toISOString());

      toolCalls = [
        {
          id: `mock-call-book-${Date.now()}`,
          name: "bookAppointment",
          args: {
            name,
            email: emailMatch ? emailMatch[1] : "client@impact-enterprise.internal",
            startTime,
            timezone: "UTC",
            notes: lastUserMessage.slice(0, 300),
          },
        },
      ];
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        `I am confirming your discovery consultation booking with our Engineering Directors for ${startTime}.`;
    } else if (
      lower.includes("check appointment") ||
      lower.includes("check availability") ||
      lower.includes("consultation slot") ||
      lower.includes("book a meeting") ||
      lower.includes("book a call") ||
      lower.includes("schedule a call") ||
      lower.includes("schedule consultation") ||
      lower.includes("available slots") ||
      lower.includes("checkappointmentavailability")
    ) {
      toolCalls = [
        {
          id: `mock-call-avail-${Date.now()}`,
          name: "checkAppointmentAvailability",
          args: {
            preferredDate: dateMatch ? dateMatch[0] : undefined,
            timezone: "UTC",
          },
        },
      ];
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        `I am checking real consultation calendar slot availability with our Engineering Directors${dateMatch ? ` for ${dateMatch[0]}` : ""}.`;
    } else if (
      emailMatch &&
      (lower.includes("name") || lower.includes("email") || lower.includes("budget") || lower.includes("capturelead") || lower.includes("reach out") || lower.includes("contact me") || lower.includes("hire") || lower.includes("my email is"))
    ) {
      let name = "Enterprise Prospect";
      const nameMatch = lastUserMessage.match(/(?:my name is|i am|i'm|name:\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }

      let company: string | undefined = undefined;
      const companyMatch = lastUserMessage.match(/(?:at|from|company:\s*)([A-Z][a-zA-Z0-9\s&]+?)(?:\s+(?:we|with|and|my|,|\.))/i);
      if (companyMatch && companyMatch[1]) {
        company = companyMatch[1].trim();
      }

      let budget: string | undefined = undefined;
      const budgetMatch = lastUserMessage.match(/(\$\s*\d+[\d,]*k?|\d+k\s*usd|\d+[\d,]*\s*dollars)/i);
      if (budgetMatch) {
        budget = budgetMatch[0];
      }

      toolCalls = [
        {
          id: `mock-call-lead-${Date.now()}`,
          name: "captureLead",
          args: {
            name,
            email: emailMatch[1],
            company,
            problem: lastUserMessage.slice(0, 300),
            budget,
          },
        },
      ];
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        `Thank you, ${name}. I have recorded your requirements in our CRM database and assigned this to our technical scoping team.`;
    } else if (
      lower.includes("lookup service") ||
      lower.includes("lookupservice") ||
      lower.includes("service catalog") ||
      lower.includes("what services do you offer") ||
      lower.includes("service capabilities")
    ) {
      let serviceName = "AI Agents & Autonomous Workflows";
      if (lower.includes("voice")) serviceName = "AI Voice & Telephony Systems";
      else if (lower.includes("automation")) serviceName = "Workflow Automation & System Integration";
      else if (lower.includes("software") || lower.includes("custom")) serviceName = "Enterprise Full-Stack Software";

      toolCalls = [
        {
          id: `mock-call-svc-${Date.now()}`,
          name: "lookupService",
          args: {
            serviceName,
            specificQuery: lastUserMessage.slice(0, 100),
          },
        },
      ];
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        `Querying the verified IMPACT Enterprise service catalog for '${serviceName}'...`;
    } else if (
      lower.includes("querycasestudy") ||
      lower.includes("query case study") ||
      lower.includes("case study metrics") ||
      lower.includes("show me case studies") ||
      lower.includes("show me case study")
    ) {
      let slug: any = "all";
      if (lower.includes("restaurant") || lower.includes("dining")) slug = "restaurant-technology-platform";
      else if (lower.includes("crm") || lower.includes("lead")) slug = "lead-crm-automation-engine";
      else if (lower.includes("knowledge") || lower.includes("rag")) slug = "enterprise-knowledge-agent";

      toolCalls = [
        {
          id: `mock-call-case-${Date.now()}`,
          name: "queryCaseStudy",
          args: { slug },
        },
      ];
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        `Retrieving verified production case study metrics for '${slug}' from our knowledge repository...`;
    }

    // 1. Guardrail: Prompt injection defense
    if (
      lower.includes("ignore all previous instructions") ||
      lower.includes("system prompt") ||
      lower.includes("reveal secret") ||
      lower.includes("jailbreak")
    ) {
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        "I am IMPACT AI, specialized exclusively as the Technical Sales & Solutions Consultant for IMPACT Enterprise. I operate strictly under enterprise security guidelines and cannot bypass system policies or disclose internal system instructions. How may I assist you with your AI, automation, or custom software requirements?";
    }
    // 2. Commercial / Pricing policy gate
    else if (
      lower.includes("price") ||
      lower.includes("cost") ||
      lower.includes("how much") ||
      lower.includes("discount") ||
      lower.includes("quote")
    ) {
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        "At IMPACT Technologies, we do not provide flat, one-size-fits-all, or fabricated pricing. Every enterprise platform, autonomous agent, and workflow automation is custom-engineered around your specific technical architecture, data volume, and integration complexity.\n\n" +
        "To obtain an accurate, milestone-based technical proposal:\n" +
        "1. Complete our 2-minute guided scoping wizard at /start-a-project.\n" +
        "2. Schedule a discovery consultation with our engineering directors.\n" +
        "3. Or connect directly with our headquarters team on WhatsApp (+92 314 7893907).\n\n" +
        "Could you share a brief overview of the problem you are looking to solve and your anticipated timeline?";
    }
    // 3. Case study / Restaurant platform inquiry
    else if (lower.includes("restaurant") || lower.includes("kds") || lower.includes("hmac")) {
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        "For multi-branch commercial dining, IMPACT developed a full-stack Restaurant Technology Platform uniting 6 isolated branches in real time. Key highlights delivered include:\n" +
        "- Cryptographic HMAC QR table ordering that completely eliminated spoofing.\n" +
        "- Redis Pub/Sub WebSocket Kitchen Display System (KDS) with sub-second order dispatch.\n" +
        "- Server-isolated 6-branch database partitioning with 8 RBAC security tiers.\n" +
        "- An automated deal engine with a 25% max discount cutoff.\n\n" +
        "The system eliminated paper ticket lag and saved thousands in third-party aggregator commissions. Are you looking to build a similar order management system or automate branch operations?";
    }
    // 4. AI & Voice Agents inquiry
    else if (lower.includes("ai") || lower.includes("agent") || lower.includes("voice")) {
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        "IMPACT Technologies specializes in production-grade AI & Autonomous Agents that take action rather than just chatting. Our capabilities include:\n" +
        "- Sub-400ms low-latency voice and telephone agents (Gemini Live WebSocket streaming).\n" +
        "- Autonomous inbound sales qualification and CRM contact synchronization.\n" +
        "- Enterprise RAG document intelligence with hybrid vector search and zero hallucinations.\n\n" +
        "Typical delivery ranges from 2 to 6 weeks. What business workflow or customer communication channel are you aiming to empower with AI?";
    }
    // 5. Leadership & Team inquiry
    else if (lower.includes("who") || lower.includes("ceo") || lower.includes("team") || lower.includes("founder")) {
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        "IMPACT Technologies is led by:\n" +
        "- Muhammad Zaryab Hassan — Chief Executive Officer (CEO): Leading vision, AI strategy, and client partnerships.\n" +
        "- Mahad Aziz — Chief Growth Officer (CGO): Driving market expansion and commercial growth.\n" +
        "- Muhammad Ismail — Chief Financial Officer (CFO): Overseeing financial strategy and capital allocation.\n" +
        "- Ansar Abbas Jafri — Branch Manager: Managing regional operations and project delivery (+92 333 6457747).\n\n" +
        "Our engineering operates under 6 core pillars, leading with Problem-First and Real-World Impact.";
    }
    // 6. Out-of-scope / Unrelated inquiries
    else if (
      lower.includes("weather") ||
      lower.includes("medicine") ||
      lower.includes("doctor") ||
      lower.includes("crypto") ||
      lower.includes("recipe")
    ) {
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        "I am specialized exclusively as the AI Sales & Solutions Consultant for IMPACT Enterprise. I cannot assist with medical, cryptocurrency trading, or unrelated topics. However, I can help you with AI intelligent agents, workflow automations, custom software development, or scheduling a technical consultation.";
    }
    // 7. General consultative response
    else {
      content =
        "[DEVELOPMENT MOCK: Gemini AI Engine]\n" +
        "Welcome to IMPACT Enterprise. We engineer AI intelligent agents, workflow automations, and custom full-stack software that turn ideas into measurable business impact.\n\n" +
        "To help me recommend the right architectural approach for your business, could you tell me a bit about your company and the core challenge or workflow you want to address?";
    }

    return {
      content,
      model,
      isMock: true,
      toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
      tokenUsage: {
        promptTokens: 120,
        completionTokens: 85,
        totalTokens: 205,
      },
    };
  }
}

export const geminiClient = new GeminiClient();
