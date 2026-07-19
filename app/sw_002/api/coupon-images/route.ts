import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { Pool } from "pg";
import { assertStoreAccess } from "../_lib/operator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const globalForSw002 = globalThis as unknown as { sw002Pool?: Pool };
const allowedImageTypes: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
const palettes: Record<string, [string, string]> = { blue: ["#246bfd", "#173e9f"], coral: ["#ff6b57", "#c83f37"], green: ["#20a46b", "#126b49"] };

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL 환경 변수가 설정되어 있지 않습니다.");
  if (!globalForSw002.sw002Pool) globalForSw002.sw002Pool = new Pool({ connectionString: databaseUrl, max: 5, ssl: { rejectUnauthorized: false } });
  return globalForSw002.sw002Pool;
}

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "쿠폰 이미지 처리 중 오류가 발생했습니다.";
}

export async function POST(request: Request) {
  let savedFilePath = "";
  try {
    const formData = await request.formData();
    const storeId = String(formData.get("storeId") ?? "");
    const mode = String(formData.get("mode") ?? "generated");
    if (!/^\d+$/.test(storeId) || storeId === "0") throw new Error("먼저 관리할 매장을 선택해 주세요.");
    await assertStoreAccess(storeId);
    const store = await getPool().query("select id from sw002_stores where id = $1", [storeId]);
    if (!store.rows[0]) throw new Error("선택한 매장을 찾을 수 없습니다.");

    let bytes: Buffer;
    let mimeType: string;
    let originalName: string;
    let extension: string;

    if (mode === "upload") {
      const file = formData.get("image");
      if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") throw new Error("업로드할 이미지를 선택해 주세요.");
      if (!allowedImageTypes[file.type]) throw new Error("JPG, PNG, WEBP, GIF 이미지만 등록할 수 있습니다.");
      if (file.size > 10 * 1024 * 1024) throw new Error("이미지는 10MB 이하만 등록할 수 있습니다.");
      bytes = Buffer.from(await file.arrayBuffer());
      mimeType = file.type;
      originalName = file.name;
      extension = allowedImageTypes[file.type];
    } else {
      const name = escapeXml(String(formData.get("name") ?? "동네온 쿠폰").slice(0, 30));
      const benefit = escapeXml(String(formData.get("benefit") ?? "SPECIAL BENEFIT").slice(0, 30));
      const palette = palettes[String(formData.get("style") ?? "blue")] ?? palettes.blue;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient></defs><rect width="800" height="450" rx="36" fill="url(#g)"/><circle cx="690" cy="90" r="120" fill="#fff" opacity=".12"/><circle cx="730" cy="390" r="180" fill="#fff" opacity=".08"/><text x="58" y="85" fill="#fff" opacity=".8" font-size="24" font-family="Arial,sans-serif" font-weight="700">DONGNEON COUPON</text><text x="58" y="210" fill="#fff" font-size="54" font-family="Arial,sans-serif" font-weight="800">${name}</text><text x="58" y="300" fill="#fff" font-size="64" font-family="Arial,sans-serif" font-weight="900">${benefit}</text><text x="58" y="380" fill="#fff" opacity=".8" font-size="22" font-family="Arial,sans-serif">동네에서 만나는 오늘의 특별한 혜택</text></svg>`;
      bytes = Buffer.from(svg, "utf8");
      mimeType = "image/svg+xml";
      originalName = "generated-coupon.svg";
      extension = "svg";
    }

    const fileName = `${storeId}-${randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), "public", "sw_002", "coupons");
    savedFilePath = path.join(directory, fileName);
    const publicPath = `/sw_002/coupons/${fileName}`;
    await mkdir(directory, { recursive: true });
    await writeFile(savedFilePath, bytes);
    await getPool().query(
      `insert into sw002_assets (store_id, asset_type, storage_provider, storage_path, original_name, mime_type, size_bytes, alt_text, is_active)
       values ($1, 'COUPON', 'LOCAL', $2, $3, $4, $5, '쿠폰 이미지', true)`,
      [storeId, publicPath, originalName, mimeType, bytes.length],
    );
    return Response.json({ imageUrl: publicPath });
  } catch (error) {
    if (savedFilePath) await unlink(savedFilePath).catch(() => undefined);
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
