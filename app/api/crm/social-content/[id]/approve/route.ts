import { NextRequest, NextResponse } from "next/server";
import { db } from "@/packages/database";
import { PublishingService } from "@/packages/growth-os/publishing/publishingService";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const autoPublish = body.autoPublish !== false; // Default: publish upon approval if requested

    // 1. Mark post APPROVED
    const updateRes = await db.query(
      `UPDATE content_posts 
       SET status = 'APPROVED', updated_at = NOW() 
       WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (updateRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    let publishResults = null;
    if (autoPublish) {
      try {
        publishResults = await PublishingService.publishPostToAllLinkedAccounts(id);
      } catch (pubErr: any) {
        // Post remains approved even if auto-publishing encounters an issue
        return NextResponse.json({
          success: true,
          post: updateRes.rows[0],
          warning: `Post approved, but auto-publish failed: ${pubErr.message}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      post: updateRes.rows[0],
      publishResults,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
