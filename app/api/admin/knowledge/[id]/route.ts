import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireRole } from "@/packages/auth/session";
import { knowledgeService } from "@/packages/knowledge";
import { handleApiError } from "@/packages/errors/errorHandler";
import { auditRepository } from "@/packages/database/repositories/auditRepository";
import { NotFoundError } from "@/packages/errors/AppError";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  source: z.string().min(3).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  reviewStatus: z.enum(["APPROVED", "UNDER_REVIEW", "ARCHIVED"]).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAuth(req);
    const doc = await knowledgeService.getDocumentById(params.id);
    if (!doc) {
      throw new NotFoundError(`Knowledge document '${params.id}' not found`);
    }
    return NextResponse.json({ success: true, document: doc });
  } catch (err) {
    return handleApiError(err, "AdminKnowledgeGetAPI");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, ["SUPER_ADMIN", "CEO", "CONTENT_MANAGER"]);
    const body = await req.json();
    const validated = updateSchema.parse(body);

    const updated = await knowledgeService.updateDocument(params.id, validated as any);
    if (!updated) {
      throw new NotFoundError(`Knowledge document '${params.id}' not found`);
    }

    await auditRepository.log({
      actorType: "USER",
      actorId: session.id,
      action: "KNOWLEDGE_DOCUMENT_UPDATED",
      resourceType: "knowledge_document",
      resourceId: params.id,
      changes: { version: updated.version, ...validated },
    });

    return NextResponse.json({
      success: true,
      document: updated,
      message: `Document updated to version v${updated.version}`,
    });
  } catch (err) {
    return handleApiError(err, "AdminKnowledgePatchAPI");
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, ["SUPER_ADMIN", "CEO"]);
    const success = await knowledgeService.archiveDocument(params.id);
    if (!success) {
      throw new NotFoundError(`Knowledge document '${params.id}' not found`);
    }

    await auditRepository.log({
      actorType: "USER",
      actorId: session.id,
      action: "KNOWLEDGE_DOCUMENT_ARCHIVED",
      resourceType: "knowledge_document",
      resourceId: params.id,
    });

    return NextResponse.json({
      success: true,
      message: "Knowledge document archived successfully",
    });
  } catch (err) {
    return handleApiError(err, "AdminKnowledgeDeleteAPI");
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, ["SUPER_ADMIN", "CEO", "CONTENT_MANAGER"]);
    const body = await req.json();
    const { status, reviewNotes } = body;

    const updated = await knowledgeService.reviewDocument(params.id, status, session.id, reviewNotes);
    if (!updated) {
      throw new NotFoundError(`Knowledge document '${params.id}' not found`);
    }

    return NextResponse.json({
      success: true,
      document: updated,
      message: `Review status updated to ${status}`,
    });
  } catch (err) {
    return handleApiError(err, "AdminKnowledgeReviewAPI");
  }
}
