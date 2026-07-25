import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const globalForSw002 = globalThis as unknown as { sw002StoreCategoryPool?: Pool };

function getPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured.");
  if (!globalForSw002.sw002StoreCategoryPool) {
    globalForSw002.sw002StoreCategoryPool = new Pool({ connectionString: databaseUrl, max: 5, ssl: { rejectUnauthorized: false } });
  }
  return globalForSw002.sw002StoreCategoryPool;
}

export async function GET() {
  try {
    const pool = getPool();
    const [major, middle, eventTypes] = await Promise.all([
      pool.query("select code, code_name from sw002_com_code where grp_cd = 'CATE_001' and attr1 = 'Y' order by code"),
      pool.query("select code, code_name, parent_grp_cd from sw002_com_code where parent_grp_cd is not null order by parent_grp_cd, code"),
      pool.query("select code, code_name from sw002_com_code where grp_cd = 'EVT_001' order by code"),
    ]);
    return Response.json({ majorCategories: major.rows, middleCategories: middle.rows, eventTypes: eventTypes.rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "업종 목록을 불러오지 못했습니다." }, { status: 400 });
  }
}
