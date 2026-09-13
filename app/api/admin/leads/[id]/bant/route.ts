import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { hasPermission } from "@/packages/auth/roles";
import { leadRepository } from "@/packages/database/repositories/leadRepository";
import { customerRepository } from "@/packages/database/repositories/customerRepository";
import { bantEngine } from "@/packages/sales/bantEngine";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ForbiddenError, NotFoundError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(req);

    const canView = user.roles.some(
      (r) => hasPermission(r, "leads:view_all") || hasPermission(r, "leads:view_assigned")
    );
    if (!canView) {
      throw new ForbiddenError("You do not have permission to view lead qualification scores.");
    }

    const leadId = params.id;
    const lead = await leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundError(`Lead with ID ${leadId} not found`);
    }

    const customer = await customerRepository.findById(lead.customer_id);
    const scoreHistory = await leadRepository.getScores(leadId);
    const latestScoreRecord = scoreHistory[0] || null;

    // Real-time BANT evaluation
    const bantAnalysis = bantEngine.computeBantScore({
      name: customer?.name,
      email: customer?.email,
      phone: customer?.phone || undefined,
      company: customer?.country || undefined,
      problem: lead.problem_statement || undefined,
      rawBudget: lead.budget_range || undefined,
      rawTimeline: lead.timeline || undefined,
      roleTitle: lead.decision_maker_status || undefined,
    });

    return NextResponse.json({
      success: true,
      leadId,
      stage: lead.stage,
      score: lead.score,
      latestBantAnalysis: bantAnalysis,
      scoreRecord: latestScoreRecord,
      historyCount: scoreHistory.length,
      history: scoreHistory,
    });
  } catch (err) {
    return handleApiError(err, "AdminLeadBantAPI");
  }
}
