import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { LeadIntakeService } from "@/packages/growth-os/crm/services/leadIntakeService";
import { AutomationEngine } from "@/packages/growth-os/automation/automationEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Email, and Message)." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const inquiryId = `INQ-${Date.now().toString(36).toUpperCase()}`;

    // 1. Ingest into CRM & AI Qualification Pipeline
    const nameParts = (name || "").trim().split(" ");
    const firstName = nameParts[0] || "Inquiry";
    const lastName = nameParts.slice(1).join(" ") || "Contact";

    let crmLeadId = null;

    try {
      const intakeResult = await LeadIntakeService.ingestLead({
        first_name: firstName,
        last_name: lastName,
        email,
        source: "contact_form",
        landing_page: "https://impact-enterprise.com/contact",
        problem_statement: `Subject: ${subject || "General Inquiry"}\n\nMessage: ${message}`,
        service_interest: subject || undefined,
      });

      crmLeadId = intakeResult.lead?.id;

      // Trigger NEW_LEAD automation pipeline (AI qualification, owner assignment, follow-up task)
      if (crmLeadId) {
        await AutomationEngine.triggerEvent(
          "NEW_LEAD",
          "lead",
          crmLeadId,
          { lead: intakeResult.lead, source: "contact_form" }
        ).catch((autoErr: any) => {
          console.warn("Automation trigger non-blocking warning:", autoErr.message);
        });
      }
    } catch (crmErr: any) {
      console.warn("CRM intake non-blocking notice (fallback to local inquiry):", crmErr.message);
    }

    // 2. Backup Record in local inquiries store
    const record = {
      id: inquiryId,
      crmLeadId,
      submittedAt: new Date().toISOString(),
      name,
      email,
      subject: subject || "General Inquiry",
      message,
    };

    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "inquiries.json");
    let inquiries = [];
    if (fs.existsSync(filePath)) {
      try {
        inquiries = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (err) {
        inquiries = [];
      }
    }

    inquiries.unshift(record);
    fs.writeFileSync(filePath, JSON.stringify(inquiries, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Your message has been received. Our team and AI sales intelligence have processed your inquiry.",
      inquiryId,
      crmLeadId,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "inquiries.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return NextResponse.json({ total: parsed.length, inquiries: parsed });
      }
    }
  } catch (err) {
    console.warn("Could not read inquiries file:", err);
  }
  return NextResponse.json({ total: 0, inquiries: [] });
}
