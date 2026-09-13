import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "./roles";

export interface TokenPayload {
  userId: string;
  email: string;
  roles: UserRole[];
}

const JWT_SECRET = env.JWT_SECRET || "impact-enterprise-secure-jwt-signing-secret-key-2026";

export function generateToken(payload: TokenPayload, expiresIn: SignOptions["expiresIn"] = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: "IMPACT Enterprise",
    audience: "IMPACT Platform",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "IMPACT Enterprise",
      audience: "IMPACT Platform",
    }) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}
