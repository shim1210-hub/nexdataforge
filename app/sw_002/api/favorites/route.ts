import { getCustomerPool, getCustomerUserId } from "../_lib/customer-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requiredUserId() {
  const userId = await getCustomerUserId();
  if (!userId) throw new Error("로그인이 필요합니다.");
  return userId;
}

export async function GET() {
  try {
    const userId = await requiredUserId();
    const result = await getCustomerPool().query(
      "select store_id::text from sw002_favorite_stores where user_id = $1 order by created_at desc",
      [userId],
    );
    return Response.json({ storeIds: result.rows.map((row) => row.store_id) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "즐겨찾기를 불러오지 못했습니다." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requiredUserId();
    const body = (await request.json()) as { storeId?: string };
    if (!body.storeId || !/^\d+$/.test(body.storeId)) throw new Error("올바른 매장을 선택해 주세요.");
    const exists = await getCustomerPool().query(
      "select 1 from sw002_favorite_stores where user_id = $1 and store_id = $2 limit 1",
      [userId, body.storeId],
    );
    if (!exists.rows[0]) {
      await getCustomerPool().query(
        "insert into sw002_favorite_stores (user_id, store_id) values ($1, $2)",
        [userId, body.storeId],
      );
    }
    return Response.json({ saved: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "즐겨찾기를 저장하지 못했습니다." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requiredUserId();
    const storeId = new URL(request.url).searchParams.get("storeId") ?? "";
    if (!/^\d+$/.test(storeId)) throw new Error("올바른 매장을 선택해 주세요.");
    await getCustomerPool().query("delete from sw002_favorite_stores where user_id = $1 and store_id = $2", [userId, storeId]);
    return Response.json({ saved: false });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "즐겨찾기를 삭제하지 못했습니다." }, { status: 400 });
  }
}
