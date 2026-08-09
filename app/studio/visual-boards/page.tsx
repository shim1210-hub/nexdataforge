import Link from "next/link";

const boards = [
  ["Color Board", "색의 의미와 대비", "A4", "Foundation v1.0", "/studio/visual-boards/colors"],
  ["Typography Board", "타입 계층과 문장 샘플", "B5", "Foundation v1.0", "/studio/visual-boards/typography"],
  ["Button Board", "행동 우선순위와 상태", "B5", "Foundation v1.0", "/studio/visual-boards/buttons"],
  ["Card Board", "정보 단위와 비교 구조", "A4", "Foundation v1.0", "/studio/visual-boards/cards"],
  ["AI Component Board", "AI 제안·요약·상태", "A4", "Foundation v1.0", "/studio/visual-boards/ai"],
  ["Layout Board", "화면·Safe Area·탐색", "A4", "Foundation v1.0", "/studio/visual-boards/layouts"],
  ["Spacing Board", "여백 scale과 관계", "B5", "Planned", ""],
  ["Motion Board", "상태 변화와 피드백", "A4", "Planned", ""],
  ["Feedback Board", "Loading·Empty·Error·Success", "A4", "Foundation v1.0", "/studio/visual-boards/feedback"],
  ["Action Board", "Buttons, groups, links, and FAB", "A4", "Component v1.0", "/studio/visual-boards/actions"],
  ["Display Board", "Cards, badges, chips, avatars, and lists", "A4", "Component v1.0", "/studio/visual-boards/display"],
  ["Overlay Board", "Dialogs, drawers, sheets, and menus", "A4", "Component v1.0", "/studio/visual-boards/overlays"],
  ["AI Prompt Pattern Board", "Prompt composition, suggestions, and validation", "A4", "AI Pattern v1.0", "/studio/visual-boards/ai-prompts"],
  ["AI Response Pattern Board", "Responses, streaming, sources, and actions", "A4", "AI Pattern v1.0", "/studio/visual-boards/ai-responses"],
  ["AI Status Pattern Board", "Processing, timeline, tools, and recovery", "A4", "AI Pattern v1.0", "/studio/visual-boards/ai-status"],
  ["AI Trust Pattern Board", "Confidence, citations, review, and feedback", "A4", "AI Pattern v1.0", "/studio/visual-boards/ai-trust"],
  ["Search Pattern Board", "Search, filters, suggestions, and results", "A4", "Pattern v1.0", "/studio/visual-boards/search-patterns"],
  ["Authentication Pattern Board", "Sign in, recovery, verification, and session", "A4", "Pattern v1.0", "/studio/visual-boards/auth-patterns"],
  ["Data State Pattern Board", "Loading, empty, error, refresh, and pagination", "A4", "Pattern v1.0", "/studio/visual-boards/data-states"],
  ["Workflow Pattern Board", "Wizard, review, save, danger, and completion", "A4", "Pattern v1.0", "/studio/visual-boards/workflows"],
  ["Navigation Board", "현재 위치와 다음 경로", "B5", "Foundation v1.0", "/studio/visual-boards/navigation"],
  ["Form Board", "입력·검증·요약 상태", "A4", "Foundation v1.0", "/studio/visual-boards/forms"],
  ["Icon Board", "아이콘 의미와 스타일", "B5", "Planned", ""],
  ["Example Gallery", "프로젝트 적용 사례", "A4", "Structure Ready", ""],
];

export default function VisualBoardsPage() {
  return <main className="studio-page"><div className="studio-shell">
    <Link href="/studio">← Studio</Link>
    <p className="studio-eyebrow">VISUAL DESIGN BOARDS</p>
    <h1>보고, 비교하고,<br />함께 판단하는 보드</h1>
    <p className="studio-lede">공통 Design Language를 실제 시각 기준으로 검토하는 공간입니다. Foundation v1.0은 브라우저에서 바로 확인할 수 있습니다.</p>
    <div className="studio-board-grid">{boards.map(([title, description, size, status, href]) => <article className="studio-board-card" key={title}><span className="studio-card-index">{size} · {status}</span><h2>{title}</h2><p>{description}</p><dl><div><dt>수정일</dt><dd>2026-08-05</dd></div><div><dt>프로젝트</dt><dd>0개</dd></div><div><dt>이미지</dt><dd>{href ? "Preview" : "0개"}</dd></div></dl>{href && <Link className="studio-card-arrow" href={href}>Foundation Board 열기 →</Link>}</article>)}</div>
    <p className="studio-note">실제 이미지가 없는 보드는 README로 관리하며 이미지·placeholder를 임의 생성하지 않습니다.</p>
  </div></main>;
}
