import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userRepository } from "@/packages/database/repositories/userRepository";
import { auditRepository } from "@/packages/database/repositories/auditRepository";
import { verifyPassword } from "@/packages/auth/password";
import { generateToken } from "@/packages/auth/jwt";
import { setSessionCookie } from "@/packages/auth/session";
import { handleApiError } from "@/packages/errors/errorHandler";
import { UnauthorizedError } from "@/packages/errors/AppError";

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      // Record failed login in audit logs
      await auditRepository.log({
        actorType: "USER",
        actorId: user.id,
        action: "AUTH_LOGIN_FAILED",
        resourceType: "auth",
        resourceId: user.email,
        ipAddress: req.ip || req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      });
      throw new UnauthorizedError("Invalid email or password.");
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    // Record successful login in audit logs
    await auditRepository.log({
      actorType: "USER",
      actorId: user.id,
      action: "AUTH_LOGIN_SUCCESS",
      resourceType: "auth",
      resourceId: user.email,
      ipAddress: req.ip || req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: user.roles,
      },
      token, // Also return token for API / CLI / testing clients
    });

    setSessionCookie(response, token);
    return response;
  } catch (err) {
    return handleApiError(err, "AuthLoginAPI");
  }
}
