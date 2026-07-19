import { errorResponse, query } from "@/lib/sw006-db";
import { canAccessSite, getSessionFromRequest } from "@/lib/sw006-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BoardRow = { id: string; code: string; name: string; description: string | null; is_enabled: boolean };

export async function GET(request: Request) {
  try {
    const siteSlug = new URL(request.url).searchParams.get("siteSlug")?.trim();
    const session = getSessionFromRequest(request);
    if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (siteSlug && !canAccessSite(session, siteSlug)) return Response.json({ error: "담당 사이트의 게시판만 조회할 수 있습니다." }, { status: 403 });
    if (!siteSlug) return Response.json({ error: "사이트를 선택해 주세요." }, { status: 400 });
    const result = await query<BoardRow>(`
      select b.id, b.code, b.name, b.description, b.is_enabled
      from boards b join sites s on s.id = b.site_id
      where s.company_slug = $1 and b.is_enabled = true
      order by b.created_at, b.name
    `, [siteSlug]);
    return Response.json({ boards: result.rows });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { siteSlug?: string; name?: string };
    const siteSlug = body.siteSlug?.trim() ?? "";
    const name = body.name?.trim() ?? "";
    if (!siteSlug || !name) return Response.json({ error: "사이트와 콘텐츠 유형 이름을 입력해 주세요." }, { status: 400 });
    const result = await query<BoardRow>(`
      insert into boards (site_id, code, name)
      select id, 'content-' || substr(md5(random()::text || clock_timestamp()::text), 1, 12), $2
      from sites where company_slug = $1
      on conflict (site_id, name) do update set is_enabled = true, updated_at = now()
      returning id, code, name, description, is_enabled
    `, [siteSlug, name]);
    if (!result.rowCount) return Response.json({ error: "사이트를 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ board: result.rows[0] }, { status: 201 });
  } catch (error) { return errorResponse(error, 400); }
}

export async function DELETE(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const id = params.get("id"); const siteSlug = params.get("siteSlug");
    if (!id || !siteSlug) return Response.json({ error: "삭제할 콘텐츠 유형과 사이트가 필요합니다." }, { status: 400 });
    const used = await query("select 1 from board_posts where board_id = $1 limit 1", [id]);
    if (used.rowCount) return Response.json({ error: "게시글이 있는 유형은 삭제할 수 없습니다. 게시글을 먼저 삭제해 주세요." }, { status: 409 });
    const result = await query(`delete from boards b using sites s where b.id = $1 and b.site_id = s.id and s.company_slug = $2`, [id, siteSlug]);
    if (!result.rowCount) return Response.json({ error: "삭제할 콘텐츠 유형을 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error, 400); }
}
