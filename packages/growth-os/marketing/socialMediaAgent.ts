/**
 * IMPACT Growth OS — AI Social Media Content Agent (Phase 5)
 * Autonomous generation of multi-channel social copy grounded in the 9 IMPACT services.
 * Strictly outputs posts in PENDING_APPROVAL status for human review.
 */

import { GoogleGenAI } from "@google/genai";
import { db } from "../../database";
import { logger } from "../../logging/logger";
import { CORE_SERVICES, IMPACT_SERVICES } from "../constants";
import { PublishingService } from "../publishing/publishingService";
import { BrandConsistencyChecker } from "./brandConsistencyChecker";
import {
  ContentCapability,
  ContentPost,
  GeneratePostRequest,
  GeneratedPostContent,
  MarketingGoal,
  PostFormat,
  SocialPlatform,
} from "./types";

export class SocialMediaAgent {
  private static defaultModel = "gemini-2.5-flash";

  /**
   * Generates a fully structured social post and saves it to the database with status = 'PENDING_APPROVAL'
   */
  public static async generateAndSavePost(
    request: GeneratePostRequest,
    userId?: string
  ): Promise<ContentPost> {
    const generated = await this.generatePostContent(request);

    const res = await db.query<ContentPost>(
      `INSERT INTO content_posts (
        title,
        content,
        target_platforms,
        platform,
        format,
        objective,
        hook,
        cta,
        hashtags,
        visual_brief,
        target_audience,
        service,
        campaign,
        post_type,
        status,
        brand_check,
        ai_model,
        ai_prompt,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *;`,
      [
        generated.title,
        generated.content,
        JSON.stringify([generated.platform]),
        generated.platform,
        generated.format,
        generated.objective,
        generated.hook,
        generated.cta,
        JSON.stringify(generated.hashtags),
        generated.visual_brief,
        generated.target_audience,
        generated.service,
        generated.campaign,
        "social_post",
        "PENDING_APPROVAL", // Mandatory Human Review Gate
        JSON.stringify(generated.brand_check),
        generated.ai_model,
        request.customPrompt || `Generated with ${request.capability} targeting ${request.goal}`,
        userId || null,
      ]
    );

    const post = res.rows[0];
    logger.info(`Generated social post [${post.id}] with status PENDING_APPROVAL`, {
      module: "SocialMediaAgent",
      platform: post.platform,
      service: post.service,
    });

    return post;
  }

  /**
   * Generates tailored social posts for all social accounts currently linked with the AI Agent
   */
  public static async generatePostsForLinkedAccounts(
    request: Omit<GeneratePostRequest, "platform"> & { platforms?: SocialPlatform[] },
    userId?: string
  ): Promise<ContentPost[]> {
    const linkedAccounts = await PublishingService.getLinkedAccountsForAiAgent();
    
    // If specific platforms are requested, filter by those; otherwise use all linked platforms
    const targetPlatforms: SocialPlatform[] = request.platforms && request.platforms.length > 0
      ? request.platforms
      : Array.from(new Set(linkedAccounts.map((a) => a.platform as SocialPlatform)));

    // Fallback to linkedin if no accounts are linked yet
    const finalPlatforms: SocialPlatform[] = targetPlatforms.length > 0 ? targetPlatforms : ["linkedin"];

    const posts: ContentPost[] = [];
    for (const platform of finalPlatforms) {
      const post = await this.generateAndSavePost(
        {
          ...request,
          platform,
          format: request.format || (platform === "twitter" ? "thread" : "post"),
        },
        userId
      );
      posts.push(post);
    }

    logger.info(`AI Agent generated ${posts.length} multi-channel posts for linked accounts`, {
      module: "SocialMediaAgent",
      platforms: finalPlatforms,
    });

    return posts;
  }

  /**
   * Generates structured post copy using Gemini API or consultative knowledge fallback
   */
  public static async generatePostContent(
    request: GeneratePostRequest
  ): Promise<GeneratedPostContent> {
    const serviceName = this.resolveService(request.serviceInterest);
    const serviceDef = CORE_SERVICES.find((s) => s.name === serviceName) || CORE_SERVICES[0];
    const platform = request.platform || "linkedin";
    const format = request.format || (platform === "twitter" ? "thread" : "post");
    const goal = request.goal || "EDUCATION";
    const capability = request.capability || "thought_leadership";
    const audience = request.targetAudience || "Enterprise Technical Leaders & Operations Directors";
    const campaign = request.campaignName || "General Brand Awareness";

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("your-gemini-api-key")) {
      try {
        const client = new GoogleGenAI({ apiKey });
        const prompt = `
You are IMPACT AI, elite Social Media & Technical Marketing Strategist for IMPACT Enterprise.
Brand Positioning: IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT
Official Service to highlight: "${serviceDef.name}" (${serviceDef.description})
Content Capability: ${capability}
Marketing Goal: ${goal}
Target Platform: ${platform}
Format: ${format}
Target Audience: ${audience}
Campaign: ${campaign}
${request.customPrompt ? `Additional instructions: ${request.customPrompt}` : ""}

STRICT ANTI-HALLUCINATION RULES:
1. Do NOT invent fake company names or client logos.
2. Do NOT invent fake percentage ROI metrics like "3000% ROI".
3. Ground technical capabilities strictly in: ${serviceDef.name} by IMPACT Enterprise.
4. Output ONLY valid JSON matching this exact structure:
{
  "title": "Short internal title",
  "hook": "Grabbing first line tailored to ${platform}",
  "content": "Full post body tailored to ${platform} formatting with line breaks",
  "cta": "Direct actionable enterprise call to action",
  "hashtags": ["EnterpriseAI", "Automation", "IMPACTEnterprise"],
  "visual_brief": "Description of accompanying high-contrast technical graphic or diagram"
}
`;

        const response = await client.models.generateContent({
          model: this.defaultModel,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const text = response.text || "{}";
        const parsed = JSON.parse(text);

        const brandCheck = BrandConsistencyChecker.check(
          parsed.content || "",
          serviceDef.name,
          parsed.hook,
          parsed.cta
        );

        return {
          title: parsed.title || `${serviceDef.name} — ${capability.replace(/_/g, " ")}`,
          platform,
          format,
          objective: goal,
          hook: parsed.hook || `How enterprise leaders scale with ${serviceDef.name}:`,
          content: parsed.content || `${serviceDef.name} empowers organizations to move from manual operations to autonomous execution.`,
          cta: parsed.cta || "Discover how IMPACT Enterprise architects custom AI solutions for your workflow.",
          hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ["EnterpriseAI", "IMPACTEnterprise"],
          visual_brief: parsed.visual_brief || "Clean minimal architecture diagram showing data flowing into intelligent automation pipelines.",
          target_audience: audience,
          service: serviceDef.name,
          campaign,
          brand_check: brandCheck,
          ai_model: this.defaultModel,
        };
      } catch (err: any) {
        logger.warn(`Gemini generation failed: ${err.message}. Using deterministic marketing engine.`, {
          module: "SocialMediaAgent",
        });
      }
    }

    // Deterministic fallback grounded strictly in the 9 IMPACT services
    return this.generateDeterministicPost(serviceDef, capability, goal, platform, format, audience, campaign);
  }

  private static generateDeterministicPost(
    serviceDef: typeof CORE_SERVICES[number],
    capability: ContentCapability,
    goal: MarketingGoal,
    platform: SocialPlatform,
    format: PostFormat,
    audience: string,
    campaign: string
  ): GeneratedPostContent {
    let hook = "";
    let content = "";
    let cta = "";
    let visualBrief = "";

    switch (capability) {
      case "service_spotlight":
        hook = `The enterprise imperative: transforming operations with ${serviceDef.name}.`;
        content = `${serviceDef.name} is not just another technology stack—it is the bridge between human intent and automated execution.\n\nAt IMPACT Enterprise, our philosophy is grounded in IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT.\n\n${serviceDef.description}\n\nBy unifying deterministic systems with cognitive AI agents, enterprise teams eliminate operational bottlenecks without sacrificing governance or reliability.`;
        cta = `Explore how IMPACT Enterprise engineers custom ${serviceDef.name} for your organization. Contact our technical team today.`;
        visualBrief = `Isometric system architecture diagram displaying data intake, neural orchestration, and verified API outputs.`;
        break;

      case "thought_leadership":
        hook = `Why modern enterprises must transition from reactive scripts to autonomous ${serviceDef.name}:`;
        content = `Traditional automation breaks the moment unstructured data enters the pipeline. The next phase of business computing requires cognitive intelligence built into every workflow.\n\n1. Deterministic precision where compliance matters\n2. AI agency where adaptability is required\n3. Continuous schema validation across every integration\n\nWhen you architect for resilience, automation becomes a compounding operational advantage.`;
        cta = `Read our technical blueprints on modern enterprise automation at IMPACT Enterprise.`;
        visualBrief = `High-contrast dark-mode typography card highlighting: "From Fragile Scripts to Resilient AI Architecture".`;
        break;

      case "educational_breakdown":
        hook = `Deep Dive: How ${serviceDef.name} works under the hood.`;
        content = `Breaking down the multi-stage pipeline powering enterprise-grade ${serviceDef.name}:\n\nStep 1: Ingestion & Normalization (Schema-driven validation)\nStep 2: Semantic Evaluation & Routing\nStep 3: Governed Tool Execution with explicit authorization\nStep 4: Immutable Audit & Telemetry Logging\n\nReliability is an engineering discipline, not an afterthought.`;
        cta = `Schedule a technical discovery session with our solutions architects.`;
        visualBrief = `4-step horizontal flowchart showing data ingestion, semantic analysis, execution, and audit trail.`;
        break;

      case "problem_solution_framework":
        hook = `The Problem: Fragmented back-office handoffs. The Solution: ${serviceDef.name}.`;
        content = `Most operational bottlenecks stem from the gap between data arrival and decision execution.\n\n${serviceDef.description}\n\nIMPACT Enterprise builds systems that close this gap permanently—delivering verifiable outcomes at enterprise scale.`;
        cta = `See how IMPACT Enterprise solves complex business workflows.`;
        visualBrief = `Split visual comparison: "Fragmented Manual Queues" vs "Unified Intelligent Execution".`;
        break;

      default:
        hook = `Engineering the future of enterprise software with ${serviceDef.name}.`;
        content = `${serviceDef.description}\n\nDriven by our core framework: IDEA → INTELLIGENCE → AUTOMATION → PRODUCT → IMPACT. Every implementation is grounded in zero-hallucination boundaries, rigorous schema contracts, and human-in-the-loop governance.`;
        cta = `Partner with IMPACT Enterprise for your AI and automation roadmap.`;
        visualBrief = `Clean enterprise badge featuring the IMPACT Enterprise logo and service category: ${serviceDef.category}.`;
        break;
    }

    const title = `${serviceDef.name} — ${capability.replace(/_/g, " ")}`;
    const brandCheck = BrandConsistencyChecker.check(content, serviceDef.name, hook, cta);

    return {
      title,
      platform,
      format,
      objective: goal,
      hook,
      content,
      cta,
      hashtags: ["EnterpriseAI", "IntelligentAutomation", "SoftwareEngineering", "IMPACTEnterprise"],
      visual_brief: visualBrief,
      target_audience: audience,
      service: serviceDef.name,
      campaign,
      brand_check: brandCheck,
      ai_model: "IMPACT-Consultative-Engine-v1",
    };
  }

  private static resolveService(serviceInterest?: string): string {
    if (!serviceInterest) return CORE_SERVICES[1].name; // Default: AI agents
    const match = IMPACT_SERVICES.find(
      (s) => s.toLowerCase() === serviceInterest.toLowerCase()
    );
    return match || CORE_SERVICES[1].name;
  }
}
