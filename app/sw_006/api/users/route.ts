import { errorResponse, query } from "@/lib/sw006-db";
import { randomBytes, scryptSync } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type UserRow = { id: string; loginId: string; displayName: string; email: string; companySlug: string | null; accessLevel: "SUPER_ADMIN" | "SITE_USER"; isActive: boolean };

async function ensureUserSchema() {
  await query(`
    alter table profiles add column if not exists login_id varchar(100);
    alter table profiles add column if not exists company_slug varchar(100);
    alter table profiles add column if not exists access_level varchar(30) default 'SITE_USER';
    alter table profiles add column if not exists password_hash text;
  `);
  await query("create unique index if not exists profiles_login_id_uq on profiles (login_id) where login_id is not null");
}

async function listUsers() {
  return query<UserRow>(`
    select id, login_id as "loginId", display_name as "displayName", coalesce(email, '') as email,
           company_slug as "companySlug", coalesce(access_level, 'SITE_USER') as "accessLevel",
           coalesce(is_active, true) as "isActive"
    from profiles
    where login_id is not null
    order by created_at desc, display_name
  `);
}

function validatePassword(password: string, confirmation: string, required: boolean) {
  if (!password && !required) return null;
  if (!password && required) throw new Error("비밀번호를 입력해 주세요.");
  if (password !== confirmation) throw new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function validateInput(body: { loginId?: string; displayName?: string; email?: string; companySlug?: string | null; accessLevel?: string; password?: string; passwordConfirmation?: string }, passwordRequired: boolean) {
  const loginId = body.loginId?.trim() ?? "";
  const displayName = body.displayName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const accessLevel = body.accessLevel === "SUPER_ADMIN" ? "SUPER_ADMIN" : "SITE_USER";
  const companySlug = accessLevel === "SUPER_ADMIN" ? null : body.companySlug?.trim() || null;
  const passwordHash = validatePassword(body.password ?? "", body.passwordConfirmation ?? "", passwordRequired);
  if (!/^[a-z0-9]{3,100}$/.test(loginId)) throw new Error("사용자 아이디는 영문 소문자와 숫자만 사용하여 3자 이상 입력해 주세요.");
  if (!displayName) throw new Error("사용자명을 입력해 주세요.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("올바른 이메일 주소를 입력해 주세요.");
  if (accessLevel === "SITE_USER" && !companySlug) throw new Error("사이트사용자는 담당 업체를 선택해야 합니다.");
  if (companySlug) {
    const site = await query("select 1 from sites where company_slug = $1 limit 1", [companySlug]);
    if (!site.rowCount) throw new Error("선택한 담당 사이트를 찾을 수 없습니다.");
  }
  return { loginId, displayName, email, accessLevel, companySlug, passwordHash };
}

export async function GET() {
  try {
    await ensureUserSchema();
    const result = await listUsers();
    return Response.json({ users: result.rows });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    await ensureUserSchema();
    const values = await validateInput(await request.json(), true);
    const duplicate = await query("select 1 from profiles where login_id = $1 limit 1", [values.loginId]);
    if (duplicate.rowCount) return Response.json({ error: "이미 사용 중인 사용자 아이디입니다." }, { status: 409 });
    const result = await query<UserRow>(`
      insert into profiles (login_id, display_name, email, company_slug, access_level, password_hash, is_platform_admin, is_active)
      values ($1, $2, $3, $4, $5::varchar, $6, ($5::varchar = 'SUPER_ADMIN'), true)
      returning id, login_id as "loginId", display_name as "displayName", email,
                company_slug as "companySlug", access_level as "accessLevel", is_active as "isActive"
    `, [values.loginId, values.displayName, values.email, values.companySlug, values.accessLevel, values.passwordHash]);
    return Response.json({ user: result.rows[0] }, { status: 201 });
  } catch (error) { return errorResponse(error, 400); }
}

export async function PATCH(request: Request) {
  try {
    await ensureUserSchema();
    const body = await request.json() as { id?: string; loginId?: string; displayName?: string; email?: string; companySlug?: string | null; accessLevel?: string; password?: string; passwordConfirmation?: string };
    if (!body.id) return Response.json({ error: "수정할 사용자 ID가 필요합니다." }, { status: 400 });
    const current = await query<{ login_id: string }>("select login_id from profiles where id = $1 and login_id is not null limit 1", [body.id]);
    if (!current.rowCount) return Response.json({ error: "수정할 사용자를 찾을 수 없습니다." }, { status: 404 });
    const values = await validateInput({ ...body, loginId: current.rows[0].login_id }, false);
    const result = await query<UserRow>(`
      update profiles set display_name=$2, email=$3, company_slug=$4,
        access_level=$5::varchar, password_hash=coalesce($6, password_hash),
        is_platform_admin=($5::varchar = 'SUPER_ADMIN'), updated_at=now()
      where id=$1
      returning id, login_id as "loginId", display_name as "displayName", email,
                company_slug as "companySlug", access_level as "accessLevel", is_active as "isActive"
    `, [body.id, values.displayName, values.email, values.companySlug, values.accessLevel, values.passwordHash]);
    if (!result.rowCount) return Response.json({ error: "수정할 사용자를 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ user: result.rows[0] });
  } catch (error) { return errorResponse(error, 400); }
}

export async function DELETE(request: Request) {
  try {
    await ensureUserSchema();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "삭제할 사용자 ID가 필요합니다." }, { status: 400 });
    const result = await query("delete from profiles where id = $1 and login_id is not null", [id]);
    if (!result.rowCount) return Response.json({ error: "삭제할 사용자를 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error, 400); }
}
