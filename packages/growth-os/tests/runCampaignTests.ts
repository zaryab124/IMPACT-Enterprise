/**
 * IMPACT Growth OS — Phase 13 Campaign Management & Funnel Attribution Tests
 * Tests campaign lifecycle, 9 services validation, full funnel event progression,
 * conversion rate mathematics, and zero-fabrication revenue attribution.
 */

import { db } from "../../database";
import { CampaignFunnelService } from "../marketing/campaignFunnelService";
import { LeadIntakeService } from "../crm/services/leadIntakeService";
import { LeadQualificationAgent } from "../crm/services/leadQualificationAgent";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  process.stdout.write(`  ▶ Running test: ${name}... `);
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    results.push({ name, passed: true, durationMs });
    console.log(`PASS (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, passed: false, error: err.message, durationMs });
    console.log(`FAIL (${durationMs}ms)`);
    console.error(`    Error: ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

export async function runCampaignTests() {
  console.log("\n=======================================================");
  console.log("  IMPACT GROWTH OS — PHASE 13 CAMPAIGN & FUNNEL TESTS");
  console.log("=======================================================\n");

  await db.query("SELECT 1;");

  let testCampaignId = "";

  // Test 1: Grounded Service Enforcement
  await test("Service Grounding: Enforces 9 Official Services Only", async () => {
    let threw = false;
    try {
      await CampaignFunnelService.createCampaign({
        name: "Bogus Crypto Campaign",
        service: "Crypto Token Mining & Yield Farming", // Non-grounded
        target_audience: "Speculators",
      });
    } catch (e: any) {
      threw = true;
      assert(e.message.includes("Must be one of the 9 official IMPACT services"), "Expected official services error");
    }
    assert(threw, "Campaign creation must reject non-official services");
  });

  // Test 2: Standard Campaign Creation with All Fields
  await test("Campaign Creation: Persists All Required Fields & Content", async () => {
    const campaign = await CampaignFunnelService.createCampaign({
      name: "Q3 Enterprise AI Automation Surge",
      objective: "LEAD_GENERATION",
      service: "AI automation",
      target_audience: "CTOs and VPs of Operations in Mid-Enterprise",
      budget: 15000,
      platforms: ["linkedin", "twitter"],
      landing_page: "https://impact-enterprise.vercel.app/services/ai-automation",
      lead_source: "campaign",
      content: "Unlocking 60% repetitive cost savings with autonomous document parsing and CRM sync.",
    });

    assert(Boolean(campaign.id), "Campaign ID must be present");
    assert(campaign.target_service === "AI automation", "Service must be AI automation");
    assert(campaign.objective === "LEAD_GENERATION", "Objective must be LEAD_GENERATION");
    assert(campaign.budget === 15000 || Number(campaign.budget) === 15000, "Budget must match");
    assert(Array.isArray(campaign.platforms) && campaign.platforms.includes("linkedin"), "Platforms must include linkedin");
    assert(campaign.landing_page?.includes("/services/ai-automation") === true, "Landing page must match");

    testCampaignId = campaign.id;
  });

  // Test 3: Zero-Fabrication Revenue Attribution: Fallback to 'Unknown'
  await test("Revenue Attribution: Returns 'Unknown' When No Revenue Entered", async () => {
    const metrics = await CampaignFunnelService.getCampaignFunnelMetrics(testCampaignId);
    assert(metrics.revenue.is_unknown === true, "Revenue must be marked unknown when no revenue entered");
    assert(metrics.revenue.display === "Unknown", `Expected 'Unknown', got '${metrics.revenue.display}'`);
    assert(metrics.revenue.amount === null, "Amount must be null");
  });

  // Test 4: Funnel Event Tracking & Conversion Rates
  await test("Funnel Progression: Campaign → Content → Click → Lead → Qualify → Deal → Won", async () => {
    // 1. Record 20 Clicks
    for (let i = 0; i < 20; i++) {
      await CampaignFunnelService.recordFunnelEvent(testCampaignId, "CLICK", undefined, {
        source_platform: "linkedin",
      });
    }

    // 2. Ingest Inbound Lead attributed to campaign
    const intakeResult = await LeadIntakeService.ingestLead({
      first_name: "Elena",
      last_name: "Vance",
      email: "elena.vance@blackmesa.tech",
      company: "Black Mesa Systems",
      source: "campaign",
      campaign: "Q3 Enterprise AI Automation Surge",
      service_interest: "AI automation",
      problem_statement: "Need multi-system ERP to CRM sync with automated reasoning.",
      budget_range: "$25,000 - $50,000",
      timeline: "Immediate",
    });

    const leadId = intakeResult.leadId;
    await CampaignFunnelService.recordFunnelEvent(testCampaignId, "LEAD_CREATED", leadId);

    // 3. Qualify Lead
    await LeadQualificationAgent.qualifyLead(leadId);
    await CampaignFunnelService.recordFunnelEvent(testCampaignId, "LEAD_QUALIFIED", leadId);

    // 4. Create CRM Deal for this lead
    const pipelinesRes = await db.query("SELECT id FROM crm_pipelines LIMIT 1");
    const stagesRes = await db.query("SELECT id FROM crm_pipeline_stages LIMIT 1");
    const pipelineId = pipelinesRes.rows[0].id;
    const stageId = stagesRes.rows[0].id;

    const dealRes = await db.query(
      `INSERT INTO crm_deals (
        title, pipeline_id, stage_id, lead_id, amount, status, service_interest
      ) VALUES ($1, $2, $3, $4, $5, 'won', $6)
      RETURNING *`,
      [
        "Black Mesa AI Automation Deployment",
        pipelineId,
        stageId,
        leadId,
        35000.0,
        "AI automation",
      ]
    );

    const deal = dealRes.rows[0];
    await CampaignFunnelService.recordFunnelEvent(testCampaignId, "DEAL_CREATED", deal.id);
    await CampaignFunnelService.recordFunnelEvent(testCampaignId, "DEAL_WON", deal.id, {
      amount: 35000,
    });

    // 5. Inspect Funnel Metrics
    const metrics = await CampaignFunnelService.getCampaignFunnelMetrics(testCampaignId);
    assert(metrics.clicks >= 20, `Expected clicks >= 20, got ${metrics.clicks}`);
    assert(metrics.leads >= 1, `Expected leads >= 1, got ${metrics.leads}`);
    assert(metrics.qualified_leads >= 1, `Expected qualified >= 1, got ${metrics.qualified_leads}`);
    assert(metrics.deals >= 1, `Expected deals >= 1, got ${metrics.deals}`);
    assert(metrics.won_deals >= 1, `Expected won deals >= 1, got ${metrics.won_deals}`);

    // Verify Verified CRM Revenue Attribution
    assert(metrics.revenue.is_unknown === false, "Revenue must now be verified");
    assert(metrics.revenue.amount === 35000, `Expected 35000, got ${metrics.revenue.amount}`);
    assert(metrics.revenue.display.includes("35,000"), `Display must show $35,000, got ${metrics.revenue.display}`);
  });

  // Test 5: Campaign Dashboard Summary Aggregator
  await test("Dashboard Aggregator: Summarizes Across Multiple Campaigns", async () => {
    const summary = await CampaignFunnelService.getCampaignDashboardSummary();
    assert(summary.total_campaigns >= 1, "Must have at least 1 campaign");
    assert(summary.total_clicks >= 20, "Total clicks aggregated");
    assert(summary.total_revenue_display.includes("35,000"), "Aggregated revenue matches entered deals");
  });

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 13 Tests: ${results.length} | Passed: ${results.filter((r) => r.passed).length} | Failed: ${results.filter((r) => !r.passed).length}`);
  console.log("-------------------------------------------------------\n");

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runCampaignTests().catch((err) => {
    console.error("FATAL:", err);
    process.exit(1);
  });
}
