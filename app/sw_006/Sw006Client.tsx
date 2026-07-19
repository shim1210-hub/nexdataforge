"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./sw006.module.css";
import SiteFooter from "./SiteFooter";
import SubmenuPageManager from "./SubmenuPageManager";
import UserManager from "./UserManager";
import sessionStyles from "./session-bar.module.css";

type Section = "dashboard" | "sites" | "menus" | "submenuPages" | "design" | "main" | "footer" | "content" | "preview" | "users" | "database" | "deploy";
type Site = { id: string; slug: string; name: string; industry: string; status: "Live" | "Build" | "Draft" | "Ready"; updated: string };
type Post = { id: number; title: string; board: string; author: string; status: "게시" | "임시"; date: string; attachments: number };
type Board = { id: string; code: string; name: string; description: string | null; is_enabled: boolean };

const nav: { id: Section; icon: string; label: string }[] = [
  { id: "dashboard", icon: "-", label: "대시보드" },
  { id: "sites", icon: "-", label: "사이트 관리" },
  { id: "menus", icon: "-", label: "메뉴 관리" },
  { id: "submenuPages", icon: "-", label: "메뉴 화면 관리" },
  { id: "design", icon: "-", label: "화면 설정" },
  { id: "main", icon: "-", label: "메인 화면 구성" },
  { id: "footer", icon: "-", label: "푸터 구성" },
  { id: "content", icon: "-", label: "콘텐츠 관리" },
  { id: "preview", icon: "-", label: "미리보기 · 적용" },
  { id: "users", icon: "-", label: "사용자 관리" },
  { id: "database", icon: "-", label: "DB 관리" },
];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "요청 처리 중 오류가 발생했습니다.");
  return result;
}

function Badge({ status }: { status: string }) {
  const descriptions: Record<string, string> = {
    Live: "사이트 구성이 완료되어 실제 운영 대상으로 적용된 상태입니다.",
    Draft: "사이트의 메뉴, 화면, 푸터 등을 제작하거나 수정 중인 상태입니다.",
    Build: "사이트 파일을 생성하거나 적용하는 작업이 진행 중인 상태입니다.",
    Ready: "사이트 설정이 완료되어 적용 또는 배포를 기다리는 상태입니다.",
  };
  return <span className={`${styles.badge} ${styles[`badge${status}`] ?? ""}`} title={descriptions[status]}><i />{status}</span>;
}

export default function Sw006Client({ currentUser }: { currentUser: { loginId: string; displayName: string; accessLevel: "SUPER_ADMIN" | "SITE_USER"; companySlug: string | null } }) {
  const isSiteUser = currentUser.accessLevel === "SITE_USER";
  const visibleNav = isSiteUser ? nav.filter((item) => item.id === "content") : nav;
  const [section, setSection] = useState<Section>(isSiteUser ? "content" : "dashboard");
  const [sites, setSites] = useState<Site[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [postBoardId, setPostBoardId] = useState("");
  const [siteQuery, setSiteQuery] = useState("");
  const [modal, setModal] = useState<"site" | "post" | null>(null);
  const [toast, setToast] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [selectedSite, setSelectedSite] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredSites = useMemo(() => sites.filter((site) => `${site.name} ${site.slug}`.toLowerCase().includes(siteQuery.toLowerCase())), [siteQuery, sites]);
  const title = nav.find((item) => item.id === section)?.label ?? "대시보드";

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }, []);

  async function logout() {
    await fetch("/sw_006/api/auth", { method: "DELETE" });
    window.location.replace("/sw_006");
  }

  useEffect(() => {
    api<{ sites: Site[] }>("/sw_006/api/sites")
      .then(({ sites: rows }) => {
        setSites(rows);
        setSelectedSite((current) => current || (isSiteUser ? rows.find((site) => site.slug === currentUser.companySlug)?.slug : rows[0]?.slug) || "");
      })
      .catch((error: Error) => notify(error.message))
      .finally(() => setLoading(false));
  }, [currentUser.companySlug, isSiteUser, notify]);

  useEffect(() => {
    if (!selectedSite) return;
    Promise.all([
      api<{ posts: Post[] }>(`/sw_006/api/posts?siteSlug=${encodeURIComponent(selectedSite)}`),
      api<{ boards: Board[] }>(`/sw_006/api/boards?siteSlug=${encodeURIComponent(selectedSite)}`),
    ]).then(([postResult, boardResult]) => { setPosts(postResult.posts); setBoards(boardResult.boards); })
      .catch((error: Error) => notify(error.message));
  }, [notify, selectedSite, section]);

  async function addSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const slug = String(data.get("slug") ?? "").trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || sites.some((site) => site.slug === slug)) {
      notify("영문 소문자 slug를 입력하고 중복 여부를 확인해 주세요.");
      return;
    }
    try {
      const { site } = await api<{ site: Site }>("/sw_006/api/sites", { method: "POST", body: JSON.stringify({ slug, name: data.get("name"), industry: data.get("industry") }) });
      setSites((current) => [site, ...current]);
      setSelectedSite(site.slug);
      setModal(null);
      notify("새 사이트가 DB에 저장되었습니다.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "사이트 저장에 실패했습니다.");
    }
  }

  async function addPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!selectedSite) return notify("먼저 사이트를 생성하거나 선택해 주세요.");
    try {
      data.set("siteSlug", selectedSite);
      const response = await fetch("/sw_006/api/posts", { method: "POST", body: data });
      const result = await response.json() as { post?: Post; error?: string };
      if (!response.ok || !result.post) throw new Error(result.error || "게시글 저장에 실패했습니다.");
      const post = result.post;
      setPosts((current) => [post, ...current]);
      setModal(null);
      notify("게시글이 DB에 저장되었습니다.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "게시글 저장에 실패했습니다.");
    }
  }

  async function deleteSite(id: string) {
    if (!window.confirm("사이트와 관련 데이터를 삭제할까요?")) return;
    try {
      await api<{ ok: boolean }>(`/sw_006/api/sites?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const next = sites.filter((site) => site.id !== id);
      setSites(next);
      if (!next.some((site) => site.slug === selectedSite)) {
        setSelectedSite(next[0]?.slug || "");
        if (!next.length) { setPosts([]); setBoards([]); }
      }
      notify("사이트가 DB에서 삭제되었습니다.");
    } catch (error) { notify(error instanceof Error ? error.message : "사이트 삭제에 실패했습니다."); }
  }

  async function editSite(site: Site) {
    const name = window.prompt("사이트 이름을 입력하세요. 경로와 영문명은 변경되지 않습니다.", site.name);
    if (name === null || !name.trim()) return;
    const industry = window.prompt("업종을 입력하세요.", site.industry);
    if (industry === null) return;
    try {
      const result = await api<{ site: Site }>("/sw_006/api/sites", { method: "PATCH", body: JSON.stringify({ id: site.id, name, industry }) });
      setSites((current) => current.map((item) => item.id === site.id ? result.site : item));
      notify("사이트 이름과 업종이 수정되었습니다. 경로는 그대로 유지됩니다.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "사이트 수정에 실패했습니다.");
    }
  }

  async function deletePost(id: number) {
    if (!window.confirm("게시글을 삭제할까요?")) return;
    try {
      await api<{ ok: boolean }>(`/sw_006/api/posts?id=${id}`, { method: "DELETE" });
      setPosts((current) => current.filter((post) => post.id !== id));
      notify("게시글이 DB에서 삭제되었습니다.");
    } catch (error) { notify(error instanceof Error ? error.message : "게시글 삭제에 실패했습니다."); }
  }

  return (
    <main className={styles.app}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.brand}><span>◆</span><div><strong>AIWF</strong><small>Website Factory</small></div></div>
        <nav aria-label="관리자 메뉴">
          <p>WORKSPACE</p>
          {visibleNav.map((item) => <button className={section === item.id ? styles.active : ""} key={item.id} onClick={() => setSection(item.id)}><b>{item.icon}</b><span>{item.label}</span></button>)}
        </nav>
        <div className={styles.sidebarBottom}><div className={styles.avatar}>{currentUser.displayName.slice(0, 2)}</div><div><strong>{currentUser.displayName}</strong><small>{currentUser.loginId}</small></div><button type="button" aria-label="로그아웃" title="로그아웃" onClick={logout}>↪</button></div>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <button className={styles.menuToggle} onClick={() => setCollapsed((value) => !value)} aria-label="사이드바 열기">☰</button>
          <div className={styles.breadcrumb}><span>AI Website Factory</span><b>/</b><strong>{title}</strong></div>
          <div className={styles.topActions}><button aria-label="알림" className={styles.iconButton}>♢<i /></button><div className={sessionStyles.user}><div className={styles.avatar}>{currentUser.displayName.slice(0, 2)}</div><span className={sessionStyles.identity}><strong>{currentUser.displayName}</strong><small>{currentUser.loginId}</small></span><button className={sessionStyles.logout} type="button" onClick={logout}>로그아웃</button></div></div>
        </header>

        <div className={styles.content}>
          {section === "dashboard" && <Dashboard sites={sites} onNavigate={(target) => setSection(target === "deploy" ? "preview" : target)} onCreate={() => setModal("site")} />}
          {section === "sites" && <Sites sites={filteredSites} query={siteQuery} setQuery={setSiteQuery} onCreate={() => setModal("site")} onEdit={editSite} onDelete={deleteSite} />}
          {section === "menus" && <Menus notify={notify} selectedSite={selectedSite} site={sites.find((item) => item.slug === selectedSite)} sites={sites} onSiteChange={setSelectedSite} />}
          {section === "submenuPages" && <SubmenuPageManager notify={notify} selectedSite={selectedSite} sites={sites} onSiteChange={setSelectedSite} />}
          {section === "design" && <Design notify={notify} selectedSite={selectedSite} site={sites.find((item) => item.slug === selectedSite)} sites={sites} onSiteChange={setSelectedSite} />}
          {section === "main" && <MainConfiguration notify={notify} selectedSite={selectedSite} site={sites.find((item) => item.slug === selectedSite)} sites={sites} onSiteChange={setSelectedSite} />}
          {section === "footer" && <FooterConfiguration notify={notify} selectedSite={selectedSite} site={sites.find((item) => item.slug === selectedSite)} sites={sites} onSiteChange={setSelectedSite} />}
          {section === "content" && <Content posts={posts} boards={boards} sites={sites} selectedSite={selectedSite} onSiteChange={setSelectedSite} onCreate={(boardId) => { setPostBoardId(boardId); setModal("post"); }} onDelete={deletePost} siteLocked={isSiteUser} />}
          {section === "preview" && <SitePreview notify={notify} selectedSite={selectedSite} site={sites.find((item) => item.slug === selectedSite)} sites={sites} onSiteChange={setSelectedSite} onApplied={(slug) => setSites((current) => current.map((item) => item.slug === slug ? { ...item, status: "Live" } : item))} />}
          {section === "users" && <UserManager notify={notify} sites={sites} />}
          {section === "database" && <Database />}
        </div>
      </section>

      {modal === "site" && <Modal title="새 사이트 만들기" subtitle="업체 기본정보를 입력하면 제작 워크플로가 시작됩니다." onClose={() => setModal(null)}><form onSubmit={addSite} className={styles.form}><label>업체명 slug <small>영문 소문자 *</small><div className={styles.prefix}><span>/sw_006/</span><input required name="slug" placeholder="company" /></div></label><label>사이트명<input required name="name" placeholder="예: Highcon Construction" /></label><label>업종<select name="industry"><option>건설 / 시공</option><option>IT / 솔루션</option><option>헬스케어</option><option>제조</option></select></label><div className={styles.modalActions}><button type="button" onClick={() => setModal(null)}>취소</button><button className={styles.primary}>사이트 생성</button></div></form></Modal>}
      {modal === "post" && <Modal title="새 게시글 등록" subtitle={`${selectedSite} 사이트의 게시판에 글을 등록합니다.`} onClose={() => setModal(null)}><form onSubmit={addPost} className={styles.form}><label>게시판<select name="boardId" required defaultValue={postBoardId || boards[0]?.id || ""}><option value="" disabled>게시판을 선택해 주세요</option>{boards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}</select></label><label>제목<input required name="title" placeholder="게시글 제목" /></label><label>내용<textarea required name="body" rows={7} placeholder="게시글 내용을 입력하세요." /></label><label>첨부파일 <small>이미지, Word, PDF · 파일당 10MB · 최대 5개</small><input type="file" name="files" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif,.doc,.docx,application/pdf" /></label><label className={styles.check}><input type="checkbox" name="publish" defaultChecked /> 바로 게시하기</label><div className={styles.modalActions}><button type="button" onClick={() => setModal(null)}>취소</button><button className={styles.primary}>저장</button></div></form></Modal>}
      {loading && <div className={styles.toast}>DB 데이터를 불러오는 중…</div>}
      {toast && <div className={styles.toast}>✓ {toast}</div>}
    </main>
  );
}

function PageHead({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  const visibleAction = title === "좋은 오후예요, 관리자님" ? null : action;
  return <div className={styles.pageHead}><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{visibleAction}</div>;
}

function Dashboard({ sites, onNavigate, onCreate }: { sites: Site[]; onNavigate: (s: Section) => void; onCreate: () => void }) {
  return <><PageHead eyebrow="OVERVIEW" title="좋은 오후예요, 관리자님" description="사이트 제작 현황과 최근 작업을 한눈에 확인하세요." action={<button className={styles.primary} onClick={onCreate}>＋ 새 사이트 만들기</button>} /><div className={styles.stats}>{[["전체 사이트", sites.length, "+2 이번 달", "▣"], ["배포 완료", sites.filter(s => s.status === "Live").length, "정상 운영 중", "✓"], ["작업 중", sites.filter(s => s.status !== "Live").length, "1개 확인 필요", "◷"], ["이번 달 방문", "24.8K", "+18.2%", "⌁"]].map((stat) => <article key={stat[0]}><div><span>{stat[0]}</span><b>{stat[3]}</b></div><strong>{stat[1]}</strong><small>{stat[2]}</small></article>)}</div><div className={styles.dashboardGrid}><section className={styles.panel}><div className={styles.panelHead}><div><h2>최근 사이트</h2><p>최근 수정된 사이트와 배포 상태</p></div><button onClick={() => onNavigate("sites")}>전체 보기 →</button></div><div className={styles.siteList}>{sites.slice(0, 4).map(site => <div key={site.id}><div className={styles.siteLogo}>{site.name.slice(0, 1)}</div><div><strong>{site.name}</strong><small>/sw_006/{site.slug}</small></div><Badge status={site.status} /><time>{site.updated}</time><button aria-label="더보기">•••</button></div>)}</div></section><section className={styles.panel}><div className={styles.panelHead}><div><h2>제작 진행률</h2><p>hicon 웹사이트</p></div><span className={styles.percent}>72%</span></div><div className={styles.progress}><i style={{ width: "72%" }} /></div><ol className={styles.steps}><li className={styles.done}><b>✓</b><div><strong>기본정보 · 템플릿</strong><small>설정 완료</small></div></li><li className={styles.done}><b>✓</b><div><strong>메뉴 · 화면 구성</strong><small>설정 완료</small></div></li><li className={styles.now}><b>3</b><div><strong>파일 생성</strong><small>HTML/CSS 생성 중</small></div></li><li><b>4</b><div><strong>GitHub · Vercel</strong><small>대기 중</small></div></li></ol><button className={styles.fullButton} onClick={() => onNavigate("deploy")}>작업 상세 보기</button></section></div><section className={styles.quick}><h2>빠른 작업</h2><div>{[["▣", "사이트 만들기", "업체 정보부터 시작", onCreate], ["☷", "메뉴 편집", "대·중메뉴 구성", () => onNavigate("menus")], ["▤", "게시글 등록", "콘텐츠 바로 작성", () => onNavigate("content")], ["↗", "배포 상태", "Vercel 배포 확인", () => onNavigate("deploy")]].map(item => <button key={String(item[1])} onClick={item[3] as () => void}><b>{item[0] as string}</b><span><strong>{item[1] as string}</strong><small>{item[2] as string}</small></span><em>→</em></button>)}</div></section></>;
}

function Sites({ sites, query, setQuery, onCreate, onEdit, onDelete }: { sites: Site[]; query: string; setQuery: (s: string) => void; onCreate: () => void; onEdit: (site: Site) => void; onDelete: (id: string) => void }) {
  return <><PageHead eyebrow="SITE MANAGEMENT" title="사이트 관리" description="사이트 이름과 업종은 수정할 수 있으며 영문 경로는 생성 후 변경할 수 없습니다." action={<button className={styles.primary} onClick={onCreate}>＋ 새 사이트 만들기</button>} /><section className={styles.panel}><div className={styles.toolbar}><div className={styles.search}>⌕<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="업체명 또는 slug 검색" /></div><div><button>전체 상태⌄</button><button>최근 수정순⌄</button></div></div><div className={`${styles.table} ${styles.siteTable}`}><div className={styles.tableHeader}><span>사이트</span><span>업종</span><span>경로(변경 불가)</span><span>상태</span><span>최근 수정</span><span>관리</span></div>{sites.map(site => <div className={styles.tableRow} key={site.id}><span><i className={styles.siteLogo}>{site.name[0]}</i><strong>{site.name}</strong></span><span>{site.industry}</span><span>/sw_006/{site.slug}</span><span><Badge status={site.status} /></span><span>{site.updated}</span><span><button onClick={() => onEdit(site)} title="수정">수정</button><button onClick={() => onDelete(site.id)} title="삭제">×</button></span></div>)}</div></section></>;
}

type MenuRow = { id: string; parent_id: string | null; depth: number; name: string; slug: string; sort_order: number; url_type: "PAGE" | "BOARD"; board_id: string | null };

function Menus({ notify, selectedSite, site, sites, onSiteChange }: { notify: (s: string) => void; selectedSite: string; site?: Site; sites: Site[]; onSiteChange: (slug: string) => void }) {
  const [menus, setMenus] = useState<MenuRow[]>([]);
  const [childParentId, setChildParentId] = useState<string | null>(null);
  const [childName, setChildName] = useState("");
  const [childIsBoard, setChildIsBoard] = useState(false);
  const [editingChild, setEditingChild] = useState<MenuRow | null>(null);

  useEffect(() => {
    if (!selectedSite) return;
    api<{ menus: MenuRow[] }>(`/sw_006/api/menus?siteSlug=${encodeURIComponent(selectedSite)}`)
      .then((result) => setMenus(result.menus))
      .catch((error: Error) => notify(error.message));
  }, [notify, selectedSite]);

  const roots = selectedSite ? menus.filter((menu) => !menu.parent_id) : [];

  async function addMenu(parentId: string | null, childOptions?: { name: string; isBoard: boolean }) {
    if (!selectedSite) return notify("먼저 사이트를 생성하거나 선택해 주세요.");
    const name = parentId ? childOptions?.name : window.prompt("대메뉴명을 입력하세요.");
    if (!name?.trim()) return;
    try {
      const { menu } = await api<{ menu: MenuRow }>("/sw_006/api/menus", { method: "POST", body: JSON.stringify({ siteSlug: selectedSite, parentId, name, isBoard: childOptions?.isBoard ?? false }) });
      setMenus((current) => [...current, menu]);
      setChildParentId(null); setChildName(""); setChildIsBoard(false);
      notify(childOptions?.isBoard ? "게시판 중메뉴가 콘텐츠 관리와 연결되었습니다." : "메뉴가 DB에 저장되었습니다.");
    } catch (error) { notify(error instanceof Error ? error.message : "메뉴 저장에 실패했습니다."); }
  }

  async function editMenu(menu: MenuRow) {
    if (menu.depth === 2) {
      setEditingChild(menu); setChildParentId(menu.parent_id); setChildName(menu.name); setChildIsBoard(menu.url_type === "BOARD");
      return;
    }
    const name = window.prompt("변경할 대메뉴명을 입력하세요. URL 경로는 변경되지 않습니다.", menu.name);
    if (!name?.trim() || name.trim() === menu.name) return;
    try {
      const result = await api<{ menu: MenuRow }>("/sw_006/api/menus", { method: "PATCH", body: JSON.stringify({ id: menu.id, siteSlug: selectedSite, name }) });
      setMenus((current) => current.map((item) => item.id === menu.id ? result.menu : item));
      notify("대메뉴명이 수정되었습니다. 기존 URL 경로는 유지됩니다.");
    } catch (error) { notify(error instanceof Error ? error.message : "메뉴명 수정에 실패했습니다."); }
  }

  async function updateChild() {
    if (!editingChild || !childName.trim()) return;
    try {
      const result = await api<{ menu: MenuRow }>("/sw_006/api/menus", { method: "PATCH", body: JSON.stringify({ id: editingChild.id, siteSlug: selectedSite, name: childName, isBoard: childIsBoard }) });
      setMenus((current) => current.map((item) => item.id === editingChild.id ? result.menu : item));
      setEditingChild(null); setChildParentId(null); setChildName(""); setChildIsBoard(false);
      notify("중메뉴 이름과 메뉴 유형이 수정되었습니다.");
    } catch (error) { notify(error instanceof Error ? error.message : "중메뉴 수정에 실패했습니다."); }
  }

  function closeChildModal() { setEditingChild(null); setChildParentId(null); setChildName(""); setChildIsBoard(false); }

  async function deleteMenu(id: string) {
    if (!window.confirm("선택한 메뉴를 삭제할까요?")) return;
    try {
      await api<{ ok: boolean }>(`/sw_006/api/menus?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      setMenus((current) => current.filter((menu) => menu.id !== id && menu.parent_id !== id));
      notify("메뉴가 DB에서 삭제되었습니다.");
    } catch (error) { notify(error instanceof Error ? error.message : "메뉴 삭제에 실패했습니다."); }
  }

  return <>
    <PageHead eyebrow="MENU-001 · MENU-002" title="메뉴 관리" description="대메뉴와 중메뉴를 추가하고 메뉴명을 수정합니다. URL 경로는 유지됩니다." action={<button className={styles.primary} disabled={!site} onClick={() => addMenu(null)}>＋ 대메뉴 추가</button>} />
    <section className={styles.siteContext} aria-label="메뉴 관리 사이트 선택">
      <div className={styles.siteLogo}>{site?.name?.slice(0, 1) || "?"}</div>
      <label className={styles.contextSelector}><span>메뉴를 관리할 사이트 선택</span><select value={selectedSite} onChange={(event) => onSiteChange(event.target.value)}><option value="">사이트를 선택해 주세요</option>{sites.map((option) => <option key={option.id} value={option.slug}>{option.name} ({option.slug})</option>)}</select></label>
      {site && <><dl><div><dt>선택된 사이트</dt><dd>{site.name}</dd></div><div><dt>저장 경로</dt><dd>app/sw_006/{site.slug}/</dd></div></dl><Badge status={site.status} /></>}
    </section>
    <div className={styles.contextNotice}>ⓘ 추가·수정·삭제하는 메뉴는 <strong>{site?.name || "아직 선택되지 않음"}</strong>에만 반영됩니다.</div>
    <div className={styles.split}>
      <section className={styles.panel}>
        <div className={styles.panelHead}><div><h2>메뉴 구조</h2><p>{site ? `${site.name} (${site.slug}) 사이트의 DB 메뉴` : "위에서 사이트를 선택해 주세요."}</p></div></div>
        <div className={styles.menuTree}>
          {roots.length === 0 && <p>{site ? "등록된 메뉴가 없습니다." : "사이트를 선택하면 메뉴가 표시됩니다."}</p>}
          {roots.map((item) => <article key={item.id}>
            <div><b>⠿</b><strong>{item.name}</strong><small>대메뉴</small><button onClick={() => editMenu(item)} title="메뉴명 수정">수정</button><button onClick={() => deleteMenu(item.id)} title="삭제">×</button></div>
            {menus.filter((child) => child.parent_id === item.id).map((child) => { const isBoard = child.board_id !== null || child.url_type === "BOARD"; return <p key={child.id}><b>└</b><span>{child.name}</span><em className={`${styles.menuTypeFlag} ${isBoard ? styles.boardMenuBadge : styles.pageMenuBadge}`}>게시판 여부: <strong>{isBoard ? "예" : "아니오"}</strong></em><small>{isBoard ? `/board/${child.slug}` : `/pages/${child.slug}`}</small><button onClick={() => editMenu(child)} title="중메뉴 수정">수정</button><button onClick={() => deleteMenu(child.id)} title="삭제">×</button></p>; })}
            <button className={styles.addChild} onClick={() => { setEditingChild(null); setChildParentId(item.id); setChildName(""); setChildIsBoard(false); }}>＋ 중메뉴 추가</button>
          </article>)}
        </div>
      </section>
      <Preview />
    </div>
    {childParentId && <Modal title={editingChild ? "중메뉴 수정" : "중메뉴 추가"} subtitle="메뉴명과 게시판 용도를 함께 설정할 수 있습니다." onClose={closeChildModal}><form className={styles.form} onSubmit={(event) => { event.preventDefault(); if (editingChild) void updateChild(); else void addMenu(childParentId, { name: childName, isBoard: childIsBoard }); }}><label>중메뉴명<input autoFocus required value={childName} onChange={(event) => setChildName(event.target.value)} placeholder="예: 공지사항" /></label><label className={styles.check}><input type="checkbox" checked={childIsBoard} onChange={(event) => setChildIsBoard(event.target.checked)} /><span>게시판 용도로 사용</span></label><p className={styles.formHint}>{childIsBoard ? "콘텐츠 관리의 게시글 작성 유형에 표시됩니다." : "메뉴 화면 관리에서 일반 화면 내용을 편집합니다."}</p><div className={styles.modalActions}><button type="button" onClick={closeChildModal}>취소</button><button className={styles.primary}>{editingChild ? "수정 저장" : "중메뉴 추가"}</button></div></form></Modal>}
  </>;
}

function Preview() { return <section className={`${styles.panel} ${styles.preview}`}><div className={styles.panelHead}><div><h2>Header 미리보기</h2><p>PC · Hover 상태</p></div><span className={styles.live}>● LIVE</span></div><div className={styles.browser}><div><i /><i /><i /><span>preview.aiwf.local/hicon</span></div><section><header><strong>HICON</strong><nav><span>회사 소개</span><span>제품 소개</span><span>사업 영역</span><span>자료실</span></nav></header><div className={styles.dropdown}><p>회사 소개</p><a>인사말</a><a>연혁</a><a>오시는 길</a></div><main><small>BUILDING THE FUTURE</small><h3>신뢰로 짓는<br />건설 파트너</h3><p>풍부한 경험과 기술력으로 더 나은 공간을 만듭니다.</p></main></section></div></section> }

type LayoutType = "horizontal" | "vertical" | "split";
type DesignConfig = { layout: LayoutType; primary: string; font: string; radius: number };

const layoutOptions: { id: LayoutType; name: string; badge: string; description: string }[] = [
  { id: "horizontal", name: "가로형 레이아웃", badge: "LANDSCAPE", description: "상단 메뉴와 넓은 메인 비주얼을 사용하는 기업 홈페이지형" },
  { id: "vertical", name: "세로형 레이아웃", badge: "PORTRAIT", description: "왼쪽 세로 메뉴와 콘텐츠 영역을 분리한 관리·정보형" },
  { id: "split", name: "분할형 레이아웃", badge: "SPLIT", description: "메인 비주얼과 핵심 정보를 좌우로 나눈 브랜드형" },
];

function Design({ notify, selectedSite, site, sites, onSiteChange }: { notify: (s: string) => void; selectedSite: string; site?: Site; sites: Site[]; onSiteChange: (slug: string) => void }) {
  const [config, setConfig] = useState<DesignConfig>({ layout: "horizontal", primary: "#4F46E5", font: "Pretendard", radius: 12 });

  useEffect(() => {
    if (!selectedSite) return;
    api<{ config: DesignConfig }>(`/sw_006/api/design?siteSlug=${encodeURIComponent(selectedSite)}`)
      .then((result) => setConfig(result.config))
      .catch((error: Error) => notify(error.message));
  }, [notify, selectedSite]);

  async function saveDesign() {
    if (!selectedSite) return notify("화면을 설정할 사이트를 먼저 선택해 주세요.");
    try {
      const result = await api<{ config: DesignConfig }>("/sw_006/api/design", { method: "PUT", body: JSON.stringify({ siteSlug: selectedSite, config }) });
      setConfig(result.config);
      notify(`${site?.name} 화면 설정이 DB에 저장되었습니다.`);
    } catch (error) { notify(error instanceof Error ? error.message : "화면 설정 저장에 실패했습니다."); }
  }

  return <><PageHead eyebrow="SITE DESIGN" title="화면 설정" description="사이트별 레이아웃 방향과 공통 디자인을 선택합니다." action={<button className={styles.primary} disabled={!site} onClick={saveDesign}>이 사이트 설정 저장</button>} /><section className={styles.designSitePicker}><div><span>1단계</span><strong>화면을 설정할 사이트</strong><p>사이트마다 서로 다른 레이아웃과 색상을 저장합니다.</p></div><select value={selectedSite} onChange={(event) => onSiteChange(event.target.value)}><option value="">사이트를 선택해 주세요</option>{sites.map((option) => <option key={option.id} value={option.slug}>{option.name} ({option.slug})</option>)}</select>{site && <div className={styles.designTarget}><i className={styles.siteLogo}>{site.name.slice(0, 1)}</i><span><small>현재 설정 대상</small><b>{site.name}</b><em>app/sw_006/{site.slug}/</em></span><Badge status={site.status} /></div>}</section><section className={styles.designStep}><div className={styles.designStepTitle}><span>2단계</span><div><h2>레이아웃 방향 선택</h2><p>사이트의 메뉴 위치와 콘텐츠 흐름을 선택하세요.</p></div></div><div className={styles.layoutGrid}>{layoutOptions.map((layout) => <button type="button" className={`${styles.layoutCard} ${config.layout === layout.id ? styles.layoutChosen : ""}`} key={layout.id} onClick={() => setConfig((current) => ({ ...current, layout: layout.id }))} disabled={!site}><div className={`${styles.layoutPreview} ${styles[`layout_${layout.id}`]}`}><header /><aside /><main><i /><i /><i /></main><footer /></div><span>{layout.badge}</span><strong>{layout.name}</strong><p>{layout.description}</p><em>{config.layout === layout.id ? "✓ 선택됨" : "선택하기"}</em></button>)}</div></section><section className={`${styles.panel} ${styles.designRules}`}><div className={styles.panelHead}><div><h2>3단계 · 공통 디자인</h2><p>{site ? `${site.name} 전체 화면에 적용됩니다.` : "사이트를 먼저 선택해 주세요."}</p></div></div><div className={styles.settings}><label>대표 색상<div><input type="color" value={config.primary} onChange={(event) => setConfig((current) => ({ ...current, primary: event.target.value.toUpperCase() }))} disabled={!site} /><input value={config.primary} onChange={(event) => setConfig((current) => ({ ...current, primary: event.target.value }))} disabled={!site} /></div></label><label>기본 글꼴<select value={config.font} onChange={(event) => setConfig((current) => ({ ...current, font: event.target.value }))} disabled={!site}><option>Pretendard</option><option>Noto Sans KR</option></select></label><label>카드 모서리<select value={config.radius} onChange={(event) => setConfig((current) => ({ ...current, radius: Number(event.target.value) }))} disabled={!site}><option value={8}>8px</option><option value={12}>12px</option><option value={16}>16px</option></select></label></div></section></>;
}

function SiteWorkSelector({ step, title, description, selectedSite, site, sites, onSiteChange }: { step: string; title: string; description: string; selectedSite: string; site?: Site; sites: Site[]; onSiteChange: (slug: string) => void }) {
  return <section className={styles.designSitePicker}><div><span>{step}</span><strong>{title}</strong><p>{description}</p></div><select value={selectedSite} onChange={(event) => onSiteChange(event.target.value)}><option value="">사이트를 선택해 주세요</option>{sites.map((option) => <option key={option.id} value={option.slug}>{option.name} ({option.slug})</option>)}</select>{site && <div className={styles.designTarget}><i className={styles.siteLogo}>{site.name.slice(0, 1)}</i><span><small>현재 작업 대상</small><b>{site.name}</b><em>app/sw_006/{site.slug}/</em></span><Badge status={site.status} /></div>}</section>;
}

type MainSectionEdit = { sectionType: string; title: string; subtitle: string; body: string; enabled: boolean; menuName?: string };
const defaultMainSections: MainSectionEdit[] = [
  { sectionType: "HERO", title: "더 나은 공간을 만드는 기업", subtitle: "BUILDING THE FUTURE", body: "신뢰와 기술을 바탕으로 고객의 미래를 함께 만들어갑니다.", enabled: true },
  { sectionType: "ABOUT", title: "회사 소개", subtitle: "ABOUT US", body: "축적된 경험과 전문성을 바탕으로 새로운 가치를 제공합니다.", enabled: true },
  { sectionType: "SERVICE", title: "주요 사업", subtitle: "OUR BUSINESS", body: "고객에게 필요한 핵심 서비스와 사업 분야를 소개합니다.", enabled: true },
];

function MainConfiguration({ notify, selectedSite, site, sites, onSiteChange }: { notify: (s: string) => void; selectedSite: string; site?: Site; sites: Site[]; onSiteChange: (slug: string) => void }) {
  const [sections, setSections] = useState<MainSectionEdit[]>([defaultMainSections[0]]);
  useEffect(() => {
    if (!selectedSite) return;
    Promise.all([
      api<{ sections: MainSectionEdit[] }>(`/sw_006/api/main-sections?siteSlug=${encodeURIComponent(selectedSite)}`),
      api<{ menus: MenuRow[] }>(`/sw_006/api/menus?siteSlug=${encodeURIComponent(selectedSite)}`),
    ])
      .then(([sectionResult, menuResult]) => {
        const storedSections = sectionResult.sections;
        const hero = storedSections.find((section) => section.sectionType === "HERO") ?? defaultMainSections[0];
        const menuSections = menuResult.menus
          .filter((menu) => menu.depth === 1)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((menu) => {
            const sectionType = `MENU_${menu.id}`;
            const saved = storedSections.find((section) => section.sectionType === sectionType);
            return saved
              ? { ...saved, menuName: menu.name }
              : { sectionType, menuName: menu.name, title: menu.name, subtitle: menu.slug.toUpperCase(), body: `${menu.name}에 대한 내용을 입력해 주세요.`, enabled: true };
          });
        setSections([{ ...hero, menuName: "메인 배너" }, ...menuSections]);
      })
      .catch((error: Error) => notify(error.message));
  }, [notify, selectedSite]);
  function updateSection(index: number, field: keyof MainSectionEdit, value: string | boolean) { setSections((current) => current.map((section, itemIndex) => itemIndex === index ? { ...section, [field]: value } : section)); }
  async function save() { if (!selectedSite) return notify("메인 화면을 구성할 사이트를 선택해 주세요."); try { await api("/sw_006/api/main-sections", { method: "PUT", body: JSON.stringify({ siteSlug: selectedSite, sections }) }); notify(`${site?.name} 메인 화면이 DB에 저장되었습니다.`); } catch (error) { notify(error instanceof Error ? error.message : "메인 화면 저장에 실패했습니다."); } }
  return <><PageHead eyebrow="MAIN-001 · MAIN-002" title="메인 화면 구성" description="메인 배너와 메뉴관리에서 등록한 대메뉴별 섹션을 구성합니다." action={<button className={styles.primary} disabled={!site} onClick={save}>메인 화면 저장</button>} /><SiteWorkSelector step="1단계" title="메인 화면을 구성할 사이트" description="선택한 사이트의 대메뉴 순서대로 아래 섹션이 표시됩니다." selectedSite={selectedSite} site={site} sites={sites} onSiteChange={onSiteChange} /><div className={styles.mainBuilder}>{sections.map((section, index) => <section className={styles.sectionEditor} key={section.sectionType}><header><div><b>{String(index + 1).padStart(2, "0")}</b><span><strong>{section.menuName || "메인 배너"}</strong><small>{section.sectionType === "HERO" ? "HERO" : "대메뉴 연동"}</small></span></div><label><input type="checkbox" checked={section.enabled} onChange={(event) => updateSection(index, "enabled", event.target.checked)} /> 화면에 표시</label></header><div><label>영문/보조 문구<input value={section.subtitle} onChange={(event) => updateSection(index, "subtitle", event.target.value)} disabled={!site} /></label><label>제목<input value={section.title} onChange={(event) => updateSection(index, "title", event.target.value)} disabled={!site} /></label><label className={styles.wideField}>설명<textarea rows={3} value={section.body} onChange={(event) => updateSection(index, "body", event.target.value)} disabled={!site} /></label></div></section>)}</div></>;
}

type FooterEdit = { companyName: string; representativeName: string; businessNumber: string; email: string; phone: string; address: string; copyrightText: string; siteByText: string };
const emptyFooter: FooterEdit = { companyName: "", representativeName: "", businessNumber: "", email: "", phone: "", address: "", copyrightText: "", siteByText: "NexDataForge" };
type FooterResponse = Partial<Record<keyof FooterEdit, string | null>>;

function normalizeFooter(value: FooterResponse | null, fallbackCompanyName: string): FooterEdit {
  return {
    companyName: value?.companyName ?? fallbackCompanyName,
    representativeName: value?.representativeName ?? "",
    businessNumber: value?.businessNumber ?? "",
    email: value?.email ?? "",
    phone: value?.phone ?? "",
    address: value?.address ?? "",
    copyrightText: value?.copyrightText ?? "",
    siteByText: value?.siteByText ?? "NexDataForge",
  };
}

function FooterPreview({ footer, siteName }: { footer: FooterEdit; siteName: string }) {
  return <section className={styles.footerSample}>
    <span>푸터 미리보기</span>
    <SiteFooter footer={footer} siteName={siteName} />
  </section>;
}

function FooterConfiguration({ notify, selectedSite, site, sites, onSiteChange }: { notify: (s: string) => void; selectedSite: string; site?: Site; sites: Site[]; onSiteChange: (slug: string) => void }) {
  const [footer, setFooter] = useState<FooterEdit>(emptyFooter);
  const [loadingFooter, setLoadingFooter] = useState(true);
  useEffect(() => {
    if (!selectedSite) return;
    let active = true;
    queueMicrotask(() => { if (active) setLoadingFooter(true); });
    api<{ footer: FooterResponse | null }>(`/sw_006/api/footer?siteSlug=${encodeURIComponent(selectedSite)}`)
      .then((result) => { if (active) setFooter(normalizeFooter(result.footer, site?.name || "")); })
      .catch((error: Error) => { if (active) notify(error.message); })
      .finally(() => { if (active) setLoadingFooter(false); });
    return () => { active = false; };
  }, [notify, selectedSite, site?.name]);
  function update(field: keyof FooterEdit, value: string) { setFooter((current) => ({ ...current, [field]: value })); }
  async function save() {
    if (!selectedSite) return notify("푸터를 구성할 사이트를 선택해 주세요.");
    if (loadingFooter) return notify("푸터 정보를 불러오는 중입니다. 잠시 후 다시 저장해 주세요.");
    if (!footer.companyName.trim()) return notify("회사명은 필수 입력 항목입니다.");
    try {
      await api("/sw_006/api/footer", { method: "PUT", body: JSON.stringify({ siteSlug: selectedSite, ...footer }) });
      notify(`${site?.name} 푸터가 DB에 저장되었습니다.`);
    } catch (error) { notify(error instanceof Error ? error.message : "푸터 저장에 실패했습니다."); }
  }
  return <><PageHead eyebrow="FOOT-001" title="푸터 구성" description="사이트 하단에 표시할 회사정보와 저작권 문구를 입력합니다." action={<button className={styles.primary} disabled={!site} onClick={save}>푸터 저장</button>} /><SiteWorkSelector step="1단계" title="푸터를 구성할 사이트" description="회사정보는 선택한 사이트 하단에만 표시됩니다." selectedSite={selectedSite} site={site} sites={sites} onSiteChange={onSiteChange} /><section className={styles.panel}><div className={styles.panelHead}><div><h2>회사 및 연락처 정보</h2><p>* 회사명은 필수 항목입니다.</p></div></div><div className={styles.footerForm}>{([ ["companyName","회사명 *"], ["representativeName","대표자명"], ["businessNumber","사업자등록번호"], ["email","대표 이메일"], ["phone","대표 전화번호"], ["address","주소"], ["copyrightText","저작권 문구"], ["siteByText","사이트 제작 표시"] ] as [keyof FooterEdit,string][]).map(([field,label]) => <label className={field === "address" || field === "copyrightText" ? styles.wideField : ""} key={field}>{label}<input value={footer[field]} onChange={(event) => update(field,event.target.value)} disabled={!site} placeholder={field === "copyrightText" ? `Copyright © ${new Date().getFullYear()} ${site?.name || "Company"}. All Rights Reserved.` : ""} /></label>)}</div></section>{site && <FooterPreview footer={footer} siteName={site.name} />}</>;
}

function SitePreview({ notify, selectedSite, site, sites, onSiteChange, onApplied }: { notify: (s: string) => void; selectedSite: string; site?: Site; sites: Site[]; onSiteChange: (slug: string) => void; onApplied: (slug: string) => void }) {
  const [frameKey, setFrameKey] = useState(0); const [applying, setApplying] = useState(false);
  async function applySite() { if (!selectedSite) return notify("적용할 사이트를 선택해 주세요."); setApplying(true); try { const result = await api<{ url: string }>("/sw_006/api/apply", { method: "POST", body: JSON.stringify({ siteSlug: selectedSite }) }); onApplied(selectedSite); setFrameKey((key) => key + 1); notify(`${site?.name} 사이트 적용이 완료되었습니다: ${result.url}`); window.open(result.url, "_blank", "noopener,noreferrer"); } catch (error) { notify(error instanceof Error ? error.message : "사이트 적용에 실패했습니다."); } finally { setApplying(false); } }
  return <><PageHead eyebrow="PREV-001 · APPLY" title="미리보기 · 사이트 적용" description="설정 결과를 확인한 뒤 실제 사이트 경로에 적용합니다." action={<div className={styles.previewActions}><button disabled={!site} onClick={() => site && window.open(`/sw_006/${site.slug}?preview=1`, "_blank", "noopener,noreferrer")}>새 창 미리보기 ↗</button><button className={styles.primary} disabled={!site || applying} onClick={applySite}>{applying ? "적용 중…" : "사이트 적용하기"}</button></div>} /><SiteWorkSelector step="최종 단계" title="미리보기·적용할 사이트" description="메뉴, 화면, 메인, 푸터 설정을 모두 확인하세요." selectedSite={selectedSite} site={site} sites={sites} onSiteChange={onSiteChange} />{site ? <><div className={styles.applyChecklist}><span>✓ 사이트 기본정보</span><span>✓ 선택 사이트 메뉴</span><span>✓ 레이아웃·디자인</span><span>✓ 메인 화면·푸터</span></div><section className={styles.previewFrame}><header><span>미리보기 · /sw_006/{site.slug}</span><button onClick={() => setFrameKey((key) => key + 1)}>새로고침 ↻</button></header><iframe key={frameKey} src={`/sw_006/${site.slug}?preview=1`} title={`${site.name} 미리보기`} /></section></> : <div className={styles.emptyState}>사이트를 선택하면 여기에 미리보기가 표시됩니다.</div>}</>;
}

function Content({ posts, boards, sites, selectedSite, onSiteChange, onCreate, onDelete, siteLocked = false }: { posts: Post[]; boards: Board[]; sites: Site[]; selectedSite: string; onSiteChange: (slug: string) => void; onCreate: (boardId: string) => void; onDelete: (id: number) => void; siteLocked?: boolean }) {
  const site = sites.find((item) => item.slug === selectedSite);
  const [boardFilter, setBoardFilter] = useState("");
  const visiblePosts = boardFilter ? posts.filter((post) => post.board === boards.find((board) => board.id === boardFilter)?.name) : posts;
  function changeSite(slug: string) { setBoardFilter(""); onSiteChange(slug); }
  return <>
    <PageHead eyebrow="SITE BOARD CMS" title="콘텐츠 관리" description="사이트와 게시판을 선택해 게시글과 첨부파일을 관리합니다." />
    <section className={styles.contentPicker}>
      <div className={styles.contentPickerTitle}><span>관리 대상</span><strong>사이트 · 게시판 선택</strong><p>사이트를 선택한 뒤 관리할 게시판을 선택하세요.</p></div>
      <label><span>사이트</span><select value={selectedSite} disabled={siteLocked} onChange={(event) => changeSite(event.target.value)}><option value="">사이트를 선택해 주세요</option>{sites.map((option) => <option key={option.id} value={option.slug}>{option.name} ({option.slug})</option>)}</select></label>
      <b>→</b>
      <label><span>게시판</span><select value={boardFilter} onChange={(event) => setBoardFilter(event.target.value)} disabled={!site || !boards.length}><option value="">{boards.length ? `전체 게시판 (${posts.length})` : "게시판이 없습니다"}</option>{boards.map((board) => <option key={board.id} value={board.id}>{board.name} ({posts.filter((post) => post.board === board.name).length})</option>)}</select></label>
      <div className={styles.contentPickerAction}><button className={styles.primary} disabled={!site || !boards.length} onClick={() => onCreate(boardFilter || boards[0]?.id || "")}>＋ 새 게시글</button></div>
    </section>
    {site && !boards.length && <div className={styles.contextNotice}>ⓘ 등록된 게시판이 없습니다. 메뉴 관리에서 중메뉴를 <strong>게시판 용도</strong>로 설정해 주세요.</div>}
    <section className={styles.panel}><div className={styles.toolbar}><div className={styles.search}>⌕<input placeholder="제목 또는 작성자 검색" /></div><div><strong>{boardFilter ? boards.find((board) => board.id === boardFilter)?.name : "전체 게시판"}</strong><span>{visiblePosts.length}개 게시글</span></div></div><div className={styles.table}><div className={`${styles.tableHeader} ${styles.postCols}`}><span>ID</span><span>제목</span><span>게시판</span><span>작성자</span><span>상태</span><span>등록일</span><span /></div>{visiblePosts.map(post => <div className={`${styles.tableRow} ${styles.postCols}`} key={post.id}><span>{post.id}</span><span><strong>{post.title}</strong>{post.attachments > 0 && <small> 📎 {post.attachments}</small>}</span><span>{post.board}</span><span>{post.author}</span><span><Badge status={post.status} /></span><span>{post.date}</span><span><button onClick={() => onDelete(post.id)}>×</button></span></div>)}</div></section>
  </>;
}

type DbTable = { table: string; description: string; rows: number; status: string };

function Database() {
  const [tables, setTables] = useState<DbTable[]>([]);
  const [error, setError] = useState("");

  const loadTables = useCallback(() => {
    api<{ tables: DbTable[] }>("/sw_006/api/database")
      .then((result) => { setTables(result.tables); setError(""); })
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  useEffect(() => { loadTables(); }, [loadTables]);

  return <><PageHead eyebrow="DB-001 · CRUD-001" title="PostgreSQL DB 관리" description="SW_006 데이터 테이블과 실제 행 수를 확인합니다." /><div className={styles.dbSummary}><article><b>◉</b><div><span>Database</span><strong>{error ? "Error" : "Connected"}</strong></div></article><article><b>▦</b><div><span>Tables</span><strong>{tables.length}</strong></div></article><article><b>◇</b><div><span>Total Rows</span><strong>{tables.reduce((sum, table) => sum + table.rows, 0)}</strong></div></article><article><b>◎</b><div><span>Source</span><strong>Supabase</strong></div></article></div><section className={styles.panel}><div className={styles.panelHead}><div><h2>테이블 상태</h2><p>{error || "DATABASE_URL로 조회한 실시간 데이터"}</p></div><button onClick={loadTables}>새로고침</button></div><div className={styles.table}><div className={styles.tableHeader}><span>테이블</span><span>용도</span><span>Rows</span><span>연결</span><span>상태</span><span /></div>{tables.map(table => <div className={styles.tableRow} key={table.table}><span><strong>{table.table}</strong></span><span>{table.description}</span><span>{table.rows}</span><span><Badge status="ON" /></span><span><Badge status={table.status} /></span><span>→</span></div>)}</div></section></>;
}


function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) { return <div className={styles.modalBackdrop} onMouseDown={onClose}><section className={styles.modal} onMouseDown={(event) => event.stopPropagation()}><header><div><h2>{title}</h2><p>{subtitle}</p></div><button onClick={onClose}>×</button></header>{children}</section></div> }
