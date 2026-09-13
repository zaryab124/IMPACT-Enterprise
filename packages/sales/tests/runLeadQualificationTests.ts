import { bantEngine } from "../bantEngine";
import { dealStageEngine } from "../dealStageEngine";
import { proposalEngine } from "../proposalEngine";



interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3005";

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    process.stdout.write(`  ▶ Running test: ${name}... `);
    await fn();
    const durationMs = Date.now() - start;
    console.log(`\x1b[32mPASS\x1b[0m (${durationMs}ms)`);
    results.push({ name, passed: true, durationMs });
  } catch (err: any) {
    const durationMs = Date.now() - start;
    console.log(`\x1b[31mFAIL\x1b[0m (${durationMs}ms)`);
    console.error(`    Error: ${err.message}`);
    results.push({ name, passed: false, error: err.message, durationMs });
  }
}

export async function runAllLeadQualificationTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 7 LEAD QUALIFICATION & SALES ENGINE");
  console.log("=======================================================\n");

  let adminToken = "";

  // 0. Database & System Readiness Check
  await runTest("System Health Check & Admin Authentication", async () => {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    if (healthRes.status !== 200) {
      throw new Error(`Health check returned HTTP ${healthRes.status}`);
    }
    const healthData = await healthRes.json();
    const dbStatus = typeof healthData.database === "string" ? healthData.database : healthData.database?.status;
    if (healthData.status !== "ok" || dbStatus !== "connected") {
      throw new Error(`System not ready: ${JSON.stringify(healthData)}`);
    }

    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bypass-rate-limit": "true" },
      body: JSON.stringify({
        email: "admin@impact.enterprise",
        password: "AdminPassword2026!",
      }),
    });

    if (loginRes.status !== 200) {
      const errBody = await loginRes.text();
      throw new Error(`Admin login failed: HTTP ${loginRes.status} — ${errBody}`);
    }
    const loginData = await loginRes.json();
    adminToken = loginData.token;
  });

  // 1. BANT Scoring Mathematics & Weighting Validation
  await runTest("BANT Scoring Matrix & Weighting Arithmetic", async () => {
    // Exact tier test: $50k budget (100), CEO (100), Voice AI Need (85), Immediate Timeline (100)
    // Formula: 85*0.3 + 100*0.25 + 100*0.25 + 100*0.2 = 25.5 + 25 + 25 + 20 = 95.5 -> 96
    const score = bantEngine.computeBantScore({
      name: "Enterprise Buyer",
      text: "I am the CEO at Global Logistics. We urgently need an AI voice agent for call center dispatch this month. We have allocated $60,000 budget.",
      problem: "Manual dispatch errors causing customer churn.",
    });

    if (score.budgetTier !== "TIER_ENTERPRISE") {
      throw new Error(`Expected TIER_ENTERPRISE, got ${score.budgetTier}`);
    }
    if (score.authorityLevel !== "PRIMARY_DECISION_MAKER") {
      throw new Error(`Expected PRIMARY_DECISION_MAKER, got ${score.authorityLevel}`);
    }
    if (score.compositeScore < 90) {
      throw new Error(`Expected composite score >= 90, got ${score.compositeScore}`);
    }
    if (score.classification !== "PROPOSAL_READY") {
      throw new Error(`Expected PROPOSAL_READY, got ${score.classification}`);
    }
  });

  // 2. Cold / Tire-Kicker Simulation
  await runTest("Cold / Tire-Kicker Simulation (Sub-Threshold Scoring)", async () => {
    const coldSignals = {
      text: "Hi, I am a student and I have no budget or money. Can you teach me how to code a free bot someday?",
      problem: "No commercial problem",
    };

    const coldScore = bantEngine.computeBantScore(coldSignals);

    if (coldScore.compositeScore >= 40) {
      throw new Error(`Cold lead score too high: ${coldScore.compositeScore}`);
    }
    if (coldScore.classification !== "COLD") {
      throw new Error(`Expected classification COLD, got ${coldScore.classification}`);
    }

    // Check deal stage auto advancement refuses promotion
    const auto = dealStageEngine.evaluateAutoAdvancement("NEW", coldScore, false);
    if (auto.shouldAdvance) {
      throw new Error("Deal stage engine should NOT advance cold tire-kicker");
    }
  });

  // 3. Warm / Emerging Lead Simulation
  await runTest("Warm / Incomplete Lead Simulation (Stage: CONTACTED)", async () => {
    const warmSignals = {
      name: "Alex Rivera",
      email: "alex@growthstartup.io",
      text: "We are struggling with our HubSpot CRM data synchronization and manual leads entry. Looking to automate within 2 months.",
      problem: "HubSpot data synchronization bottleneck",
      rawTimeline: "2 months",
    };

    const warmScore = bantEngine.computeBantScore(warmSignals);

    if (warmScore.compositeScore < 40 || warmScore.compositeScore > 75) {
      throw new Error(`Expected warm score between 40 and 75, got ${warmScore.compositeScore}`);
    }
    if (warmScore.classification !== "WARM" && warmScore.classification !== "HOT_QUALIFIED") {
      throw new Error(`Expected WARM or HOT_QUALIFIED classification, got ${warmScore.classification}`);
    }

    const auto = dealStageEngine.evaluateAutoAdvancement("NEW", warmScore, true);
    if (!auto.shouldAdvance || auto.nextStage !== "CONTACTED") {
      throw new Error(`Expected promotion to CONTACTED, got ${auto.nextStage}`);
    }
  });

  // 4. Highly Qualified Enterprise Prospect Simulation (Stage: PROPOSAL)
  await runTest("High-Value Enterprise Prospect Simulation (Auto Stage: PROPOSAL)", async () => {
    const enterpriseSignals = {
      name: "Victoria Sterling",
      email: "victoria@sterlingaerospace.com",
      company: "Sterling Aerospace",
      roleTitle: "Founder & CEO",
      text: "I am Victoria Sterling, Founder & CEO at Sterling Aerospace. We have an urgent $45,000 project budget to build an autonomous voice qualification agent and client portal. We need this ready in 3 weeks.",
      problem: "Need voice qualification agent with CRM integration in 3 weeks.",
      rawBudget: "$45,000",
      rawTimeline: "3 weeks",
    };

    const bant = bantEngine.computeBantScore(enterpriseSignals);

    if (bant.compositeScore < 80) {
      throw new Error(`Expected score >= 80, got ${bant.compositeScore}`);
    }
    if (bant.classification !== "HOT_QUALIFIED" && bant.classification !== "PROPOSAL_READY") {
      throw new Error(`Expected proposal readiness classification, got ${bant.classification}`);
    }

    const auto = dealStageEngine.evaluateAutoAdvancement("CONTACTED", bant, true);
    if (!auto.shouldAdvance || (auto.nextStage !== "QUALIFIED" && auto.nextStage !== "PROPOSAL")) {
      throw new Error(`Expected promotion to QUALIFIED or PROPOSAL, got ${auto.nextStage}`);
    }
  });

  // 5. CRM Deal Stage State Machine Constraints & Progression
  await runTest("CRM Deal Stage State Machine Transition Rules", async () => {
    // Valid transitions
    if (!dealStageEngine.canTransition("NEW", "CONTACTED")) {
      throw new Error("NEW -> CONTACTED should be allowed");
    }
    if (!dealStageEngine.canTransition("CONTACTED", "QUALIFIED")) {
      throw new Error("CONTACTED -> QUALIFIED should be allowed");
    }
    if (!dealStageEngine.canTransition("QUALIFIED", "PROPOSAL")) {
      throw new Error("QUALIFIED -> PROPOSAL should be allowed");
    }
    if (!dealStageEngine.canTransition("PROPOSAL", "WON")) {
      throw new Error("PROPOSAL -> WON should be allowed");
    }

    // Invalid transitions (without SUPER_ADMIN override)
    if (dealStageEngine.canTransition("NEW", "WON", false)) {
      throw new Error("Illegal leap NEW -> WON was incorrectly permitted");
    }
    if (dealStageEngine.canTransition("CONTACTED", "WON", false)) {
      throw new Error("Illegal leap CONTACTED -> WON was incorrectly permitted");
    }

    // Super Admin override permitted
    if (!dealStageEngine.canTransition("NEW", "WON", true)) {
      throw new Error("Super Admin override should permit stage change");
    }
  });

  // 6. Proposal Trigger & Scoping Generator Validation
  await runTest("Proposal Readiness Evaluation & Architectural Scoping Generator", async () => {
    const mockLead: any = {
      id: "test-lead-101",
      customer_id: "test-cust-101",
      stage: "QUALIFIED",
      score: 88,
      problem_statement: "Need bidirectional AI voice agents with sub-400ms latency and CRM persistence.",
      proposed_solution: "AI Voice System",
      budget_range: "$45,000",
      timeline: "3 weeks",
    };

    const mockCustomer: any = {
      id: "test-cust-101",
      name: "Marcus Vance",
      email: "marcus@vancetech.io",
      country: "United States",
    };

    const bant = bantEngine.computeBantScore({
      text: mockLead.problem_statement,
      rawBudget: mockLead.budget_range,
      rawTimeline: mockLead.timeline,
      roleTitle: "CTO",
    });

    const readiness = proposalEngine.isProposalReady(mockLead, bant, mockCustomer);
    if (!readiness.ready) {
      throw new Error(`Expected proposal ready, missing: ${readiness.missingCriteria.join(", ")}`);
    }

    const scope = proposalEngine.generateScope(mockLead, bant, mockCustomer);
    if (!scope.title.includes("Marcus Vance")) {
      throw new Error(`Scope title malformed: ${scope.title}`);
    }
    if (!scope.proposedArchitecture.includes("Voice")) {
      throw new Error(`Expected Voice architecture, got ${scope.proposedArchitecture}`);
    }
    if (!scope.coreDeliverables || scope.coreDeliverables.length < 2) {
      throw new Error("Missing deliverables in generated scope");
    }
    if (!scope.recommendedTechStack.includes("Gemini Live API") && !scope.recommendedTechStack.includes("TypeScript")) {
      throw new Error("Missing key tech stack components");
    }
  });

  // 7. Live Admin APIs: BANT Scorecard, Stage Transition & Proposal Endpoints
  await runTest("Live Admin APIs: /bant, /stage, /proposal", async () => {
    // Fetch leads to get a target lead ID
    const initialLeadsRes = await fetch(`${BASE_URL}/api/admin/leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const leadsData = initialLeadsRes.ok ? await initialLeadsRes.json() : { leads: [] };

    let targetLeadId = "";
    if (leadsData.leads && leadsData.leads.length > 0) {
      targetLeadId = leadsData.leads[0].id;
    } else {
      // Provision a test lead via live chat API
      const sessionRes = await fetch(`${BASE_URL}/api/chat/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "website_chat" }),
      });
      const sessionData = await sessionRes.json();
      const testConvId = sessionData.conversationId;

      await fetch(`${BASE_URL}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: testConvId,
          message:
            "[LEAD INTAKE SUBMISSION] Name: Marcus Vance | Email: marcus@vancetech.io | Phone: +1-555-0199 | Company: VanceTech",
        }),
      });

      // Refetch leads
      const refetch = await fetch(`${BASE_URL}/api/admin/leads`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const refetchData = await refetch.json();
      if (!refetchData.leads || refetchData.leads.length === 0) {
        throw new Error("Failed to auto-provision test lead for Admin APIs test");
      }
      targetLeadId = refetchData.leads[0].id;
    }

    // Test GET /api/admin/leads/[id]/bant
    const bantRes = await fetch(`${BASE_URL}/api/admin/leads/${targetLeadId}/bant`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (bantRes.status !== 200) {
      throw new Error(`GET /bant failed: HTTP ${bantRes.status}`);
    }
    const bantData = await bantRes.json();
    if (!bantData.success || !bantData.latestBantAnalysis) {
      throw new Error("Malformed response from GET /bant");
    }

    // Test POST /api/admin/leads/[id]/stage
    const stageRes = await fetch(`${BASE_URL}/api/admin/leads/${targetLeadId}/stage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        stage: "QUALIFIED",
        reason: "Automated qualification test execution",
      }),
    });
    if (stageRes.status !== 200) {
      throw new Error(`POST /stage failed: HTTP ${stageRes.status}`);
    }
    const stageData = await stageRes.json();
    if (!stageData.success || stageData.stage !== "QUALIFIED") {
      throw new Error(`Stage was not updated to QUALIFIED: ${JSON.stringify(stageData)}`);
    }

    // Test POST /api/admin/leads/[id]/proposal
    const proposalRes = await fetch(`${BASE_URL}/api/admin/leads/${targetLeadId}/proposal`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (proposalRes.status !== 200) {
      throw new Error(`POST /proposal failed: HTTP ${proposalRes.status}`);
    }
    const proposalData = await proposalRes.json();
    if (!proposalData.success || !proposalData.proposalScope) {
      throw new Error("Malformed response from POST /proposal");
    }
    if (!proposalData.proposalScope.proposedArchitecture) {
      throw new Error("Missing proposed architecture in generated proposal");
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const failed = results.filter((r) => !r.passed);
  console.log(`Total Lead Qualification Tests: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
  console.log("-------------------------------------------------------\n");

  if (failed.length > 0) {
    console.error("FAILURES DETECTED:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    return false;
  }

  console.log("\x1b[32mALL LEAD QUALIFICATION & SALES ENGINE TESTS PASSED!\x1b[0m\n");
  return true;
}

// CLI Entrypoint
if (require.main === module) {
  runAllLeadQualificationTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Unhandled Lead Qualification test runner exception:", err);
      process.exit(1);
    });
}
