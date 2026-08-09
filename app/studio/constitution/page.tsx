import Link from "next/link";
import { ArticleBlock, ConstitutionLayout, ConstitutionSection, RouteLinks } from "./_components/ConstitutionUI";
import { articles, principles, projects } from "./_components/constitution-data";

export const metadata = { title: "Design Constitution | NexDataForge", description: "NexDataForge 제품 경험의 최상위 디자인 판단 기준" };

export default function ConstitutionOverviewPage() {
  return <ConstitutionLayout active="Overview" eyebrow="NEXDATAFORGE / DESIGN CONSTITUTION V1.0" title="NexDataForge Design Constitution" summary="모든 NexDataForge 제품이 같은 철학으로 명확하고 신뢰할 수 있으며 유지보수 가능한 경험을 제공하기 위한 최상위 디자인 원칙입니다." aside={<><strong>Decision chain</strong><ol><li>Constitution</li><li>Principle</li><li>Article</li><li>Design Rule</li><li>Review Question</li><li>Quality Evidence</li></ol></>}>
    <section className="constitution-purpose" aria-labelledby="purpose-title"><span className="constitution-kicker">PURPOSE</span><h2 id="purpose-title">디자인 취향이 아니라 제품 판단의 기준</h2><p>화면이 이해되는지, AI를 검토할 수 있는지, 모바일과 접근성을 보호하는지, 새 Component가 필요한지를 같은 질문으로 판단합니다.</p><div className="constitution-question-list">{["중요한 정보가 먼저 보이는가?", "사용자가 결과를 검토하고 통제할 수 있는가?", "기존 시스템을 확장해 해결할 수 있는가?", "실패 후 복구 경로가 있는가?"].map((item) => <span key={item}>{item}</span>)}</div></section>

    <ConstitutionSection kicker="CORE PHILOSOPHY" title="열 가지 철학, 하나의 제품 언어" intro="철학은 슬로건이 아니라 화면 구조와 실행 흐름을 결정합니다."><div className="philosophy-map">{principles.map((item, index) => <Link href="/studio/constitution/principles" key={item.name}><b>{String(index + 1).padStart(2, "0")}</b><strong>{item.name}</strong><span>{item.definition}</span></Link>)}</div></ConstitutionSection>

    <ConstitutionSection kicker="15 ARTICLES" title="모든 검토가 돌아오는 핵심 조항" intro="각 조항은 Rule, Review Question, Evidence로 이어집니다."><div className="article-overview-list">{articles.map((article) => <ArticleBlock article={article} compact key={article.number} />)}</div><Link className="constitution-primary-link" href="/studio/constitution/articles">15개 조항 전체 보기 →</Link></ConstitutionSection>

    <ConstitutionSection kicker="PROJECT APPLICATION" title="프로젝트가 달라도 같은 철학으로 판단합니다"><div className="project-application-grid">{projects.map(([name, focus, application]) => <article key={name}><h3>{name}</h3><strong>{focus}</strong><p>{application}</p></article>)}</div></ConstitutionSection>

    <ConstitutionSection kicker="REVIEW & GOVERNANCE" title="원칙을 Evidence와 운영 규칙으로 연결합니다"><div className="constitution-split-links"><Link href="/studio/constitution/review"><strong>Design Review Framework</strong><span>Pass · Needs Review · Fail · Not Applicable</span></Link><Link href="/studio/constitution/governance"><strong>Component & Token Governance</strong><span>신규 항목, 예외, Lifecycle과 책임</span></Link></div></ConstitutionSection>

    <ConstitutionSection kicker="RELATED DOCUMENTATION" title="기존 문서를 대체하지 않고 상위에서 연결합니다"><RouteLinks /></ConstitutionSection>
  </ConstitutionLayout>;
}
