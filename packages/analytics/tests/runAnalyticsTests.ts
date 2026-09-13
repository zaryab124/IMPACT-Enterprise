import { db } from "../../database";
import { migrator } from "../../database/migrator";
import { seedDevelopmentDatabase } from "../../database/seed";
import { userRepository } from "../../database/repositories/userRepository";
import { analyticsService } from "../analyticsService";
import { escapeCsvField, buildCsvExport } from "../exporters/csvExporter";
import { GET as getAnalyticsHandler } from "../../../app/api/admin/analytics/route";
import { GET as getExportHandler } from "../../../app/api/admin/analytics/export/route";
import { generateToken } from "../../auth/jwt";
import { NextRequest } from "next/server";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const report: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  process.stdout.write(`  ▶ Running test: ${name}... `);
  const start = Date.now();
  try {
    await fn();
    const durationMs = Date.now() - start;
    console.log(`\x1b[32mPASS\x1b[0m (${durationMs}ms)`);
    report.push({ name, passed: true, durationMs });
  } catch (err: any) {
    const durationMs = Date.now() - start;
    console.log(`\x1b[31mFAIL\x1b[0m (${durationMs}ms)`);
    console.error(`    \x1b[31mError:\x1b[0m ${err.message}`);
    report.push({ name, passed: false, error: err.message, durationMs });
  }
}

export async function runAllAnalyticsTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 13 ANALYTICS & TELEMETRY SUITE");
  console.log("=======================================================\n");

  // 1. Database & System Readiness Check
  await runTest("Database & System Readiness Check", async () => {
    await migrator.migrateUp();
    await seedDevelopmentDatabase();
    const res = await db.query("SELECT 1 as healthy;");
    if (!res.rows[0]?.healthy) {
      throw new Error("Database health query failed");
    }
  });

  // 2. Channel Breakdown Aggregation & Metrics Arithmetic
  await runTest("Channel Breakdown Aggregation & Metrics Arithmetic", async () => {
    const channels = await analyticsService.getChannelBreakdown(null);

    if (!Array.isArray(channels) || channels.length !== 4) {
      throw new Error(`Expected 4 standard channels, got ${channels?.length}`);
    }

    const expectedChannels = ["web_chat", "whatsapp", "email", "phone"];
    for (const ec of expectedChannels) {
      const found = channels.find((c) => c.channel === ec);
      if (!found) {
        throw new Error(`Missing expected channel: ${ec}`);
      }
      if (typeof found.conversationCount !== "number" || found.conversationCount < 0) {
        throw new Error(`Invalid conversationCount for channel ${ec}`);
      }
      if (typeof found.leadCount !== "number" || found.leadCount < 0) {
        throw new Error(`Invalid leadCount for channel ${ec}`);
      }
      if (found.conversionRate < 0 || found.conversionRate > 100) {
        throw new Error(`Invalid conversionRate ${found.conversionRate} for channel ${ec}`);
      }
    }

    // Check sum of percentages is close to 100% (allowing small rounding difference) or 0
    const totalPercentage = channels.reduce((sum, c) => sum + c.percentageOfTotal, 0);
    if (totalPercentage > 0 && (totalPercentage < 95 || totalPercentage > 105)) {
      throw new Error(`Channel percentages should sum to ~100%, got ${totalPercentage}%`);
    }
  });

  // 3. Multi-Stage Conversion Funnel Evaluation
  await runTest("Multi-Stage Conversion Funnel Evaluation", async () => {
    const funnel = await analyticsService.getFunnelMetrics(null);

    if (!funnel || !Array.isArray(funnel.stages)) {
      throw new Error("Missing funnel or stages array");
    }

    if (funnel.stages.length !== 6) {
      throw new Error(`Expected 6 funnel stages, got ${funnel.stages.length}`);
    }

    const stageIds = funnel.stages.map((s) => s.id);
    const expectedStages = [
      "interactions",
      "leads_captured",
      "contacted",
      "qualified",
      "proposal",
      "won",
    ];

    for (let i = 0; i < expectedStages.length; i++) {
      if (stageIds[i] !== expectedStages[i]) {
        throw new Error(`Stage ${i} should be ${expectedStages[i]}, got ${stageIds[i]}`);
      }
    }

    // Validate arithmetic: overall conversion rate should equal (totalWon / totalInbound) * 100
    if (funnel.totalInbound > 0) {
      const expectedOverall = Math.round((funnel.totalWon / funnel.totalInbound) * 1000) / 10;
      if (funnel.overallConversionRate !== expectedOverall) {
        throw new Error(
          `Overall conversion rate mismatch: expected ${expectedOverall}%, got ${funnel.overallConversionRate}%`
        );
      }
    }
  });

  // 4. SLA Metrics Calculation
  await runTest("SLA Metrics Calculation (AI Response, Handoff & Omnichannel)", async () => {
    const sla = await analyticsService.getSLAMetrics(null);

    if (sla.aiFirstResponseTimeAvgMs <= 0) {
      throw new Error(`AI response time average should be positive, got ${sla.aiFirstResponseTimeAvgMs}`);
    }

    if (sla.aiFirstResponseTimeP95Ms < sla.aiFirstResponseTimeAvgMs) {
      throw new Error(
        `P95 latency (${sla.aiFirstResponseTimeP95Ms}ms) should be >= average (${sla.aiFirstResponseTimeAvgMs}ms)`
      );
    }

    if (sla.humanHandoffPickupAvgSec <= 0) {
      throw new Error(`Human handoff pickup time should be positive, got ${sla.humanHandoffPickupAvgSec}`);
    }

    if (sla.omnichannelDeliveryRate < 0 || sla.omnichannelDeliveryRate > 100) {
      throw new Error(`Omnichannel delivery rate must be 0-100%, got ${sla.omnichannelDeliveryRate}%`);
    }

    if (sla.omnichannelAvgDeliverySec < 0) {
      throw new Error(`Omnichannel delivery latency should be >= 0, got ${sla.omnichannelAvgDeliverySec}`);
    }
  });

  // 5. Multi-Day Volume Trends Aggregation
  await runTest("Multi-Day Volume Trends Aggregation", async () => {
    const trends7d = await analyticsService.getTrends(7);
    if (!Array.isArray(trends7d) || trends7d.length !== 7) {
      throw new Error(`Expected 7 daily trend points for 7d, got ${trends7d?.length}`);
    }

    for (const point of trends7d) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(point.date)) {
        throw new Error(`Invalid date format in trend point: ${point.date}`);
      }
      if (typeof point.conversations !== "number" || typeof point.leads !== "number") {
        throw new Error(`Invalid metric types in trend point: ${JSON.stringify(point)}`);
      }
    }
  });

  // 6. RFC 4180 CSV Exporter Engine & Escaping Rules
  await runTest("RFC 4180 CSV Exporter Engine & Escaping Rules", async () => {
    // Test RFC 4180 field escaping
    const plain = escapeCsvField("SimpleText");
    if (plain !== "SimpleText") throw new Error(`Expected SimpleText, got ${plain}`);

    const withComma = escapeCsvField("IMPACT, Enterprise");
    if (withComma !== '"IMPACT, Enterprise"') throw new Error(`Comma escaping failed: ${withComma}`);

    const withQuotes = escapeCsvField('He said "Hello"');
    if (withQuotes !== '"He said ""Hello"""') throw new Error(`Quote escaping failed: ${withQuotes}`);

    const withNewline = escapeCsvField("Line 1\nLine 2");
    if (withNewline !== '"Line 1\nLine 2"') throw new Error(`Newline escaping failed: ${withNewline}`);

    // Test lead CSV export
    const sampleLeads = [
      {
        id: "test-lead-1",
        customer_name: "Sarah Connor",
        customer_email: "sarah@cyberdyne.com",
        stage: "QUALIFIED",
        score: 85,
        budget_range: "$50k - $100k",
        timeline: "1-2 months",
        decision_maker_status: "Decision Maker",
        problem_statement: "Need multi-channel AI agents with 24/7 uptime.",
        proposed_solution: "IMPACT Omnichannel Suite",
        created_at: new Date().toISOString(),
      },
    ];

    const leadCsv = buildCsvExport("leads", sampleLeads);
    if (leadCsv.rowCount !== 1) throw new Error(`Expected rowCount 1, got ${leadCsv.rowCount}`);
    if (!leadCsv.csv.includes("Lead ID,Customer Name,Customer Email")) {
      throw new Error("Missing expected headers in lead CSV");
    }
    if (!leadCsv.csv.includes("sarah@cyberdyne.com")) {
      throw new Error("Missing customer email in lead CSV row");
    }

    // Test voice CSV export
    const sampleVoice = [
      {
        id: "rec-1",
        voice_session_id: "sess-1",
        customer_name: "John Doe",
        customer_email: "john@doe.com",
        duration_seconds: 145,
        overall_sentiment: "POSITIVE",
        sentiment_score: 0.85,
        key_topics: ["Pricing", "Integrations"],
        action_items: [{ item: "Send proposal" }],
        created_at: new Date().toISOString(),
      },
    ];
    const voiceCsv = buildCsvExport("voice", sampleVoice);
    if (!voiceCsv.csv.includes("Pricing; Integrations")) {
      throw new Error("Missing semicolon-delimited topics in voice CSV");
    }
  });

  // 7. JSON Exporter Serialization & Schema Validity
  await runTest("JSON Exporter Serialization & Schema Validity", async () => {
    const exportResult = await analyticsService.generateExport("leads", "json", "all");

    if (exportResult.mimeType !== "application/json; charset=utf-8") {
      throw new Error(`Unexpected mimeType: ${exportResult.mimeType}`);
    }

    const parsed = JSON.parse(exportResult.content);
    if (parsed.exportType !== "leads") {
      throw new Error(`Expected exportType 'leads', got ${parsed.exportType}`);
    }
    if (!Array.isArray(parsed.data)) {
      throw new Error("Parsed export payload missing data array");
    }
    if (typeof parsed.totalRecords !== "number") {
      throw new Error("Parsed export payload missing totalRecords count");
    }
  });

  // 8. Full Analytics Service Aggregation (getFullAnalytics)
  await runTest("Full Analytics Service Aggregation (getFullAnalytics)", async () => {
    const summary = await analyticsService.getFullAnalytics("7d");

    if (summary.timeRange !== "7d") {
      throw new Error(`Expected timeRange '7d', got ${summary.timeRange}`);
    }
    if (!summary.generatedAt || isNaN(Date.parse(summary.generatedAt))) {
      throw new Error("Missing or invalid generatedAt timestamp");
    }
    if (typeof summary.totalInteractions !== "number") {
      throw new Error("Invalid totalInteractions");
    }
    if (!summary.channels || summary.channels.length !== 4) {
      throw new Error("Summary missing 4 channel breakdowns");
    }
    if (!summary.funnel || summary.funnel.stages.length !== 6) {
      throw new Error("Summary missing 6 funnel stages");
    }
    if (!summary.sla || typeof summary.sla.aiFirstResponseTimeAvgMs !== "number") {
      throw new Error("Summary missing SLA metrics");
    }
    if (!Array.isArray(summary.trends) || summary.trends.length !== 7) {
      throw new Error(`Expected 7 trend points for 7d, got ${summary.trends?.length}`);
    }
  });

  // 9. Admin Analytics REST API Endpoint Verification
  await runTest("Admin Analytics REST API Endpoint (Auth Gate & 200 Response)", async () => {
    // 1. Unauthenticated request -> should return 401
    const unauthReq = new NextRequest("http://localhost:3005/api/admin/analytics");
    const unauthRes = await getAnalyticsHandler(unauthReq);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized for unauthenticated request, got ${unauthRes.status}`);
    }

    // 2. Authenticated request with SUPER_ADMIN token -> should return 200 with complete analytics
    const adminUser = await userRepository.findByEmail("admin@impact.enterprise");
    if (!adminUser) throw new Error("Seeded admin user not found");

    const token = generateToken({
      userId: adminUser.id,
      email: adminUser.email,
      roles: adminUser.roles,
    });

    const authReq = new NextRequest("http://localhost:3005/api/admin/analytics?timeRange=30d", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const authRes = await getAnalyticsHandler(authReq);
    if (authRes.status !== 200) {
      throw new Error(`Expected 200 OK for authenticated request, got ${authRes.status}`);
    }

    const body = await authRes.json();
    if (!body.success || !body.analytics) {
      throw new Error("API response payload missing success: true or analytics object");
    }
    if (body.analytics.channels.length !== 4) {
      throw new Error("API response missing 4 channels breakdown");
    }
  });

  // 10. Admin Analytics Export REST API File Stream
  await runTest("Admin Analytics Export REST API (CSV & JSON Stream Verification)", async () => {
    const adminUser = await userRepository.findByEmail("admin@impact.enterprise");
    if (!adminUser) throw new Error("Seeded admin user not found");

    const token = generateToken({
      userId: adminUser.id,
      email: adminUser.email,
      roles: adminUser.roles,
    });

    // Seed test customer & lead for export verification
    const custRes = await db.query<{ id: string }>(`
      INSERT INTO customers (name, email, source)
      VALUES ('Export Test Lead', 'export@test.com', 'web_chat')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `);
    const custId = custRes.rows[0].id;
    await db.query(`
      INSERT INTO leads (customer_id, stage, score, problem_statement, budget_range)
      VALUES ($1, 'QUALIFIED', 80, 'Testing CSV export pipeline', '$50k - $100k');
    `, [custId]);

    // 1. Test CSV Download
    const csvReq = new NextRequest(
      "http://localhost:3005/api/admin/analytics/export?type=leads&format=csv&timeRange=all",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const csvRes = await getExportHandler(csvReq);
    if (csvRes.status !== 200) {
      throw new Error(`Expected 200 OK for CSV export, got ${csvRes.status}`);
    }

    const contentType = csvRes.headers.get("Content-Type");
    if (!contentType || !contentType.includes("text/csv")) {
      throw new Error(`Expected Content-Type text/csv, got ${contentType}`);
    }

    const contentDisposition = csvRes.headers.get("Content-Disposition");
    if (!contentDisposition || !contentDisposition.includes('attachment; filename="impact_leads_export_')) {
      throw new Error(`Invalid Content-Disposition: ${contentDisposition}`);
    }

    const csvText = await csvRes.text();
    if (!csvText.startsWith("Lead ID,Customer Name,Customer Email")) {
      throw new Error(`CSV payload missing expected header: ${csvText.substring(0, 50)}`);
    }

    // 2. Test JSON Download
    const jsonReq = new NextRequest(
      "http://localhost:3005/api/admin/analytics/export?type=voice&format=json&timeRange=all",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const jsonRes = await getExportHandler(jsonReq);
    if (jsonRes.status !== 200) {
      throw new Error(`Expected 200 OK for JSON export, got ${jsonRes.status}`);
    }

    const jsonType = jsonRes.headers.get("Content-Type");
    if (!jsonType || !jsonType.includes("application/json")) {
      throw new Error(`Expected Content-Type application/json, got ${jsonType}`);
    }

    const jsonBody = await jsonRes.json();
    if (jsonBody.exportType !== "voice" || !Array.isArray(jsonBody.data)) {
      throw new Error("JSON export response malformed");
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const failed = report.filter((r) => !r.passed);
  console.log(
    `Total Analytics Tests: ${report.length} | Passed: ${report.length - failed.length} | Failed: ${failed.length}`
  );
  console.log("-------------------------------------------------------\n");

  if (failed.length > 0) {
    console.error("FAILURES DETECTED IN ANALYTICS SUITE:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    return false;
  }

  console.log("\x1b[32mALL ANALYTICS & TELEMETRY TESTS PASSED!\x1b[0m\n");
  return true;
}

if (require.main === module) {
  runAllAnalyticsTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Fatal error during test run:", err);
      process.exit(1);
    });
}
