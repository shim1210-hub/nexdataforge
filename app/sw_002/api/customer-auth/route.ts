import {
  clearCustomerSession,
  getCustomerPool,
  getCustomerUserId,
  hashPassword,
  setCustomerSession,
  verifyPassword,
} from "../_lib/customer-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AuthPayload = { mode?: "login" | "register"; email?: string; password?: string; nickname?: string };

async function currentUser() {
  const userId = await getCustomerUserId();
  if (!userId) return null;
  const result = await getCustomerPool().query(
    `select id::text, email, nickname, role
       from sw002_users
      where id = $1 and role = 'CUSTOMER' and status = 'ACTIVE'`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function GET() {
  try {
    return Response.json({ user: await currentUser() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "로그인 상태를 확인하지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AuthPayload;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("올바른 이메일을 입력해 주세요.");
    if (!password) throw new Error("비밀번호를 입력해 주세요.");

    if (body.mode === "register") {
      const exists = await getCustomerPool().query("select id from sw002_users where lower(email) = $1 limit 1", [email]);
      if (exists.rows[0]) throw new Error("이미 가입된 이메일입니다.");
      const created = await getCustomerPool().query(
        `insert into sw002_users (email, password_hash, nickname, role, status, last_login_at)
         values ($1, $2, $3, 'CUSTOMER', 'ACTIVE', now())
         returning id::text, email, nickname, role`,
        [email, hashPassword(password), body.nickname?.trim() || email.split("@")[0]],
      );
      await setCustomerSession(created.rows[0].id);
      return Response.json({ user: created.rows[0] }, { status: 201 });
    }

    const result = await getCustomerPool().query(
      `select id::text, email, nickname, role, password_hash
         from sw002_users
        where lower(email) = $1 and role = 'CUSTOMER' and status = 'ACTIVE'
        order by id limit 1`,
      [email],
    );
    const user = result.rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    await getCustomerPool().query("update sw002_users set last_login_at = now() where id = $1", [user.id]);
    await setCustomerSession(user.id);
    return Response.json({ user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "로그인 처리 중 오류가 발생했습니다." }, { status: 400 });
  }
}

export async function DELETE() {
  await clearCustomerSession();
  return Response.json({ user: null }, { headers: { "Cache-Control": "no-store" } });
}
