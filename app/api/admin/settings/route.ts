import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/packages/auth/session";
import { auditRepository } from "@/packages/database/repositories/auditRepository";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, ["SUPER_ADMIN", "ADMIN"]);
    return NextResponse.json({
      success: true,
      settings: {
        aiModel: "gemini-2.5-flash",
        voiceLatencyTargetMs: 400,
        handoffUrgentThresholdScore: 85,
        allowedChannels: ["web_chat", "whatsapp", "voice", "email"],
        maintenanceMode: false,
      },
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    });
  } catch (err) {
    return handleApiError(err, "AdminSettingsGetAPI");
  }
}

export async function POST(req: NextRequest) {
  try {
    // STRICT RBAC: Only SUPER_ADMIN is permitted to modify system settings
    const user = await requireRole(req, ["SUPER_ADMIN"]);

    const body = await req.json();

    await auditRepository.log({
      actorType: "USER",
      actorId: user.id,
      action: "UPDATE_SYSTEM_SETTINGS",
      resourceType: "settings",
      resourceId: "system",
      changes: body,
    });

    return NextResponse.json({
      success: true,
      message: "System settings updated successfully",
      updatedBy: user.email,
    });
  } catch (err) {
    return handleApiError(err, "AdminSettingsPostAPI");
  }
}
