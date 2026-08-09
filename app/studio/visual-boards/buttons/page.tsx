import { BoardFrame } from "../_components/BoardFrame";

const actions = ["요청 시작하기", "제안 비교하기", "예약 확정하기", "AI로 요청 정리", "다시 시도하기"];
export default function ButtonBoard() { return <BoardFrame title="Button Board" version="Foundation v1.0" status="Visual Preview: Available" scope="B5 · Global"><p>한 화면에는 하나의 Primary action을 둔다. 라벨은 결과가 아니라 사용자가 실행할 행동으로 작성하고, 위험 행동은 명시적으로 표현한다.</p><div className="button-samples">{actions.map((action, index) => <button className={`foundation-button button-${index}`} key={action}>{action}</button>)}<button className="foundation-button" disabled>처리 중…</button></div></BoardFrame>;
}
