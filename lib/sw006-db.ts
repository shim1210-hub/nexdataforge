import "server-only";

import { Pool, type PoolClient, type QueryResultRow } from "pg";

declare global {
  var sw006Pool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
  }

  return new Pool({
    connectionString,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    max: 5,
    ssl: { rejectUnauthorized: false },
  });
}

export function getPool() {
  if (!globalThis.sw006Pool) {
    globalThis.sw006Pool = createPool();
  }
  return globalThis.sw006Pool;
}

export async function query<T extends QueryResultRow>(sql: string, values: unknown[] = []) {
  return getPool().query<T>(sql, values);
}

export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await work(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error && error.message ? error.message : "데이터베이스 처리 중 오류가 발생했습니다.";
  return Response.json({ error: message }, { status });
}
