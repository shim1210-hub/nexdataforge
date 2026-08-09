import { ConstitutionLayout, PrincipleBlock } from "../_components/ConstitutionUI";
import { principles } from "../_components/constitution-data";

export const metadata = { title: "Core Principles | Design Constitution" };

export default function PrinciplesPage() {
  return <ConstitutionLayout active="Principles" eyebrow="CONSTITUTION / PRINCIPLES" title="Core Design Philosophy" summary="각 철학을 실제 사용자 흐름, 좋은 예와 피해야 할 예, 검토 질문으로 연결합니다." aside={<div className="principle-flow"><strong>AI-assisted decision</strong>{["사용자 요청", "AI 이해", "제안·분석", "근거 확인", "사용자 검토", "명시적 승인", "실행과 결과"].map((step, index) => <span key={step}><b>{index + 1}</b>{step}</span>)}</div>}>
    <div className="principle-list">{principles.map((principle, index) => <PrincipleBlock principle={principle} index={index} key={principle.name} />)}</div>
  </ConstitutionLayout>;
}
