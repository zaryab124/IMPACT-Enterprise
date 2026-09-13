import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: user.roles,
      },
    });
  } catch (err) {
    return handleApiError(err, "AuthMeAPI");
  }
}
