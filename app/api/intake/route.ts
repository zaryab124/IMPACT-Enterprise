import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      projectType,
      goal,
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

    // Validate essential fields
    if (!projectType || !goal || !description || !name || !email) {
      return NextResponse.json(
        { error: "Please complete all required fields (Project Type, Goal, Description, Name, and Email)." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const submissionId = `IMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const record = {
      id: submissionId,
      submittedAt: new Date().toISOString(),
      projectType,
      goal,
      description,
      currentSituation: currentSituation || "Idea only",
      timeline: timeline || "Flexible",
      budgetRange: budgetRange || "Flexible",
      contact: {
        name,
        company: company || "Independent / Founder",
        email,
        phone: phone || "Not provided",
        country: country || "Not provided",
      },
      status: "received",
    };

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "intake_submissions.json");
    let submissions = [];
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf8");
        submissions = JSON.parse(fileContent);
      } catch (err) {
        submissions = [];
      }
    }

    submissions.unshift(record);
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Your idea has been received. An IMPACT team member will review your requirements.",
      submissionId,
    });
  } catch (error) {
    console.error("Error processing project intake submission:", error);
    return NextResponse.json(
      { error: "An error occurred while submitting your project. Please try again." },
      { status: 500 }
    );
  }
}
