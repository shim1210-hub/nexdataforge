import { ComplianceSubnav, ConstitutionLayout, ConstitutionSection } from "../../_components/ConstitutionUI";
import { ComplianceStatusBadge, MobileAuditChecklist } from "../_components/ComplianceUI";

export const metadata = { title: "Mobile Compliance Audit | Design Constitution" };

const dimensions = [
  ["320px", "Smallest supported baseline", "Needs Device Review"],
  ["360px", "Common compact Android viewport", "Needs Device Review"],
  ["390px", "Common modern mobile viewport", "Needs Device Review"],
  ["768px", "Tablet and stacked-layout boundary", "Needs Review"],
] as const;

export default function MobileCompliancePage() {
  return <ConstitutionLayout active="Compliance" eyebrow="COMPLIANCE / MOBILE" title="Mobile Compliance Audit" summary="코드 검토, 브라우저 검토와 실제 Device Review를 분리해 320·360·390·768px의 시각 회귀 Evidence를 기록합니다." aside={<><strong>Review levels</strong>{["Code Reviewed", "Browser Reviewed", "Device Reviewed", "Not Reviewed"].map((item) => <span key={item}>{item}</span>)}</>}>
    <ComplianceSubnav active="Mobile" />
    <ConstitutionSection title="Target widths"><div className="mobile-dimension-grid">{dimensions.map(([width, meaning, status]) => <article key={width}><strong>{width}</strong><span>{meaning}</span><ComplianceStatusBadge status={status} /></article>)}</div></ConstitutionSection>
    <ConstitutionSection title="320px Visual Regression Checklist" intro="체크 상태는 현재 브라우저 메모리에만 존재하며 DB나 localStorage에 저장하지 않습니다."><MobileAuditChecklist /></ConstitutionSection>
    <ConstitutionSection title="Required mobile evidence"><div className="mobile-evidence-grid">{["가로 Overflow와 긴 한글", "Button·Header·Touch Target", "Safe Area·Bottom Navigation·Sticky Action", "Large Text·Keyboard·Result Amount", "Dialog·Drawer·Table", "AI Workspace 상태와 검토 Action"].map((item) => <article key={item}><ComplianceStatusBadge status="Not Verified" /><strong>{item}</strong><span>Screenshot 또는 Device Review Notes 필요</span></article>)}</div></ConstitutionSection>
  </ConstitutionLayout>;
}
