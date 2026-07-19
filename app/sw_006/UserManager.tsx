"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "./users.module.css";
import actionStyles from "./users-actions.module.css";

type Site = { id: string; slug: string; name: string };
type User = { id: string; loginId: string; displayName: string; email: string; companySlug: string | null; accessLevel: "SUPER_ADMIN" | "SITE_USER"; isActive: boolean };

export default function UserManager({ sites, notify }: { sites: Site[]; notify: (message: string) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null | undefined>(undefined);
  const [accessLevel, setAccessLevel] = useState<"SUPER_ADMIN" | "SITE_USER">("SITE_USER");
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(() => {
    fetch("/sw_006/api/users", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "사용자 목록을 불러오지 못했습니다.");
        setUsers(data.users ?? []);
      })
      .catch((error: Error) => notify(error.message));
  }, [notify]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  function openCreate() {
    setAccessLevel("SITE_USER");
    setEditing(null);
  }

  function openEdit(user: User) {
    setAccessLevel(user.accessLevel);
    setEditing(user);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const payload = {
        id: editing?.id,
        loginId: data.get("loginId"),
        displayName: data.get("displayName"),
        email: data.get("email"),
        companySlug: accessLevel === "SITE_USER" ? data.get("companySlug") : null,
        accessLevel,
        password: data.get("password"),
        passwordConfirmation: data.get("passwordConfirmation"),
      };
      const response = await fetch("/sw_006/api/users", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "사용자를 저장하지 못했습니다.");
      setUsers((current) => editing ? current.map((user) => user.id === result.user.id ? result.user : user) : [result.user, ...current]);
      setEditing(undefined);
      notify(editing ? "사용자 정보가 수정되었습니다." : "신규 사용자가 등록되었습니다.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "사용자 저장 중 오류가 발생했습니다.");
    } finally { setLoading(false); }
  }

  async function deleteUser(user: User) {
    if (!window.confirm(`${user.displayName}(${user.loginId}) 사용자를 삭제할까요?`)) return;
    try {
      const response = await fetch(`/sw_006/api/users?id=${encodeURIComponent(user.id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "사용자를 삭제하지 못했습니다.");
      setUsers((current) => current.filter((item) => item.id !== user.id));
      notify("사용자가 삭제되었습니다.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "사용자 삭제 중 오류가 발생했습니다.");
    }
  }

  return <section className={styles.page}>
    <header className={styles.head}>
      <div><span>USER MANAGEMENT</span><h1>사용자 관리</h1><p>슈퍼관리자와 사이트별 담당 사용자를 등록하고 수정합니다.</p></div>
      <button type="button" onClick={openCreate}>＋ 신규 사용자 추가</button>
    </header>

    <div className={styles.policy}>
      <div><strong>슈퍼관리자</strong><span>모든 사이트와 관리자 기능을 관리합니다.</span></div>
      <div><strong>사이트사용자</strong><span>지정된 담당 사이트만 관리합니다.</span></div>
    </div>

    <section className={styles.list}>
      <header><strong>사용자 리스트</strong><span>총 {users.length}명</span></header>
      <div className={styles.columns}><span>사용자</span><span>아이디</span><span>업체명 / slug</span><span>권한</span><span>메일주소</span><span>관리</span></div>
      {users.length === 0 ? <p className={styles.empty}>등록된 사용자가 없습니다.</p> : users.map((user) => {
        const site = sites.find((item) => item.slug === user.companySlug);
        return <article key={user.id}>
          <span className={styles.user}><i>{user.displayName.slice(0, 1)}</i><strong>{user.displayName}</strong></span>
          <span>{user.loginId}</span>
          <span>{user.accessLevel === "SUPER_ADMIN" ? "전체 업체" : site ? `${site.name} (${site.slug})` : user.companySlug}</span>
          <span><b className={user.accessLevel === "SUPER_ADMIN" ? styles.super : styles.siteUser}>{user.accessLevel === "SUPER_ADMIN" ? "슈퍼관리자" : "사이트사용자"}</b></span>
          <span>{user.email}</span>
          <span className={actionStyles.manage}><button type="button" onClick={() => openEdit(user)}>수정</button><button className={actionStyles.delete} type="button" onClick={() => deleteUser(user)}>삭제</button></span>
        </article>;
      })}
    </section>

    {editing !== undefined && <div className={styles.backdrop} onMouseDown={() => setEditing(undefined)}>
      <section className={styles.modal} onMouseDown={(event) => event.stopPropagation()}>
        <header><div><h2>{editing ? "기존 사용자 수정" : "신규 사용자 추가"}</h2><p>사용자 기본정보와 관리 권한을 입력합니다.</p></div><button type="button" onClick={() => setEditing(undefined)}>×</button></header>
        <form onSubmit={save}>
          <label><span>사용자 아이디 {editing && <small>변경 불가</small>}</span><input required minLength={3} maxLength={100} pattern="[a-z0-9]+" name={editing ? undefined : "loginId"} disabled={Boolean(editing)} defaultValue={editing?.loginId ?? ""} placeholder="예: honggildong01" title="영문 소문자와 숫자만 입력할 수 있습니다." onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toLowerCase().replace(/[^a-z0-9]/g, ""); }} />{editing && <input type="hidden" name="loginId" value={editing.loginId} />}</label>
          <label><span>사용자명</span><input required name="displayName" defaultValue={editing?.displayName ?? ""} placeholder="예: 홍길동" /></label>
          <label className={styles.full}><span>권한</span><select name="accessLevel" value={accessLevel} onChange={(event) => setAccessLevel(event.target.value as "SUPER_ADMIN" | "SITE_USER")}><option value="SUPER_ADMIN">관리자 : 슈퍼관리자</option><option value="SITE_USER">사이트사용자 : 담당 사이트만 관리</option></select></label>
          <label className={styles.full}><span>업체명 slug(영문명)</span><select required={accessLevel === "SITE_USER"} disabled={accessLevel === "SUPER_ADMIN"} name="companySlug" defaultValue={editing?.companySlug ?? ""}><option value="">{accessLevel === "SUPER_ADMIN" ? "전체 업체 관리" : "담당 업체를 선택해 주세요"}</option>{sites.map((site) => <option key={site.id} value={site.slug}>{site.name} ({site.slug})</option>)}</select></label>
          <label className={styles.full}><span>메일주소</span><input required type="email" name="email" defaultValue={editing?.email ?? ""} placeholder="user@company.co.kr" /></label>
          <label><span>비밀번호 {editing && <small>변경할 때만 입력</small>}</span><input required={!editing} type="password" name="password" autoComplete="new-password" placeholder="비밀번호 입력" /></label>
          <label><span>비밀번호 확인</span><input required={!editing} type="password" name="passwordConfirmation" autoComplete="new-password" placeholder="비밀번호를 다시 입력" /></label>
          <div className={styles.actions}><button type="button" onClick={() => setEditing(undefined)}>취소</button><button disabled={loading}>{loading ? "저장 중..." : editing ? "수정 저장" : "사용자 등록"}</button></div>
        </form>
      </section>
    </div>}
  </section>;
}
