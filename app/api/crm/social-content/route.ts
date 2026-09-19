import { NextRequest, NextResponse } from "next/server";
import { db } from "@/packages/database";
import { SocialMediaAgent } from "@/packages/growth-os/marketing/socialMediaAgent";
import { ContentPost } from "@/packages/growth-os/marketing/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");

    let query = `SELECT * FROM content_posts WHERE post_type = 'social_post'`;
    const params: any[] = [];

    if (status && status !== "ALL") {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (platform && platform !== "ALL") {
      params.push(platform);
      query += ` AND (platform = $${params.length} OR target_platforms::text LIKE '%' || $${params.length} || '%')`;
    }

    query += ` ORDER BY created_at DESC LIMIT 50;`;

    const res = await db.query<ContentPost>(query, params);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceInterest, capability, goal, platforms, format, customPrompt } = body;

    if (platforms && Array.isArray(platforms) && platforms.length > 0) {
      const posts = await SocialMediaAgent.generatePostsForLinkedAccounts({
        serviceInterest,
        capability,
        goal,
        platforms,
        format,
        customPrompt,
      });
      return NextResponse.json({ success: true, posts }, { status: 201 });
    }

    // Default single or fallback generation
    const post = await SocialMediaAgent.generateAndSavePost({
      serviceInterest,
      capability,
      goal,
      platform: body.platform || "linkedin",
      format,
      customPrompt,
    });

    return NextResponse.json({ success: true, posts: [post] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
