import { Pool } from "pg";
import { assertStoreAccess } from "../_lib/operator-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type EventPayload = {
  id?: string;
  storeId?: string;
  title?: string;
  description?: string;
  eventType?: string;
  mapIcon?: string;
  startAt?: string;
  endAt?: string;
};

const globalForSw002 = globalThis as unknown as { sw002Pool?: Pool };
const mapIcons = new Set(["HOT", "BEST", "COUPON", "FREE", "CLOSING_SOON"]);
const eventTypes = new Set(["DISCOUNT", "SOJU", "TIME_SALE", "SERVICE", "RECOMMEND"]);

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
  return error instanceof Error && error.message ? error.message : "이벤트 처리 중 오류가 발생했습니다.";
}

const selectEvents = `
  select id::text as id, store_id::text as store_id, title, description, event_type,
         map_icon, start_at, end_at, priority, status, view_count::text as view_count
    from sw002_events
   where store_id = $1
   order by start_at desc, id desc
`;
const selectEventTypes = `select code, code_name from sw002_com_code where grp_cd = 'EVT_001' order by code`;
async function getEventTypes() {
  const result = await getPool().query(selectEventTypes);
  return result.rows as Array<{ code: string; code_name: string }>;
}

export async function GET(request: Request) {
  try {
    const storeId = new URL(request.url).searchParams.get("storeId") ?? "";
    if (!validId(storeId)) throw new Error("관리할 매장을 선택해 주세요.");
    await assertStoreAccess(storeId);
    const [events, eventTypes] = await Promise.all([getPool().query(selectEvents, [storeId]), getEventTypes()]);
    return Response.json({ events: events.rows, eventTypes });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EventPayload;
    if (!validId(payload.storeId)) throw new Error("관리할 매장을 선택해 주세요.");
    await assertStoreAccess(payload.storeId!);
    (await getEventTypes()).forEach(({ code }) => eventTypes.add(code));
    if (!payload.title?.trim()) throw new Error("이벤트명을 입력해 주세요.");
    if (!payload.eventType || !eventTypes.has(payload.eventType)) throw new Error("올바른 이벤트 유형을 선택해 주세요.");
    if (!payload.mapIcon || !mapIcons.has(payload.mapIcon)) throw new Error("올바른 지도 아이콘을 선택해 주세요.");
    const startAt = new Date(payload.startAt ?? "");
    const endAt = new Date(payload.endAt ?? "");
    if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || endAt <= startAt) throw new Error("종료일은 시작일보다 이후여야 합니다.");
    const status = startAt <= new Date() && endAt > new Date() ? "ACTIVE" : "SCHEDULED";

    const store = await getPool().query("select id from sw002_stores where id = $1", [payload.storeId]);
    if (!store.rows[0]) throw new Error("선택한 매장을 찾을 수 없습니다.");
    await getPool().query(
      `insert into sw002_events (store_id, title, description, event_type, map_icon, start_at, end_at, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [payload.storeId, payload.title.trim(), payload.description?.trim() || null, payload.eventType, payload.mapIcon, startAt.toISOString(), endAt.toISOString(), status],
    );
    const result = await getPool().query(selectEvents, [payload.storeId]);
    return Response.json({ events: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as EventPayload;
    if (!validId(payload.id) || !validId(payload.storeId)) throw new Error("수정할 이벤트를 찾을 수 없습니다.");
    await assertStoreAccess(payload.storeId!);
    (await getEventTypes()).forEach(({ code }) => eventTypes.add(code));
    if (!payload.title?.trim()) throw new Error("이벤트명을 입력해 주세요.");
    if (!payload.eventType || !eventTypes.has(payload.eventType)) throw new Error("올바른 이벤트 유형을 선택해 주세요.");
    if (!payload.mapIcon || !mapIcons.has(payload.mapIcon)) throw new Error("올바른 지도 아이콘을 선택해 주세요.");
    const startAt = new Date(payload.startAt ?? "");
    const endAt = new Date(payload.endAt ?? "");
    if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || endAt <= startAt) throw new Error("종료일은 시작일보다 이후여야 합니다.");
    const status = startAt <= new Date() && endAt > new Date() ? "ACTIVE" : endAt <= new Date() ? "ENDED" : "SCHEDULED";
    const updated = await getPool().query(
      `update sw002_events
          set title = $1, description = $2, event_type = $3, map_icon = $4, start_at = $5,
              end_at = $6, status = $7, updated_at = now()
        where id = $8 and store_id = $9`,
      [payload.title.trim(), payload.description?.trim() || null, payload.eventType, payload.mapIcon, startAt.toISOString(), endAt.toISOString(), status, payload.id, payload.storeId],
    );
    if (!updated.rowCount) throw new Error("수정할 이벤트를 찾을 수 없습니다.");
    const result = await getPool().query(selectEvents, [payload.storeId]);
    return Response.json({ events: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") ?? "";
    const storeId = url.searchParams.get("storeId") ?? "";
    if (!validId(id) || !validId(storeId)) throw new Error("삭제할 이벤트를 찾을 수 없습니다.");
    await assertStoreAccess(storeId);
    const deleted = await getPool().query("delete from sw002_events where id = $1 and store_id = $2", [id, storeId]);
    if (!deleted.rowCount) throw new Error("삭제할 이벤트를 찾을 수 없습니다.");
    const result = await getPool().query(selectEvents, [storeId]);
    return Response.json({ events: result.rows });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
