import { Pool } from "pg";
import { assertStoreAccess } from "../_lib/operator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MenuPayload = {
  id?: string;
  storeId?: string;
  name?: string;
  category?: string;
  price?: number;
  isVisible?: boolean;
};

const globalForSw002 = globalThis as unknown as { sw002Pool?: Pool };

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL 환경 변수가 설정되어 있지 않습니다.");
  if (!globalForSw002.sw002Pool) {
    globalForSw002.sw002Pool = new Pool({ connectionString: databaseUrl, max: 5, ssl: { rejectUnauthorized: false } });
  }
  return globalForSw002.sw002Pool;
}

function validId(value: string | undefined) {
  return Boolean(value && /^\d+$/.test(value) && value !== "0");
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "음식메뉴 처리 중 오류가 발생했습니다.";
}

const selectMenus = `
  select id::text as id, store_id::text as store_id, name, description, category,
         price, image_url, is_main, is_visible, sort_order
    from sw002_menus
   where store_id = $1
   order by sort_order, id
`;

export async function GET(request: Request) {
  try {
    const storeId = new URL(request.url).searchParams.get("storeId") ?? "";
    if (!validId(storeId)) throw new Error("관리할 매장을 선택해 주세요.");
    await assertStoreAccess(storeId);
    const result = await getPool().query(selectMenus, [storeId]);
    return Response.json({ menus: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MenuPayload;
    if (!validId(payload.storeId)) throw new Error("관리할 매장을 선택해 주세요.");
    await assertStoreAccess(payload.storeId!);
    if (!payload.name?.trim()) throw new Error("메뉴명을 입력해 주세요.");
    if (!payload.category?.trim()) throw new Error("메뉴 분류를 선택해 주세요.");
    if (!Number.isInteger(payload.price) || (payload.price ?? -1) < 0) throw new Error("올바른 가격을 입력해 주세요.");

    const store = await getPool().query("select id from sw002_stores where id = $1", [payload.storeId]);
    if (!store.rows[0]) throw new Error("선택한 매장을 찾을 수 없습니다.");
    await getPool().query(
      `insert into sw002_menus (store_id, name, category, price, is_visible)
       values ($1, $2, $3, $4, true)`,
      [payload.storeId, payload.name.trim(), payload.category.trim(), payload.price],
    );
    const result = await getPool().query(selectMenus, [payload.storeId]);
    return Response.json({ menus: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as MenuPayload;
    if (!validId(payload.id) || !validId(payload.storeId)) throw new Error("수정할 음식메뉴를 찾을 수 없습니다.");
    await assertStoreAccess(payload.storeId!);
    let updated;
    if (payload.name !== undefined || payload.category !== undefined || payload.price !== undefined) {
      if (!payload.name?.trim()) throw new Error("메뉴명을 입력해 주세요.");
      if (!payload.category?.trim()) throw new Error("메뉴 분류를 선택해 주세요.");
      if (!Number.isInteger(payload.price) || (payload.price ?? -1) < 0) throw new Error("올바른 가격을 입력해 주세요.");
      updated = await getPool().query(
        `update sw002_menus
            set name = $1, category = $2, price = $3, updated_at = now()
          where id = $4 and store_id = $5`,
        [payload.name.trim(), payload.category.trim(), payload.price, payload.id, payload.storeId],
      );
    } else {
      if (typeof payload.isVisible !== "boolean") throw new Error("변경할 노출 상태가 없습니다.");
      updated = await getPool().query(
        `update sw002_menus set is_visible = $1, updated_at = now() where id = $2 and store_id = $3`,
        [payload.isVisible, payload.id, payload.storeId],
      );
    }
    if (!updated.rowCount) throw new Error("수정할 음식메뉴를 찾을 수 없습니다.");
    const result = await getPool().query(selectMenus, [payload.storeId]);
    return Response.json({ menus: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") ?? "";
    const storeId = url.searchParams.get("storeId") ?? "";
    if (!validId(id) || !validId(storeId)) throw new Error("삭제할 음식메뉴를 찾을 수 없습니다.");
    await assertStoreAccess(storeId);
    const deleted = await getPool().query("delete from sw002_menus where id = $1 and store_id = $2", [id, storeId]);
    if (!deleted.rowCount) throw new Error("삭제할 음식메뉴를 찾을 수 없습니다.");
    const result = await getPool().query(selectMenus, [storeId]);
    return Response.json({ menus: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
