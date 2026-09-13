import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/packages/auth/session";
import { customerRepository } from "@/packages/database/repositories/customerRepository";
import { handleApiError } from "@/packages/errors/errorHandler";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "dashboard:view");
    const customers = await customerRepository.list(100);
    return NextResponse.json({
      success: true,
      total: customers.length,
      customers,
    });
  } catch (err) {
    return handleApiError(err, "AdminCustomersAPI");
  }
}
