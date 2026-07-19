"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./submenu-pages.module.css";

type Site = { slug: string; name: string };
type PageItem = {
  menuId: string;
  parentId: string;
  parentName: string;
  menuName: string;
  menuSlug: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
};
type Edit = { title: string; subtitle: string; body: string; imageUrl: string };

const emptyEdit: Edit = { title: "", subtitle: "", body: "", imageUrl: "" };

export default function SubmenuPageManager({ sites, selectedSite, onSiteChange, notify }: {
  sites: Site[];
  selectedSite: string;
  onSiteChange: (siteSlug: string) => void;
  notify: (message: string) => void;
}) {
  const siteSlug = selectedSite || sites[0]?.slug || "";
  const [items, setItems] = useState<PageItem[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [edit, setEdit] = useState<Edit>(emptyEdit);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const selected = items.find((item) => item.menuId === selectedMenuId) ?? null;
  const grouped = useMemo(() => {
    const groups = new Map<string, { parentName: string; items: PageItem[] }>();
    items.forEach((item) => {
      const group = groups.get(item.parentId) ?? { parentName: item.parentName, items: [] };
      group.items.push(item);
      groups.set(item.parentId, group);
    });
    return [...groups.entries()];
  }, [items]);

  useEffect(() => {
    if (!siteSlug) return;
    let canceled = false;
    queueMicrotask(() => {
      if (!canceled) {
        setLoading(true);
        setMessage("");
      }
    });
    fetch(`/sw_006/api/submenu-pages?siteSlug=${encodeURIComponent(siteSlug)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "메뉴 화면 정보를 불러오지 못했습니다.");
        if (!canceled) {
          const nextItems: PageItem[] = data.pages ?? [];
          setItems(nextItems);
          setSelectedMenuId((current) => nextItems.some((item) => item.menuId === current) ? current : (nextItems[0]?.menuId ?? ""));
        }
      })
      .catch((error) => !canceled && setMessage(error.message))
      .finally(() => !canceled && setLoading(false));
    return () => { canceled = true; };
  }, [siteSlug]);

  useEffect(() => {
    const next = selected ? {
      title: selected.title ?? selected.menuName,
      subtitle: selected.subtitle ?? "",
      body: selected.body ?? "",
      imageUrl: selected.imageUrl ?? "",
    } : emptyEdit;
    queueMicrotask(() => setEdit(next));
  }, [selected]);

  async function save() {
    if (!siteSlug || !selectedMenuId) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/sw_006/api/submenu-pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug, menuId: selectedMenuId, ...edit }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "저장하지 못했습니다.");
      setItems((current) => current.map((item) => item.menuId === selectedMenuId ? { ...item, ...edit } : item));
      setMessage("저장되었습니다. 실제 사이트에 바로 반영됩니다.");
      notify("메뉴 화면이 저장되어 실제 사이트에 반영되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage(file: File) {
    if (!siteSlug) return;
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("siteSlug", siteSlug);
      formData.append("file", file);
      const response = await fetch("/sw_006/api/submenu-images", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "이미지를 업로드하지 못했습니다.");
      setEdit((current) => ({ ...current, imageUrl: data.imageUrl }));
      setMessage(`이미지가 ${data.physicalPath}에 업로드되었습니다. 화면 저장을 눌러 반영해 주세요.`);
      notify("대표 이미지가 사이트 폴더에 업로드되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }

  if (sites.length === 0) return <section className={styles.empty}>먼저 사이트 관리에서 사이트를 생성해 주세요.</section>;

  return (
    <section className={styles.page}>
      <header className={styles.topbar}>
        <div><span className={styles.eyebrow}>MENU CONTENT</span><h2>메뉴 화면 관리</h2><p>사이트와 대메뉴를 확인하고 각 중메뉴의 실제 화면 내용을 관리합니다.</p></div>
        <label className={styles.siteSelect}><span>대상 사이트</span><select value={siteSlug} onChange={(event) => onSiteChange(event.target.value)}>{sites.map((site) => <option key={site.slug} value={site.slug}>{site.name}</option>)}</select></label>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.menuPanel}>
          <div className={styles.panelTitle}><strong>대메뉴별 중메뉴</strong><span>{items.length}개</span></div>
          {grouped.length === 0 ? <p className={styles.guide}>선택한 사이트에 등록된 중메뉴가 없습니다.</p> : grouped.map(([parentId, group]) => (
            <div key={parentId} className={styles.menuGroup}>
              <div className={styles.parentLabel}><span>대메뉴</span><strong>{group.parentName}</strong></div>
              <div className={styles.childList}>{group.items.map((item) => (
                <button key={item.menuId} type="button" className={item.menuId === selectedMenuId ? styles.activeChild : ""} onClick={() => setSelectedMenuId(item.menuId)}>
                  <span>{item.menuName}</span><small>{item.title ? "저장됨" : "미작성"}</small>
                </button>
              ))}</div>
            </div>
          ))}
        </aside>

        <main className={styles.editorPanel}>
          {!selected ? <div className={styles.editorEmpty}>{loading ? "불러오는 중..." : "편집할 중메뉴를 선택해 주세요."}</div> : (
            <>
              <div className={styles.editorHeader}>
                <div><span>{selected.parentName} / {selected.menuName}</span><h3>{selected.menuName} 화면 편집</h3></div>
                <button type="button" onClick={save} disabled={loading}>{loading ? "저장 중..." : "화면 저장"}</button>
              </div>
              {message && <p className={styles.message}>{message}</p>}
              <div className={styles.formGrid}>
                <label><span>화면 제목</span><input value={edit.title} onChange={(event) => setEdit({ ...edit, title: event.target.value })} /></label>
                <label><span>부제목</span><input value={edit.subtitle} onChange={(event) => setEdit({ ...edit, subtitle: event.target.value })} /></label>
                <label className={styles.full}><span>본문 내용</span><textarea rows={12} value={edit.body} onChange={(event) => setEdit({ ...edit, body: event.target.value })} /></label>
                <div className={`${styles.full} ${styles.imageField}`}>
                  <span>대표 이미지 URL</span>
                  <div>
                    <input placeholder="https://... 또는 /sw_006/사이트명/images/..." value={edit.imageUrl} onChange={(event) => setEdit({ ...edit, imageUrl: event.target.value })} />
                    <label className={styles.fileButton}>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={uploading} onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadImage(file);
                        event.target.value = "";
                      }} />
                      {uploading ? "업로드 중..." : "파일 찾기"}
                    </label>
                  </div>
                  <small>선택한 이미지는 app/sw_006/{siteSlug}/images/ 폴더에 저장됩니다.</small>
                </div>
                {edit.imageUrl && <div className={styles.full} role="img" aria-label="대표 이미지 미리보기" style={{ minHeight: 260, borderRadius: 18, background: `center / cover no-repeat url(${edit.imageUrl})` }} />}
              </div>
            </>
          )}
        </main>
      </div>
    </section>
  );
}
