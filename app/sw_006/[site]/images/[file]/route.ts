import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const filePattern = /^[a-zA-Z0-9가-힣_-]+\.(?:jpg|jpeg|png|webp|gif|avif)$/i;
const contentTypes: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif" };

export async function GET(_request: Request, context: RouteContext<"/sw_006/[site]/images/[file]">) {
  const { site, file } = await context.params;
  if (!slugPattern.test(site) || !filePattern.test(file)) return new Response("Not found", { status: 404 });
  const basePath = path.resolve(process.cwd(), "app", "sw_006");
  const filePath = path.resolve(basePath, site, "images", file);
  if (!filePath.startsWith(`${basePath}${path.sep}`)) return new Response("Not found", { status: 404 });
  try {
    const image = await readFile(filePath);
    return new Response(image, { headers: { "Content-Type": contentTypes[path.extname(file).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
