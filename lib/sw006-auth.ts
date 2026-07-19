import "server-only";

import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export const SW006_SESSION_COOKIE = "sw006_session";
export type Sw006Session = { userId: string; loginId: string; displayName: string; accessLevel: "SUPER_ADMIN" | "SITE_USER"; companySlug: string | null; expiresAt: number };

function secret() {
  return process.env.SW006_SESSION_SECRET || process.env.DATABASE_URL || "sw006-development-session-secret";
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(session: Omit<Sw006Session, "expiresAt">) {
  const payload = Buffer.from(JSON.stringify({ ...session, expiresAt: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifySessionToken(token?: string | null): Sw006Session | null {
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expected = signature(payload);
  if (expected.length !== suppliedSignature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(suppliedSignature))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Sw006Session;
    return session.expiresAt > Date.now() ? session : null;
  } catch { return null; }
}

export function getSessionFromRequest(request: Request): Sw006Session | null {
  const cookie = request.headers.get("cookie")
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SW006_SESSION_COOKIE}=`));
  return verifySessionToken(cookie ? decodeURIComponent(cookie.slice(SW006_SESSION_COOKIE.length + 1)) : null);
}

export function canAccessSite(session: Sw006Session, siteSlug: string) {
  return session.accessLevel === "SUPER_ADMIN" || (Boolean(session.companySlug) && session.companySlug === siteSlug);
}

export function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [salt, expectedHex] = storedHash.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
