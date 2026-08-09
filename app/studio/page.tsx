import Link from "next/link";

const sections = [
  ["Constitution", "모든 제품과 디자인 판단의 최상위 원칙·조항·검토·운영 기준", "/studio/constitution"],
  ["Design Book", "공통 철학과 Experience·UI/UX·AI UX·접근성 원칙", "/studio/design-book"],
  ["Design Language", "색·타입·형태·모션·레이아웃·AI·피드백의 공통 문법", "/studio/design-language"],
  ["Foundations", "Token과 Theme의 공통 기반", "/studio/foundations"],
  ["Visual Boards", "Design Language를 시각적으로 비교·검토하는 보드", "/studio/visual-boards"],
  ["Design System", "색상, 타이포그래피, 간격, 컴포넌트, 모션 초안", "/studio/design-system"],
  ["Templates", "Mobile·Dashboard·Admin·AI Workspace의 페이지 구조", "/studio/templates"],
  ["Quality", "접근성·Checklist·Release Gate 검토", "/studio/quality"],
  ["Documentation", "사용·적용·Migration·기여·Versioning 가이드", "/studio/docs"],
  ["Projects", "프로젝트별 흐름과 화면 명세", "/studio/projects"],
];

export const metadata = { title: "Studio", description: "NexDataForge Design Studio" };

export default function StudioPage() {
  return <main className="studio-page"><div className="studio-shell">
    <Link className="studio-back" href="/">← NexDataForge</Link>
    <p className="studio-eyebrow">NEXDATAFORGE / DESIGN STUDIO V1.0</p>
    <h1>사용자가 무엇을 보고,<br />이해하고, 행동할지 먼저 설계합니다.</h1>
    <p className="studio-lede">Studio는 기능 구현을 대체하지 않습니다. 모든 서비스의 경험 설계와 디자인 판단을 한곳에서 정리하는 작업 공간입니다.</p>
    <div className="studio-grid">{sections.map(([title, description, href], index) => <Link className="studio-card" href={href} key={title}><span className="studio-card-index">{String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{description}</p><span className="studio-card-arrow">열어보기 →</span></Link>)}</div>
    <section className="studio-featured"><div><p className="studio-eyebrow">FIRST PROJECT</p><h2>bidme</h2><p>SEARCH에서 REQUEST로 이어지는 요청·제안·예약 경험을 Studio 원칙으로 설계합니다.</p></div><Link className="studio-button" href="/studio/projects/bidme">Bidme Design Book 보기</Link></section>
    <p className="studio-note">현재 단계: 문서 기반 v1.0 초안 · 기존 SW_007, API, DB, 인증은 보호됩니다.</p>
  </div></main>;
}
