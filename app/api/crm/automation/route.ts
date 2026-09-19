import { NextRequest, NextResponse } from "next/server";
import { AutomationEngine } from "@/packages/growth-os/automation/automationEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "both"; // 'rules', 'logs', 'both'

    let rules = null;
    let logs = null;

    if (view === "rules" || view === "both") {
      rules = await AutomationEngine.listRules();
    }
    if (view === "logs" || view === "both") {
      const status = searchParams.get("status") || undefined;
      const limit = parseInt(searchParams.get("limit") || "50", 10);
      logs = await AutomationEngine.getExecutionLogs(limit, status);
    }

    return NextResponse.json({
      success: true,
      rules,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "toggle_rule") {
      const rule = await AutomationEngine.toggleRule(body.ruleId, body.isEnabled);
      return NextResponse.json({ success: true, rule });
    }

    if (body.action === "trigger_event") {
      const logs = await AutomationEngine.triggerEvent(
        body.trigger,
        body.entityType,
        body.entityId,
        body.context || {}
      );
      return NextResponse.json({ success: true, logs });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
