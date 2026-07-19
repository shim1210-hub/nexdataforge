"use client";

import { FormEvent, useState } from "react";
import styles from "./login.module.css";

export default function LoginScreen() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true); setError("");
    try {
      const response = await fetch("/sw_006/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ loginId: data.get("loginId"), password: data.get("password") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "로그인하지 못했습니다.");
      window.location.replace("/sw_006");
    } catch (loginError) { setError(loginError instanceof Error ? loginError.message : "로그인 중 오류가 발생했습니다."); }
    finally { setLoading(false); }
  }
  return <main className={styles.page}><section className={styles.card}><span>AI WEBSITE FACTORY</span><h1>관리자 로그인</h1><p>등록된 사용자 아이디와 비밀번호를 입력하세요.</p><form onSubmit={login}><label>사용자 아이디<input autoFocus required name="loginId" autoComplete="username" /></label><label>비밀번호<input required type="password" name="password" autoComplete="current-password" /></label>{error && <strong>{error}</strong>}<button disabled={loading}>{loading ? "로그인 중..." : "로그인"}</button></form></section></main>;
}
