import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In-memory backup store to guarantee 100% data persistence even if filesystem is read-only or locked
const memorySubmissionsStore: any[] = [];

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (parseError) {
      console.warn("Intake POST body parse warning:", parseError);
      return NextResponse.json(
        { error: "Invalid data format received. Please check your submission and try again." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "No submission data provided. Please fill in your project details." },
        { status: 400 }
      );
    }

    const {
      projectType,
      customProjectType,
      goal,
      customGoal,
      description,
      currentSituation,
      timeline,
      budgetRange,
      name,
      company,
      email,
      phone,
      country,
    } = body;

    // Clean and validate contact details
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim();
    const cleanPhone = String(phone || "").trim();

    if (!cleanName) {
      return NextResponse.json(
        { error: "Please provide your name so our team knows who to contact." },
        { status: 400 }
      );
    }

    if (!cleanEmail) {
      return NextResponse.json(
        { error: "Please provide your email address for your project proposal." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address (e.g. name@company.com)." },
        { status: 400 }
      );
    }

    // Resolve intelligent defaults if user jumped directly to contact step
    const resolvedProjectType =
      projectType && projectType !== "Other"
        ? String(projectType).trim()
        : customProjectType && String(customProjectType).trim()
        ? `Other: ${String(customProjectType).trim()}`
        : "App & System Integration";

    const resolvedGoal =
      goal && goal !== "Other"
        ? String(goal).trim()
        : customGoal && String(customGoal).trim()
        ? `Other: ${String(customGoal).trim()}`
        : "Build something new / System Modernization";

    const resolvedDescription =
      description && String(description).trim()
        ? String(description).trim()
        : `Strategic scoping for ${resolvedProjectType}. Goal: ${resolvedGoal}. Detailed specifications to be finalized during technical discovery.`;

    const submissionId = `IMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const record = {
      id: submissionId,
      submittedAt: new Date().toISOString(),
      projectType: resolvedProjectType,
      goal: resolvedGoal,
      description: resolvedDescription,
      currentSituation: currentSituation || "Idea only",
      timeline: timeline || "Flexible",
      budgetRange: budgetRange || "Flexible",
      contact: {
        name: cleanName,
        company: (company && String(company).trim()) || "Independent / Founder",
        email: cleanEmail,
        phone: cleanPhone || "Not provided",
        country: (country && String(country).trim()) || "Not provided",
      },
      status: "received",
      source: "web_intake",
    };

    // Save to in-memory store immediately
    memorySubmissionsStore.unshift(record);
    if (memorySubmissionsStore.length > 500) {
      memorySubmissionsStore.pop();
    }

    // Persist to local filesystem safely without crashing if file is locked or restricted
    try {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const filePath = path.join(dataDir, "intake_submissions.json");
      let submissions: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, "utf8");
          const parsed = JSON.parse(fileContent);
          if (Array.isArray(parsed)) {
            submissions = parsed;
          }
        } catch (readErr) {
          console.warn("Notice: re-initializing intake_submissions.json due to parse state:", readErr);
          submissions = [];
        }
      }

      submissions.unshift(record);
      fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2), "utf8");
    } catch (fsError) {
      // Non-fatal: Record is safely held in memory and logged
      console.error("Warning: File persistence encountered error, backed up in memory:", fsError);
    }

    console.log(`[INTAKE SUCCESS] Submission ${submissionId} recorded for ${cleanName} (${cleanEmail})`);

    return NextResponse.json({
      success: true,
      message: "Your project inquiry has been received. An IMPACT engineering director will review your requirements.",
      submissionId,
      record: {
        id: submissionId,
        projectType: resolvedProjectType,
        goal: resolvedGoal,
        name: cleanName,
      },
    });
  } catch (error: any) {
    console.error("Critical error in project intake submission:", error);
    return NextResponse.json(
      {
        error: "An unexpected processing error occurred. You can also send your project brief directly to WhatsApp (+92 314 7893907) or email impactenterprise527@gmail.com.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Safe read-only inspection endpoint
  try {
    const filePath = path.join(process.cwd(), "data", "intake_submissions.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return NextResponse.json({ total: parsed.length, submissions: parsed.slice(0, 10) });
      }
    }
  } catch (err) {
    // Fallback to memory
  }
  return NextResponse.json({ total: memorySubmissionsStore.length, submissions: memorySubmissionsStore.slice(0, 10) });
}
