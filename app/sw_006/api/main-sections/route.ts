import { errorResponse, query, transaction } from "@/lib/sw006-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SectionInput = { sectionType: string; title: string; subtitle: string; body: string; enabled: boolean };

export async function GET(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get("siteSlug");
    if (!slug) return Response.json({ sections: [] });
    const result = await query(`
      select ms.id, ms.section_type as "sectionType", ms.title, ms.subtitle, ms.body,
             ms.sort_order as "sortOrder", ms.is_enabled as enabled
      from main_sections ms join sites s on s.id = ms.site_id
      where s.company_slug = $1 order by ms.sort_order
    `, [slug]);
    return Response.json({ sections: result.rows });
  } catch (error) { return errorResponse(error); }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { siteSlug?: string; sections?: SectionInput[] };
    if (!body.siteSlug) return Response.json({ error: "메인 화면을 구성할 사이트를 선택해 주세요." }, { status: 400 });
    if (!Array.isArray(body.sections) || body.sections.length === 0) return Response.json({ error: "메인 섹션을 한 개 이상 입력해 주세요." }, { status: 400 });
    await transaction(async (client) => {
      const site = await client.query<{ id: string }>("select id from sites where company_slug = $1 limit 1", [body.siteSlug]);
      if (!site.rowCount) throw new Error("선택한 사이트를 찾을 수 없습니다.");
      await client.query("delete from main_sections where site_id = $1", [site.rows[0].id]);
      for (const [index, section] of body.sections!.entries()) {
        await client.query(`
          insert into main_sections (site_id, section_type, title, subtitle, body, sort_order, is_enabled)
          values ($1, $2, $3, $4, $5, $6, $7)
        `, [site.rows[0].id, section.sectionType, section.title.trim() || null, section.subtitle.trim() || null, section.body.trim() || null, index + 1, section.enabled]);
      }
    });
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error, 400); }
}
