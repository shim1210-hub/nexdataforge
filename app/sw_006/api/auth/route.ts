import { query } from "@/lib/sw006-db";
import { createSessionToken, SW006_SESSION_COOKIE, verifyPassword, verifySessionToken } from "@/lib/sw006-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginUser = { id: string; loginId: string; displayName: string; accessLevel: "SUPER_ADMIN" | "SITE_USER"; companySlug: string | null; passwordHash: string | null; isActive: boolean };

export async function POST(request: Request) {
  const body = await request.json() as { loginId?: string; password?: string };
  const loginId = body.loginId?.trim().toLowerCase() ?? "";
  const result = await query<LoginUser>(`
    select id, login_id as "loginId", display_name as "displayName",
      coalesce(access_level, 'SITE_USER') as "accessLevel", company_slug as "companySlug",
      password_hash as "passwordHash", coalesce(is_active, true) as "isActive"
    from profiles where login_id=$1 limit 1
  `, [loginId]);
  const user = result.rows[0];
  if (!user?.isActive || !verifyPassword(body.password ?? "", user.passwordHash)) return Response.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  const token = createSessionToken({ userId: user.id, loginId: user.loginId, displayName: user.displayName, accessLevel: user.accessLevel, companySlug: user.companySlug });
  return Response.json({ ok: true, user: { loginId: user.loginId, displayName: user.displayName, accessLevel: user.accessLevel, companySlug: user.companySlug } }, { headers: { "Set-Cookie": `${SW006_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}` } });
}

export async function GET(request: Request) {
  const token = request.headers.get("cookie")?.match(/(?:^|;\s*)sw006_session=([^;]+)/)?.[1];
  const session = verifySessionToken(token);
  return session ? Response.json({ authenticated: true, user: session }) : Response.json({ authenticated: false }, { status: 401 });
}

export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${SW006_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` } });
}
