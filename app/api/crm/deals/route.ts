import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { crmDealRepository } from "@/packages/growth-os/crm";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const pipelineId = searchParams.get("pipeline_id") || undefined;
    const stageId = searchParams.get("stage_id") || undefined;
    const leadId = searchParams.get("lead_id") || undefined;
    const companyId = searchParams.get("company_id") || undefined;
    const assignedTo = searchParams.get("assigned_to") || undefined;
    const status = searchParams.get("status") || undefined;
    const includeDeleted = searchParams.get("include_deleted") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    const [dealsResult, pipelines] = await Promise.all([
      crmDealRepository.list({
        pipelineId,
        stageId,
        leadId,
        companyId,
        assignedTo,
        status,
        includeDeleted,
        limit,
        offset,
      }),
      crmDealRepository.getPipelines(),
    ]);

    return NextResponse.json({
      success: true,
      total: dealsResult.total,
      deals: dealsResult.deals,
      pipelines,
    });
  } catch (err) {
    return handleApiError(err, "CrmDealsListAPI");
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    let pipelineId = body.pipeline_id;
    let stageId = body.stage_id;

    if (!pipelineId || !stageId) {
      const pipelines = await crmDealRepository.getPipelines();
      const defaultPipeline = pipelines.find((p) => p.is_default) || pipelines[0];
      if (defaultPipeline) {
        pipelineId = pipelineId || defaultPipeline.id;
        stageId = stageId || defaultPipeline.stages[0]?.id;
      }
    }

    if (!body.title || !pipelineId || !stageId) {
      throw new ValidationError("title, pipeline_id, and stage_id are required for a deal");
    }

    const deal = await crmDealRepository.create({
      title: body.title.trim(),
      pipeline_id: pipelineId,
      stage_id: stageId,
      lead_id: body.lead_id,
      contact_id: body.contact_id,
      company_id: body.company_id,
      amount: body.amount ? Number(body.amount) : 0.0,
      currency: body.currency || "USD",
      expected_close_date: body.expected_close_date,
      status: body.status || "open",
      service_interest: body.service_interest,
      assigned_to: body.assigned_to || user.id,
      created_by: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        deal,
      },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err, "CrmDealsCreateAPI");
  }
}
