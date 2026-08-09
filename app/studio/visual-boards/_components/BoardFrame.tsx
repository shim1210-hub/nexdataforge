import Link from "next/link";

type BoardFrameProps = { title: string; version: string; status: string; scope: string; languageHref?: string; children: React.ReactNode; token?: React.ReactNode; component?: React.ReactNode; bidme?: React.ReactNode; next?: string };

export function BoardFrame({ title, version, status, scope, languageHref = "/studio/design-language", children, token = "Foundation tokens", component = "Related component", bidme = "Bidme preview is next.", next = "Add project-specific examples after review." }: BoardFrameProps) {
  return <main className="foundation-board"><div className="foundation-shell">
    <Link className="foundation-back" href="/studio/visual-boards">← Visual Boards</Link>
    <header className="foundation-header"><div><p className="foundation-kicker">NEXDATAFORGE / VISUAL FOUNDATION</p><h1>{title}</h1></div><div className="foundation-meta"><span>{version}</span><span className="foundation-status">{status}</span><span>{scope}</span><span>Updated 2026-08-05</span></div></header>
    <p className="foundation-language-link">Design Language: <Link href={languageHref}>reference document →</Link></p>
    <section className="foundation-principle"><h2>Principle</h2>{children}</section>
    <div className="foundation-board-grid"><section className="foundation-section"><h2>Visual Samples</h2>{token}</section><section className="foundation-section"><h2>Usage</h2>{component}</section></div>
    <section className="foundation-section"><h2>Good / Avoid</h2><div className="foundation-goodavoid"><div><strong>Good</strong><p>의미와 상태를 분명히 하고, 실제 행동과 연결합니다.</p></div><div><strong>Avoid</strong><p>장식만을 위해 강조하거나 색·크기만으로 상태를 전달하지 않습니다.</p></div></div></section>
    <section className="foundation-section"><h2>Accessibility</h2><p>Keyboard focus, 충분한 대비, semantic HTML, 명확한 label, 44px 터치 영역과 320px 화면을 확인합니다.</p></section>
    <section className="foundation-section"><h2>Project Application · Bidme</h2>{bidme}</section>
    <footer className="foundation-footer"><div><strong>Next improvement</strong><p>{next}</p></div><div><strong>Related token</strong><p>{token}</p></div><div><strong>Related component</strong><p>{component}</p></div></footer>
  </div></main>;
}
