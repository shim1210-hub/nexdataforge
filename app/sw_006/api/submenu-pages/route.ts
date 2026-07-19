import { errorResponse, query, transaction } from "@/lib/sw006-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageRow = {
  menuId: string;
  parentId: string;
  parentName: string;
  menuName: string;
  menuSlug: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
};

export async function GET(request: Request) {
  try {
    const siteSlug = new URL(request.url).searchParams.get("siteSlug");
    if (!siteSlug) return Response.json({ pages: [] });
    const result = await query<PageRow>(`
      select m.id as "menuId", parent.id as "parentId", parent.name as "parentName", m.name as "menuName",
             m.slug as "menuSlug", p.title, p.content ->> 'subtitle' as subtitle,
             p.content ->> 'body' as body, p.content ->> 'imageUrl' as "imageUrl"
      from menus m
      join menus parent on parent.id = m.parent_id
      join sites s on s.id = m.site_id
      left join lateral (
        select title, content
        from pages
        where site_id = s.id and menu_id = m.id
        order by updated_at desc nulls last, created_at desc nulls last
        limit 1
      ) p on true
      where s.company_slug = $1 and m.depth = 2 and coalesce(m.url_type, 'PAGE') <> 'BOARD'
      order by parent.sort_order, m.sort_order
    `, [siteSlug]);
    return Response.json({ pages: result.rows });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { siteSlug?: string; menuId?: string; title?: string; subtitle?: string; body?: string; imageUrl?: string };
    if (!body.siteSlug || !body.menuId) return Response.json({ error: "사이트와 중메뉴를 선택해 주세요." }, { status: 400 });
    const title = body.title?.trim();
    if (!title) return Response.json({ error: "화면 제목을 입력해 주세요." }, { status: 400 });
    const content = { subtitle: body.subtitle?.trim() || "", body: body.body?.trim() || "", imageUrl: body.imageUrl?.trim() || "" };

    await transaction(async (client) => {
      const menu = await client.query<{ site_id: string; slug: string }>(`
        select m.site_id, m.slug
        from menus m join sites s on s.id = m.site_id
        where s.company_slug = $1 and m.id = $2 and m.depth = 2
        limit 1
      `, [body.siteSlug, body.menuId]);
      if (!menu.rowCount) throw new Error("선택한 사이트의 중메뉴를 찾을 수 없습니다.");

      const updated = await client.query(`
        update pages
        set title = $3, content = $4::jsonb, status = 'PUBLISHED',
            published_at = coalesce(published_at, now()),
            updated_at = now()
        where site_id = $1 and menu_id = $2
      `, [menu.rows[0].site_id, body.menuId, title, JSON.stringify(content)]);
      if (!updated.rowCount) {
        await client.query(`
          insert into pages (site_id, menu_id, slug, title, content, status, published_at)
          values ($1, $2, $3, $4, $5::jsonb, 'PUBLISHED', now())
        `, [menu.rows[0].site_id, body.menuId, menu.rows[0].slug, title, JSON.stringify(content)]);
      }
    });
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
