import { Client } from "pg";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type InsaPayload = {
  birth?: string;
  dept_cd?: string;
  name?: string;
  reg_date?: string;
  seq?: string;
};

type PgClient = {
  connect: () => Promise<unknown>;
  end: () => Promise<void>;
  query: (
    sql: string,
    params?: Array<string | null>,
  ) => Promise<{
    fields: Array<{ name: string }>;
    rows: Array<Record<string, unknown>>;
    rowCount: number | null;
  }>;
};

function createPgClient(): PgClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL 환경 변수가 설정되어 있지 않습니다.");
  }

  return new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

function stringifyDbValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function normalizeOptionalValue(value: string | undefined) {
  const normalizedValue = value?.trim() ?? "";

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function validateRequiredPayload(payload: InsaPayload) {
  if (!payload.dept_cd?.trim()) {
    throw new Error("부서코드를 입력해 주세요.");
  }

  if (!payload.name?.trim()) {
    throw new Error("이름을 입력해 주세요.");
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AggregateError) {
    const nestedMessages = error.errors
      .map((nestedError) => getErrorMessage(nestedError))
      .filter(Boolean);

    if (nestedMessages.length > 0) {
      return nestedMessages.join(" / ");
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return "알 수 없는 오류가 발생했습니다.";
}

async function withClient<T>(callback: (client: PgClient) => Promise<T>) {
  const client = createPgClient();

  try {
    await client.connect();
    return await callback(client);
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function readRows(client: PgClient) {
  const result = await client.query(
    `
      select
        b.seq,
        b.dept_cd,
        a.dept_nm,
        b.name,
        b.birth,
        b.reg_date
      from insa b
      left join dept a on a.dept_cd = b.dept_cd
      order by b.seq desc
      limit 100
    `,
  );
  const columns = result.fields.map((field) => field.name);
  const rows = result.rows.map((row) =>
    Object.fromEntries(columns.map((column) => [column, stringifyDbValue(row[column])])),
  );

  return {
    columns,
    rows,
    total: rows.length,
  };
}

function jsonError(error: unknown, status = 400) {
  return Response.json(
    { error: getErrorMessage(error) },
    { status },
  );
}

export async function GET() {
  try {
    return Response.json(await withClient(readRows));
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as InsaPayload;
    validateRequiredPayload(payload);

    return Response.json(
      await withClient(async (client) => {
        if (payload.seq?.trim()) {
          await client.query(
            `
              insert into insa (seq, dept_cd, name, birth, reg_date)
              values ($1, $2, $3, $4, $5)
            `,
            [
              payload.seq.trim(),
              payload.dept_cd?.trim() ?? "",
              payload.name?.trim() ?? "",
              normalizeOptionalValue(payload.birth),
              normalizeOptionalValue(payload.reg_date),
            ],
          );
        } else {
          await client.query(
            `
              insert into insa (dept_cd, name, birth, reg_date)
              values ($1, $2, $3, $4)
            `,
            [
              payload.dept_cd?.trim() ?? "",
              payload.name?.trim() ?? "",
              normalizeOptionalValue(payload.birth),
              normalizeOptionalValue(payload.reg_date),
            ],
          );
        }

        return readRows(client);
      }),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as InsaPayload;

    if (!payload.seq?.trim()) {
      throw new Error("수정할 행을 선택해 주세요.");
    }

    validateRequiredPayload(payload);

    return Response.json(
      await withClient(async (client) => {
        const result = await client.query(
          `
            update insa
            set
              dept_cd = $2,
              name = $3,
              birth = $4,
              reg_date = $5
            where seq = $1
          `,
          [
            payload.seq?.trim() ?? "",
            payload.dept_cd?.trim() ?? "",
            payload.name?.trim() ?? "",
            normalizeOptionalValue(payload.birth),
            normalizeOptionalValue(payload.reg_date),
          ],
        );

        if (result.rowCount === 0) {
          throw new Error("수정할 데이터를 찾을 수 없습니다.");
        }

        return readRows(client);
      }),
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = (await request.json()) as InsaPayload;

    const seq = payload.seq?.trim();

    if (!seq) {
      throw new Error("삭제할 행을 선택해 주세요.");
    }

    return Response.json(
      await withClient(async (client) => {
        const result = await client.query("delete from insa where seq = $1", [seq]);

        if (result.rowCount === 0) {
          throw new Error("삭제할 데이터를 찾을 수 없습니다.");
        }

        return readRows(client);
      }),
    );
  } catch (error) {
    return jsonError(error);
  }
}
