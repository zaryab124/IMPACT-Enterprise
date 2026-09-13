import { db } from "../../database";
import { voiceSessionRepository } from "../../database/repositories/voiceSessionRepository";
import { conversationRepository, customerRepository } from "../../database/repositories";
import { voiceService } from "../voiceService";
import {
  floatTo16BitPCM,
  pcm16ToFloat32,
  pcmToBase64,
  base64To16BitPCM,
  calculateAudioEnergy,
  generateSyntheticSineWavePCM,
  downsampleBuffer,
} from "../audio/pcmConverter";
import { AudioBufferQueue } from "../audio/audioBufferQueue";
import { IMPACT_VOICE_SYSTEM_INSTRUCTION, getCustomizedVoicePrompt } from "../persona/voicePrompt";

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

export async function runAllVoiceTests(): Promise<boolean> {
  console.log("\n=======================================================");
  console.log("  IMPACT AI — PHASE 11 REALTIME VOICE AGENT (GEMINI LIVE)");
  console.log("=======================================================\n");

  let testSessionId = "";
  let testConversationId = "";

  // 1. Database & Schema Readiness Check
  await runTest("Database & System Readiness Check", async () => {
    await voiceSessionRepository.ensureTable();

    // Verify customer and conversation for testing
    const customer = await customerRepository.upsert({
      name: "Voice Test Executive",
      email: `voice.client.${Date.now()}@example.com`,
      phone: "+96181221829",
      source: "voice_call",
    });

    const conv = await conversationRepository.create({
      customerId: customer.id,
      channel: "voice",
      metadata: { initiatedVia: "voice_modal" },
    });

    testConversationId = conv.id;
    if (!testConversationId) {
      throw new Error("Failed to initialize test conversation for voice turns");
    }
  });

  // 2. Spoken Voice Persona & Prompt Formatting Rules
  await runTest("Spoken Voice Persona & Prompt Formatting Rules", async () => {
    if (!IMPACT_VOICE_SYSTEM_INSTRUCTION.includes("IMPACT AI")) {
      throw new Error("Missing IMPACT AI identity in voice system instructions");
    }
    if (!IMPACT_VOICE_SYSTEM_INSTRUCTION.includes("ZERO WRITTEN FORMATTING")) {
      throw new Error("Missing rule forbidding markdown/bullets in spoken voice");
    }
    if (!IMPACT_VOICE_SYSTEM_INSTRUCTION.includes("+961 81 221 829")) {
      throw new Error("Missing direct contact telephone grounding in voice prompt");
    }

    const customized = getCustomizedVoicePrompt("Greet the caller in French initially.");
    if (!customized.includes("Greet the caller in French initially.")) {
      throw new Error("Custom voice prompt injection failed");
    }
  });

  // 3. Audio PCM 16kHz Encoding & Base64 Conversions
  await runTest("Audio PCM 16kHz Encoding & Base64 Conversions", async () => {
    // Generate 100ms of 16kHz Float32 audio (1600 samples)
    const float32 = new Float32Array(1600);
    for (let i = 0; i < 1600; i++) {
      float32[i] = Math.sin((2 * Math.PI * 440 * i) / 16000);
    }

    const pcm16 = floatTo16BitPCM(float32);
    if (pcm16.length !== 1600) {
      throw new Error(`Expected 1600 Int16 samples, got ${pcm16.length}`);
    }

    const base64 = pcmToBase64(pcm16);
    if (!base64 || typeof base64 !== "string") {
      throw new Error("Failed to convert PCM16 to base64");
    }

    const roundtripPCM = base64To16BitPCM(base64);
    if (roundtripPCM.length !== 1600) {
      throw new Error(`Base64 roundtrip mismatch: expected 1600 samples, got ${roundtripPCM.length}`);
    }

    // Verify sample value accuracy
    if (Math.abs(roundtripPCM[100] - pcm16[100]) > 2) {
      throw new Error("PCM sample roundtrip loss exceeds tolerance");
    }
  });

  // 4. Audio PCM 24kHz Decoding & Energy Calculation
  await runTest("Audio PCM 24kHz Decoding & Energy Calculation", async () => {
    const syntheticPCM = generateSyntheticSineWavePCM(200, 440, 24000);
    // 200ms at 24000Hz = 4800 samples
    if (syntheticPCM.length !== 4800) {
      throw new Error(`Expected 4800 samples for 200ms @ 24kHz, got ${syntheticPCM.length}`);
    }

    const energy = calculateAudioEnergy(syntheticPCM);
    if (energy <= 0 || energy > 1) {
      throw new Error(`Audio energy calculation out of expected [0, 1] range: ${energy}`);
    }

    const float32 = pcm16ToFloat32(syntheticPCM);
    if (float32.length !== 4800) {
      throw new Error("Failed to convert PCM16 back to Float32");
    }
    // Verify values are in [-1, 1]
    for (let i = 0; i < 100; i++) {
      if (float32[i] < -1 || float32[i] > 1) {
        throw new Error(`Float32 sample out of [-1, 1] bounds: ${float32[i]}`);
      }
    }

    // Downsampling check
    const downsampled = downsampleBuffer(float32, 48000, 16000);
    if (downsampled.length !== Math.round(float32.length / 3)) {
      throw new Error("Downsampling ratio did not match expected 3:1 reduction");
    }
  });

  // 5. Audio Buffer Queue & Atomic Interruption Flushing
  await runTest("Audio Buffer Queue & Atomic Interruption Flushing", async () => {
    const queue = new AudioBufferQueue(24000);

    // Enqueue 3 chunks of 2400 samples each
    const chunk1 = new Float32Array(2400);
    const chunk2 = new Float32Array(2400);
    const chunk3 = new Float32Array(2400);

    queue.enqueueFloat32(chunk1);
    queue.enqueueFloat32(chunk2);
    queue.enqueueFloat32(chunk3);

    if (queue.getQueueLength() !== 2) { // 1 shifted to play, 2 in queue
      throw new Error(`Expected queue length 2, got ${queue.getQueueLength()}`);
    }

    if (!queue.isPlaying()) {
      throw new Error("Queue should report isPlaying = true when chunks are scheduled");
    }

    // Trigger atomic interruption flush (Gemini VAD signal)
    queue.flush();

    if (queue.getQueueLength() !== 0) {
      throw new Error(`Queue length should be 0 after flush, got ${queue.getQueueLength()}`);
    }

    if (queue.isPlaying()) {
      throw new Error("Queue should report isPlaying = false immediately after flush");
    }

    if (queue.getInterruptionCount() !== 1) {
      throw new Error(`Expected interruption count 1, got ${queue.getInterruptionCount()}`);
    }
  });

  // 6. Voice Session Creation & Ephemeral Token Minting
  await runTest("Voice Session Creation & Ephemeral Token Minting", async () => {
    const session = await voiceService.createVoiceSession({
      voiceName: "Charon",
      conversationId: testConversationId,
    });

    if (!session || !session.sessionId) {
      throw new Error("Failed to create voice session");
    }

    testSessionId = session.sessionId;

    if (session.voiceName !== "Charon") {
      throw new Error(`Expected voice Charon, got ${session.voiceName}`);
    }

    if (!session.token) {
      throw new Error("Voice session missing token");
    }

    // Verify raw secret isolation
    if (process.env.GEMINI_API_KEY && session.token === process.env.GEMINI_API_KEY) {
      throw new Error("SECURITY VIOLATION: Raw GEMINI_API_KEY exposed in client session token!");
    }

    // Verify database record was created
    const record = await voiceSessionRepository.findBySessionId(testSessionId);
    if (!record) {
      throw new Error("Voice session was not recorded in PostgreSQL database");
    }
    if (record.voice_name !== "Charon") {
      throw new Error(`Database record voice_name mismatch: ${record.voice_name}`);
    }
    if (record.status !== "active") {
      throw new Error(`Expected initial session status active, got ${record.status}`);
    }
  });

  // 7. Development Mock Simulator Labeled Fallback
  await runTest("Development Mock Simulator Labeled Fallback", async () => {
    // If no live key is configured or fallback is triggered, token must be labeled
    if (!voiceService.isLive()) {
      const mockSession = await voiceService.createVoiceSession({
        voiceName: "Aoede",
      });

      if (!mockSession.isMock) {
        throw new Error("Session should report isMock = true when running without live credentials");
      }

      if (!mockSession.token.includes("[DEVELOPMENT MOCK: Gemini Live API]")) {
        throw new Error(`Mock token missing required specification label: ${mockSession.token}`);
      }
    }
  });

  // 8. Voice Speech Transcript Persistence into Conversations & Messages
  await runTest("Voice Speech Transcript Persistence into Conversations & Messages", async () => {
    // Save user spoken turn
    await voiceService.saveTranscriptTurn({
      sessionId: testSessionId,
      conversationId: testConversationId,
      role: "user",
      text: "We need an autonomous AI agent for customer support on WhatsApp.",
      timestamp: new Date().toISOString(),
    });

    // Save model spoken turn
    await voiceService.saveTranscriptTurn({
      sessionId: testSessionId,
      conversationId: testConversationId,
      role: "model",
      text: "We build custom WhatsApp agents integrated with your CRM and knowledge base.",
      timestamp: new Date().toISOString(),
    });

    // Verify messages exist in database
    const messages = await conversationRepository.getMessages(testConversationId);
    const userMsg = messages.find((m) => m.content.includes("autonomous AI agent"));
    const modelMsg = messages.find((m) => m.content.includes("custom WhatsApp agents"));

    if (!userMsg) {
      throw new Error("User voice transcript turn not found in database messages");
    }
    if (!modelMsg) {
      throw new Error("AI agent voice transcript turn not found in database messages");
    }

    // Verify session turn count was updated
    const session = await voiceSessionRepository.findBySessionId(testSessionId);
    if (!session || (session.turns_count || 0) < 2) {
      throw new Error(`Expected turns_count >= 2, got ${session?.turns_count}`);
    }
  });

  // 9. Voice Session Telemetry & Interruption Tracking
  await runTest("Voice Session Telemetry & Interruption Tracking", async () => {
    // Record interruption
    await voiceService.recordInterruption(testSessionId);

    let session = await voiceSessionRepository.findBySessionId(testSessionId);
    if (!session || session.interruptions_count !== 1) {
      throw new Error(`Expected interruptions_count 1, got ${session?.interruptions_count}`);
    }

    // Finalize voice call
    await voiceService.endVoiceSession(testSessionId, {
      durationSeconds: 120,
      latencyMs: 380,
    });

    session = await voiceSessionRepository.findBySessionId(testSessionId);
    if (!session || session.status !== "completed") {
      throw new Error(`Expected status completed, got ${session?.status}`);
    }
    if (session.duration_seconds !== 120) {
      throw new Error(`Expected duration 120s, got ${session.duration_seconds}`);
    }
    if (session.latency_ms !== 380) {
      throw new Error(`Expected latency 380ms, got ${session.latency_ms}`);
    }
    if (!session.ended_at) {
      throw new Error("Voice session missing ended_at timestamp");
    }
  });

  // 10. Admin Voice Analytics API & Aggregation
  await runTest("Admin Voice Analytics API & Aggregation", async () => {
    const analytics = await voiceService.getVoiceAnalytics();

    if (!analytics.stats) {
      throw new Error("Missing stats in voice analytics");
    }
    if (analytics.stats.totalSessions < 1) {
      throw new Error(`Expected totalSessions >= 1, got ${analytics.stats.totalSessions}`);
    }
    if (analytics.stats.completedSessions < 1) {
      throw new Error(`Expected completedSessions >= 1, got ${analytics.stats.completedSessions}`);
    }
    if (analytics.stats.totalTurns < 2) {
      throw new Error(`Expected totalTurns >= 2, got ${analytics.stats.totalTurns}`);
    }
    if (analytics.stats.totalInterruptions < 1) {
      throw new Error(`Expected totalInterruptions >= 1, got ${analytics.stats.totalInterruptions}`);
    }

    if (!Array.isArray(analytics.recent) || analytics.recent.length === 0) {
      throw new Error("Missing recent sessions array in voice analytics");
    }

    const found = analytics.recent.find((s) => s.session_id === testSessionId);
    if (!found) {
      throw new Error(`Test session ${testSessionId} not found in recent list`);
    }
  });

  // Summary
  console.log("\n-------------------------------------------------------");
  const failed = report.filter((r) => !r.passed);
  console.log(`Total Voice Tests: ${report.length} | Passed: ${report.length - failed.length} | Failed: ${failed.length}`);
  console.log("-------------------------------------------------------\n");

  if (failed.length > 0) {
    console.error("FAILURES DETECTED IN VOICE SUITE:");
    failed.forEach((f) => console.error(`  - ${f.name}: ${f.error}`));
    return false;
  }

  console.log("\x1b[32mALL REALTIME VOICE AGENT TESTS PASSED!\x1b[0m\n");
  return true;
}

// CLI Execution
if (require.main === module) {
  runAllVoiceTests()
    .then(async (success) => {
      await db.close();
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error("Fatal exception in voice test runner:", err);
      process.exit(1);
    });
}
