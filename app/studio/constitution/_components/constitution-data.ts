export type Principle = {
  name: string;
  definition: string;
  meaning: string;
  rules: string[];
  good: string;
  bad: string;
  question: string;
  related: string;
};

export type Article = {
  number: number;
  title: string;
  rule: string;
  why: string;
  good: string;
  bad: string;
  questions: string[];
  related: string;
};

export const principles: Principle[] = [
  { name: "AI First", definition: "AI는 의도를 이해하고 제안하되 사용자의 통제권을 대신하지 않는다.", meaning: "복잡한 조작을 줄이고 검토 가능한 도움을 먼저 제공한다.", rules: ["결과 수정·재생성·거부 가능", "중요 행동은 승인 후 실행", "진행·실패·복구 상태 제공"], good: "BidMe가 요청을 정리한 뒤 사용자가 수정하고 승인한다.", bad: "AI 제안을 검토 없이 외부에 자동 발송한다.", question: "AI 결과를 사용자가 거부하거나 고칠 수 있는가?", related: "AI UX · AI Trust · Feedback" },
  { name: "Data First", definition: "장식보다 중요한 데이터와 상태를 먼저 보여준다.", meaning: "숫자, 비교, 출처, 갱신 시점을 판단 순서에 맞춰 배치한다.", rules: ["핵심 숫자 우선", "Loading·Empty·Error 명시", "출처와 갱신 시점 제공"], good: "PriceGo가 원화 환산 결과와 적용 환율을 먼저 보여준다.", bad: "핵심 금액을 작은 Caption으로 숨긴다.", question: "사용자가 판단할 데이터가 장식보다 먼저 보이는가?", related: "Display · Data States · Templates" },
  { name: "Mobile First", definition: "가장 작은 화면에서 핵심 목적과 행동을 먼저 해결한다.", meaning: "320px, Safe Area, 큰 터치 영역과 한 손 사용을 기본으로 검토한다.", rules: ["320px 지원", "가로 스크롤 금지", "긴 문구와 큰 글씨 대응"], good: "OCR 복구 Action이 좁은 화면에서 세로로 쌓인다.", bad: "Desktop 표를 그대로 축소해 가로 스크롤로 숨긴다.", question: "320px에서도 같은 목적을 달성할 수 있는가?", related: "Mobile Template · Responsive Quality" },
  { name: "Zero Learning", definition: "교육 없이 화면 목적과 다음 행동을 이해할 수 있어야 한다.", meaning: "명확한 제목, 하나의 목적, 즉시 Feedback으로 학습 비용을 줄인다.", rules: ["3초 안에 목적 이해", "Primary Action 명확", "행동 결과 즉시 표시"], good: "스캔 화면이 촬영과 갤러리 선택을 바로 제시한다.", bad: "아이콘만 나열하고 설명은 별도 도움말에 둔다.", question: "설명서 없이 다음 행동을 선택할 수 있는가?", related: "Navigation · Actions · Page Templates" },
  { name: "Trust First", definition: "정확성, 한계, 출처와 실패를 숨기지 않는다.", meaning: "자동 분석의 근거와 불확실성을 검토 가능한 상태로 전달한다.", rules: ["Confidence와 한계 표현", "Source·Last Updated 제공", "Retry·Correction 제공"], good: "AI Measure가 측정 신뢰도와 현장 확인 필요를 함께 표시한다.", bad: "추정 결과를 확정값처럼 표현한다.", question: "사용자가 결과를 신뢰할 근거와 의심할 이유를 모두 볼 수 있는가?", related: "AI Trust · Status · Quality" },
  { name: "Clarity First", definition: "시각적 풍부함보다 이해와 판단 속도를 우선한다.", meaning: "불필요한 문구와 장식을 줄이고 정보 계층을 선명하게 만든다.", rules: ["핵심 메시지 먼저", "쉬운 문장", "경쟁하는 강조 최소화"], good: "ShimPM이 현재 위험과 다음 조치를 한 화면에 구분한다.", bad: "동일한 강도의 카드가 핵심 상태와 부가 설명을 경쟁시킨다.", question: "가장 중요한 한 가지가 즉시 드러나는가?", related: "Typography · Layout · Cards" },
  { name: "Consistency", definition: "같은 의미와 상태는 프로젝트가 달라도 같은 UI 언어를 사용한다.", meaning: "기존 Token, Component, Pattern을 먼저 확장한다.", rules: ["동일 상태는 동일 표현", "기존 컴포넌트 우선", "예외는 기록"], good: "모든 제품의 Error가 설명과 복구 Action을 함께 제공한다.", bad: "서비스마다 Success 색상과 용어가 다르다.", question: "기존 Studio 항목으로 같은 의미를 표현할 수 있는가?", related: "Foundations · Components · Patterns" },
  { name: "Accessibility", definition: "접근성은 선택 기능이 아니라 기본 품질 기준이다.", meaning: "키보드, 보조 기술, 큰 글씨, 대비와 터치 영역을 설계 단계에서 포함한다.", rules: ["명확한 Heading과 Landmark", "상태를 색상 외 텍스트로 표현", "Focus와 터치 영역 보장"], good: "Toggle이 이름과 checked 상태를 함께 전달한다.", bad: "색상만으로 오류와 성공을 구분한다.", question: "보지 못하거나 정밀 조작이 어려워도 목적을 달성할 수 있는가?", related: "Accessibility Quality · Checklists" },
  { name: "Maintainability", definition: "시각적 완성도가 구조와 유지보수성을 해치지 않아야 한다.", meaning: "의미 있는 Token과 재사용 가능한 책임 경계를 유지한다.", rules: ["UI에 비즈니스 로직 금지", "일회성 Global Token 금지", "중복 Wrapper 최소화"], good: "프로젝트 Adapter가 기존 Semantic Token을 연결한다.", bad: "한 화면 장식을 위해 전역 Theme 구조를 확장한다.", question: "변경 이유와 영향 범위를 다음 개발자가 이해할 수 있는가?", related: "Token Governance · Contributing" },
  { name: "Human Control", definition: "중요한 의사결정과 실행의 최종 통제권은 사용자에게 있다.", meaning: "제안, 검토, 수정, 승인, 실행, 결과 확인의 경계를 명확히 한다.", rules: ["위험 Action 명시적 승인", "취소와 수정 제공", "실행 결과 확인"], good: "ShimPM이 Git Action을 제안하고 사용자가 승인한 뒤 실행한다.", bad: "AI가 계약 생성이나 삭제를 자동 확정한다.", question: "되돌리기 어렵거나 외부 영향이 있는 행동을 사용자가 승인했는가?", related: "Overlays · Actions · AI Governance" },
];

export const articles: Article[] = [
  [1, "3초 이해 원칙", "모든 화면은 3초 안에 목적과 주요 행동을 이해할 수 있어야 한다.", "초기 이해 비용이 제품 사용 가능성을 결정한다.", "PriceGo가 금액 말하기를 첫 행동으로 제시한다.", "설명 없는 아이콘과 동일 강조 버튼을 나열한다.", ["화면 제목이 명확한가?", "Primary Action이 첫 화면에 있는가?"], "Typography · Actions"],
  [2, "하나의 화면, 하나의 목적", "서로 경쟁하는 여러 핵심 목적을 한 화면에 배치하지 않는다.", "사용자의 판단 부담과 실수를 줄인다.", "BidMe 요청 작성과 제안 비교를 별도 단계로 둔다.", "작성·비교·계약을 한 화면에 동시에 강조한다.", ["이 화면의 한 문장 목적은 무엇인가?"], "Workflow · Templates"],
  [3, "중요한 정보 우선", "중요한 숫자, 결과, 상태는 장식과 설명보다 먼저 보인다.", "판단에 필요한 데이터의 발견 시간을 줄인다.", "AI Measure가 측정값을 설명보다 먼저 보여준다.", "핵심 결과를 작은 보조 텍스트로 표시한다.", ["가장 중요한 결과가 가장 강하게 보이는가?"], "Display · Data First"],
  [4, "상태는 숨기지 않는다", "Loading, Empty, Error, Success, Disabled 상태를 명확히 표현한다.", "시스템이 멈췄다는 오해와 반복 행동을 막는다.", "OCR 분석 중 상태와 실패 후 재촬영을 제공한다.", "빈 영역으로 처리 상태를 대신한다.", ["시작·진행·완료·실패가 모두 정의됐는가?"], "Feedback · Data States"],
  [5, "AI 결과는 검토 가능해야 한다", "AI 결과는 수정, 재시도, 출처 확인과 승인 흐름을 제공한다.", "자동화의 효율과 인간의 책임을 함께 유지한다.", "BidMe 제안을 수정한 뒤 승인한다.", "AI 초안을 자동 확정한다.", ["결과를 고치고 거부할 수 있는가?"], "AI Trust · Human Control"],
  [6, "사용자가 길을 잃지 않게 한다", "현재 위치, 이전 화면과 다음 행동을 알 수 있어야 한다.", "탐색 실패와 데이터 유실 불안을 줄인다.", "Settings에서 About으로 이동하고 명확히 복귀한다.", "뒤로가기 결과를 예측할 수 없다.", ["현재 위치와 안전한 복귀 경로가 보이는가?"], "Navigation · Overlays"],
  [7, "클릭보다 사고를 줄인다", "클릭 수보다 판단 부담을 줄이는 것을 우선한다.", "적은 클릭도 어려운 선택을 요구하면 좋은 UX가 아니다.", "SoolMap 필터가 자주 쓰는 기준을 먼저 제공한다.", "옵션을 한 메뉴에 모두 노출한다.", ["사용자가 기억하거나 비교해야 할 항목을 줄였는가?"], "Search · Forms"],
  [8, "같은 의미는 같은 UI", "동일한 기능과 상태는 서비스가 달라도 같은 방식으로 표현한다.", "학습 이전과 유지보수 비용을 줄인다.", "모든 Needs Review 상태가 텍스트와 동일 구조를 쓴다.", "프로젝트마다 상태 명칭과 색상이 다르다.", ["기존 Component나 Pattern과 의미가 같은가?"], "Components · Patterns"],
  [9, "기존 항목을 먼저 확장한다", "새 Token, Component, Pattern 전에 기존 항목으로 해결 가능한지 확인한다.", "시스템의 중복과 분기를 억제한다.", "PriceGo Adapter가 기존 색과 간격을 의미별로 연결한다.", "한 화면을 위해 유사 Token을 추가한다.", ["Variant나 조합으로 해결 가능한가?"], "Foundations · Governance"],
  [10, "접근성은 선택 사항이 아니다", "큰 글씨, 키보드, 보조 기술, 대비와 터치 영역을 기본으로 한다.", "사용 조건과 능력에 관계없이 핵심 목적을 보장한다.", "320px과 키보드 Focus를 Release Gate에서 검토한다.", "마우스와 색상만으로 상태를 전달한다.", ["키보드와 큰 글씨에서 완료 가능한가?"], "Accessibility · Quality"],
  [11, "디자인은 유지보수를 쉽게 해야 한다", "시각적 완성도를 위해 구조와 책임 경계를 희생하지 않는다.", "빠른 변경과 안전한 회귀 검증을 가능하게 한다.", "표시 컴포넌트와 서비스 로직을 분리한다.", "UI 컴포넌트가 API와 저장을 직접 처리한다.", ["변경 범위와 Rollback 경계가 명확한가?"], "Contributing · Versioning"],
  [12, "실제 기능을 숨기지 않는다", "구현되지 않은 기능을 작동하는 것처럼 표현하지 않는다.", "사용자의 기대와 제품 신뢰를 보호한다.", "Sample Data를 명확히 표시한다.", "가짜 진행률과 작동하지 않는 버튼을 노출한다.", ["표현한 기능과 상태가 실제로 연결됐는가?"], "Trust · Quality Gate"],
  [13, "위험 Action은 명확해야 한다", "삭제, 취소, 발송, 승인에는 구분과 확인 절차를 제공한다.", "복구하기 어려운 실수를 예방한다.", "계약 발송 전 대상과 내용을 확인한다.", "일반 버튼과 같은 모습으로 즉시 삭제한다.", ["영향과 복구 가능성을 승인 전에 알 수 있는가?"], "Actions · Overlays"],
  [14, "모바일에서 먼저 검증한다", "모든 Component, Pattern, Template는 320px에서 먼저 검증한다.", "가장 제한된 조건에서 핵심 목적을 보호한다.", "긴 OCR 결과와 Action을 세로로 배치한다.", "Desktop 표를 가로 스크롤로 축소한다.", ["320px에서 가로 넘침 없이 완료 가능한가?"], "Mobile Template · Responsive"],
  [15, "복구 경로를 제공한다", "실패 상태에는 재시도, 수정, 이전 단계나 대체 경로를 제공한다.", "오류를 막다른 길이 아닌 작업 흐름으로 만든다.", "OCR 실패 시 재촬영과 직접입력을 제공한다.", "오류 코드만 표시하고 종료한다.", ["실패 후 사용자가 취할 수 있는 다음 행동이 있는가?"], "Feedback · Recovery"],
].map(([number, title, rule, why, good, bad, questions, related]) => ({ number, title, rule, why, good, bad, questions, related })) as Article[];

export const projects = [
  ["PriceGo", "어르신 사용성 · 큰 글씨 · 큰 터치 영역", "금액 결과 우선, 음성·OCR 오류 복구, 단순 Navigation"],
  ["SoolMap", "검색과 필터 단순화", "지도와 목록 목적 분리, 가격 우선, 위치 권한과 Empty 상태"],
  ["BidMe", "요청 작성 부담 감소", "AI 요청 정리, 제안 비교, 최종 선택 사용자 승인"],
  ["ShimPM", "프로젝트 상태 우선", "위험 명시, Git Action 확인, AI 권고와 실행 분리"],
  ["AI Measure", "측정 결과와 신뢰도", "현장 확인, 사진 품질 안내, 잘못된 측정 복구"],
  ["NexDataForge Portal", "서비스 목적 명확화", "과장 없는 설명, 실제 상태, 일관된 Brand"],
];

export const reviewAreas = [
  ["Clarity", "화면 목적과 Primary Action이 3초 안에 이해되는가?", "첫 화면 캡처와 핵심 작업 설명", "제1조"],
  ["Hierarchy", "제목, 결과, 본문과 보조 정보의 위계가 명확한가?", "Typography 및 데이터 우선순위", "제3조"],
  ["Consistency", "기존 Component와 Pattern을 사용했는가?", "재사용 항목과 예외 기록", "제8조"],
  ["Accessibility", "320px, 큰 글씨, 키보드와 보조 기술에서 사용할 수 있는가?", "반응형 캡처와 접근성 점검", "제10조"],
  ["Responsiveness", "작은 화면과 Wide Desktop에서 목적이 유지되는가?", "320·768·1440px 검토", "제14조"],
  ["Trust", "자동 결과의 출처, 한계와 복구 경로가 있는가?", "Source·Confidence·Error 상태", "제5조"],
  ["User Control", "중요 Action을 검토하고 승인할 수 있는가?", "확인 흐름과 취소 경로", "제13조"],
  ["Maintainability", "임의 값과 기능 로직 중복을 피했는가?", "Token 사용과 책임 경계 diff", "제11조"],
  ["Token Usage", "Semantic Token을 우선 사용했는가?", "사용 Token 목록과 신규 사유", "제9조"],
  ["State Coverage", "Loading, Empty, Error, Success와 Disabled가 정의됐는가?", "상태별 Preview", "제4조"],
];
