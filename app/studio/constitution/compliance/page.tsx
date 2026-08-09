import Link from "next/link";
import { ComplianceSubnav, ConstitutionLayout, ConstitutionSection } from "../_components/ConstitutionUI";
import { ComplianceGate, ComplianceStatusBadge, PriorityBadge } from "./_components/ComplianceUI";
import { articleAudits, gaps, studioAreas } from "./_components/compliance-data";

export const metadata = { title: "Compliance Audit | Design Constitution", description: "Evidence-based Constitution compliance audit" };

export default function ComplianceOverviewPage() {
  const statusCounts = articleAudits.reduce<Record<string, number>>((counts, item) => ({ ...counts, [item.status]: (counts[item.status] ?? 0) + 1 }), {});
  return <ConstitutionLayout active="Compliance" eyebrow="CONSTITUTION / COMPLIANCE AUDIT V1.0" title="Constitution Compliance Audit" summary="Foundation, Component, Pattern, Template, Quality, Documentation과 PriceGo Pilot을 실제 Evidence와 검증 Gap으로 구분해 검토합니다." aside={<><strong>Audit rule</strong><p>실행 Evidence가 없으면 Pass로 추정하지 않습니다. 코드 검토와 Device Review를 분리합니다.</p><ComplianceStatusBadge status="Not Verified" /></>}>
    <ComplianceSubnav active="Overview" />
    <ConstitutionSection kicker="AUDIT MODEL" title="점수가 아닌 Evidence와 상태로 판단합니다"><div className="compliance-model-grid">{["Pass", "Needs Review", "Needs Device Review", "Partial", "Fail", "Not Applicable", "Not Verified"].map((status) => <div key={status}><ComplianceStatusBadge status={status as Parameters<typeof ComplianceStatusBadge>[0]["status"]} /><p>{({ Pass: "근거로 준수 확인", "Needs Review": "추가 검토 필요", "Needs Device Review": "실기기 근거 필요", Partial: "일부 요구만 충족", Fail: "명확한 충돌", "Not Applicable": "적용 대상 아님", "Not Verified": "검토 근거 없음" } as Record<string, string>)[status]}</p></div>)}</div></ConstitutionSection>
    <ConstitutionSection kicker="ARTICLE COVERAGE" title="15개 조항 감사 현황"><div className="compliance-summary-strip">{Object.entries(statusCounts).map(([status, count]) => <div key={status}><ComplianceStatusBadge status={status as Parameters<typeof ComplianceStatusBadge>[0]["status"]} /><strong>{count} articles</strong></div>)}</div><p className="constitution-intro">개수는 품질 점수가 아니라 현재 Evidence 상태의 분포입니다.</p><Link className="constitution-primary-link" href="/studio/constitution/compliance/pricego">PriceGo Article Mapping 보기 →</Link></ConstitutionSection>
    <ConstitutionSection kicker="STUDIO MATRIX" title="Studio 영역별 준수 근거"><div className="compliance-area-preview">{studioAreas.map(([area, route, article, status, evidence]) => <Link href="/studio/constitution/compliance/studio" key={area}><strong>{area}</strong><span>Articles {article}</span><ComplianceStatusBadge status={status} /><small>{evidence}</small><code>{route}</code></Link>)}</div></ConstitutionSection>
    <ConstitutionSection kicker="REMEDIATION" title="검증 Gap을 우선순위로 관리합니다"><div className="remediation-list">{gaps.map(([priority, gap, status, evidence, action]) => <article key={gap}><header><PriorityBadge priority={priority} /><ComplianceStatusBadge status={status} /></header><h3>{gap}</h3><p>{evidence}</p><strong>Required action</strong><span>{action}</span></article>)}</div></ConstitutionSection>
    <ConstitutionSection kicker="RELEASE GATE" title="Compliance Decision 전에 일곱 단계를 확인합니다"><ComplianceGate /><div className="compliance-decision"><span>Current preview decision</span><strong>Conditionally Compliant · PriceGo</strong><p>코드·문서 Evidence는 존재하지만 실제 기기, 320px, 큰 글씨, 음성·카메라·OCR 실행 검증이 남아 있습니다.</p></div></ConstitutionSection>
  </ConstitutionLayout>;
}
