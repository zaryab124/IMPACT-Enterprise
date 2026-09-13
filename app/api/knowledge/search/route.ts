import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { knowledgeService } from "@/packages/knowledge";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

const searchSchema = z.object({
  q: z.string().min(1, "Search query 'q' parameter is required"),
  category: z
    .enum(["SERVICES", "CASE_STUDIES", "LEADERSHIP", "POLICIES", "CONTACT", "FAQ", "TECHNICAL"])
    .optional(),
  limit: z.coerce.number().min(1).max(20).optional().default(5),
});

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("q");

    if (!rawQuery || rawQuery.trim().length === 0) {
      throw new ValidationError("Query parameter 'q' is required");
    }

    const { q, category, limit } = searchSchema.parse({
      q: rawQuery,
      category: searchParams.get("category") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    const result = await knowledgeService.search(q, {
      category,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        query: q,
        totalFound: result.documents.length,
        isOutOfScope: result.isOutOfScope,
      },
    });
  } catch (err) {
    return handleApiError(err, "KnowledgeSearchAPI");
  }
}
