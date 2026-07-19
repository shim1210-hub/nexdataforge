import { clearOperatorSession, getOperatorSession, setOperatorSession, type OperatorRole } from "../_lib/operator-session";
import { getCustomerPool, verifyPassword } from "../_lib/customer-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const roleForMode = { partner: "STORE_MANAGER", admin: "ADMIN" } as const;

export async function GET() {
  const session = await getOperatorSession();
  if (!session) return Response.json({ user: null });
  const result = await getCustomerPool().query("select id::text, email, nickname, role from sw002_users where id = $1 and status = 'ACTIVE'", [session.userId]);
  return Response.json({ user: result.rows[0] ?? null });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; mode?: "partner" | "admin" };
    const requiredRole: OperatorRole = body.mode ? roleForMode[body.mode] : "STORE_MANAGER";
    const result = await getCustomerPool().query(
      "select id::text, email, nickname, role, password_hash from sw002_users where lower(email) = $1 and role = $2 and status = 'ACTIVE' order by id limit 1",
      [body.email?.trim().toLowerCase(), requiredRole],
    );
    const user = result.rows[0];
    if (!user || !verifyPassword(body.password ?? "", user.password_hash)) throw new Error("해당 운영자 계정 또는 비밀번호가 올바르지 않습니다.");
    await setOperatorSession(user.id, user.role);
    return Response.json({ user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "운영자 로그인에 실패했습니다." }, { status: 401 });
  }
}

export async function DELETE() {
  await clearOperatorSession();
  return Response.json({ user: null });
}
