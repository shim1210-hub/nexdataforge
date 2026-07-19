import { Pool } from "pg";
import { assertStoreAccess } from "../_lib/operator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CouponPayload = {
  id?: string;
  storeId?: string;
  name?: string;
  discountType?: string;
  discountValue?: number;
  minimumOrderAmount?: number;
  startAt?: string;
  endAt?: string;
  totalQuantity?: number | null;
  perUserLimit?: number;
  imageUrl?: string | null;
};

const globalForSw002 = globalThis as unknown as { sw002Pool?: Pool };
const discountTypes = new Set(["AMOUNT", "PERCENT", "GIFT", "SERVICE"]);

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL 환경 변수가 설정되어 있지 않습니다.");
  if (!globalForSw002.sw002Pool) globalForSw002.sw002Pool = new Pool({ connectionString: databaseUrl, max: 5, ssl: { rejectUnauthorized: false } });
  return globalForSw002.sw002Pool;
}

function validId(value: string | undefined) {
  return Boolean(value && /^\d+$/.test(value) && value !== "0");
}

function errorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "쿠폰 처리 중 오류가 발생했습니다.";
}

const selectCoupons = `
  select id::text as id, store_id::text as store_id, event_id::text as event_id,
         name, description, discount_type, discount_value, minimum_order_amount,
         start_at, end_at, total_quantity, issued_quantity, used_quantity,
         per_user_limit, status, image_url
    from sw002_coupons
   where store_id = $1
   order by start_at desc, id desc
`;

export async function GET(request: Request) {
  try {
    const storeId = new URL(request.url).searchParams.get("storeId") ?? "";
    if (!validId(storeId)) throw new Error("관리할 매장을 선택해 주세요.");
    await assertStoreAccess(storeId);
    const result = await getPool().query(selectCoupons, [storeId]);
    return Response.json({ coupons: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CouponPayload;
    if (!validId(payload.storeId)) throw new Error("관리할 매장을 선택해 주세요.");
    await assertStoreAccess(payload.storeId!);
    if (!payload.name?.trim()) throw new Error("쿠폰명을 입력해 주세요.");
    if (!payload.discountType || !discountTypes.has(payload.discountType)) throw new Error("올바른 할인 유형을 선택해 주세요.");
    if (!Number.isInteger(payload.discountValue) || (payload.discountValue ?? -1) < 0) throw new Error("올바른 할인값을 입력해 주세요.");
    if (!Number.isInteger(payload.minimumOrderAmount) || (payload.minimumOrderAmount ?? -1) < 0) throw new Error("최소 주문금액을 확인해 주세요.");
    if (!Number.isInteger(payload.perUserLimit) || (payload.perUserLimit ?? 0) < 1) throw new Error("1인당 사용 한도는 1 이상이어야 합니다.");
    if (payload.totalQuantity !== null && (!Number.isInteger(payload.totalQuantity) || (payload.totalQuantity ?? -1) < 0)) throw new Error("발급 수량을 확인해 주세요.");
    const startAt = new Date(payload.startAt ?? "");
    const endAt = new Date(payload.endAt ?? "");
    if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || endAt <= startAt) throw new Error("종료일은 시작일보다 이후여야 합니다.");
    const now = new Date();
    const status = startAt <= now && endAt > now ? "ACTIVE" : endAt <= now ? "ENDED" : "SCHEDULED";
    const store = await getPool().query("select id from sw002_stores where id = $1", [payload.storeId]);
    if (!store.rows[0]) throw new Error("선택한 매장을 찾을 수 없습니다.");
    await getPool().query(
      `insert into sw002_coupons
         (store_id, name, discount_type, discount_value, minimum_order_amount,
          start_at, end_at, total_quantity, per_user_limit, status, image_url)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [payload.storeId, payload.name.trim(), payload.discountType, payload.discountValue, payload.minimumOrderAmount, startAt.toISOString(), endAt.toISOString(), payload.totalQuantity, payload.perUserLimit, status, payload.imageUrl ?? null],
    );
    const result = await getPool().query(selectCoupons, [payload.storeId]);
    return Response.json({ coupons: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as CouponPayload;
    if (!validId(payload.id) || !validId(payload.storeId)) throw new Error("수정할 쿠폰을 찾을 수 없습니다.");
    await assertStoreAccess(payload.storeId!);
    if (!payload.name?.trim()) throw new Error("쿠폰명을 입력해 주세요.");
    if (!payload.discountType || !discountTypes.has(payload.discountType)) throw new Error("올바른 할인 유형을 선택해 주세요.");
    if (!Number.isInteger(payload.discountValue) || (payload.discountValue ?? -1) < 0) throw new Error("올바른 할인값을 입력해 주세요.");
    if (!Number.isInteger(payload.minimumOrderAmount) || (payload.minimumOrderAmount ?? -1) < 0) throw new Error("최소 주문금액을 확인해 주세요.");
    if (!Number.isInteger(payload.perUserLimit) || (payload.perUserLimit ?? 0) < 1) throw new Error("1인당 사용 한도는 1 이상이어야 합니다.");
    if (payload.totalQuantity !== null && (!Number.isInteger(payload.totalQuantity) || (payload.totalQuantity ?? -1) < 0)) throw new Error("발급 수량을 확인해 주세요.");
    const startAt = new Date(payload.startAt ?? "");
    const endAt = new Date(payload.endAt ?? "");
    if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || endAt <= startAt) throw new Error("종료일은 시작일보다 이후여야 합니다.");
    const now = new Date();
    const status = startAt <= now && endAt > now ? "ACTIVE" : endAt <= now ? "ENDED" : "SCHEDULED";
    const updated = await getPool().query(
      `update sw002_coupons
          set name = $1, discount_type = $2, discount_value = $3,
              minimum_order_amount = $4, start_at = $5, end_at = $6,
              total_quantity = $7, per_user_limit = $8, status = $9,
              image_url = $10, updated_at = now()
        where id = $11 and store_id = $12`,
      [payload.name.trim(), payload.discountType, payload.discountValue, payload.minimumOrderAmount, startAt.toISOString(), endAt.toISOString(), payload.totalQuantity, payload.perUserLimit, status, payload.imageUrl ?? null, payload.id, payload.storeId],
    );
    if (!updated.rowCount) throw new Error("수정할 쿠폰을 찾을 수 없습니다.");
    const result = await getPool().query(selectCoupons, [payload.storeId]);
    return Response.json({ coupons: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") ?? "";
    const storeId = url.searchParams.get("storeId") ?? "";
    if (!validId(id) || !validId(storeId)) throw new Error("삭제할 쿠폰을 찾을 수 없습니다.");
    await assertStoreAccess(storeId);
    const deleted = await getPool().query("delete from sw002_coupons where id = $1 and store_id = $2", [id, storeId]);
    if (!deleted.rowCount) throw new Error("삭제할 쿠폰을 찾을 수 없습니다.");
    const result = await getPool().query(selectCoupons, [storeId]);
    return Response.json({ coupons: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
