import Link from "next/link";
import { ComplianceSubnav, ConstitutionLayout, ConstitutionSection } from "../../_components/ConstitutionUI";
import { ComplianceStatusBadge } from "../_components/ComplianceUI";
import { studioAreas } from "../_components/compliance-data";

export const metadata = { title: "Studio Compliance Matrix | Design Constitution" };

const focusedAudits = [
  ["Foundations", "Semantic Token · contrast · status text · Theme · High Contrast · motion", "Partial", "Reduced Motion와 실제 contrast 측정 Evidence 필요"],
  ["Components", "Purpose · variants · states · loading · disabled · error · touch · name · mobile", "Needs Review", "Visual Board와 PriceGo 공통 UI 상태 전수 비교 필요"],
  ["Patterns", "Initial · Loading · Empty · Error · Success · Retry", "Partial", "AI·Search·Auth·Workflow별 Recovery Evidence 불균일"],
  ["Templates", "목적 · Primary Action · hierarchy · Navigation · responsive · sample · danger", "Needs Review", "Preview 기능은 실행 준수 Not Applicable, 시각 Evidence 추가 필요"],
  ["Quality / Documentation", "Constitution 충돌 · Governance · Lifecycle · Exception 연결", "Partial", "기존 Release Gate에 Compliance 단계 직접 연결 필요"],
] as const;

export default function StudioCompliancePage() {
  return <ConstitutionLayout active="Compliance" eyebrow="COMPLIANCE / STUDIO" title="Studio Compliance Matrix" summary="Studio 각 영역에 적용되는 Constitution Article, 확인된 Evidence와 아직 검토되지 않은 Gap을 함께 표시합니다." aside={<><strong>Evidence boundary</strong><p>Route 존재와 Build 성공은 기능 준수 전체를 의미하지 않습니다. Preview 전용 기능은 실행 항목을 Not Applicable로 다룹니다.</p></>}>
    <ComplianceSubnav active="Studio" />
    <ConstitutionSection title="Area matrix"><div className="studio-compliance-matrix" role="table" aria-label="Studio compliance matrix"><div className="studio-compliance-row head" role="row"><strong role="columnheader">Area</strong><strong role="columnheader">Route</strong><strong role="columnheader">Articles</strong><strong role="columnheader">Status</strong><strong role="columnheader">Evidence / gap</strong></div>{studioAreas.map(([area, route, article, status, evidence, gap]) => <div className="studio-compliance-row" role="row" key={area}><strong role="cell">{area}</strong><Link role="cell" href={route}>{route}</Link><span role="cell">{article}</span><span role="cell"><ComplianceStatusBadge status={status} /></span><span role="cell"><b>Evidence</b>{evidence}<b>Known gap</b>{gap}</span></div>)}</div></ConstitutionSection>
    <ConstitutionSection title="Focused audits"><div className="focused-audit-list">{focusedAudits.map(([area, scope, status, gap]) => <article key={area}><header><h3>{area}</h3><ComplianceStatusBadge status={status} /></header><p>{scope}</p><strong>Known gap</strong><span>{gap}</span></article>)}</div></ConstitutionSection>
  </ConstitutionLayout>;
}
