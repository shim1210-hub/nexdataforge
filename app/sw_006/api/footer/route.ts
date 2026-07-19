import { errorResponse, query } from "@/lib/sw006-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FooterInput = {
  companyName?: string;
  representativeName?: string;
  businessNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  copyrightText?: string;
  siteByText?: string;
};

export async function GET(request: Request) {
  try {
    const slug = new URL(request.url).searchParams.get("siteSlug");
    if (!slug) return Response.json({ footer: null });
    const result = await query(`
      select f.company_name as "companyName", f.representative_name as "representativeName",
             f.business_number as "businessNumber", f.email, f.phone, f.address,
             f.copyright_text as "copyrightText", f.site_by_text as "siteByText"
      from footers f join sites s on s.id = f.site_id where s.company_slug = $1 limit 1
    `, [slug]);
    return Response.json({ footer: result.rows[0] ?? null });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as FooterInput & { siteSlug?: string };
    const siteSlug = body.siteSlug?.trim().toLowerCase();
    const companyName = body.companyName?.trim();
    if (!siteSlug) return Response.json({ error: "푸터를 저장할 사이트를 선택해 주세요." }, { status: 400 });
    if (!companyName) return Response.json({ error: "회사명은 필수 입력 항목입니다." }, { status: 400 });

    const result = await query(`
      insert into footers (
        site_id, company_name, representative_name, business_number, email,
        phone, address, copyright_text, site_by_text, updated_at
      )
      select id, $2, $3, $4, $5, $6, $7, $8, $9, now()
      from sites
      where company_slug = $1
      on conflict (site_id) do update set
        company_name = excluded.company_name,
        representative_name = excluded.representative_name,
        business_number = excluded.business_number,
        email = excluded.email,
        phone = excluded.phone,
        address = excluded.address,
        copyright_text = excluded.copyright_text,
        site_by_text = excluded.site_by_text,
        updated_at = now()
    `, [
      siteSlug,
      companyName,
      body.representativeName?.trim() || null,
      body.businessNumber?.trim() || null,
      body.email?.trim() || null,
      body.phone?.trim() || null,
      body.address?.trim() || null,
      body.copyrightText?.trim() || null,
      body.siteByText?.trim() || "NexDataForge",
    ]);
    if (!result.rowCount) return Response.json({ error: "선택한 사이트를 찾을 수 없습니다." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
