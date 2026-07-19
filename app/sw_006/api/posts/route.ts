import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { errorResponse, query, transaction } from "@/lib/sw006-db";
import { canAccessSite, getSessionFromRequest } from "@/lib/sw006-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PostRow = { id: string; title: string; board: string | null; author: string | null; status: string | null; created_at: Date | string | null; attachment_count?: string | number };

const allowedFiles = new Map([
  ["image/jpeg", new Set([".jpg", ".jpeg"])], ["image/png", new Set([".png"])],
  ["image/webp", new Set([".webp"])], ["image/gif", new Set([".gif"])],
  ["image/avif", new Set([".avif"])], ["application/pdf", new Set([".pdf"])],
  ["application/msword", new Set([".doc"])],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", new Set([".docx"])],
]);

function formatPost(row: PostRow) {
  return { id: Number(row.id), title: row.title, board: row.board ?? "미분류", author: row.author ?? "admin", status: row.status === "PUBLISHED" ? "게시" : "임시", date: row.created_at ? new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul" }).format(new Date(row.created_at)) : "-", attachments: Number(row.attachment_count ?? 0) };
}

export async function GET(request: Request) {
  try {
    const siteSlug = new URL(request.url).searchParams.get("siteSlug")?.trim();
    const session = getSessionFromRequest(request);
    if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (siteSlug && !canAccessSite(session, siteSlug)) return Response.json({ error: "담당 사이트의 게시글만 조회할 수 있습니다." }, { status: 403 });
    if (!siteSlug) return Response.json({ error: "사이트를 선택해 주세요." }, { status: 400 });
    const result = await query<PostRow>(`
      select bp.id, bp.title, b.name as board, p.display_name as author, bp.status, bp.created_at,
             (select count(*) from board_files bf where bf.post_id = bp.id) as attachment_count
      from board_posts bp
      left join boards b on b.id = bp.board_id
      left join profiles p on p.id = bp.author_id
      left join sites s on s.id = bp.site_id
      where s.company_slug = $1
      order by bp.created_at desc nulls last, bp.id desc
      limit 200
    `, [siteSlug]);
    return Response.json({ posts: result.rows.map(formatPost) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const writtenPaths: string[] = [];
  try {
    const body = await request.formData();
    const siteSlug = String(body.get("siteSlug") ?? "").trim();
    const boardId = String(body.get("boardId") ?? "").trim();
    const title = String(body.get("title") ?? "").trim();
    const content = String(body.get("body") ?? "").trim();
    const session = getSessionFromRequest(request);
    if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (siteSlug && !canAccessSite(session, siteSlug)) return Response.json({ error: "담당 사이트에만 게시글을 등록할 수 있습니다." }, { status: 403 });
    const files = body.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
    if (!siteSlug || !boardId || !title || !content) return Response.json({ error: "사이트, 게시판, 제목, 내용을 모두 입력해 주세요." }, { status: 400 });
    if (files.length > 5) return Response.json({ error: "첨부파일은 최대 5개까지 등록할 수 있습니다." }, { status: 400 });
    for (const file of files) {
      const extension = path.extname(file.name).toLowerCase();
      if (!allowedFiles.get(file.type)?.has(extension)) throw new Error("이미지(JPG, PNG, WebP, GIF, AVIF), Word(DOC, DOCX), PDF 파일만 첨부할 수 있습니다.");
      if (file.size > 10 * 1024 * 1024) throw new Error("첨부파일은 파일당 10MB 이하여야 합니다.");
    }
    const target = await query<{ site_id: string; board_name: string }>(`
      select s.id as site_id, b.name as board_name
      from sites s join boards b on b.site_id = s.id
      where s.company_slug = $1 and b.id = $2 and b.is_enabled = true
      limit 1
    `, [siteSlug, boardId]);
    if (!target.rowCount) throw new Error("선택한 사이트의 게시판을 찾을 수 없습니다.");
    const basePath = path.resolve(process.cwd(), "app", "sw_006");
    const fileDirectory = path.resolve(basePath, siteSlug, "files");
    if (!fileDirectory.startsWith(`${basePath}${path.sep}`)) throw new Error("허용되지 않은 첨부파일 저장 경로입니다.");
    await mkdir(fileDirectory, { recursive: true });
    const storedFiles: { file: File; storedName: string; storagePath: string }[] = [];
    for (const file of files) {
      const storedName = `${crypto.randomUUID()}${path.extname(file.name).toLowerCase()}`;
      const physicalPath = path.join(fileDirectory, storedName);
      await writeFile(physicalPath, Buffer.from(await file.arrayBuffer()), { flag: "wx" });
      writtenPaths.push(physicalPath);
      storedFiles.push({ file, storedName, storagePath: `/sw_006/${siteSlug}/files/${storedName}` });
    }
    const post = await transaction(async (client) => {
      const result = await client.query<PostRow>(`
        insert into board_posts (site_id, board_id, title, content, status, published_at)
        values ($1, $2, $3, $4, $5::varchar(30), case when $5::text = 'PUBLISHED' then now() else null end)
        returning id, title, $6::text as board, null::text as author, status, created_at
      `, [target.rows[0].site_id, boardId, title, content, body.get("publish") === "on" ? "PUBLISHED" : "DRAFT", target.rows[0].board_name]);
      for (const [index, stored] of storedFiles.entries()) {
        const asset = await client.query<{ id: string }>(`
          insert into assets (site_id, bucket_name, storage_path, original_name, mime_type, size_bytes)
          values ($1, 'local', $2, $3, $4, $5) returning id
        `, [target.rows[0].site_id, stored.storagePath, stored.file.name, stored.file.type, stored.file.size]);
        await client.query("insert into board_files (post_id, asset_id, sort_order) values ($1, $2, $3)", [result.rows[0].id, asset.rows[0].id, index]);
      }
      result.rows[0].attachment_count = storedFiles.length;
      return formatPost(result.rows[0]);
    });
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    await Promise.all(writtenPaths.map((filePath) => rm(filePath, { force: true }).catch(() => undefined)));
    return errorResponse(error, 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    const session = getSessionFromRequest(request);
    if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (!id || !/^\d+$/.test(id)) return Response.json({ error: "올바른 게시글 ID가 필요합니다." }, { status: 400 });
    const allowedPost = await query(`select 1 from board_posts bp join sites s on s.id = bp.site_id where bp.id = $1 and ($2::text = 'SUPER_ADMIN' or s.company_slug = $3)`, [id, session.accessLevel, session.companySlug]);
    if (!allowedPost.rowCount) return Response.json({ error: "담당 사이트의 게시글만 삭제할 수 있습니다." }, { status: 403 });
    const storagePaths = await transaction(async (client) => {
      const assets = await client.query<{ id: string; storage_path: string | null }>("select a.id, a.storage_path from board_files bf join assets a on a.id = bf.asset_id where bf.post_id = $1", [id]);
      await client.query("delete from board_files where post_id = $1", [id]);
      if (assets.rowCount) await client.query("delete from assets where id = any($1::uuid[])", [assets.rows.map((item) => item.id)]);
      const result = await client.query("delete from board_posts where id = $1", [id]);
      if (!result.rowCount) throw new Error("삭제할 게시글을 찾을 수 없습니다.");
      return assets.rows.flatMap((item) => item.storage_path ? [item.storage_path] : []);
    });
    const basePath = path.resolve(process.cwd(), "app");
    await Promise.all(storagePaths.map(async (storagePath) => {
      const physicalPath = path.resolve(basePath, storagePath.replace(/^\/sw_006\//, "sw_006/"));
      if (physicalPath.startsWith(`${basePath}${path.sep}sw_006${path.sep}`)) await rm(physicalPath, { force: true });
    }));
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
