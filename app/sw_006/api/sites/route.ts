import { errorResponse, query, transaction } from "@/lib/sw006-db";
import { createSiteStructure, deleteSiteStructure } from "@/lib/sw006-site-files";
import { getSessionFromRequest } from "@/lib/sw006-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SiteRow = {
  id: string;
  company_slug: string;
  name: string;
  industry: string | null;
  status: string | null;
  updated_at: Date | string | null;
};

function formatSite(row: SiteRow) {
  const statuses: Record<string, string> = { BUILD: "Build", DRAFT: "Draft", LIVE: "Live", READY: "Ready" };
  return {
    id: row.id,
    slug: row.company_slug,
    name: row.name,
    industry: row.industry ?? "미분류",
    status: statuses[row.status ?? ""] ?? "Draft",
    updated: row.updated_at ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(row.updated_at)) : "-",
  };
}

async function listSites(companySlug?: string | null) {
  const result = await query<SiteRow>(`
    select id, company_slug, name, industry, status, updated_at
    from sites
    where ($1::text is null or company_slug = $1)
    order by updated_at desc nulls last, created_at desc nulls last
  `, [companySlug ?? null]);
  return result.rows.map(formatSite);
}

export async function GET(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (session.accessLevel === "SITE_USER" && !session.companySlug) return Response.json({ error: "담당 사이트가 지정되지 않았습니다." }, { status: 403 });
    return Response.json({ sites: await listSites(session.accessLevel === "SITE_USER" ? session.companySlug : null) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { slug?: string; name?: string; industry?: string };
    const slug = body.slug?.trim().toLowerCase() ?? "";
    const name = body.name?.trim() ?? "";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return Response.json({ error: "업체 slug는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다." }, { status: 400 });
    }
    if (!name) {
      return Response.json({ error: "사이트명을 입력해 주세요." }, { status: 400 });
    }

    const duplicate = await query("select 1 from sites where company_slug = $1 limit 1", [slug]);
    if (duplicate.rowCount) throw new Error("이미 사용 중인 업체 slug입니다.");

    const structure = await createSiteStructure({ slug, name, industry: body.industry?.trim() || null });
    let saved = false;
    try {
      const site = await transaction(async (client) => {
      const duplicate = await client.query("select 1 from sites where company_slug = $1 limit 1", [slug]);
      if (duplicate.rowCount) throw new Error("이미 사용 중인 업체 slug입니다.");
      const result = await client.query<SiteRow>(`
        insert into sites (company_slug, name, industry, status, output_path)
        values ($1, $2, $3, 'DRAFT', $4)
        returning id, company_slug, name, industry, status, updated_at
      `, [slug, name, body.industry?.trim() || null, structure.outputPath]);
      return formatSite(result.rows[0]);
      });
      saved = true;
      return Response.json({ site, folder: structure.outputPath }, { status: 201 });
    } finally {
      if (!saved) await deleteSiteStructure(slug).catch(() => undefined);
    }
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; name?: string; industry?: string };
    const name = body.name?.trim() ?? "";
    const industry = body.industry?.trim() ?? "";
    if (!body.id) return Response.json({ error: "수정할 사이트 ID가 필요합니다." }, { status: 400 });
    if (!name) return Response.json({ error: "사이트 이름을 입력해 주세요." }, { status: 400 });
    const result = await query<SiteRow>(`
      update sites
      set name = $2, industry = nullif($3, ''), updated_at = now()
      where id = $1
      returning id, company_slug, name, industry, status, updated_at
    `, [body.id, name, industry]);
    if (!result.rowCount) return Response.json({ error: "수정할 사이트를 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ site: formatSite(result.rows[0]) });
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "삭제할 사이트 ID가 필요합니다." }, { status: 400 });
    const siteResult = await query<{ company_slug: string }>("select company_slug from sites where id = $1 limit 1", [id]);
    if (!siteResult.rowCount) return Response.json({ error: "삭제할 사이트를 찾을 수 없습니다." }, { status: 404 });
    const slug = siteResult.rows[0].company_slug;
    await transaction(async (client) => {
      await client.query("delete from board_files where post_id in (select id from board_posts where site_id = $1)", [id]);
      for (const table of ["board_posts", "boards", "menus", "footers", "main_sections", "assets", "pages", "site_templates", "generated_files", "generation_jobs"]) {
        await client.query(`delete from ${table} where site_id = $1`, [id]);
      }
      const result = await client.query("delete from sites where id = $1", [id]);
      if (!result.rowCount) throw new Error("삭제할 사이트를 찾을 수 없습니다.");
    });
    await deleteSiteStructure(slug);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
