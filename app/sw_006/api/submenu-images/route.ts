import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { errorResponse, query } from "@/lib/sw006-db";

export const runtime = "nodejs";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedTypes = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"], ["image/gif", ".gif"], ["image/avif", ".avif"]]);

function safeBaseName(fileName: string) {
  return (path.basename(fileName, path.extname(fileName)).normalize("NFKC").replace(/[^a-zA-Z0-9가-힣_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const siteSlug = String(formData.get("siteSlug") ?? "");
    const file = formData.get("file");
    if (!slugPattern.test(siteSlug)) return Response.json({ error: "올바른 사이트를 선택해 주세요." }, { status: 400 });
    if (!(file instanceof File)) return Response.json({ error: "업로드할 이미지 파일을 선택해 주세요." }, { status: 400 });
    const extension = allowedTypes.get(file.type);
    if (!extension) return Response.json({ error: "PNG, JPG, WebP, GIF, AVIF 이미지만 업로드할 수 있습니다." }, { status: 400 });
    if (file.size <= 0 || file.size > 10 * 1024 * 1024) return Response.json({ error: "이미지 크기는 10MB 이하여야 합니다." }, { status: 400 });
    const site = await query<{ id: string }>("select id from sites where company_slug = $1 limit 1", [siteSlug]);
    if (!site.rowCount) return Response.json({ error: "사이트 정보를 찾을 수 없습니다." }, { status: 404 });

    const basePath = path.resolve(process.cwd(), "app", "sw_006");
    const imageDirectory = path.resolve(basePath, siteSlug, "images");
    if (!imageDirectory.startsWith(`${basePath}${path.sep}`)) throw new Error("허용되지 않은 저장 경로입니다.");
    const fileName = `${safeBaseName(file.name)}-${Date.now()}${extension}`;
    await mkdir(imageDirectory, { recursive: true });
    await writeFile(path.join(imageDirectory, fileName), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    return Response.json({ ok: true, imageUrl: `/sw_006/${siteSlug}/images/${encodeURIComponent(fileName)}`, physicalPath: `app/sw_006/${siteSlug}/images/${fileName}` });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
