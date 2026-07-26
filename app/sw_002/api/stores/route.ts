import { Pool } from "pg";
import { assertStoreAccess, requireOperator } from "../_lib/operator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StorePayload = {
  id?: string | null;
  name?: string;
  category?: string;
  category2?: string;
  description?: string;
  phone?: string;
  zipCd?: string;
  address?: string;
  addressDetail?: string;
  jibunAddress?: string;
  openTime?: string;
  closeTime?: string;
  latitude?: number | null;
  longitude?: number | null;
};

type KakaoAddressResponse = {
  documents?: Array<{ x?: string; y?: string }>;
  message?: string;
};

const globalForSw002 = globalThis as unknown as { sw002Pool?: Pool };

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL 환경 변수가 설정되어 있지 않습니다.");
  }

  if (!globalForSw002.sw002Pool) {
    globalForSw002.sw002Pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      ssl: { rejectUnauthorized: false },
    });
  }

  return globalForSw002.sw002Pool;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message ? error.message : "데이터베이스 처리 중 오류가 발생했습니다.";
}

function validate(payload: StorePayload) {
  if (payload.id && !/^\d+$/.test(payload.id)) throw new Error("올바르지 않은 매장 ID입니다.");
  if (!payload.name?.trim()) throw new Error("업체명을 입력해 주세요.");
  if (!payload.category?.trim()) throw new Error("업종을 선택해 주세요.");
  if (!payload.address?.trim()) throw new Error("주소를 검색하여 선택해 주세요.");
  if (!payload.openTime || !payload.closeTime) throw new Error("영업시간을 선택해 주세요.");
}

async function geocodeAddress(address: string) {
  const restApiKey = process.env.KAKAO_REST_API_KEY?.trim().replace(/^"|"$/g, "");
  if (!restApiKey) throw new Error("KAKAO_REST_API_KEY 환경 변수가 설정되어 있지 않습니다.");

  const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
  url.searchParams.set("query", address);
  const response = await fetch(url, {
    headers: { Authorization: `KakaoAK ${restApiKey}` },
    cache: "no-store",
  });
  const result = await response.json() as KakaoAddressResponse;

  if (!response.ok) throw new Error(result.message || "주소 좌표 검색에 실패했습니다.");
  const longitude = Number(result.documents?.[0]?.x);
  const latitude = Number(result.documents?.[0]?.y);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("선택한 주소의 위도·경도를 찾을 수 없습니다.");
  }

  return { latitude, longitude };
}

export async function GET() {
  try {
    const operator = await requireOperator();
    const result = await getPool().query(
      `select id::text as id, name, category, category2, description, phone, zip_cd, road_address as address, road_address_detail as address_detail,
              latitude::text as latitude, longitude::text as longitude,
              opening_hours, status, is_map_visible,
              (select storage_path
                 from sw002_assets
                where store_id = sw002_stores.id
                  and asset_type = 'STORE'
                  and is_active = true
                order by id desc
                limit 1) as image_url
         from sw002_stores
        where ($1::varchar = 'ADMIN' or exists (
          select 1 from sw002_store_members member
           where member.store_id = sw002_stores.id
             and member.user_id = $2
             and member.is_active = true
        ))
        order by id`,
      [operator.role, operator.userId],
    );

    return Response.json({ stores: result.rows });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const operator = await requireOperator();
    const payload = (await request.json()) as StorePayload;
    validate(payload);
    if (!Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
      throw new Error("주소 검색으로 위도와 경도를 확인한 후 저장해 주세요.");
    }
    const coordinates = { latitude: payload.latitude!, longitude: payload.longitude! };
    if (!payload.id && operator.role === "STORE_MANAGER") {
      const created = await getPool().query(
        `insert into sw002_stores
           (name, category, category2, description, phone, zip_cd, road_address, road_address_detail, jibun_address, opening_hours, latitude, longitude)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)
         returning id::text as id, name, category, category2, description, phone, zip_cd, road_address as address, road_address_detail as address_detail,
                   latitude::text as latitude, longitude::text as longitude, opening_hours, status, is_map_visible`,
        [payload.name?.trim(), payload.category?.trim(), payload.category2?.trim() || null, payload.description?.trim() || null,
         payload.phone?.trim() || null, payload.zipCd?.trim() || null, payload.address?.trim(), payload.addressDetail?.trim() || null, payload.jibunAddress?.trim() || null,
         JSON.stringify({ open: payload.openTime, close: payload.closeTime }), coordinates.latitude, coordinates.longitude],
      );
      await getPool().query(
        `insert into sw002_store_members (store_id, user_id, member_role, is_active) values ($1, $2, 'MANAGER', true)`,
        [created.rows[0].id, operator.userId],
      );
      return Response.json({ store: created.rows[0] });
    }
    if (payload.id) await assertStoreAccess(payload.id);
    if (!payload.id && operator.role !== "ADMIN") throw new Error("신규 매장 생성은 통합관리자만 할 수 있습니다.");

    const values = [
      payload.name?.trim(),
      payload.category?.trim(),
      payload.category2?.trim() || null,
      payload.description?.trim() || null,
      payload.phone?.trim() || null,
      payload.zipCd?.trim() || null,
      payload.address?.trim(),
      payload.addressDetail?.trim() || null,
      payload.jibunAddress?.trim() || null,
      JSON.stringify({ open: payload.openTime, close: payload.closeTime }),
      coordinates.latitude,
      coordinates.longitude,
    ];

    const result = payload.id
      ? await getPool().query(
          `update sw002_stores
              set name = $1, category = $2, category2 = $3, description = $4, phone = $5,
                  zip_cd = $6, road_address = $7, road_address_detail = $8, jibun_address = $9, opening_hours = $10::jsonb,
                  latitude = $11, longitude = $12,
                  updated_at = now()
            where id = $13
        returning id::text as id, name, category, category2, description, phone, zip_cd, road_address as address, road_address_detail as address_detail,
                  latitude::text as latitude, longitude::text as longitude,
                  opening_hours, status, is_map_visible`,
          [...values, payload.id],
        )
      : await getPool().query(
          `insert into sw002_stores
             (name, category, category2, description, phone, zip_cd, road_address, road_address_detail, jibun_address, opening_hours,
              latitude, longitude)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12)
        returning id::text as id, name, category, category2, description, phone, zip_cd, road_address as address, road_address_detail as address_detail,
                  latitude::text as latitude, longitude::text as longitude,
                  opening_hours, status, is_map_visible`,
          values,
        );

    if (!result.rows[0]) {
      throw new Error("저장할 매장 정보를 찾을 수 없습니다.");
    }

    return Response.json({ store: result.rows[0] });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireOperator("ADMIN");
    const storeId = new URL(request.url).searchParams.get("id") ?? "";
    if (!/^\d+$/.test(storeId)) throw new Error("삭제할 매장을 선택해 주세요.");
    const pool = getPool();
    await pool.query("delete from sw002_store_members where store_id = $1", [storeId]);
    const deleted = await pool.query("delete from sw002_stores where id = $1", [storeId]);
    if (!deleted.rowCount) throw new Error("삭제할 매장을 찾을 수 없습니다.");
    return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 403 });
  }
}
