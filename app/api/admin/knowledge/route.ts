import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireRole } from "@/packages/auth/session";
import { knowledgeService } from "@/packages/knowledge";
import { db } from "@/packages/database";
import { handleApiError } from "@/packages/errors/errorHandler";
import { auditRepository } from "@/packages/database/repositories/auditRepository";

export const dynamic = "force-dynamic";

const createDocumentSchema = z.object({
  category: z.enum(["SERVICES", "CASE_STUDIES", "LEADERSHIP", "POLICIES", "CONTACT", "FAQ", "TECHNICAL"]),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  source: z.string().min(3, "Source is required"),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as any;

    const documents = await knowledgeService.listDocuments(category);

    return NextResponse.json({
      success: true,
      documents,
      meta: {
        total: documents.length,
        userRole: session.roles[0],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return handleApiError(err, "AdminKnowledgeListAPI");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, ["SUPER_ADMIN", "ADMIN"]);
    const body = await req.json();
    const validated = createDocumentSchema.parse(body);

    const res = await db.query(
      `INSERT INTO knowledge_documents (category, title, content, source, version, metadata, is_active)
       VALUES ($1, $2, $3, $4, 1, $5, TRUE)
       RETURNING *;`,
      [
        validated.category,
        validated.title,
        validated.content,
        validated.source,
        JSON.stringify(validated.metadata),
      ]
    );

    const createdDoc = res.rows[0];

    // Audit log
    await auditRepository.log({
      actorType: "USER",
      actorId: session.id,
      action: "KNOWLEDGE_DOCUMENT_CREATED",
      resourceType: "knowledge_document",
      resourceId: createdDoc.id,
      changes: { title: validated.title, category: validated.category },
    });

    return NextResponse.json({
      success: true,
      document: createdDoc,
      message: "Knowledge document added successfully",
    });
  } catch (err) {
    return handleApiError(err, "AdminKnowledgeCreateAPI");
  }
}
