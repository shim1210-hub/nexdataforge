import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getCustomerPool } from "./customer-session";

export type OperatorRole = "ADMIN" | "STORE_MANAGER";
export type OperatorSession = { userId: string; role: OperatorRole; expiresAt: number };
const cookieName = "sw002_operator_session";
const maxAge = 60 * 60 * 12;

function secret() {
  return process.env.SW002_SESSION_SECRET || process.env.DATABASE_URL || "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function setOperatorSession(userId: string, role: OperatorRole) {
  const session: OperatorSession = { userId, role, expiresAt: Date.now() + maxAge * 1000 };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  (await cookies()).set(cookieName, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/sw_002",
    maxAge,
  });
}

export async function clearOperatorSession() {
  const store = await cookies();
  // The session is scoped to /sw_002. The path must match the path used when
  // the cookie was created, otherwise the browser keeps the old cookie.
  store.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/sw_002",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function getOperatorSession(): Promise<OperatorSession | null> {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied) return null;
  const expectedBuffer = Buffer.from(sign(payload));
  const suppliedBuffer = Buffer.from(supplied);
  if (expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as OperatorSession;
    if (session.expiresAt <= Date.now() || !["ADMIN", "STORE_MANAGER"].includes(session.role)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function requireOperator(requiredRole?: OperatorRole) {
  const session = await getOperatorSession();
  if (!session) throw new Error("운영자 로그인이 필요합니다.");
  if (requiredRole && session.role !== requiredRole) throw new Error("해당 관리 화면에 접근할 권한이 없습니다.");
  return session;
}

export async function assertStoreAccess(storeId: string) {
  const session = await requireOperator();
  if (session.role === "ADMIN") return session;
  const membership = await getCustomerPool().query(
    `select 1 from sw002_store_members
      where user_id = $1 and store_id = $2 and is_active = true limit 1`,
    [session.userId, storeId],
  );
  if (!membership.rows[0]) throw new Error("소속 매장만 관리할 수 있습니다.");
  return session;
}
