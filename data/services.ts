export type ServiceStatus = "서비스 준비" | "개발 완료" | "개발 중" | "기획 중";

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  status: ServiceStatus;
  href: string;
  enabled: boolean;
  icon: string;
}

export const services: Service[] = [
  {
    id: "SW_001",
    title: "DongneOn",
    description:
      "지역과 생활 정보를 연결해 가까운 곳의 유용한 혜택과 소식을 확인하는 NexDataForge 서비스입니다.",
    features: [
      "지역 기반 정보 탐색",
      "생활 혜택과 소식 확인",
      "동네 중심 서비스 경험",
    ],
    status: "서비스 준비",
    href: "/sw_002",
    enabled: true,
    icon: "DON",
  },
  {
    id: "SW_002",
    title: "Util",
    description:
      "반복적인 웹 작업과 데이터 정리를 빠르게 처리할 수 있도록 도구를 모아 제공하는 유틸리티 서비스입니다.",
    features: [
      "자주 쓰는 웹 도구",
      "문자열·데이터 정리",
      "작업별 독립 화면",
    ],
    status: "개발 완료",
    href: "/sw_005",
    enabled: true,
    icon: "UTL",
  },
  {
    id: "SW_003",
    title: "AI Website Factory",
    description:
      "사이트 생성부터 콘텐츠 운영과 배포 흐름까지 한곳에서 관리하는 웹사이트 제작·운영 서비스입니다.",
    features: [
      "사이트 생성 흐름",
      "콘텐츠 운영 관리",
      "배포 과정 관리",
    ],
    status: "서비스 준비",
    href: "/sw_006",
    enabled: true,
    icon: "AIW",
  },
  {
    id: "SW_004",
    title: "MetaSys",
    description:
      "서비스 운영에 필요한 구조와 메타 정보를 체계적으로 정리하고 관리하기 위한 시스템 서비스입니다.",
    features: [
      "메타 정보 관리",
      "운영 구조 정리",
      "시스템 기준 관리",
    ],
    status: "개발 완료",
    href: "/sw_007",
    enabled: true,
    icon: "MTA",
  },
  {
    id: "SW_005",
    title: "Data Analytics",
    description:
      "기업 매출과 재무 흐름을 비교 가능한 지표와 차트로 확인하는 데이터 분석 서비스입니다.",
    features: [
      "기업 매출 흐름 확인",
      "재무 지표 비교",
      "분석 카드와 차트",
    ],
    status: "개발 중",
    href: "/sw_003",
    enabled: true,
    icon: "DAT",
  },
  {
    id: "SW_006",
    title: "AI Assistant",
    description:
      "업무 맥락과 데이터를 바탕으로 사용자의 판단과 실행을 보조하는 AI 기반 지원 서비스입니다.",
    features: [
      "업무 맥락 지원",
      "정보 탐색 보조",
      "AI 기반 작업 지원",
    ],
    status: "기획 중",
    href: "",
    enabled: false,
    icon: "AIA",
  },
];
