import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userRepository } from "@/packages/database/repositories/userRepository";
import { auditRepository } from "@/packages/database/repositories/auditRepository";
import { hashPassword } from "@/packages/auth/password";
import { requireRole } from "@/packages/auth/session";
import { handleApiError } from "@/packages/errors/errorHandler";
import { UserRole } from "@/packages/auth/roles";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  roles: z.array(z.enum(["SUPER_ADMIN", "ADMIN", "SALES_MANAGER", "SALES_AGENT", "SUPPORT_AGENT", "VIEWER"])).optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Requires SUPER_ADMIN or ADMIN role to register new users
    const currentUser = await requireRole(req, ["SUPER_ADMIN", "ADMIN"]);

    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_EXISTS", message: "A user with this email already exists" } },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(data.password);
    const newUser = await userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roles: (data.roles as UserRole[]) || ["VIEWER"],
    });

    await auditRepository.log({
      actorType: "USER",
      actorId: currentUser.id,
      action: "USER_REGISTERED",
      resourceType: "user",
      resourceId: newUser.id,
      changes: { email: newUser.email, roles: newUser.roles },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        roles: newUser.roles,
      },
    });
  } catch (err) {
    return handleApiError(err, "AuthRegisterAPI");
  }
}
