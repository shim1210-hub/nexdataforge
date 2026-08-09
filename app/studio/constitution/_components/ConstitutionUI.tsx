import Link from "next/link";
import type { Article, Principle } from "./constitution-data";

const nav = [
  ["Overview", "/studio/constitution"],
  ["Principles", "/studio/constitution/principles"],
  ["Articles", "/studio/constitution/articles"],
  ["Review", "/studio/constitution/review"],
  ["Governance", "/studio/constitution/governance"],
  ["Compliance", "/studio/constitution/compliance"],
];

export function ConstitutionLayout({ active, eyebrow, title, summary, children, aside }: { active: string; eyebrow: string; title: string; summary: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return <main className="constitution-page"><div className="constitution-shell">
    <Link className="constitution-back" href="/studio">← Design Studio</Link>
    <header className="constitution-header"><span>{eyebrow}</span><h1>{title}</h1><p>{summary}</p></header>
    <nav className="constitution-nav" aria-label="Design Constitution">{nav.map(([label, href]) => <Link aria-current={active === label ? "page" : undefined} href={href} key={label}>{label}</Link>)}</nav>
    <div className={aside ? "constitution-layout has-aside" : "constitution-layout"}><article className="constitution-content">{children}</article>{aside && <aside className="constitution-aside" aria-label="Related constitution information">{aside}</aside>}</div>
  </div></main>;
}

export function ConstitutionSection({ kicker, title, intro, children }: { kicker?: string; title: string; intro?: string; children: React.ReactNode }) {
  return <section className="constitution-section">{kicker && <span className="constitution-kicker">{kicker}</span>}<h2>{title}</h2>{intro && <p className="constitution-intro">{intro}</p>}{children}</section>;
}

export function PrincipleBlock({ principle, index }: { principle: Principle; index: number }) {
  return <section className="principle-block"><div className="principle-index">{String(index + 1).padStart(2, "0")}</div><div><span className="constitution-kicker">CORE PHILOSOPHY</span><h2>{principle.name}</h2><p className="principle-definition">{principle.definition}</p><p>{principle.meaning}</p><ul>{principle.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul><div className="constitution-example-grid"><div><strong>Good</strong><p>{principle.good}</p></div><div><strong>Do not</strong><p>{principle.bad}</p></div></div><blockquote>{principle.question}</blockquote><small>Related · {principle.related}</small></div></section>;
}

export function ArticleBlock({ article, compact = false }: { article: Article; compact?: boolean }) {
  return <article className={compact ? "article-block compact" : "article-block"}><div className="article-number">제{article.number}조</div><div><h2>{article.title}</h2><p className="article-rule">{article.rule}</p>{!compact && <><h3>Why it matters</h3><p>{article.why}</p><div className="constitution-example-grid"><div><strong>Good</strong><p>{article.good}</p></div><div><strong>Do not</strong><p>{article.bad}</p></div></div><h3>Review questions</h3><ul>{article.questions.map((question) => <li key={question}>{question}</li>)}</ul><small>Related · {article.related}</small></>}</div></article>;
}

export function RouteLinks() {
  const links = [["Design Principles", "/studio/docs/design-principles"], ["Usage", "/studio/docs/usage"], ["Adoption", "/studio/docs/adoption"], ["Migration", "/studio/docs/migration"], ["Contributing", "/studio/docs/contributing"], ["Versioning", "/studio/docs/versioning"], ["Release Gate", "/studio/quality/release-gate"]];
  return <div className="constitution-route-links">{links.map(([label, href]) => <Link href={href} key={href}>{label}<span>→</span></Link>)}</div>;
}

export function ComplianceSubnav({ active }: { active: string }) {
  const links = [["Overview", "/studio/constitution/compliance"], ["Studio", "/studio/constitution/compliance/studio"], ["PriceGo", "/studio/constitution/compliance/pricego"], ["Mobile", "/studio/constitution/compliance/mobile"]];
  return <nav className="compliance-subnav" aria-label="Constitution compliance">{links.map(([label, href]) => <Link aria-current={active === label ? "page" : undefined} href={href} key={label}>{label}</Link>)}</nav>;
}
