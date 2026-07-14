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
    enabled: false,
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
    enabled: false,
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
    enabled: false,
    icon: "📊",
  },
];