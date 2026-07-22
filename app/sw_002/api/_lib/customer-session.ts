import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { Pool } from "pg";

const cookieName = "sw002_customer_session";
const sessionSeconds = 60 * 60 * 24 * 14;

const globalForSw002Customer = globalThis as typeof globalThis & {
  sw002CustomerPool?: Pool;
};

export function getCustomerPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
  if (!globalForSw002Customer.sw002CustomerPool) {
    globalForSw002Customer.sw002CustomerPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalForSw002Customer.sw002CustomerPool;
}

function sessionSecret() {
  return process.env.SW002_SESSION_SECRET || process.env.DATABASE_URL || "";
}

function signature(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export async function setCustomerSession(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionSeconds;
  const value = `${userId}.${expiresAt}`;
  (await cookies()).set(cookieName, `${value}.${signature(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/sw_002",
    maxAge: sessionSeconds,
  });
}

export async function clearCustomerSession() {
  // The session is scoped to /sw_002, so deletion must use the same path.
  // Calling delete() without it can leave the browser cookie active.
  const store = await cookies();
  store.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/sw_002",
    maxAge: 0,
    expires: new Date(0),
  });
  // Also clear the old root-scoped variant created by earlier builds.
  store.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function getCustomerUserId() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const [userId, expiresAt, suppliedSignature] = token.split(".");
  if (!/^\d+$/.test(userId) || !/^\d+$/.test(expiresAt) || !suppliedSignature) return null;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return null;
  const expected = signature(`${userId}.${expiresAt}`);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  return userId;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
