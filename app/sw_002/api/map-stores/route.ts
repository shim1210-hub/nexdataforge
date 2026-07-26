import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForPool = globalThis as typeof globalThis & {
  sw002MapPool?: Pool;
};

const pool =
  globalForPool.sw002MapPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.sw002MapPool = pool;
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL이 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  try {
    const result = await pool.query(`
      select
        s.id::text,
        s.name,
        s.category,
        s.category2,
        s.description,
        s.phone,
        s.road_address as address,
        s.road_address_detail as address_detail,
        s.jibun_address,
        s.opening_hours,
        s.latitude::text,
        s.longitude::text,
        image.file_url as image_url,
        event.title as event_title,
        event.map_icon,
        event.end_at,
        coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', active_event.id::text,
            'title', active_event.title,
            'description', active_event.description,
            'eventType', active_event.event_type,
            'mapIcon', active_event.map_icon,
            'startAt', active_event.start_at,
            'endAt', active_event.end_at,
            'status', active_event.status
          ) order by active_event.priority desc, active_event.end_at asc)
          from sw002_events active_event
          where active_event.store_id = s.id
            and active_event.status in ('ACTIVE', 'SCHEDULED')
            and (active_event.end_at is null or active_event.end_at >= now())
        ), '[]'::jsonb) as events,
        coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', active_coupon.id::text,
            'name', active_coupon.name,
            'description', active_coupon.description,
            'discountType', active_coupon.discount_type,
            'discountValue', active_coupon.discount_value,
            'minimumOrderAmount', active_coupon.minimum_order_amount,
            'usageInstructions', active_coupon.usage_instructions,
            'startAt', active_coupon.start_at,
            'endAt', active_coupon.end_at,
            'imageUrl', active_coupon.image_url
          ) order by active_coupon.end_at asc)
          from sw002_coupons active_coupon
          where active_coupon.store_id = s.id
            and active_coupon.status in ('ACTIVE', 'SCHEDULED')
            and (active_coupon.end_at is null or active_coupon.end_at >= now())
        ), '[]'::jsonb) as coupons
      from sw002_stores s
      left join lateral (
        select a.storage_path as file_url
        from sw002_assets a
        where a.store_id = s.id
          and a.asset_type = 'STORE'
          and a.is_active = true
        order by a.created_at desc, a.id desc
        limit 1
      ) image on true
      left join lateral (
        select e.title, e.map_icon, e.end_at
        from sw002_events e
        where e.store_id = s.id
          and e.status in ('ACTIVE', 'SCHEDULED')
          and (e.end_at is null or e.end_at >= now())
        order by
          case when e.status = 'ACTIVE' then 0 else 1 end,
          e.start_at asc nulls last,
          e.created_at desc
        limit 1
      ) event on true
      where s.latitude is not null
        and s.longitude is not null
      order by s.created_at desc, s.id desc
    `);

    return NextResponse.json({ stores: result.rows });
  } catch (error) {
    console.error("SW002 map store query failed", error);
    return NextResponse.json(
      { error: "지도 매장 정보를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
