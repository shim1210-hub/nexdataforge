import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Pool } from "pg";
import { assertStoreAccess } from "../_lib/operator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const globalForSw002 = globalThis as unknown as { sw002Pool?: Pool };
const allowedImageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL 환경 변수가 설정되어 있지 않습니다.");

  if (!globalForSw002.sw002Pool) {
    globalForSw002.sw002Pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl: { rejectUnauthorized: false },
    });
  }

  return globalForSw002.sw002Pool;
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "이미지 저장 중 오류가 발생했습니다.";
}

export async function POST(request: Request) {
  let savedFilePath = "";

  try {
    const formData = await request.formData();
    const storeIdValue = formData.get("storeId");
    const storeId = typeof storeIdValue === "string" ? storeIdValue : "";
    const file = formData.get("image");

    if (!/^\d+$/.test(storeId) || storeId === "0") throw new Error("먼저 매장 정보를 저장해 주세요.");
    await assertStoreAccess(storeId);
    if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") throw new Error("저장할 이미지 파일을 선택해 주세요.");
    if (!allowedImageTypes[file.type]) throw new Error("JPG, PNG, WEBP, GIF 이미지만 등록할 수 있습니다.");
    if (file.size > 10 * 1024 * 1024) throw new Error("이미지는 10MB 이하만 등록할 수 있습니다.");

    const exists = await getPool().query("select id from sw002_stores where id = $1", [storeId]);
    if (!exists.rows[0]) throw new Error("이미지를 등록할 매장을 찾을 수 없습니다.");

    const fileName = `${storeId}-${randomUUID()}.${allowedImageTypes[file.type]}`;
    const uploadDirectory = path.join(process.cwd(), "public", "sw_002", "uploads");
    savedFilePath = path.join(uploadDirectory, fileName);
    const publicPath = `/sw_002/uploads/${fileName}`;

    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(savedFilePath, Buffer.from(await file.arrayBuffer()));

    const client = await getPool().connect();
    try {
      await client.query("begin");
      await client.query(
        `update sw002_assets
            set is_active = false
          where store_id = $1 and asset_type = 'STORE' and is_active = true`,
        [storeId],
      );
      const result = await client.query(
        `insert into sw002_assets
           (store_id, asset_type, storage_provider, storage_path, original_name,
            mime_type, size_bytes, alt_text, is_active)
         values ($1, 'STORE', 'LOCAL', $2, $3, $4, $5, $6, true)
         returning id, storage_path`,
        [storeId, publicPath, file.name, file.type, file.size, `${storeId}번 매장 대표 이미지`],
      );
      await client.query("commit");
      return Response.json({ asset: result.rows[0] });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    if (savedFilePath) {
      const { unlink } = await import("fs/promises");
      await unlink(savedFilePath).catch(() => undefined);
    }
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
