import "server-only";

import { access, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PublicSiteData } from "@/lib/sw006-public-data";

export type SiteFileInput = {
  slug: string;
  name: string;
  industry: string | null;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function resolveSitePath(slug: string) {
  if (!slugPattern.test(slug)) throw new Error("안전하지 않은 사이트 경로입니다.");
  const basePath = path.resolve(process.cwd(), "app", "sw_006");
  const sitePath = path.resolve(basePath, slug);
  if (path.dirname(sitePath) !== basePath) throw new Error("사이트 경로가 허용 범위를 벗어났습니다.");
  return { basePath, sitePath };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

export async function createSiteStructure(input: SiteFileInput) {
  const { basePath, sitePath } = resolveSitePath(input.slug);
  await mkdir(basePath, { recursive: true });
  try {
    await access(sitePath);
    throw new Error(`이미 존재하는 사이트 폴더입니다: sw_006/${input.slug}`);
  } catch (error) {
    if (error instanceof Error && !error.message.includes("ENOENT") && !error.message.includes("no such file")) throw error;
  }

  await mkdir(sitePath);
  await Promise.all([
    mkdir(path.join(sitePath, "pages")),
    mkdir(path.join(sitePath, "assets", "images"), { recursive: true }),
    mkdir(path.join(sitePath, "assets", "css"), { recursive: true }),
    mkdir(path.join(sitePath, "data")),
  ]);

  const safeName = escapeHtml(input.name);
  const safeIndustry = escapeHtml(input.industry ?? "");
  const indexHtml = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeName}</title>
  <link rel="stylesheet" href="./assets/css/style.css">
</head>
<body>
  <header class="site-header"><strong>${safeName}</strong></header>
  <main class="site-main">
    <p class="eyebrow">${safeIndustry}</p>
    <h1>${safeName}</h1>
    <p>AI Website Factory에서 생성된 사이트입니다.</p>
  </main>
  <footer class="site-footer">Copyright © ${new Date().getFullYear()} ${safeName}. All Rights Reserved.</footer>
</body>
</html>
`;
  const styleCss = `:root { color-scheme: light; font-family: Pretendard, "Noto Sans KR", sans-serif; color: #111827; background: #f6f8fc; }
* { box-sizing: border-box; }
body { min-height: 100vh; margin: 0; display: grid; grid-template-rows: auto 1fr auto; }
.site-header, .site-footer { padding: 24px max(24px, 6vw); background: #fff; border-bottom: 1px solid #dce3ee; }
.site-main { display: grid; place-content: center; padding: 80px 24px; text-align: center; }
.site-main h1 { margin: 8px 0; font-size: clamp(40px, 7vw, 76px); }
.eyebrow { color: #4f46e5; font-weight: 800; letter-spacing: .12em; }
.site-footer { border-top: 1px solid #dce3ee; border-bottom: 0; color: #64748b; font-size: 13px; }
`;
  const siteJson = JSON.stringify({ slug: input.slug, name: input.name, industry: input.industry, status: "DRAFT", generatedAt: new Date().toISOString() }, null, 2);

  await Promise.all([
    writeFile(path.join(sitePath, "index.html"), indexHtml, "utf8"),
    writeFile(path.join(sitePath, "assets", "css", "style.css"), styleCss, "utf8"),
    writeFile(path.join(sitePath, "data", "site.json"), `${siteJson}\n`, "utf8"),
  ]);

  return { outputPath: `/sw_006/${input.slug}/`, sitePath };
}

export async function deleteSiteStructure(slug: string) {
  const { sitePath } = resolveSitePath(slug);
  await rm(sitePath, { force: true, recursive: true });
}

export async function writeAppliedSiteFiles(data: PublicSiteData) {
  const { sitePath } = resolveSitePath(data.slug);
  await mkdir(path.join(sitePath, "pages"), { recursive: true });
  await mkdir(path.join(sitePath, "assets", "images"), { recursive: true });
  await mkdir(path.join(sitePath, "assets", "css"), { recursive: true });
  await mkdir(path.join(sitePath, "data"), { recursive: true });
  const roots = data.menus.filter((menu) => !menu.parentId);
  const navigation = roots.map((menu) => `<a href="#${escapeHtml(menu.slug)}">${escapeHtml(menu.name)}</a>`).join("");
  const sections = data.sections.map((section, index) => {
    const linkedMenu = roots.find((menu) => section.sectionType === `MENU_${menu.id}`) ?? (index > 0 ? roots[index - 1] : undefined);
    const sectionId = linkedMenu?.slug ?? (index === 0 ? "home" : section.sectionType.toLowerCase());
    return `<section class="section${index === 0 ? " hero" : ""}" id="${escapeHtml(sectionId)}"><span>${escapeHtml(section.subtitle ?? section.sectionType)}</span><h${index === 0 ? "1" : "2"}>${escapeHtml(section.title ?? data.name)}</h${index === 0 ? "1" : "2"}><p>${escapeHtml(section.body ?? "")}</p></section>`;
  }).join("\n");
  const splitMenuGrid = roots.map((menu, index) => `<button type="button" data-panel="${index + 1}"><small>${String(index + 1).padStart(2, "0")}</small><strong>${escapeHtml(menu.name)}</strong><span>자세히 보기</span><i>↗</i></button>`).join("");
  const mainContent = data.theme.layout === "split" ? `<section class="split-stage"><div class="split-panels">${sections}</div><div class="split-menu-grid">${splitMenuGrid}</div></section>` : sections;
  const footer = data.footer;
  const footerContacts = [
    footer?.email ? `<a href="mailto:${escapeHtml(footer.email)}"><small>대표 이메일</small><b>${escapeHtml(footer.email)}</b></a>` : "",
    footer?.phone ? `<a href="tel:${escapeHtml(footer.phone)}"><small>전화번호</small><b>${escapeHtml(footer.phone)}</b></a>` : "",
  ].join("");
  const footerDetails = [
    footer?.representativeName ? `<dl><dt>대표자</dt><dd>${escapeHtml(footer.representativeName)}</dd></dl>` : "",
    footer?.businessNumber ? `<dl><dt>사업자등록번호</dt><dd>${escapeHtml(footer.businessNumber)}</dd></dl>` : "",
    footer?.address ? `<dl class="address"><dt>주소</dt><dd>${escapeHtml(footer.address)}</dd></dl>` : "",
  ].join("");
  const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(data.name)}</title><link rel="stylesheet" href="./assets/css/style.css"></head>
<body class="layout-${data.theme.layout}"><header><strong>${escapeHtml(data.name)}</strong><nav>${navigation}</nav></header><main>${mainContent}</main><footer class="generated-footer"><div class="footer-brand"><strong>${escapeHtml(footer?.companyName ?? data.name)}</strong><p>신뢰와 가치를 만드는 기업</p></div><div class="footer-contacts">${footerContacts}</div><div class="footer-info">${footerDetails}</div><div class="footer-bottom"><small>${escapeHtml(footer?.copyrightText ?? `Copyright © ${new Date().getFullYear()} ${data.name}. All Rights Reserved.`)}</small>${footer?.siteByText ? `<em>Site by ${escapeHtml(footer.siteByText)}</em>` : ""}</div></footer><script>if(document.body.classList.contains('layout-horizontal')){const links=[...document.querySelectorAll('header nav a')];const panels=[...document.querySelectorAll('main .section')];const show=(index)=>{panels.forEach((panel,panelIndex)=>panel.hidden=panelIndex!==index);window.scrollTo({top:0,behavior:'smooth'})};show(0);links.forEach((link,index)=>link.addEventListener('click',(event)=>{event.preventDefault();show(index+1)}))}if(document.body.classList.contains('layout-split')){const panels=[...document.querySelectorAll('.split-panels .section')];const buttons=[...document.querySelectorAll('.split-menu-grid button')];const show=(index)=>{panels.forEach((panel,panelIndex)=>panel.hidden=panelIndex!==index);buttons.forEach((button,buttonIndex)=>button.classList.toggle('active',buttonIndex===index-1))};show(0);buttons.forEach((button)=>button.addEventListener('click',()=>show(Number(button.dataset.panel))))}</script></body></html>`;
  const css = `:root{font-family:${data.theme.font},sans-serif;color:#111827;--primary:${data.theme.primary};--radius:${data.theme.radius}px}*{box-sizing:border-box}body{margin:0}header{min-height:76px;display:flex;align-items:center;padding:0 6vw;border-bottom:1px solid #e5e7eb}header strong{font-size:20px}nav{display:flex;gap:28px;margin-left:auto}nav a{color:inherit;text-decoration:none;font-weight:700}.section{min-height:480px;display:grid;align-content:center;padding:70px 8vw;border-bottom:1px solid #e5e7eb}.section:nth-child(even){background:#f8fafc}.section span{color:var(--primary);font-size:12px;font-weight:900}.section h1,.section h2{max-width:850px;margin:12px 0;font-size:clamp(38px,6vw,76px)}.section p{max-width:700px;color:#64748b;font-size:17px;line-height:1.8;white-space:pre-line}.hero{min-height:calc(100vh - 76px);background:linear-gradient(135deg,#f8fafc,#eef2ff)}footer{padding:50px 8vw;color:#cbd5e1;background:#111827}footer p,footer small{font-size:12px}.layout-vertical main{margin-left:220px}.layout-vertical:before{content:'MENU';position:fixed;inset:76px auto 0 0;width:220px;padding:45px 25px;color:#818cf8;background:#111827}.layout-split .hero{background:linear-gradient(90deg,#fff 50%,var(--primary) 50%)}@media(max-width:760px){nav{display:none}.section{min-height:380px;padding:55px 24px}.layout-vertical main{margin-left:0}.layout-vertical:before{display:none}.layout-split .hero{background:#f8fafc}footer{padding:40px 24px}}`;
  const appliedFooterCss = `.generated-footer{position:relative;padding:28px 8vw 16px;background:radial-gradient(circle at 92% 0,rgb(99 102 241 / 18%),transparent 30%),linear-gradient(145deg,#111827,#0b1120)}.footer-brand{display:flex;align-items:baseline;gap:12px}.footer-brand strong{color:#fff;font-size:24px}.footer-brand p{margin:0;color:#718096}.footer-contacts{display:flex;gap:8px;justify-content:flex-end;margin-top:-32px}.footer-contacts a{display:grid;min-width:190px;gap:4px;padding:10px 13px;border:1px solid #ffffff12;border-radius:9px;color:#e2e8f0;background:#ffffff08;text-decoration:none}.footer-contacts small{color:#718096}.footer-info{display:flex;flex-wrap:wrap;gap:8px 24px;margin-top:14px;padding:9px 0 8px;border-top:1px solid #ffffff14;border-bottom:1px solid #ffffff14}.footer-info dl{display:flex;gap:8px;margin:0;font-size:11px;line-height:1.4}.footer-info dt{color:#64748b;font-weight:800}.footer-info dd{margin:0}.footer-info .address{flex-basis:100%}.footer-bottom{display:flex;align-items:baseline;justify-content:space-between;padding-top:8px}.footer-bottom small,.footer-bottom em{display:block;line-height:1.2}.footer-bottom em{color:#8492a6;font-size:9px;font-style:normal}@media(max-width:760px){.generated-footer{padding:22px 24px 15px}.footer-contacts{display:grid;justify-content:stretch;margin-top:14px}.footer-contacts a{min-width:0}.footer-info{display:grid}.footer-bottom{gap:16px}}@media(max-width:440px){.footer-brand{align-items:flex-start;flex-direction:column;gap:4px}}`;
  const appliedLayoutCss = `.layout-horizontal header nav a{position:relative;padding:28px 0 25px}.layout-horizontal main{display:block}.layout-vertical header nav{position:fixed;z-index:2;inset:120px auto 0 0;width:220px;height:max-content;display:grid;gap:4px;padding:0 25px}.layout-vertical header nav a{padding:12px;border-radius:7px;color:#e2e8f0}.layout-vertical header nav a:hover{background:#ffffff12}.layout-vertical main .section{scroll-margin-top:20px}.layout-split header nav{display:none}.split-stage{min-height:calc(100vh - 76px);display:grid;grid-template-columns:1fr minmax(520px,1fr)}.split-panels{display:grid}.split-panels .section{grid-area:1/1;min-height:100%;background:linear-gradient(145deg,#fff,#f5f7ff)!important}.split-menu-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:minmax(160px,1fr);gap:1px;background:#dfe5ee}.split-menu-grid button{position:relative;display:grid;align-content:center;gap:8px;padding:32px;border:0;background:#fff;text-align:left;cursor:pointer}.split-menu-grid button:hover,.split-menu-grid button.active{color:#fff;background:var(--primary)}.split-menu-grid small{color:#94a3b8}.split-menu-grid strong{font-size:clamp(18px,2vw,27px)}.split-menu-grid i{position:absolute;right:24px;top:22px;font-style:normal}@media(max-width:1050px){.split-stage{grid-template-columns:1fr}}@media(max-width:760px){.split-menu-grid{grid-template-columns:1fr}}html{scroll-behavior:smooth}`;
  const json = JSON.stringify({ ...data, appliedAt: new Date().toISOString() }, null, 2);
  await Promise.all([
    writeFile(path.join(sitePath, "index.html"), html, "utf8"),
    writeFile(path.join(sitePath, "assets", "css", "style.css"), `${css}${appliedFooterCss}${appliedLayoutCss}`, "utf8"),
    writeFile(path.join(sitePath, "data", "site.json"), `${json}\n`, "utf8"),
  ]);
  return { outputPath: `/sw_006/${data.slug}/`, files: ["index.html", "assets/css/style.css", "data/site.json"] };
}
