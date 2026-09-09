import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

    const record = {
      id: inquiryId,
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
      message: "Your message has been received. An IMPACT team member will be in touch shortly.",
      inquiryId,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry. Please try again." },
      { status: 500 }
    );
  }
}
