import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/packages/auth/session";
import { ROLE_PERMISSIONS } from "@/packages/auth/roles";
import { growthOsService } from "@/packages/growth-os";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Aggregate user permissions across all assigned roles
    const userPermissions = new Set<string>();
    for (const role of user.roles) {
      const perms = ROLE_PERMISSIONS[role] || [];
      perms.forEach((p) => userPermissions.add(p));
    }

    const modules = await growthOsService.getModuleCatalog(Array.from(userPermissions));

    return NextResponse.json({
      success: true,
      total: modules.length,
      modules,
    });
  } catch (err) {
    return handleApiError(err, "GrowthOsModulesAPI");
  }
}
