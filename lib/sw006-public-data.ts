import "server-only";

import { query } from "@/lib/sw006-db";

export type PublicMenu = { id: string; parentId: string | null; name: string; slug: string; urlType: string; boardId: string | null };
export type PublicSection = { sectionType: string; title: string | null; subtitle: string | null; body: string | null };
export type PublicPage = { menuId: string; title: string; subtitle: string | null; body: string | null; imageUrl: string | null };
export type PublicFooter = { companyName: string; representativeName: string | null; businessNumber: string | null; email: string | null; phone: string | null; address: string | null; copyrightText: string | null; siteByText: string | null };
export type PublicTheme = { layout: "horizontal" | "vertical" | "split"; primary: string; font: string; radius: number };
export type PublicAttachment = { id: string; name: string; url: string; mimeType: string | null };
export type PublicPost = { id: number; boardId: string; title: string; content: string; isNotice: boolean; publishedAt: string | null; attachments: PublicAttachment[] };

export type PublicSiteData = {
  id: string; slug: string; name: string; industry: string | null; status: string;
  menus: PublicMenu[]; sections: PublicSection[]; pages: PublicPage[]; posts: PublicPost[]; footer: PublicFooter | null; theme: PublicTheme;
};

export async function getPublicSiteData(slug: string): Promise<PublicSiteData | null> {
  const site = await query<{ id: string; company_slug: string; name: string; industry: string | null; status: string; theme_config: Partial<PublicTheme> | null }>(`
    select s.id, s.company_slug, s.name, s.industry, s.status, st.theme_config
    from sites s left join site_templates st on st.site_id = s.id
    where s.company_slug = $1 limit 1
  `, [slug]);
  if (!site.rowCount) return null;
  const row = site.rows[0];
  const [menus, sections, pages, posts, footer] = await Promise.all([
    query<PublicMenu>(`select id, parent_id as "parentId", name, slug, coalesce(url_type, 'PAGE') as "urlType", board_id as "boardId" from menus where site_id=$1 and is_enabled is not false order by depth, sort_order`, [row.id]),
    query<PublicSection>(`select section_type as "sectionType", title, subtitle, body from main_sections where site_id=$1 and is_enabled is not false order by sort_order`, [row.id]),
    query<PublicPage>(`select distinct on (menu_id) menu_id as "menuId", title, content ->> 'subtitle' as subtitle, content ->> 'body' as body, content ->> 'imageUrl' as "imageUrl" from pages where site_id=$1 order by menu_id, updated_at desc nulls last, created_at desc nulls last`, [row.id]),
    query<PublicPost>(`
      select bp.id::int, bp.board_id as "boardId", bp.title, bp.content,
             bp.is_notice as "isNotice", bp.published_at::text as "publishedAt",
             coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'name', a.original_name, 'url', a.storage_path, 'mimeType', a.mime_type) order by bf.sort_order)
               from board_files bf join assets a on a.id = bf.asset_id where bf.post_id = bp.id), '[]'::jsonb) as attachments
      from board_posts bp
      where bp.site_id=$1 and bp.status='PUBLISHED'
      order by bp.is_notice desc, bp.published_at desc nulls last, bp.created_at desc
    `, [row.id]),
    query<PublicFooter>(`select company_name as "companyName", representative_name as "representativeName", business_number as "businessNumber", email, phone, address, copyright_text as "copyrightText", site_by_text as "siteByText" from footers where site_id=$1 limit 1`, [row.id]),
  ]);
  return {
    id: row.id, slug: row.company_slug, name: row.name, industry: row.industry, status: row.status,
    menus: menus.rows,
    sections: sections.rows,
    pages: pages.rows,
    posts: posts.rows,
    footer: footer.rows[0] ?? null,
    theme: { layout: "horizontal", primary: "#4F46E5", font: "Pretendard", radius: 12, ...(row.theme_config ?? {}) },
  };
}
