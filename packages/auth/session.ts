import { NextResponse } from "next/server";
import { verifyToken, TokenPayload } from "./jwt";
import { userRepository, UserWithRoles } from "../database/repositories/userRepository";
import { UserRole, Permission, hasPermission } from "./roles";
import { UnauthorizedError, ForbiddenError } from "../errors/AppError";

export const SESSION_COOKIE_NAME = "impact_session_token";

export function extractToken(req: Request): string | null {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie header
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${SESSION_COOKIE_NAME}=`)) {
        return decodeURIComponent(cookie.substring(SESSION_COOKIE_NAME.length + 1));
      }
    }
  }

  return null;
}

export async function authenticateRequest(req: Request): Promise<UserWithRoles | null> {
  const token = extractToken(req);
  if (!token) return null;

  const payload: TokenPayload | null = verifyToken(token);
  if (!payload || !payload.userId) return null;

  const user = await userRepository.findById(payload.userId);
  if (!user || !user.is_active) return null;

  return user;
}

export async function requireAuth(req: Request): Promise<UserWithRoles> {
  const user = await authenticateRequest(req);
  if (!user) {
    throw new UnauthorizedError("You must be logged in to access this resource.");
  }
  return user;
}

export async function requireRole(
  req: Request,
  allowedRoles: UserRole[]
): Promise<UserWithRoles> {
  const user = await requireAuth(req);
  const hasAllowedRole = user.roles.some((r) => allowedRoles.includes(r));
  if (!hasAllowedRole) {
    throw new ForbiddenError(
      `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]. Current roles: [${user.roles.join(", ")}].`
    );
  }
  return user;
}

export async function requirePermission(
  req: Request,
  permission: Permission
): Promise<UserWithRoles> {
  const user = await requireAuth(req);
  const permitted = user.roles.some((role) => hasPermission(role, permission));
  if (!permitted) {
    throw new ForbiddenError(
      `Access denied. Requires permission: '${permission}'. Current roles: [${user.roles.join(", ")}].`
    );
  }
  return user;
}

export function setSessionCookie(res: NextResponse, token: string): void {
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
