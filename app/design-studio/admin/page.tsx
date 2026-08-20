"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./admin.module.css";

type Category = {
  id: number;
  name: string;
  slug: string;
  imagePath: string;
  sortOrder: number;
  active: boolean;
};

type Subcategory = Category & { category: string };

const initialCategories: Category[] = [
  { id: 1, name: "TEXTILE", slug: "textile", imagePath: "/design-studio/styles/textile/category.webp", sortOrder: 1, active: true },
  { id: 2, name: "ILLUSTRATION", slug: "illustration", imagePath: "/design-studio/styles/illustration/category.webp", sortOrder: 2, active: true },
  { id: 3, name: "PHOTOGRAPHY", slug: "photography", imagePath: "/design-studio/styles/photography/category.webp", sortOrder: 3, active: false },
];

const initialSubcategories: Subcategory[] = [
  { id: 1, category: "TEXTILE", name: "Woven", slug: "woven", imagePath: "/design-studio/styles/textile/woven.webp", sortOrder: 1, active: true },
  { id: 2, category: "TEXTILE", name: "Embroidery", slug: "embroidery", imagePath: "/design-studio/styles/textile/embroidery.webp", sortOrder: 2, active: true },
  { id: 3, category: "ILLUSTRATION", name: "Watercolor", slug: "watercolor", imagePath: "/design-studio/styles/illustration/watercolor.webp", sortOrder: 1, active: true },
];

const emptyCategory = { name: "", slug: "", imagePath: "", sortOrder: "1", active: true };
const emptySubcategory = { category: "TEXTILE", name: "", slug: "", imagePath: "", sortOrder: "1", active: true };

export default function DesignStudioAdminPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [subcategories, setSubcategories] = useState(initialSubcategories);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [subcategoryForm, setSubcategoryForm] = useState(emptySubcategory);
  const [notice, setNotice] = useState("");

  const activeCategoryCount = useMemo(() => categories.filter((item) => item.active).length, [categories]);
  const activeSubcategoryCount = useMemo(() => subcategories.filter((item) => item.active).length, [subcategories]);

  function addCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) return;
    setCategories((current) => [...current, { ...categoryForm, id: Date.now(), sortOrder: Number(categoryForm.sortOrder) || 1 }]);
    setCategoryForm(emptyCategory);
    setNotice("대분류를 임시 목록에 등록했습니다.");
  }

  function addSubcategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subcategoryForm.name.trim() || !subcategoryForm.slug.trim()) return;
    setSubcategories((current) => [...current, { ...subcategoryForm, id: Date.now(), sortOrder: Number(subcategoryForm.sortOrder) || 1 }]);
    setSubcategoryForm(emptySubcategory);
    setNotice("중분류를 임시 목록에 등록했습니다.");
  }

  return <main className={styles.adminPage}>
    <header className={styles.adminHeader}><div className={styles.headerInner}><Link href="/design-studio" className={styles.brand}><span className={styles.logo}>N</span><span><b>NexDataForge</b><small>DESIGN STUDIO ADMIN</small></span></Link><div className={styles.headerMeta}><span className={styles.statusDot} />UI preview mode <span className={styles.adminBadge}>ADMIN V1</span></div></div></header>
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}><div><p className={styles.eyebrow}>DESIGN STUDIO</p><h1>Admin Console</h1><p className={styles.sidebarCopy}>스타일 라이브러리의 구조와 표시 경로를 관리합니다.</p></div><nav><a className={styles.navActive}>▦　Catalog</a><span>◇　Categories</span><span>◇　Subcategories</span><span className={styles.navDisabled}>▤　Styles <small>준비 중</small></span><span className={styles.navDisabled}>▣　Assets <small>준비 중</small></span></nav><Link href="/design-studio" className={styles.backLink}>← Design Studio로 돌아가기</Link></aside>
      <section className={styles.content}>
        <div className={styles.pageHeading}><div><p className={styles.eyebrow}>ADMIN / CATALOG</p><h2>Category &amp; Subcategory</h2><p>대분류와 중분류의 기본 정보, 정렬, 활성 상태, 이미지 경로를 관리합니다.</p></div><span className={styles.mockBadge}>LOCAL MOCK DATA</span></div>
        {notice && <div className={styles.notice} role="status">✓ {notice}<button onClick={() => setNotice("")} aria-label="알림 닫기">×</button></div>}
        <div className={styles.metrics}><Metric label="대분류" value={categories.length} detail={`${activeCategoryCount} active`} /><Metric label="중분류" value={subcategories.length} detail={`${activeSubcategoryCount} active`} /><Metric label="Image paths" value={categories.length + subcategories.length} detail="Preview references" /><Metric label="Storage" value="UI" detail="Not connected" /></div>
        <div className={styles.formGrid}><CategoryForm value={categoryForm} onChange={setCategoryForm} onSubmit={addCategory} /><SubcategoryForm value={subcategoryForm} categories={categories} onChange={setSubcategoryForm} onSubmit={addSubcategory} /></div>
        <section className={styles.listSection}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>REGISTERED ITEMS</p><h3>대분류 목록</h3></div><span>{categories.length} items</span></div><div className={styles.tableWrap}><table><thead><tr><th>이름</th><th>Slug</th><th>Preview</th><th>image_path</th><th>순서</th><th>상태</th></tr></thead><tbody>{categories.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td><code>{item.slug}</code></td><td><PathPreview path={item.imagePath} /></td><td><code className={styles.path}>{item.imagePath}</code></td><td>{item.sortOrder}</td><td><Status active={item.active} /></td></tr>)}</tbody></table></div></section>
        <section className={styles.listSection}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>REGISTERED ITEMS</p><h3>중분류 목록</h3></div><span>{subcategories.length} items</span></div><div className={styles.tableWrap}><table><thead><tr><th>대분류</th><th>이름</th><th>Slug</th><th>Preview</th><th>image_path</th><th>순서</th><th>상태</th></tr></thead><tbody>{subcategories.map((item) => <tr key={item.id}><td><span className={styles.categoryTag}>{item.category}</span></td><td><strong>{item.name}</strong></td><td><code>{item.slug}</code></td><td><PathPreview path={item.imagePath} /></td><td><code className={styles.path}>{item.imagePath}</code></td><td>{item.sortOrder}</td><td><Status active={item.active} /></td></tr>)}</tbody></table></div></section>
        <p className={styles.footerNote}>현재 데이터는 화면 검증용 local/mock data입니다. 등록 내용은 새로고침하면 초기화됩니다.</p>
      </section>
    </div>
  </main>;
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) { return <article className={styles.metric}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
function Status({ active }: { active: boolean }) { return <span className={active ? styles.statusActive : styles.statusInactive}>{active ? "ON" : "OFF"}</span>; }
function PathPreview({ path }: { path: string }) { const [failed, setFailed] = useState(false); return <div className={styles.preview}>{path && !failed ? <img src={path} alt="" onError={() => setFailed(true)} /> : <span>이미지를 찾을 수 없음</span>}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className={styles.field}><span>{label}</span>{children}</label>; }
function CategoryForm({ value, onChange, onSubmit }: { value: typeof emptyCategory; onChange: (value: typeof emptyCategory) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) { return <form className={styles.formCard} onSubmit={onSubmit}><div className={styles.formHeader}><div><span className={styles.formNumber}>01</span><div><p className={styles.eyebrow}>CATEGORY</p><h3>대분류 등록</h3></div></div><span className={styles.required}>필수 항목 *</span></div><div className={styles.fields}><Field label="대분류명 *"><input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} placeholder="예: TEXTILE" required /></Field><Field label="영문명 또는 Slug *"><input value={value.slug} onChange={(event) => onChange({ ...value, slug: event.target.value })} placeholder="예: textile" required /></Field><Field label="대표 이미지 경로"><input value={value.imagePath} onChange={(event) => onChange({ ...value, imagePath: event.target.value })} placeholder="/design-studio/styles/..." /></Field><PreviewField path={value.imagePath} /><div className={styles.fieldRow}><Field label="정렬 순서"><input type="number" min="1" value={value.sortOrder} onChange={(event) => onChange({ ...value, sortOrder: event.target.value })} /></Field><Toggle label="활성 여부" checked={value.active} onChange={(active) => onChange({ ...value, active })} /></div></div><button className={styles.primaryButton} type="submit">＋ 대분류 등록</button></form>; }
function SubcategoryForm({ value, categories, onChange, onSubmit }: { value: typeof emptySubcategory; categories: Category[]; onChange: (value: typeof emptySubcategory) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) { return <form className={styles.formCard} onSubmit={onSubmit}><div className={styles.formHeader}><div><span className={styles.formNumber}>02</span><div><p className={styles.eyebrow}>SUBCATEGORY</p><h3>중분류 등록</h3></div></div><span className={styles.required}>필수 항목 *</span></div><div className={styles.fields}><Field label="상위 대분류 *"><select value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value })}>{categories.map((category) => <option key={category.id}>{category.name}</option>)}</select></Field><Field label="중분류명 *"><input value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} placeholder="예: Woven" required /></Field><Field label="영문명 또는 Slug *"><input value={value.slug} onChange={(event) => onChange({ ...value, slug: event.target.value })} placeholder="예: woven" required /></Field><Field label="대표 이미지 경로"><input value={value.imagePath} onChange={(event) => onChange({ ...value, imagePath: event.target.value })} placeholder="/design-studio/styles/..." /></Field><PreviewField path={value.imagePath} /><div className={styles.fieldRow}><Field label="정렬 순서"><input type="number" min="1" value={value.sortOrder} onChange={(event) => onChange({ ...value, sortOrder: event.target.value })} /></Field><Toggle label="활성 여부" checked={value.active} onChange={(active) => onChange({ ...value, active })} /></div></div><button className={styles.secondaryButton} type="submit">＋ 중분류 등록</button></form>; }
function PreviewField({ path }: { path: string }) { return <div className={styles.previewField}><span>IMAGE PREVIEW</span><PathPreview path={path} /></div>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className={styles.toggleField}><span>{label}</span><button type="button" className={checked ? styles.toggleOn : styles.toggleOff} onClick={() => onChange(!checked)} aria-pressed={checked}><i /></button><small>{checked ? "ON" : "OFF"}</small></label>; }
