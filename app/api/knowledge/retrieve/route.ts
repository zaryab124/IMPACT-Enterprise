import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { knowledgeService } from "@/packages/knowledge";
import { handleApiError } from "@/packages/errors/errorHandler";
import { ValidationError } from "@/packages/errors/AppError";

const retrieveSchema = z.object({
  query: z.string().min(1, "Query is required"),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(20).optional().default(3),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = retrieveSchema.parse(body);

    const result = await knowledgeService.search(validated.query, {
      category: validated.category as any,
      limit: validated.limit,
    });

    const groundedContext = await knowledgeService.getGroundedPromptContext(validated.query);

    return NextResponse.json({
      success: true,
      data: {
        query: validated.query,
        isOutOfScope: result.isOutOfScope,
        isRestrictedTopic: result.isRestrictedTopic ?? false,
        confidenceScore: result.confidenceScore,
        guardrailMessage: result.guardrailMessage,
        groundedPromptContext: groundedContext,
        documents: result.documents,
      },
      meta: {
        timestamp: new Date().toISOString(),
        totalMatches: result.documents.length,
      },
    });
  } catch (err) {
    return handleApiError(err, "KnowledgeRetrievalAPI");
  }
}
