import { BoardFrame } from "../_components/BoardFrame";

const samples = [["Display", "NexDataForge Design Studio", "48px / 700"], ["Heading 1", "필요한 것을 말해주세요", "32px / 700"], ["Title", "3개의 제안이 도착했습니다", "20px / 700"], ["Body", "AI가 요청 내용을 정리했습니다.", "16px / 400"], ["Label", "예약 가능 시간", "13px / 700"], ["Numeric", "125,000원  ·  4.9  ·  02:35", "22px / 700"]];

export default function TypographyBoard() { return <BoardFrame title="Typography Board" version="Foundation v1.0" status="Visual Preview: Available" scope="B5 · Global"><p>타입 계층은 사용자가 먼저 읽고 결정해야 할 순서를 만든다. 한국어 가독성, 모바일 줄바꿈, 숫자 비교 가능성을 우선한다.</p><div className="type-samples">{samples.map(([role, text, spec]) => <div key={role}><span>{role}</span><p className={`type-${role.toLowerCase().replace(" ", "-")}`}>{text}</p><small>{spec}</small></div>)}</div></BoardFrame>;
}
