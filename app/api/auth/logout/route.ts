import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, authenticateRequest } from "@/packages/auth/session";
import { auditRepository } from "@/packages/database/repositories/auditRepository";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (user) {
      await auditRepository.log({
        actorType: "USER",
        actorId: user.id,
        action: "AUTH_LOGOUT",
        resourceType: "auth",
        resourceId: user.email,
        ipAddress: req.ip || req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Successfully logged out. Session invalidated.",
    });

    clearSessionCookie(response);
    return response;
  } catch (err) {
    return handleApiError(err, "AuthLogoutAPI");
  }
}
