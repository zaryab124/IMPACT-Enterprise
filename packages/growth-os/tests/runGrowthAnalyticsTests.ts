/**
 * IMPACT Growth OS — Phase 14 Growth Analytics Verification Tests
 * Verifies all 4 analytical domains (Social Media, Leads, Sales, AI Operations),
 * date range filtering, and strict metric transparency (definition, time period, source).
 */

import { db } from "../../database";
import { GrowthAnalyticsService } from "../analytics/growthAnalyticsService";

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

export async function runGrowthAnalyticsTests() {
  console.log("\n=======================================================");
  console.log("  IMPACT GROWTH OS — PHASE 14 GROWTH ANALYTICS TESTS");
  console.log("=======================================================\n");

  await db.query("SELECT 1;");

  // Test 1: Complete 4-Domain Report Generation
  await test("Growth Report: Generates All 4 Domains (Social, Leads, Sales, AI)", async () => {
    const report = await GrowthAnalyticsService.getGrowthReport({ timeRange: "30d" });

    assert(Boolean(report.social), "Social domain must be present");
    assert(Boolean(report.leads), "Leads domain must be present");
    assert(Boolean(report.sales), "Sales domain must be present");
    assert(Boolean(report.ai), "AI domain must be present");
  });

  // Test 2: Strict Metric Transparency Triad Enforcement
  await test("Metric Transparency: Every Metric Has Definition, Time Period, and Source", async () => {
    const report = await GrowthAnalyticsService.getGrowthReport({ timeRange: "30d" });

    const metricsToCheck = [
      report.social.posts,
      report.social.reach,
      report.social.engagement,
      report.social.clicks,
      report.social.follower_changes,
      report.leads.total_leads,
      report.leads.qualified_leads,
      report.leads.lead_response_time_minutes,
      report.sales.pipeline_value,
      report.sales.active_deals,
      report.sales.won_deals,
      report.sales.won_revenue,
      report.sales.lost_deals,
      report.sales.average_deal_value,
      report.sales.sales_cycle_duration_days,
      report.ai.ai_generated_content,
      report.ai.approved_content,
      report.ai.rejected_content,
      report.ai.ai_qualified_leads,
      report.ai.human_overrides,
      report.ai.ai_follow_ups,
    ];

    for (const m of metricsToCheck) {
      assert(Boolean(m.definition) && m.definition.length > 5, `Missing or invalid definition: ${JSON.stringify(m)}`);
      assert(Boolean(m.time_period) && m.time_period.includes("30d"), `Missing or invalid time_period: ${JSON.stringify(m)}`);
      assert(Boolean(m.source) && m.source.length > 3, `Missing or invalid database source: ${JSON.stringify(m)}`);
      assert(Boolean(m.display), `Missing display value: ${JSON.stringify(m)}`);
    }
  });

  // Test 3: Date Range Filtering (7d vs 90d vs all)
  await test("Date Range Filtering: Bounds Adjust Correctly Across Periods", async () => {
    const r7 = await GrowthAnalyticsService.getGrowthReport({ timeRange: "7d" });
    const r90 = await GrowthAnalyticsService.getGrowthReport({ timeRange: "90d" });
    const rAll = await GrowthAnalyticsService.getGrowthReport({ timeRange: "all" });

    assert(r7.time_range === "7d", "7d filter recorded");
    assert(r90.time_range === "90d", "90d filter recorded");
    assert(rAll.time_range === "all", "all filter recorded");

    assert(r7.social.posts.time_period.includes("7d"), "7d reflected in metric metadata");
    assert(r90.social.posts.time_period.includes("90d"), "90d reflected in metric metadata");
  });

  // Test 4: Leads Domain Breakdowns (Source, Campaign, Service)
  await test("Leads Telemetry: Categorized by Source, Campaign, and 9 Services", async () => {
    const report = await GrowthAnalyticsService.getGrowthReport({ timeRange: "all" });

    assert(typeof report.leads.leads_by_source.breakdown === "object", "Source breakdown must be object");
    assert(typeof report.leads.leads_by_campaign.breakdown === "object", "Campaign breakdown must be object");
    assert(typeof report.leads.leads_by_service.breakdown === "object", "Service breakdown must be object");

    assert(report.leads.leads_by_source.source.includes("leads table"), "Verified database source");
    assert(report.leads.leads_by_service.source.includes("leads table"), "Verified database source");
  });

  // Test 5: Sales Revenue Anti-Fabrication Rule
  await test("Sales Telemetry: Realized Revenue Enforces Non-Fabrication Rule", async () => {
    const report = await GrowthAnalyticsService.getGrowthReport({ timeRange: "all" });
    const wonRev = report.sales.won_revenue;

    if (wonRev.value === null) {
      assert(wonRev.display === "Unknown", `Unentered revenue must display 'Unknown', got '${wonRev.display}'`);
    } else {
      assert(wonRev.display.startsWith("$"), `Entered revenue must format as currency, got '${wonRev.display}'`);
    }
  });

  console.log("\n-------------------------------------------------------");
  console.log(`Total Phase 14 Tests: ${results.length} | Passed: ${results.filter((r) => r.passed).length} | Failed: ${results.filter((r) => !r.passed).length}`);
  console.log("-------------------------------------------------------\n");

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runGrowthAnalyticsTests().catch((err) => {
    console.error("FATAL:", err);
    process.exit(1);
  });
}
