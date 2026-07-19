import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicSiteData } from "@/lib/sw006-public-data";
import SiteFooter from "../SiteFooter";
import SiteExperience from "./SiteExperience";
import styles from "./site.module.css";

export const dynamic = "force-dynamic";

export default async function PublicSitePage({ params, searchParams }: PageProps<"/sw_006/[site]">) {
  const [{ site }, query] = await Promise.all([params, searchParams]);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(site)) notFound();
  const data = await getPublicSiteData(site);
  if (!data) notFound();
  const preview = query.preview === "1";
  const sections = data.sections.length ? data.sections : [{ sectionType: "HERO", title: data.name, subtitle: data.industry, body: "메인 화면 구성에서 사이트 내용을 입력해 주세요." }];

  return <main className={`${styles.site} ${styles[data.theme.layout]}`} data-layout={data.theme.layout} style={{ "--site-primary": data.theme.primary, "--site-radius": `${data.theme.radius}px`, fontFamily: `${data.theme.font}, sans-serif` } as React.CSSProperties}>
    {preview && <div className={styles.previewBar}><strong>미리보기</strong><span>{data.name} · 저장된 현재 설정을 확인하고 있습니다.</span><Link href="/sw_006">관리자로 돌아가기</Link></div>}
    <SiteExperience name={data.name} slug={data.slug} layout={data.theme.layout} menus={data.menus} sections={sections} pages={data.pages} posts={data.posts} />
    <footer id="contact"><SiteFooter footer={data.footer} siteName={data.name} /></footer>
  </main>;
}
