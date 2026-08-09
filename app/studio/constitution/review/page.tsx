import { ConstitutionLayout, ConstitutionSection } from "../_components/ConstitutionUI";
import { reviewAreas } from "../_components/constitution-data";

export const metadata = { title: "Design Review Framework | Design Constitution" };

export default function ReviewPage() {
  return <ConstitutionLayout active="Review" eyebrow="CONSTITUTION / REVIEW" title="Design Review Framework" summary="점수가 아니라 질문, 기대 Evidence, 현재 상태와 관련 조항으로 디자인 품질을 검토합니다." aside={<><strong>Allowed status</strong>{["Pass", "Needs Review", "Fail", "Not Applicable"].map((status) => <span className={`constitution-status ${status.toLowerCase().replaceAll(" ", "-")}`} key={status}>{status}</span>)}</>}>
    <ConstitutionSection title="Review record" intro="Preview의 기본 상태는 Needs Review입니다. 실제 프로젝트 검토에서 Evidence와 Notes를 기록한 뒤 상태를 갱신합니다.">
      <div className="constitution-review-table" role="table" aria-label="Design review framework"><div className="constitution-review-row head" role="row"><strong role="columnheader">Area</strong><strong role="columnheader">Review question</strong><strong role="columnheader">Expected evidence</strong><strong role="columnheader">Status</strong><strong role="columnheader">Article</strong></div>{reviewAreas.map(([area, question, evidence, article]) => <div className="constitution-review-row" role="row" key={area}><strong role="cell">{area}</strong><span role="cell">{question}</span><span role="cell">{evidence}</span><span role="cell"><span className="constitution-status needs-review">Needs Review</span></span><code role="cell">{article}</code></div>)}</div>
    </ConstitutionSection>
    <ConstitutionSection title="Review notes template"><div className="review-note-template"><div><strong>Current status</strong><span>Needs Review</span></div><div><strong>Notes</strong><span>관찰한 사실과 사용자 영향만 기록합니다.</span></div><div><strong>Evidence</strong><span>Route, 캡처, 테스트 결과, 관련 diff</span></div><div><strong>Exception</strong><span>예외가 있다면 승인 상태와 재검토 시점 연결</span></div></div></ConstitutionSection>
  </ConstitutionLayout>;
}
