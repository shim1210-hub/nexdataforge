import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const allowedViewTypes = new Set(["MAP_PIN", "STORE_DETAIL"]);

const globalForPool = globalThis as typeof globalThis & {
  sw002ViewPool?: Pool;
};

const pool =
  globalForPool.sw002ViewPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.sw002ViewPool = pool;
}

type ViewRequest = {
  storeId?: string;
  viewType?: string;
  anonymousSessionId?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL이 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as ViewRequest;
    const storeId = body.storeId?.trim();
    const viewType = body.viewType?.trim();
    const anonymousSessionId = body.anonymousSessionId?.trim();

    if (!storeId || !/^\d+$/.test(storeId)) {
      return NextResponse.json(
        { error: "올바른 매장 ID가 필요합니다." },
        { status: 400 },
      );
    }

    if (!viewType || !allowedViewTypes.has(viewType)) {
      return NextResponse.json(
        { error: "지원하지 않는 조회 유형입니다." },
        { status: 400 },
      );
    }

    if (!anonymousSessionId || anonymousSessionId.length > 200) {
      return NextResponse.json(
        { error: "방문자 세션 정보가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    await pool.query(
      `insert into sw002_store_views (
        store_id,
        anonymous_session_id,
        view_type,
        latitude,
        longitude
      ) values ($1, $2, $3, $4, $5)`,
      [
        storeId,
        anonymousSessionId,
        viewType,
        Number.isFinite(body.latitude) ? body.latitude : null,
        Number.isFinite(body.longitude) ? body.longitude : null,
      ],
    );

    return NextResponse.json({ recorded: true }, { status: 201 });
  } catch (error) {
    console.error("SW002 store view insert failed", error);
    return NextResponse.json(
      { error: "매장 조회 통계를 저장하지 못했습니다." },
      { status: 500 },
    );
  }
}
