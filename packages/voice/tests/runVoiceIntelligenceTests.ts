import { db } from "../../database";
import {
  callRecordingRepository,
  customerRepository,
  conversationRepository,
  voiceSessionRepository,
  leadRepository,
} from "../../database/repositories";
import {
  conversationIntelligenceService,
  sentimentAnalyzer,
} from "../intelligence";

interface TestReportItem {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const report: TestReportItem[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    process.stdout.write(`  ▶ Running test: ${name}... `);
    await fn();
    const durationMs = Date.now() - start;
    console.log(`\x1b[32mPASS\x1b[0m (${durationMs}ms)`);
    report.push({ name, passed: true, durationMs });
  } catch (err: any) {
    const durationMs = Date.now() - start;
    console.log(`\x1b[31mFAIL\x1b[0m (${durationMs}ms)`);
    console.error(`    Error: ${err.message}`);
    report.push({ name, passed: false, error: err.message, durationMs });
  }
}

export async function runAllVoiceIntelligenceTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 12 VOICE ANALYTICS & INTELLIGENCE");
  console.log("=======================================================\n");

  let testCustomerId = "";
  let testConversationId = "";
  let testSessionId = "";
  let testRecordingId = "";
  let testLeadId = "";

  // 1. Database Schema Readiness Check
  await runTest("Database & Schema Readiness Check", async () => {
    await callRecordingRepository.ensureTable();

    // Create a customer, lead, and voice conversation for testing
    const customer = await customerRepository.upsert({
      name: "Tariq Al-Mansoor",
      email: `tariq.mansoor.${Date.now()}@gulf-enterprises.ae`,
      phone: "+971501234567",
      country: "United Arab Emirates",
      source: "voice_call",
    });
    testCustomerId = customer.id;

    const lead = await leadRepository.create({
      customerId: testCustomerId,
      problemStatement: "Looking for enterprise voice automation for Dubai regional customer centers.",
      stage: "NEW",
      score: 30,
    });
    testLeadId = lead.id;

    const conv = await conversationRepository.create({
      customerId: testCustomerId,
      channel: "voice",
      metadata: { source: "voice_modal" },
    });
    testConversationId = conv.id;

    testSessionId = `voice-session-${Date.now()}-intel`;
    await voiceSessionRepository.create({
      sessionId: testSessionId,
      conversationId: testConversationId,
      model: "gemini-3.1-flash-live-preview",
      voiceName: "Charon",
      metadata: { customerId: testCustomerId },
    });

    // Populate conversation messages
    await conversationRepository.addMessage({
      conversationId: testConversationId,
      senderType: "customer",
      content: "Hello! We are looking to automate our multi-channel customer intake using autonomous AI agents with WhatsApp integration.",
    });

    await conversationRepository.addMessage({
      conversationId: testConversationId,
      senderType: "ai_agent",
      content: "Welcome to IMPACT Enterprise! We engineer enterprise AI agents integrated with Meta WhatsApp Cloud API and custom CRM workflows.",
    });

    await conversationRepository.addMessage({
      conversationId: testConversationId,
      senderType: "customer",
      content: "That sounds excellent. Our budget is around $40,000 and we want to deploy ASAP within the next 6 weeks. Can we schedule a consultation?",
    });

    await conversationRepository.addMessage({
      conversationId: testConversationId,
      senderType: "ai_agent",
      content: "Certainly! Our senior engineering leads in Beirut are available for discovery sessions this week. Let me reserve that slot for your team.",
    });
  });

  // 2. Sentiment Analysis Arithmetic & Turn Labeling
  await runTest("Sentiment Analysis Arithmetic & Turn Labeling", async () => {
    const posTurn = sentimentAnalyzer.analyzeTurn("This is awesome, perfect, sounds great, thank you!");
    if (posTurn !== "positive") {
      throw new Error(`Expected positive turn sentiment, got ${posTurn}`);
    }

    const negTurn = sentimentAnalyzer.analyzeTurn("This is terrible, broken, and useless.");
    if (negTurn !== "negative") {
      throw new Error(`Expected negative turn sentiment, got ${negTurn}`);
    }

    const urgentTurn = sentimentAnalyzer.analyzeTurn("We have a critical outage, urgent assistance needed asap!");
    if (urgentTurn !== "urgent") {
      throw new Error(`Expected urgent turn sentiment, got ${urgentTurn}`);
    }

    const neutralTurn = sentimentAnalyzer.analyzeTurn("The model parameters were set to 24000 sample rate.");
    if (neutralTurn !== "neutral") {
      throw new Error(`Expected neutral turn sentiment, got ${neutralTurn}`);
    }

    // Aggregate call sentiment
    const callSentiment = sentimentAnalyzer.calculateCallSentiment([
      { text: "Hello, we are interested in your services." },
      { text: "Great, sounds awesome and very helpful!" },
      { text: "Perfect, we are ready to move forward." },
    ]);

    if (callSentiment.label !== "positive" || callSentiment.score <= 0.2) {
      throw new Error(`Expected positive call sentiment with score > 0.2, got ${callSentiment.label} (${callSentiment.score})`);
    }
  });

  // 3. Speaker Diarization & Turn Attribution
  await runTest("Speaker Diarization & Turn Attribution", async () => {
    const messages = await conversationRepository.getMessages(testConversationId);
    if (messages.length < 4) {
      throw new Error(`Expected >=4 messages, found ${messages.length}`);
    }

    // Verify first message is customer (user) and second is ai_agent (agent)
    if (messages[0].sender_type !== "customer") {
      throw new Error(`Expected first turn customer, got ${messages[0].sender_type}`);
    }
    if (messages[1].sender_type !== "ai_agent") {
      throw new Error(`Expected second turn ai_agent, got ${messages[1].sender_type}`);
    }
  });

  // 4. Voice Call Intelligence Processing & Analysis
  await runTest("Voice Call Intelligence Processing & Analysis", async () => {
    const analysis = await conversationIntelligenceService.analyzeVoiceCall(testSessionId);

    if (!analysis || !analysis.id) {
      throw new Error("Failed to produce call intelligence analysis");
    }

    testRecordingId = analysis.id;

    if (analysis.voiceSessionId !== testSessionId) {
      throw new Error(`Session ID mismatch: expected ${testSessionId}, got ${analysis.voiceSessionId}`);
    }

    if (!analysis.executiveSummary || analysis.executiveSummary.length < 50) {
      throw new Error("Executive summary missing or insufficient length");
    }

    if (!Array.isArray(analysis.actionItems) || analysis.actionItems.length === 0) {
      throw new Error("No action items extracted from voice conversation");
    }

    if (!Array.isArray(analysis.keyTopics) || analysis.keyTopics.length === 0) {
      throw new Error("No key topics extracted from voice conversation");
    }
  });

  // 5. Executive Summary & Action Items Validation
  await runTest("Executive Summary & Action Items Validation", async () => {
    const recording = await callRecordingRepository.findById(testRecordingId);
    if (!recording) {
      throw new Error("Saved call recording not found in database");
    }

    // Validate action items structure
    for (const item of recording.action_items) {
      if (!item.task || typeof item.task !== "string") {
        throw new Error("Action item missing task description");
      }
      if (!item.owner || typeof item.owner !== "string") {
        throw new Error("Action item missing assigned owner");
      }
      if (!["high", "medium", "low"].includes(item.priority)) {
        throw new Error(`Invalid action item priority: ${item.priority}`);
      }
      if (typeof item.completed !== "boolean") {
        throw new Error("Action item completed status must be boolean");
      }
    }
  });

  // 6. Voice BANT Extraction & Scoring
  await runTest("Voice BANT Extraction & Scoring", async () => {
    const recording = await callRecordingRepository.findById(testRecordingId);
    if (!recording || !recording.bant_insights) {
      throw new Error("Missing BANT insights in call recording");
    }

    const bant = recording.bant_insights;
    if (!bant.need) {
      throw new Error("BANT insights missing identified need");
    }
    if ((bant.score || 0) < 50) {
      throw new Error(`Expected qualified BANT score >= 50, got ${bant.score}`);
    }
    if (!["qualified", "ready_for_proposal", "warm"].includes(bant.readiness || "")) {
      throw new Error(`Unexpected readiness state: ${bant.readiness}`);
    }
  });

  // 7. CRM Deal Stage Auto-Progression from Voice Insights
  await runTest("CRM Deal Stage Auto-Progression from Voice Insights", async () => {
    const lead = await leadRepository.findById(testLeadId);
    if (!lead) {
      throw new Error("Lead record not found");
    }

    // Lead started at NEW with score 30, should have progressed to CONTACTED or PROPOSAL with score >= 70
    if (lead.stage === "NEW") {
      throw new Error("Lead stage failed to progress from NEW after voice intelligence processing");
    }

    if (lead.score < 70) {
      throw new Error(`Expected updated lead score >= 70, got ${lead.score}`);
    }
  });

  // 8. Action Item Interactive Toggle & Completion Tracking
  await runTest("Action Item Interactive Toggle & Completion Tracking", async () => {
    // Toggle first action item to true
    const updated = await conversationIntelligenceService.toggleActionItem(testRecordingId, 0, true);
    if (!updated) {
      throw new Error("Failed to toggle action item");
    }

    if (!updated.action_items[0].completed) {
      throw new Error("Action item 0 completed flag should be true after toggle");
    }

    // Toggle back to false
    const reverted = await conversationIntelligenceService.toggleActionItem(testRecordingId, 0, false);
    if (!reverted || reverted.action_items[0].completed) {
      throw new Error("Action item 0 completed flag should be false after untoggle");
    }
  });

  // 9. Development Mock Simulator Labeled Fallback Verification
  await runTest("Development Mock Simulator Labeled Fallback Verification", async () => {
    if (!conversationIntelligenceService.isLive()) {
      const recording = await callRecordingRepository.findById(testRecordingId);
      if (!recording?.executive_summary?.includes("[DEVELOPMENT MOCK: Conversation Intelligence Engine]")) {
        throw new Error("Simulator output missing required specification label");
      }
    }
  });

  // 10. Admin Voice Intelligence Analytics & Paginated Query
  await runTest("Admin Voice Intelligence Analytics & Paginated Query", async () => {
    const listData = await conversationIntelligenceService.getCallRecordings({
      limit: 10,
      offset: 0,
    });

    if (listData.total < 1) {
      throw new Error(`Expected total recordings >= 1, got ${listData.total}`);
    }

    const found = listData.recordings.find((r) => r.id === testRecordingId);
    if (!found) {
      throw new Error("Test recording not found in paginated query");
    }

    const analytics = await conversationIntelligenceService.getIntelligenceAnalytics();
    if (analytics.totalCallsAnalyzed < 1) {
      throw new Error(`Expected totalCallsAnalyzed >= 1, got ${analytics.totalCallsAnalyzed}`);
    }
    if (analytics.totalActionItems < 1) {
      throw new Error(`Expected totalActionItems >= 1, got ${analytics.totalActionItems}`);
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const failed = report.filter((r) => !r.passed);
  console.log(`Total Voice Intelligence Tests: ${report.length} | Passed: ${report.length - failed.length} | Failed: ${failed.length}`);
  console.log("-------------------------------------------------------\n");

  if (failed.length > 0) {
    console.error("FAILURES DETECTED IN VOICE INTELLIGENCE SUITE:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    return false;
  }

  console.log("\x1b[32mALL VOICE ANALYTICS & INTELLIGENCE TESTS PASSED!\x1b[0m\n");
  return true;
}

// CLI Execution
if (require.main === module) {
  runAllVoiceIntelligenceTests()
    .then(async (success) => {
      await db.close();
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Fatal exception in voice intelligence runner:", err);
      process.exit(1);
    });
}
