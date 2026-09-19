/**
 * IMPACT Growth OS — Phase 16 Master End-to-End Smoke Test Suite
 * Validates the two definitive operational engines of IMPACT Enterprise:
 *
 * FLOW A: Inbound Revenue Engine
 * Lead → CRM → AI Qualification → Assignment → Follow-up → Deal → Attribution → Analytics
 *
 * FLOW B: Autonomous Content Engine
 * Content Idea → AI Generation → Approval → Scheduling → Publishing → Analytics
 */

import { db } from "../../database";
import { LeadIntakeService } from "../crm/services/leadIntakeService";
import { LeadQualificationAgent } from "../crm/services/leadQualificationAgent";
import { LeadFollowupAgent } from "../sales/leadFollowupAgent";
import { AutomationEngine } from "../automation/automationEngine";
import { CampaignFunnelService } from "../marketing/campaignFunnelService";
import { GrowthAnalyticsService } from "../analytics/growthAnalyticsService";
import { SocialMediaAgent } from "../marketing/socialMediaAgent";
import { SimulatedPublisher } from "../marketing/simulatedPublisher";

interface StepResult {
  step: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const stepResults: StepResult[] = [];

async function step(name: string, fn: () => Promise<void>) {
  process.stdout.write(`  ▶ [E2E STEP] ${name}... `);
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    stepResults.push({ step: name, passed: true, durationMs });
    console.log(`PASS (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    stepResults.push({ step: name, passed: false, error: err.message, durationMs });
    console.log(`FAIL (${durationMs}ms)`);
    console.error(`    Error: ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

export async function runMasterEndToEndTests() {
  console.log("\n=======================================================");
  console.log("  IMPACT GROWTH OS — PHASE 16 MASTER END-TO-END SUITE");
  console.log("=======================================================\n");

  await db.query("SELECT 1;");
  await AutomationEngine.initializeDefaultRules();

  // ==============================================================================
  // FLOW A: THE INBOUND REVENUE ENGINE
  // Lead → CRM → AI Qualification → Assignment → Follow-up → Deal → Attribution → Analytics
  // ==============================================================================
  console.log("--- STARTING FLOW A: THE INBOUND REVENUE ENGINE ---");

  let leadId = "";
  let campaignId = "";
  let dealId = "";
  let followupId = "";

  // Step A1: Campaign Creation
  await step("Flow A.1: Campaign Setup Grounded in 9 Official Services", async () => {
    const campaign = await CampaignFunnelService.createCampaign({
      name: "Global Enterprise AI Agent Launch",
      objective: "LEAD_GENERATION",
      service: "AI agents",
      target_audience: "Enterprise Heads of Digital Transformation",
      budget: 25000,
      platforms: ["linkedin"],
      landing_page: "https://impact-enterprise.vercel.app/services/ai-agents",
      lead_source: "campaign",
      content: "Autonomous multi-agent workflows executing end-to-end business operations.",
    });

    assert(Boolean(campaign.id), "Campaign must be created");
    campaignId = campaign.id;
  });

  // Step A2: Lead Intake & CRM Normalization
  await step("Flow A.2: Inbound Lead Intake & Attribution Ingestion", async () => {
    const intake = await LeadIntakeService.ingestLead({
      first_name: "Alexander",
      last_name: "Sterling",
      email: "alexander.sterling@vanguard-holdings.co",
      phone: "+1-415-555-8822",
      company: "Vanguard Global Holdings",
      job_title: "Chief Information Officer",
      source: "campaign",
      campaign: "Global Enterprise AI Agent Launch",
      service_interest: "AI agents",
      problem_statement: "Deploying autonomous customer triage and supply chain escalation agents.",
      budget_range: "$50,000 - $100,000",
      timeline: "Q4 2026",
    });

    assert(intake.success === true, "Lead intake must succeed");
    assert(Boolean(intake.leadId), "Lead ID must be generated");
    leadId = intake.leadId;

    await CampaignFunnelService.recordFunnelEvent(campaignId, "CLICK");
    await CampaignFunnelService.recordFunnelEvent(campaignId, "LEAD_CREATED", leadId);
  });

  // Step A3: Automation Engine Event (NEW_LEAD)
  await step("Flow A.3: Automation Engine Dispatches NEW_LEAD Pipeline", async () => {
    const logs = await AutomationEngine.triggerEvent(
      "NEW_LEAD",
      "lead",
      leadId,
      { source: "campaign", _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "NEW_LEAD automation must succeed");
  });

  // Step A4: AI Qualification Evaluation & Historical Audit
  await step("Flow A.4: AI Qualification Agent Analyzes 8 Dimensions", async () => {
    const qual = await LeadQualificationAgent.qualifyLead(leadId);

    assert(qual.leadScore >= 70, `Expected score >= 70, got ${qual.leadScore}`);
    assert(qual.qualificationStatus === "HIGH_INTENT" || qual.qualificationStatus === "QUALIFIED", "Lead must be qualified");
    assert(Boolean(qual.reasoningSummary), "Reasoning summary must be present");
    assert(Boolean(qual.recommendedNextAction), "Next action must be present");

    await CampaignFunnelService.recordFunnelEvent(campaignId, "LEAD_QUALIFIED", leadId);
  });

  // Step A5: AI Follow-up Drafting & Human Review Gate
  await step("Flow A.5: AI Follow-up Agent Drafts Message & Reviewer Authorizes", async () => {
    const draft = await LeadFollowupAgent.draftFollowup(leadId, "email");

    assert(draft.status === "draft", "Follow-up must strictly start in 'draft' status");
    assert(!draft.body.includes("100% guarantee"), "Guardrails must block guarantees");
    followupId = draft.messageId;

    // Human Authorization Gate
    const userRes = await db.query(`SELECT id FROM users LIMIT 1;`);
    const reviewerId = userRes.rows[0]?.id || null;
    const sentResult = await LeadFollowupAgent.sendFollowup(followupId, reviewerId);
    assert(sentResult.success === true, "sendFollowup must report success");

    const messageInDb = await db.query(`SELECT status FROM crm_messages WHERE id = $1`, [followupId]);
    assert(messageInDb.rows[0].status === "sent", "Follow-up must transition to 'sent' in database");
  });

  // Step A6: Commercial Opportunity Deal Creation
  await step("Flow A.6: Salesperson Creates Commercial Deal in CRM", async () => {
    const pipelinesRes = await db.query("SELECT id FROM crm_pipelines LIMIT 1");
    const stagesRes = await db.query("SELECT id FROM crm_pipeline_stages LIMIT 1");

    const dealRes = await db.query(
      `INSERT INTO crm_deals (
        title, pipeline_id, stage_id, lead_id, amount, status, service_interest
      ) VALUES ($1, $2, $3, $4, $5, 'open', $6)
      RETURNING *;`,
      [
        "Vanguard Global Autonomous Agent Framework",
        pipelinesRes.rows[0].id,
        stagesRes.rows[0].id,
        leadId,
        48000.0,
        "AI agents",
      ]
    );

    assert(dealRes.rows.length === 1, "Deal must be created");
    dealId = dealRes.rows[0].id;

    await CampaignFunnelService.recordFunnelEvent(campaignId, "DEAL_CREATED", dealId);
  });

  // Step A7: Deal Won & Onboarding Trigger
  await step("Flow A.7: Deal Won → Triggers DEAL_WON Automation Pipeline", async () => {
    await db.query(
      `UPDATE crm_deals 
       SET status = 'won', actual_close_date = NOW(), updated_at = NOW() 
       WHERE id = $1;`,
      [dealId]
    );

    const logs = await AutomationEngine.triggerEvent(
      "DEAL_WON",
      "deal",
      dealId,
      { status: "won", _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "DEAL_WON automation must succeed");
    await CampaignFunnelService.recordFunnelEvent(campaignId, "DEAL_WON", dealId, {
      amount: 48000,
    });
  });

  // Step A8: Campaign Attribution & Non-Fabrication Revenue Verification
  await step("Flow A.8: Full Funnel Attribution Confirms Realized Revenue ($48,000)", async () => {
    const metrics = await CampaignFunnelService.getCampaignFunnelMetrics(campaignId);

    assert(metrics.leads >= 1, "At least 1 lead attributed");
    assert(metrics.qualified_leads >= 1, "At least 1 qualified lead");
    assert(metrics.deals >= 1, "At least 1 deal");
    assert(metrics.won_deals >= 1, "At least 1 won deal");
    assert(metrics.revenue.is_unknown === false, "Revenue must be verified");
    assert(metrics.revenue.amount === 48000, `Expected 48000, got ${metrics.revenue.amount}`);
    assert(metrics.revenue.display.includes("48,000"), `Display must show $48,000, got ${metrics.revenue.display}`);
  });

  // Step A9: Growth Analytics Real-time Telemetry Verification
  await step("Flow A.9: Growth Analytics Reflects Verified Revenue & Lead Pipeline", async () => {
    const report = await GrowthAnalyticsService.getGrowthReport({ timeRange: "all" });

    assert(report.leads.total_leads.value >= 1, "Leads reflected in analytics");
    assert(report.sales.won_deals.value >= 1, "Won deals reflected in analytics");
    assert(report.sales.won_revenue.value !== null && report.sales.won_revenue.value >= 48000, "Won revenue verified in analytics");
    assert(report.sales.won_revenue.display.includes("48,000"), "Display verified");
  });

  // ==============================================================================
  // FLOW B: THE AUTONOMOUS CONTENT ENGINE
  // Content Idea → AI Generation → Approval → Scheduling → Publishing → Analytics
  // ==============================================================================
  console.log("\n--- STARTING FLOW B: THE AUTONOMOUS CONTENT ENGINE ---");

  let postId = "";

  // Step B1: AI Content Generation Grounded in 9 Services
  await step("Flow B.1: AI Social Media Agent Generates Grounded Post", async () => {
    const post = await SocialMediaAgent.generateAndSavePost({
      capability: "thought_leadership",
      platform: "linkedin",
      format: "post",
      goal: "AUTHORITY",
      serviceInterest: "AI automation",
      targetAudience: "Operations Executives",
    });

    assert(Boolean(post.id), "Post must be generated");
    assert(post.status === "PENDING_APPROVAL", "Post must strictly start at PENDING_APPROVAL");
    assert(Boolean(post.hook), "Post hook must be present");
    assert(Boolean(post.cta), "Post CTA must be present");
    assert(post.hashtags.length >= 2, "Post hashtags must be present");
    postId = post.id;
  });

  // Step B2: Editorial Human Review & Approval Gate
  await step("Flow B.2: Editorial Reviewer Approves Content Post", async () => {
    const userRes = await db.query(`SELECT id FROM users LIMIT 1;`);
    const reviewerId = userRes.rows[0]?.id || null;
    const approvedPost = await SimulatedPublisher.approvePost(postId, reviewerId);
    assert(approvedPost.status === "APPROVED", "Post must transition to APPROVED");
  });

  // Step B3: Content Scheduling via Automation Engine
  await step("Flow B.3: APPROVED_CONTENT Automation Schedules Publishing", async () => {
    const logs = await AutomationEngine.triggerEvent(
      "APPROVED_CONTENT",
      "post",
      postId,
      { status: "APPROVED", _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "Scheduling automation must succeed");
    const updatedPost = await db.query(`SELECT status FROM content_posts WHERE id = $1`, [postId]);
    assert(updatedPost.rows[0].status === "SCHEDULED", "Post must transition to SCHEDULED");
  });

  // Step B4: Publishing Execution & Idempotent Log Verification
  await step("Flow B.4: Platform Adapter Dispatches Post & Records Publication", async () => {
    const logs = await AutomationEngine.triggerEvent(
      "PUBLISHED_CONTENT",
      "post",
      postId,
      { status: "PUBLISHED", platform: "linkedin", _force: true }
    );

    assert(logs.some((l) => l.status === "SUCCESS"), "Publication automation must succeed");

    const updatedPost = await db.query(`SELECT status FROM content_posts WHERE id = $1`, [postId]);
    assert(updatedPost.rows[0].status === "PUBLISHED", "Post must transition to PUBLISHED");

    const pubLog = await db.query(`SELECT * FROM content_publish_logs WHERE post_id = $1`, [postId]);
    assert(pubLog.rows.length >= 1, "Content publish log must be recorded");
  });

  // Step B5: Analytics Telemetry Verifies Published Content
  await step("Flow B.5: Growth Analytics Reflects Published Content & Reach", async () => {
    const report = await GrowthAnalyticsService.getGrowthReport({ timeRange: "all" });

    assert(report.social.posts.value >= 1, "Published posts reflected in analytics");
    assert(report.ai.approved_content.value >= 1, "Approved content reflected in AI operations");
    assert(report.social.reach.value >= 1250, "Content reach verified in analytics");
  });

  console.log("\n=======================================================");
  console.log(`Total Master E2E Steps: ${stepResults.length} | Passed: ${stepResults.filter((r) => r.passed).length} | Failed: ${stepResults.filter((r) => !r.passed).length}`);
  console.log("=======================================================\n");

  const failed = stepResults.filter((r) => !r.passed);
  if (failed.length > 0) {
    console.error("FATAL: Master End-to-End Suite Failed!");
    process.exit(1);
  }

  console.log("🎉 ALL DUAL END-TO-END FLOWS (REVENUE & CONTENT) PASSED WITH 100% RELIABILITY!");
}

if (require.main === module) {
  runMasterEndToEndTests().catch((err) => {
    console.error("FATAL:", err);
    process.exit(1);
  });
}
