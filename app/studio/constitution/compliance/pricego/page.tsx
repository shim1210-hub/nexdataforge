import { ComplianceSubnav, ConstitutionLayout, ConstitutionSection } from "../../_components/ConstitutionUI";
import { ComplianceStatusBadge, EvidenceCard, PriorityBadge } from "../_components/ComplianceUI";
import { articleAudits, gaps, priceGoScreens, protectedPriceGo } from "../_components/compliance-data";

export const metadata = { title: "PriceGo Compliance Review | Design Constitution" };

export default function PriceGoCompliancePage() {
  return <ConstitutionLayout active="Compliance" eyebrow="COMPLIANCE / PRICEGO" title="PriceGo Pilot Compliance Review" summary="Stage 15-20의 About, Settings, Direct Input, Voice, Scan/OCR Pilot을 Article과 기능 보호 Evidence로 검토합니다." aside={<><strong>Decision</strong><span className="compliance-decision-label">Conditionally Compliant</span><p>Source review completed. Device evidence remains required.</p></>}>
    <ComplianceSubnav active="PriceGo" />
    <ConstitutionSection kicker="SCREEN MAPPING" title="화면별 적용 Article"><div className="pricego-screen-grid">{priceGoScreens.map(([screen, article, status, evidence, gap]) => <article key={screen}><header><h3>{screen}</h3><ComplianceStatusBadge status={status} /></header><code>Articles {article}</code><p><strong>Evidence</strong>{evidence}</p><p><strong>Known gap</strong>{gap}</p></article>)}</div></ConstitutionSection>
    <ConstitutionSection kicker="15 ARTICLES" title="Article별 Compliance Evidence" intro="모든 조항을 같은 Evidence 구조로 기록합니다."><div className="evidence-card-list">{articleAudits.map((record) => <EvidenceCard record={record} key={record.article} />)}</div></ConstitutionSection>
    <ConstitutionSection kicker="FUNCTIONAL PROTECTION" title="Constitution 적용이 핵심 기능을 변경하지 않았는가"><div className="protection-evidence-list">{protectedPriceGo.map(([target, type, evidence]) => <article key={target}><div><strong>{target}</strong><span>{type}</span></div><p>{evidence}</p><ComplianceStatusBadge status="Pass" /></article>)}</div></ConstitutionSection>
    <ConstitutionSection kicker="KNOWN GAPS" title="Fail로 추정하지 않고 필요한 검증을 분리합니다"><div className="remediation-list">{gaps.slice(0, 4).map(([priority, gap, status, evidence, action]) => <article key={gap}><header><PriorityBadge priority={priority} /><ComplianceStatusBadge status={status} /></header><h3>{gap}</h3><p>{evidence}</p><strong>Required action</strong><span>{action}</span></article>)}</div></ConstitutionSection>
  </ConstitutionLayout>;
}
