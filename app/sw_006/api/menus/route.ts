import { errorResponse, query, transaction } from "@/lib/sw006-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MenuRow = { id: string; parent_id: string | null; depth: number | null; name: string; slug: string | null; sort_order: number | null; url_type: string | null; board_id: string | null };

export async function GET(request: Request) {
  try {
    const siteSlug = new URL(request.url).searchParams.get("siteSlug");
    if (!siteSlug) return Response.json({ menus: [] });
    const result = await query<MenuRow>(`
      select m.id, m.parent_id, m.depth, m.name, m.slug, m.sort_order,
             case when m.board_id is not null or upper(coalesce(m.url_type, '')) = 'BOARD' then 'BOARD' else 'PAGE' end as url_type,
             m.board_id
      from menus m join sites s on s.id = m.site_id
      where s.company_slug = $1
      order by m.depth, m.sort_order, m.created_at
    `, [siteSlug]);
    return Response.json({ menus: result.rows });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { siteSlug?: string; parentId?: string | null; name?: string; isBoard?: boolean };
    if (!body.siteSlug || !body.name?.trim()) return Response.json({ error: "사이트와 메뉴명이 필요합니다." }, { status: 400 });
    const siteSlug = body.siteSlug;
    const menuName = body.name.trim();
    const menu = await transaction(async (client) => {
      const site = await client.query<{ id: string }>("select id from sites where company_slug = $1 limit 1", [siteSlug]);
      if (!site.rowCount) throw new Error("선택한 사이트를 찾을 수 없습니다.");
      const depth = body.parentId ? 2 : 1;
      if (body.isBoard && depth !== 2) throw new Error("게시판 용도는 중메뉴에만 설정할 수 있습니다.");
      if (body.parentId) {
        const parent = await client.query("select 1 from menus where id = $1 and site_id = $2 and depth = 1", [body.parentId, site.rows[0].id]);
        if (!parent.rowCount) throw new Error("선택한 사이트의 대메뉴를 찾을 수 없습니다.");
      }
      const order = await client.query<{ next_order: number }>("select coalesce(max(sort_order), 0) + 1 as next_order from menus where site_id = $1 and parent_id is not distinct from $2", [site.rows[0].id, body.parentId ?? null]);
      const slugBase = menuName.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, "") || `menu-${Date.now()}`;
      let boardId: string | null = null;
      if (body.isBoard) {
        const board = await client.query<{ id: string }>(`
          insert into boards (site_id, code, name)
          values ($1, $2, $3)
          on conflict (site_id, name) do update set is_enabled = true, updated_at = now()
          returning id
        `, [site.rows[0].id, `menu-${crypto.randomUUID()}`, menuName]);
        boardId = board.rows[0].id;
      }
      const result = await client.query<MenuRow>(`
        insert into menus (site_id, parent_id, depth, name, slug, sort_order, url_type, board_id)
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        returning id, parent_id, depth, name, slug, sort_order, url_type, board_id
      `, [site.rows[0].id, body.parentId ?? null, depth, menuName, slugBase, order.rows[0].next_order, body.isBoard ? "BOARD" : "PAGE", boardId]);
      return result.rows[0];
    });
    return Response.json({ menu }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; siteSlug?: string; name?: string; isBoard?: boolean };
    const name = body.name?.trim() ?? "";
    if (!body.id || !body.siteSlug) return Response.json({ error: "수정할 사이트와 메뉴 ID가 필요합니다." }, { status: 400 });
    if (!name) return Response.json({ error: "메뉴명을 입력해 주세요." }, { status: 400 });
    const menu = await transaction(async (client) => {
      const current = await client.query<MenuRow & { site_id: string }>(`
        select m.id, m.site_id, m.parent_id, m.depth, m.name, m.slug, m.sort_order, m.url_type, m.board_id
        from menus m join sites s on s.id = m.site_id
        where m.id = $1 and s.company_slug = $2
        limit 1
      `, [body.id, body.siteSlug]);
      if (!current.rowCount) throw new Error("수정할 메뉴를 찾을 수 없습니다.");
      const before = current.rows[0];
      let boardId = before.board_id;
      let urlType = before.url_type ?? "PAGE";

      if (before.depth === 2 && typeof body.isBoard === "boolean") {
        if (body.isBoard && !boardId) {
          const board = await client.query<{ id: string }>(`
            insert into boards (site_id, code, name)
            values ($1, $2, $3)
            on conflict (site_id, name) do update set is_enabled = true, updated_at = now()
            returning id
          `, [before.site_id, `menu-${crypto.randomUUID()}`, name]);
          boardId = board.rows[0].id;
          urlType = "BOARD";
          await client.query("delete from pages where site_id = $1 and menu_id = $2", [before.site_id, before.id]);
        } else if (!body.isBoard && boardId) {
          const used = await client.query("select 1 from board_posts where board_id = $1 limit 1", [boardId]);
          if (used.rowCount) throw new Error("게시글이 있는 메뉴는 일반 화면으로 변경할 수 없습니다. 콘텐츠 관리에서 게시글을 먼저 삭제해 주세요.");
          const previousBoardId = boardId;
          boardId = null;
          urlType = "PAGE";
          await client.query("delete from boards where id = $1", [previousBoardId]);
        }
      }

      const updated = await client.query<MenuRow>(`
        update menus set name = $2, url_type = $3, board_id = $4, updated_at = now()
        where id = $1
        returning id, parent_id, depth, name, slug, sort_order, url_type, board_id
      `, [before.id, name, urlType, boardId]);
      if (boardId) await client.query("update boards set name = $2, updated_at = now() where id = $1", [boardId, name]);
      return updated.rows[0];
    });
    return Response.json({ menu });
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "삭제할 메뉴 ID가 필요합니다." }, { status: 400 });
    await transaction(async (client) => {
      const linked = await client.query<{ board_id: string }>("select board_id from menus where (id = $1 or parent_id = $1) and board_id is not null", [id]);
      if (linked.rowCount) {
        const used = await client.query("select 1 from board_posts where board_id = any($1::varchar[]) limit 1", [linked.rows.map((row) => row.board_id)]);
        if (used.rowCount) throw new Error("게시글이 등록된 게시판 메뉴는 삭제할 수 없습니다. 콘텐츠 관리에서 게시글을 먼저 삭제해 주세요.");
      }
      await client.query("delete from menus where parent_id = $1", [id]);
      const result = await client.query("delete from menus where id = $1", [id]);
      if (!result.rowCount) throw new Error("삭제할 메뉴를 찾을 수 없습니다.");
      if (linked.rowCount) await client.query("delete from boards where id = any($1::varchar[])", [linked.rows.map((row) => row.board_id)]);
    });
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
