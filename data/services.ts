export type ServiceStatus = "개발 예정" | "기획 중" | "개발 중" | "서비스 중";

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
    title: "동네 안전서비스",
    description:
      "공공데이터와 지도 정보를 활용해 우리 동네의 안전정보를 한눈에 확인하는 서비스입니다.",
    features: [
      "지역별 안전정보",
      "CCTV 및 안전시설 위치",
      "범죄·사고 통계 시각화",
    ],
    status: "개발 예정",
    href: "/sw_001",
    enabled: true,
    icon: "🛡️",
  },
  {
    id: "SW_002",
    title: "배달통",
    description:
      "지역의 음식점과 배달 관련 정보를 편리하게 검색하고 비교하는 생활형 서비스입니다.",
    features: [
      "지역별 음식점 검색",
      "메뉴와 배달정보 확인",
      "관심 매장 관리",
    ],
    status: "기획 중",
    href: "/sw_002",
    enabled: true,
    icon: "🛵",
  },
  {
    id: "SW_003",
    title: "기업 매출 분석",
    description:
      "기업의 매출과 재무정보를 데이터와 차트로 비교·분석하는 서비스입니다.",
    features: [
      "기업 검색",
      "연도별 매출 비교",
      "매출 성장률과 재무 차트",
    ],
    status: "기획 중",
    href: "/sw_003",
    enabled: true,
    icon: "📊",
  },
  {
    id: "SW_004",
    title: "웹 패킷 분석",
    description:
      "다른 화면에서 발생하는 REQUEST를 실시간으로 수집하고 패킷 목록과 상세 정보를 확인하는 서비스입니다.",
    features: [
      "실시간 REQUEST 수집",
      "HTTP 메서드별 필터링",
      "패킷 상세 헤더 확인",
    ],
    status: "기획 중" as ServiceStatus,
    href: "/sw_004",
    enabled: true,
    icon: "PKT",
  },
  {
    id: "SW_005",
    title: "웹 유틸 관리",
    description:
      "문자열 변환, 날짜 계산, URL 분석, 데이터 정리처럼 웹에서 자주 사용하는 유틸을 한곳에서 관리하는 서비스입니다.",
    features: [
      "유틸 카테고리 관리",
      "자주 쓰는 도구 즐겨찾기",
      "실행 이력과 상태 확인",
    ],
    status: "기획 중" as ServiceStatus,
    href: "/sw_005",
    enabled: true,
    icon: "UTL",
  },
];
