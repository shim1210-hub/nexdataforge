"use client";

import { useState } from "react";
import styles from "./site.module.css";
import layoutStyles from "./layout-fixes.module.css";

type Menu = { id: string; parentId: string | null; name: string; slug: string; urlType: string; boardId: string | null };
type Section = { sectionType: string; title: string | null; subtitle: string | null; body: string | null };
type Page = { menuId: string; title: string; subtitle: string | null; body: string | null; imageUrl: string | null };
type Attachment = { id: string; name: string; url: string; mimeType: string | null };
type Post = { id: number; boardId: string; title: string; content: string; isNotice: boolean; publishedAt: string | null; attachments: Attachment[] };
type Layout = "horizontal" | "vertical" | "split";

function findMenuSection(menu: Menu, menuIndex: number, sections: Section[]) {
  const menuSections = sections.filter((section) => section.sectionType !== "HERO");
  return sections.find((section) => section.sectionType === `MENU_${menu.id}`)
    ?? menuSections.find((section) => section.title === menu.name)
    ?? menuSections[menuIndex]
    ?? { sectionType: `MENU_${menu.id}`, title: menu.name, subtitle: menu.slug.toUpperCase(), body: `${menu.name} 내용을 준비 중입니다.` };
}

function ContentSection({ section, id, hero = false, index = 0, imageUrl }: { section: Section; id: string; hero?: boolean; index?: number; imageUrl?: string | null }) {
  return <section className={`${styles.section} ${hero ? styles.hero : ""}`} id={id}>
    <div>
      <span>{section.subtitle || section.sectionType}</span>
      <h1>{section.title}</h1>
      <p>{section.body}</p>
      {imageUrl && <div className={layoutStyles.contentImage} style={{ backgroundImage: `url("${imageUrl.replaceAll('"', '%22')}")` }} role="img" aria-label={`${section.title || "화면"} 대표 이미지`} />}
      {hero && <a href="#site-menu">메뉴 살펴보기 →</a>}
    </div>
    <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
  </section>;
}

function BoardSection({ menu, parentName, posts, id }: { menu: Menu; parentName: string; posts: Post[]; id: string }) {
  const boardPosts = posts.filter((post) => post.boardId === menu.boardId);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const selectedPost = boardPosts.find((post) => post.id === selectedPostId) ?? null;
  return <section className={layoutStyles.boardSection} id={id}>
    <header><span>{parentName} · BOARD</span><h1>{menu.name}</h1><p>새로운 소식과 자료를 확인하세요.</p></header>
    {selectedPost ? <article className={layoutStyles.postDetail}><button type="button" onClick={() => setSelectedPostId(null)}>← 목록으로</button><div><span>{selectedPost.isNotice ? "공지" : menu.name}</span><time>{selectedPost.publishedAt ? new Intl.DateTimeFormat("ko-KR").format(new Date(selectedPost.publishedAt)) : ""}</time></div><h2>{selectedPost.title}</h2><p>{selectedPost.content}</p>{selectedPost.attachments.length > 0 && <section><strong>첨부파일</strong>{selectedPost.attachments.map((file) => <a href={file.url} key={file.id}>📎 {file.name}</a>)}</section>}</article> : <div className={layoutStyles.postList}>{boardPosts.length === 0 ? <p className={layoutStyles.boardEmpty}>등록된 게시글이 없습니다.</p> : boardPosts.map((post) => <button type="button" key={post.id} onClick={() => setSelectedPostId(post.id)}><span>{post.isNotice ? "공지" : String(post.id).padStart(3, "0")}</span><strong>{post.title}</strong>{post.attachments.length > 0 && <em>📎 {post.attachments.length}</em>}<time>{post.publishedAt ? new Intl.DateTimeFormat("ko-KR").format(new Date(post.publishedAt)) : ""}</time></button>)}</div>}
  </section>;
}

export default function SiteExperience({ name, slug, layout, menus, sections, pages, posts }: { name: string; slug: string; layout: Layout; menus: Menu[]; sections: Section[]; pages: Page[]; posts: Post[] }) {
  const roots = menus.filter((menu) => !menu.parentId);
  const hero = sections.find((section) => section.sectionType === "HERO") ?? sections[0] ?? { sectionType: "HERO", title: name, subtitle: "WELCOME", body: "메인 화면을 구성해 주세요." };
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const activeItem = menus.find((menu) => menu.id === activeMenuId) ?? null;
  const activeRoot = activeItem?.parentId ? roots.find((menu) => menu.id === activeItem.parentId) ?? null : activeItem;
  const activeIndex = activeRoot ? roots.findIndex((menu) => menu.id === activeRoot.id) : -1;
  const activeRootSection = activeRoot ? findMenuSection(activeRoot, activeIndex, sections) : hero;
  const activePage = activeItem ? pages.find((page) => page.menuId === activeItem.id) ?? null : null;
  const activeSection = activePage
    ? { sectionType: `PAGE_${activeItem?.id}`, title: activePage.title, subtitle: activePage.subtitle, body: activePage.body }
    : activeItem?.parentId
    ? sections.find((section) => section.sectionType === `MENU_${activeItem.id}`) ?? { ...activeRootSection, title: activeItem.name, subtitle: `${activeRoot?.name ?? "메뉴"} · ${activeItem.name}` }
    : activeRootSection;

  function selectHorizontalMenu(menuId: string) {
    setActiveMenuId(menuId);
  }

  function selectVerticalMenu(menuId: string) {
    setActiveMenuId(menuId);
    document.getElementById(`menu-${menuId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <>
    <header className={`${styles.header} ${layout === "horizontal" ? layoutStyles.horizontalHeader : ""}`}>
      <a className={styles.logo} href={`/sw_006/${slug}`} onClick={(event) => { if (layout === "horizontal") { event.preventDefault(); setActiveMenuId(null); } }}>{name}</a>
      <nav className={layout === "horizontal" ? layoutStyles.horizontalNav : layout === "split" ? layoutStyles.splitTopNav : ""} id="site-menu">
        {roots.map((menu) => <div key={menu.id}>
          {layout === "horizontal"
            ? <button className={`${layoutStyles.menuButton} ${activeMenuId === menu.id ? layoutStyles.menuActive : ""}`} type="button" onClick={() => selectHorizontalMenu(menu.id)}>{menu.name}</button>
            : <a href={`#${menu.slug}`}>{menu.name}</a>}
          {menus.some((child) => child.parentId === menu.id) && <div>{menus.filter((child) => child.parentId === menu.id).map((child) => layout === "horizontal"
            ? <button className={layoutStyles.horizontalSubButton} key={child.id} type="button" onClick={() => selectHorizontalMenu(child.id)}>{child.name}</button>
            : <a key={child.id} href={`#${menu.slug}`}>{child.name}</a>)}</div>}
        </div>)}
      </nav>
    </header>
    <div className={`${styles.body} ${layout === "horizontal" ? layoutStyles.horizontalBody : ""}`}>
      {layout === "vertical" && <aside className={`${styles.sideNav} ${layoutStyles.verticalMenu}`}>
        <strong>MENU</strong>
        {roots.map((menu) => {
          const children = menus.filter((child) => child.parentId === menu.id);
          return <div className={layoutStyles.verticalMenuItem} key={menu.id}>
            <button className={`${layoutStyles.verticalRoot} ${activeMenuId === menu.id ? layoutStyles.verticalActive : ""}`} type="button" onClick={() => selectVerticalMenu(menu.id)}><span>{menu.name}</span>{children.length > 0 && <b>›</b>}</button>
            {children.length > 0 && <div className={layoutStyles.verticalSubmenu}>
              <small>{menu.name}</small>
              {children.map((child) => <button className={activeMenuId === child.id ? layoutStyles.verticalSubActive : ""} type="button" key={child.id} onClick={() => selectVerticalMenu(child.id)}>{child.name}</button>)}
            </div>}
          </div>;
        })}
      </aside>}
      <section className={styles.sections} id="site-content">
        {layout === "horizontal" && (activeItem?.boardId ? <BoardSection menu={activeItem} parentName={activeRoot?.name ?? "소식"} posts={posts} id={activeItem.slug} /> : <ContentSection section={activeSection} id={activeItem?.slug ?? activeRoot?.slug ?? "home"} hero={!activeRoot} index={activeRoot ? activeIndex + 1 : 0} imageUrl={activePage?.imageUrl} />)}
        {layout === "vertical" && <>
          <ContentSection section={hero} id="home" hero index={0} />
          {roots.flatMap((menu, rootIndex) => {
            const rootSection = findMenuSection(menu, rootIndex, sections);
            const children = menus.filter((child) => child.parentId === menu.id);
            return [
              <ContentSection key={menu.id} section={rootSection} id={`menu-${menu.id}`} index={rootIndex + 1} />,
              ...children.map((child, childIndex) => {
                const page = pages.find((item) => item.menuId === child.id);
                const childSection = page
                  ? { sectionType: `PAGE_${child.id}`, title: page.title, subtitle: page.subtitle, body: page.body }
                  : { sectionType: `MENU_${child.id}`, title: child.name, subtitle: `${menu.name} · ${child.name}`, body: `${child.name} 내용을 준비 중입니다.` };
                return child.boardId ? <BoardSection key={child.id} menu={child} parentName={menu.name} posts={posts} id={`menu-${child.id}`} /> : <ContentSection key={child.id} section={childSection} id={`menu-${child.id}`} index={rootIndex + childIndex + 2} imageUrl={page?.imageUrl} />;
              }),
            ];
          })}
        </>}
        {layout === "split" && (activeItem?.boardId ? <BoardSection menu={activeItem} parentName={activeRoot?.name ?? "소식"} posts={posts} id={activeItem.slug} /> : <section className={layoutStyles.splitStage}>
          <div className={layoutStyles.splitContent}>
            <span>{activeSection.subtitle || activeSection.sectionType}</span>
            <h1>{activeSection.title || name}</h1>
            <p>{activeSection.body}</p>
            {activeRoot && menus.some((menu) => menu.parentId === activeRoot.id) && <div className={layoutStyles.splitSubmenus}>{menus.filter((menu) => menu.parentId === activeRoot.id).map((menu) => <button type="button" key={menu.id} onClick={() => setActiveMenuId(menu.id)}>{menu.name}<span>{menu.boardId ? "게시판" : "화면"}</span></button>)}</div>}
            {activeRoot && <button type="button" onClick={() => setActiveMenuId(null)}>← 메인으로 돌아가기</button>}
          </div>
          <div className={layoutStyles.splitMenuGrid}>
            {roots.map((menu, index) => <button className={activeMenuId === menu.id ? layoutStyles.splitMenuActive : ""} type="button" key={menu.id} onClick={() => setActiveMenuId(menu.id)}>
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{menu.name}</strong>
              <span>{menus.filter((child) => child.parentId === menu.id).length > 0 ? `중메뉴 ${menus.filter((child) => child.parentId === menu.id).length}개` : "자세히 보기"}</span>
              <i>↗</i>
            </button>)}
          </div>
        </section>)}
      </section>
    </div>
  </>;
}
