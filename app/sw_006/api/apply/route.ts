import { errorResponse, transaction } from "@/lib/sw006-db";
import { getPublicSiteData } from "@/lib/sw006-public-data";
import { writeAppliedSiteFiles } from "@/lib/sw006-site-files";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { siteSlug?: string };
    if (!body.siteSlug) return Response.json({ error: "적용할 사이트를 선택해 주세요." }, { status: 400 });
    const data = await getPublicSiteData(body.siteSlug);
    if (!data) return Response.json({ error: "선택한 사이트를 찾을 수 없습니다." }, { status: 404 });
    const missing = [];
    if (!data.menus.length) missing.push("메뉴");
    if (!data.sections.length) missing.push("메인 화면");
    if (!data.footer) missing.push("푸터");
    if (missing.length) return Response.json({ error: `${missing.join(", ")} 설정을 먼저 완료해 주세요.` }, { status: 400 });
    const generated = await writeAppliedSiteFiles(data);
    await transaction(async (client) => {
      await client.query("update sites set status='LIVE', output_path=$2, updated_at=now() where id=$1", [data.id, generated.outputPath]);
      const job = await client.query<{ id: string }>("insert into generation_jobs (site_id,status,progress,current_step,started_at,completed_at) values ($1,'SUCCEEDED',100,'사이트 적용 완료',now(),now()) returning id", [data.id]);
      for (const file of generated.files) await client.query("insert into generated_files (site_id,generation_job_id,relative_path) values ($1,$2,$3)", [data.id, job.rows[0].id, file]);
    });
    return Response.json({ ok: true, url: generated.outputPath });
  } catch (error) { return errorResponse(error, 400); }
}
