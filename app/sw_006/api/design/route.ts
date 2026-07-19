import { errorResponse, query } from "@/lib/sw006-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ThemeConfig = { layout: "horizontal" | "vertical" | "split"; primary: string; font: string; radius: number };
const defaults: ThemeConfig = { layout: "horizontal", primary: "#4F46E5", font: "Pretendard", radius: 12 };

export async function GET(request: Request) {
  try {
    const siteSlug = new URL(request.url).searchParams.get("siteSlug");
    if (!siteSlug) return Response.json({ config: defaults });
    const result = await query<{ theme_config: ThemeConfig | null }>(`
      select st.theme_config
      from sites s left join site_templates st on st.site_id = s.id
      where s.company_slug = $1 limit 1
    `, [siteSlug]);
    if (!result.rowCount) return Response.json({ error: "선택한 사이트를 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ config: { ...defaults, ...(result.rows[0].theme_config ?? {}) } });
  } catch (error) { return errorResponse(error); }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { siteSlug?: string; config?: Partial<ThemeConfig> };
    if (!body.siteSlug) return Response.json({ error: "화면을 설정할 사이트를 선택해 주세요." }, { status: 400 });
    const layout = body.config?.layout;
    if (!layout || !["horizontal", "vertical", "split"].includes(layout)) return Response.json({ error: "레이아웃을 선택해 주세요." }, { status: 400 });
    const config: ThemeConfig = { layout, primary: body.config?.primary || defaults.primary, font: body.config?.font || defaults.font, radius: Number(body.config?.radius) || defaults.radius };
    const site = await query<{ id: string }>("select id from sites where company_slug = $1 limit 1", [body.siteSlug]);
    if (!site.rowCount) return Response.json({ error: "선택한 사이트를 찾을 수 없습니다." }, { status: 404 });
    await query(`
      insert into site_templates (site_id, theme_config, updated_at)
      values ($1, $2::jsonb, now())
      on conflict (site_id) do update set theme_config = excluded.theme_config, updated_at = now()
    `, [site.rows[0].id, JSON.stringify(config)]);
    return Response.json({ config });
  } catch (error) { return errorResponse(error, 400); }
}
