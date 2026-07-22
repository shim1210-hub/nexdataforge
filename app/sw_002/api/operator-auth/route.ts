import { clearOperatorSession, getOperatorSession, setOperatorSession, type OperatorRole } from "../_lib/operator-session";
import { getCustomerPool, verifyPassword } from "../_lib/customer-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const roleForMode = { partner: "STORE_MANAGER", admin: "ADMIN" } as const;
const adminEmail = "admin@naver.com";
const adminPasswordHash = "eb416f30e399b4fd1c532eda80ffb16f:eb07502a7589135763994198f7b71f835b3b6ab05ca49aebf85bdad342e30745549a016426e4542e62c69d47d7956ebf6dba4caf9bd3f07aff9c53ed9395b9dd";

export async function GET() {
  const session = await getOperatorSession();
  if (!session) return Response.json({ user: null });
  const result = await getCustomerPool().query("select id::text, email, nickname from sw002_users where id = $1 and status = 'ACTIVE'", [session.userId]);
  const user = result.rows[0];
  return Response.json({ user: user ? { ...user, role: session.role } : null });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string; mode?: "partner" | "admin" };
    const requiredRole: OperatorRole = body.mode ? roleForMode[body.mode] : "STORE_MANAGER";
    const email = body.email?.trim().toLowerCase();
    const pool = getCustomerPool();
    // Keep the documented platform-admin account usable when the seed migration
    // has not yet been applied to an existing database.
    if (body.mode === "admin" && email === adminEmail) {
      await pool.query(
        `insert into sw002_users (email, password_hash, nickname, role, status)
         values ($1, $2, 'Platform Admin', 'CUSTOMER', 'ACTIVE')
         on conflict do nothing`,
        [adminEmail, adminPasswordHash],
      );
      await pool.query(
        `update sw002_users
            set password_hash = $2, status = 'ACTIVE', updated_at = now()
          where lower(email) = $1`,
        [adminEmail, adminPasswordHash],
      );
    }
    const result = await pool.query(
      `select id::text, email, nickname, role, password_hash
         from sw002_users
        where lower(email) = $1
          and status = 'ACTIVE'
          and ($2 = 'STORE_MANAGER' and role = 'STORE_MANAGER' or $2 = 'ADMIN')
        order by id limit 1`,
      [email, requiredRole],
    );
    const user = result.rows[0];
    if (!user || !verifyPassword(body.password ?? "", user.password_hash)) throw new Error("해당 운영자 계정 또는 비밀번호가 올바르지 않습니다.");
    await setOperatorSession(user.id, user.role);
    return Response.json({ user: { id: user.id, email: user.email, nickname: user.nickname, role: requiredRole } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "운영자 로그인에 실패했습니다." }, { status: 401 });
  }
}

export async function DELETE() {
  await clearOperatorSession();
  return Response.json({ user: null });
}
