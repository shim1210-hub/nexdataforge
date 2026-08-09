import Link from "next/link";

const languages = ["Color", "Typography", "Spacing", "Shape", "Elevation", "Motion", "Icon", "Layout", "Card", "Button", "Form", "Navigation", "AI", "Feedback"];

export default function DesignLanguagePage() {
  return <main className="studio-page"><div className="studio-shell">
    <Link href="/studio">← Studio</Link>
    <p className="studio-eyebrow">DESIGN LANGUAGE</p>
    <h1>의미를 일관되게<br />전달하는 공통 문법</h1>
    <p className="studio-lede">색상과 컴포넌트의 목록을 넘어, 사용자가 무엇을 보고 어떻게 행동해야 하는지를 정의합니다.</p>
    <div className="studio-language-grid">{languages.map((language, index) => <div className="studio-language-item" key={language}><span>0{index + 1}</span><strong>{language}</strong><p>목적과 사용 맥락을 먼저 정합니다.</p></div>)}</div>
    <p className="studio-note">공통 언어 → Design System 구현 → Project Design Book 적용 → Design Review 검증</p>
  </div></main>;
}
