import { errorResponse, query } from "@/lib/sw006-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const tables = [
  "profiles", "sites",
  "templates", "site_templates", "menus", "footers", "main_sections", "assets",
  "pages", "boards", "board_posts", "board_files", "generation_jobs",
  "generated_files",
] as const;

const descriptions: Record<(typeof tables)[number], string> = {
  profiles: "사용자 프로필", sites: "업체 사이트 기본정보",
  templates: "디자인 템플릿", site_templates: "사이트별 템플릿", menus: "대·중메뉴",
  footers: "푸터 정보", main_sections: "메인 화면 구성", assets: "이미지·첨부파일",
  pages: "일반 페이지", boards: "게시판", board_posts: "게시글 콘텐츠",
  board_files: "게시글 첨부파일", generation_jobs: "파일 생성 작업",
  generated_files: "생성 파일",
};

export async function GET() {
  try {
    const rows = await Promise.all(tables.map(async (table) => {
      const result = await query<{ count: string }>(`select count(*)::text as count from ${table}`);
      return { table, description: descriptions[table], rows: Number(result.rows[0].count), status: "정상" };
    }));
    return Response.json({ tables: rows });
  } catch (error) {
    return errorResponse(error);
  }
}
