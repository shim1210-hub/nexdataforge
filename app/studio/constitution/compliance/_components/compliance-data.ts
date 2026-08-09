import { articles } from "../../_components/constitution-data";

export type ComplianceStatus = "Pass" | "Needs Review" | "Needs Device Review" | "Partial" | "Fail" | "Not Applicable" | "Not Verified";
export type EvidenceType = "Source Code" | "Visual Route" | "Build Result" | "TypeScript Result" | "ESLint Result" | "Documentation" | "Manual Browser Review" | "Device Review" | "Not Available";
export type Priority = "Blocker" | "High" | "Medium" | "Low" | "Observation";

export type ComplianceRecord = {
  article: string;
  target: string;
  status: ComplianceStatus;
  evidenceType: EvidenceType;
  evidence: string;
  gap: string;
  action: string;
  owner: string;
  recheck: string;
  priority?: Priority;
};

const articleAuditDetails: Array<[string, ComplianceStatus, EvidenceType, string, string, string]> = [
  ["PriceGo Direct Input", "Needs Device Review", "Source Code", "화면 제목, 국가 Context, 금액 입력과 자동 환산 Action 계층 확인", "실제 사용자의 3초 이해 여부 미검증", "320px 실제 기기에서 핵심 흐름 관찰"],
  ["Studio Page Templates", "Partial", "Visual Route", "Landing·Dashboard·Admin·Mobile·AI Workspace 목적을 Route별 분리", "일부 Preview에 경쟁 Action이 없는지 수동 검토 필요", "Template별 Primary Action Evidence 기록"],
  ["PriceGo Result Surfaces", "Pass", "Source Code", "현지 금액과 원화 결과가 설명·메타 정보보다 먼저 렌더링됨", "실제 Font Scale에서 강조 유지 여부 미검증", "Device Review에서 결과 계층 재확인"],
  ["Visual Boards and PriceGo", "Partial", "Source Code", "Loading·Success·Review·Error Pattern과 일부 실제 상태 구현 확인", "PriceGo Processing·구조화 Error State는 현재 계약에 없음", "누락 상태를 기능 변경 없이 별도 설계 검토"],
  ["AI and Automated Results", "Partial", "Documentation", "AI Trust Board와 PriceGo 음성·OCR Review/Retry 흐름 문서 확인", "출처·Confidence가 모든 AI Pattern에 일관적인지 미검증", "AI Pattern 전체 Evidence Review"],
  ["Studio and PriceGo Navigation", "Needs Device Review", "Source Code", "현재 Route, Back, Bottom Navigation Handler 연결 확인", "실행 중 Focus와 첫 클릭 흐름 미검증", "키보드·기기 Navigation 회귀"],
  ["Search, Forms, Request Flows", "Needs Review", "Visual Route", "검색·Form·Workflow Board가 판단 단계를 분리", "인지 부담 사용자 검증 없음", "대표 과업별 Decision Count 검토"],
  ["Foundation and Shared UI", "Partial", "Source Code", "Semantic Token과 공통 상태 표현 구조 확인", "Studio 전체 Legacy UI는 아직 동일 언어로 전환되지 않음", "적용 범위별 Migration 기록"],
  ["Component and Token Governance", "Pass", "Documentation", "기존 항목·Variant 우선 질문과 Token 추가 기준 문서화", "실제 승인 Workflow는 Preview 범위 밖", "첫 신규 제안에 Governance 적용"],
  ["Constitution and PriceGo Pilot", "Needs Device Review", "Source Code", "Heading, 접근성 이름, switch state, touch target, 320px 코드 대응 확인", "Screen reader·Font Scale·실기기 320px 미검증", "Device Accessibility Checklist 실행"],
  ["Studio Architecture", "Pass", "Source Code", "표시 컴포넌트, 데이터, Route를 분리하고 기존 Wrapper 재사용", "장기 변경 비용은 운영 중 재검토 필요", "다음 Versioning Review"],
  ["Templates and Preview Data", "Needs Review", "Visual Route", "Quality 문서가 Sample/Preview 성격을 명시", "모든 Template의 Sample Data Label 전수 확인 미완료", "Template Route 전수 수동 검토"],
  ["Danger and External Actions", "Partial", "Documentation", "Constitution과 Overlay/Action Pattern에 승인 원칙 존재", "실제 프로젝트별 위험 Action Evidence 부족", "BidMe·ShimPM Danger Action Audit"],
  ["Studio and PriceGo Mobile", "Needs Device Review", "Source Code", "320px CSS Stack, flex shrink, vertical Action과 max width 확인", "실제 Safe Area·키보드·Font Scale 미검증", "320·360·390px Device Review"],
  ["Failure Recovery", "Partial", "Source Code", "PriceGo 음성 Retry, OCR 재촬영·직접입력, Quality Recovery 질문 확인", "일부 Studio Preview는 복구가 문서 수준", "Pattern별 Recovery Evidence 보강"],
];

export const articleAudits: ComplianceRecord[] = articles.map((article, index) => {
  const [target, status, evidenceType, evidence, gap, action] = articleAuditDetails[index];
  return { article: `제${article.number}조 · ${article.title}`, target, status, evidenceType, evidence, gap, action, owner: "Design Reviewer", recheck: status === "Needs Device Review" ? "Stage 20.1 Device Review" : "Next Constitution Review" };
});

export const studioAreas = [
  ["Foundations", "/studio/foundations", "8·9·10·11·14", "Partial", "Semantic Token, Theme와 High Contrast Preview 존재", "Reduced Motion와 실제 대비 Evidence 보강 필요"],
  ["Core Components", "/studio/visual-boards/actions", "1·4·8·9·10", "Needs Review", "Action·Display·Feedback·Overlay Board 존재", "Loading·Error·Large Text 상태 전수 검토 필요"],
  ["UX Patterns", "/studio/visual-boards/workflows", "2·4·6·7·15", "Partial", "Search·Auth·Data State·Workflow Route 존재", "Recovery 상태의 Route별 Evidence 불완전"],
  ["AI Patterns", "/studio/visual-boards/ai-trust", "4·5·12·15", "Partial", "Prompt·Response·Status·Trust Board 존재", "실제 AI Source와 Human Approval 실행은 Preview 범위 밖"],
  ["Templates", "/studio/templates", "1·2·3·6·14", "Needs Review", "5개 Template와 Mobile Preview Build 확인", "Sample label·Danger Action 수동 검토 필요"],
  ["Quality", "/studio/quality", "4·10·11·14·15", "Partial", "Accessibility·Checklist·Release Gate 존재", "Constitution Compliance를 기존 Release Gate에 아직 직접 포함하지 않음"],
  ["Documentation", "/studio/docs", "6·8·9·11·12", "Pass", "Usage·Adoption·Migration·Contribution·Versioning 연결", "실제 운영 적용 후 충돌 재검토"],
  ["Constitution", "/studio/constitution", "1–15", "Pass", "철학·15개 Article·Review·Governance Route Build 및 HTTP 확인", "실제 프로젝트 반복 적용 Evidence 축적 필요"],
] as const;

export const priceGoScreens = [
  ["About / Version", "1·6·8·10·14", "Needs Device Review", "실제 Expo version, Settings 복귀, Safe Area·Scroll·접근성 코드 확인", "320px·큰 글씨·Back 동작 실기기 미검증"],
  ["Settings", "1·2·6·8·10·14", "Needs Device Review", "기존 항목·Handler·Storage 소유권과 공통 Row/Switch 확인", "설정 저장 재실행과 Screen Reader 미검증"],
  ["Direct Input", "1·3·4·7·10·14·15", "Needs Device Review", "상위 입력 State, 자동 calculateKrw, 키패드·삭제·초기화 연결 확인", "키보드·큰 금액·320px 실제 동작 미검증"],
  ["Voice Result", "3·4·5·10·15", "Needs Device Review", "기존 인식 원문·통화·원화 결과와 Retry Handler 연결 확인", "음성 권한·오류·실제 Recognition 미검증"],
  ["Scan / OCR", "4·5·8·10·14·15", "Needs Device Review", "Camera/Gallery Handler, OCR raw text/items, low confidence, KRW와 Recovery 연결 확인", "권한·촬영·OCR·Safe Area 실기기 미검증"],
] as const;

export const protectedPriceGo = [
  ["Voice recognition and VOICE logs", "Source Code", "No content diff under speech service; existing handlers retained"],
  ["parseDetailed and parser", "Source Code", "Parser service files unchanged by Pilot diff"],
  ["OCR and AI Assist", "Source Code", "OCR/AI service files unchanged; Scan consumes existing result contract"],
  ["Currency and exchange rate", "Source Code", "calculateKrw, formatKrw, Cache/Fallback service unchanged"],
  ["AsyncStorage", "Source Code", "AppSettings service and keys unchanged"],
  ["Bottom Navigation", "Source Code", "Component and tab order unchanged"],
  ["Expo Config", "Documentation", "app.json/eas/package content protected; Expo Doctor remains 19/20"],
] as const;

export const gaps: Array<[Priority, string, ComplianceStatus, string, string]> = [
  ["High", "PriceGo device integration", "Needs Device Review", "음성·카메라·OCR·Safe Area·Font Scale 실행 Evidence 없음", "Stage 20.1 실제 기기 회귀"],
  ["High", "320px and large text device review", "Needs Device Review", "코드 대응만 확인", "320·360·390px와 큰 글씨 캡처 검토"],
  ["Medium", "Expo package alignment", "Needs Review", "Expo Doctor 8개 patch mismatch", "별도 Package Alignment Stage"],
  ["Medium", "Non-mutating PriceGo lint gate", "Not Verified", "expo lint가 자동 설정을 시도하는 기존 상태", "별도 Lint Setup Stage"],
  ["Medium", "Studio pattern state evidence", "Needs Review", "Pattern Route는 존재하나 상태별 전수 Evidence 부족", "Initial·Loading·Empty·Error·Success·Recovery 기록"],
  ["Low", "Template sample labels", "Needs Review", "일부 Preview 성격은 문서화됐으나 전수 확인 미완료", "Template 수동 Review"],
  ["Observation", "Constitution operational history", "Not Verified", "v1.0 신규 기준으로 반복 적용 이력 부족", "다음 프로젝트 Review에서 Evidence 축적"],
];

export const mobileTargets = ["Constitution", "Foundations", "Visual Boards", "Templates", "Quality", "Documentation", "PriceGo About", "PriceGo Settings", "PriceGo Direct Input", "PriceGo Voice", "PriceGo Scan"];
export const mobileChecks = ["Page Overflow", "Text Clipping", "Button Clipping", "Card Width", "Action Collision", "Navigation Overflow", "Long Code or Route", "Live Region Duplication", "Large Text Risk"];
