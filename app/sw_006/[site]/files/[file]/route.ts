import { readFile } from "node:fs/promises";
import path from "node:path";
import { errorResponse, query } from "@/lib/sw006-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const filePattern = /^[0-9a-f-]+\.(?:jpe?g|png|webp|gif|avif|docx?|pdf)$/i;

export async function GET(_request: Request, context: RouteContext<"/sw_006/[site]/files/[file]">) {
  try {
    const { site, file } = await context.params;
    if (!slugPattern.test(site) || !filePattern.test(file)) return Response.json({ error: "올바르지 않은 첨부파일 경로입니다." }, { status: 400 });
    const storagePath = `/sw_006/${site}/files/${file}`;
    const asset = await query<{ mime_type: string | null; original_name: string | null }>(`
      select a.mime_type, a.original_name from assets a
      join sites s on s.id = a.site_id
      where s.company_slug = $1 and a.storage_path = $2 limit 1
    `, [site, storagePath]);
    if (!asset.rowCount) return Response.json({ error: "첨부파일을 찾을 수 없습니다." }, { status: 404 });
    const basePath = path.resolve(process.cwd(), "app", "sw_006");
    const physicalPath = path.resolve(basePath, site, "files", file);
    if (!physicalPath.startsWith(`${basePath}${path.sep}`)) throw new Error("허용되지 않은 첨부파일 경로입니다.");
    const data = await readFile(physicalPath);
    const originalName = (asset.rows[0].original_name ?? file).replace(/["\r\n]/g, "");
    return new Response(data, { headers: { "Content-Type": asset.rows[0].mime_type ?? "application/octet-stream", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(originalName)}`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error, 404);
  }
}
