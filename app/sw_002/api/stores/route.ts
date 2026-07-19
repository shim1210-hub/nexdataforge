import { Pool } from "pg";
import { assertStoreAccess, requireOperator } from "../_lib/operator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StorePayload = {
  id?: string | null;
  name?: string;
  category?: string;
  description?: string;
  phone?: string;
  address?: string;
  addressDetail?: string;
  openTime?: string;
  closeTime?: string;
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
  const restApiKey = process.env.KAKAO_REST_API_KEY;
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
      `select id::text as id, name, category, description, phone, address, address_detail,
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
    if (payload.id) await assertStoreAccess(payload.id);
    if (!payload.id && operator.role !== "ADMIN") throw new Error("신규 매장 생성은 통합관리자만 할 수 있습니다.");
    const coordinates = await geocodeAddress(payload.address?.trim() ?? "");

    const values = [
      payload.name?.trim(),
      payload.category?.trim(),
      payload.description?.trim() || null,
      payload.phone?.trim() || null,
      payload.address?.trim(),
      payload.addressDetail?.trim() || null,
      JSON.stringify({ open: payload.openTime, close: payload.closeTime }),
      coordinates.latitude,
      coordinates.longitude,
    ];

    const result = payload.id
      ? await getPool().query(
          `update sw002_stores
              set name = $1, category = $2, description = $3, phone = $4,
                  address = $5, address_detail = $6, opening_hours = $7::jsonb,
                  latitude = $8, longitude = $9,
                  updated_at = now()
            where id = $10
        returning id::text as id, name, category, description, phone, address, address_detail,
                  latitude::text as latitude, longitude::text as longitude,
                  opening_hours, status, is_map_visible`,
          [...values, payload.id],
        )
      : await getPool().query(
          `insert into sw002_stores
             (name, category, description, phone, address, address_detail, opening_hours,
              latitude, longitude)
           values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
        returning id::text as id, name, category, description, phone, address, address_detail,
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
