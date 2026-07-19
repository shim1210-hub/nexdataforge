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
    title: "동네온",
    description:
      "내 주변 매장의 할인, 이벤트와 쿠폰을 지도에서 발견하고 저장하는 지역 혜택 플랫폼입니다.",
    features: [
      "지도 기반 주변 이벤트 탐색",
      "매장별 쿠폰 저장 및 이용",
      "관심 업종·거리별 알림 설정",
    ],
    status: "개발 중",
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
  {
    id: "SW_006",
    title: "AI Website Factory",
    description:
      "업체별 홈페이지 생성부터 메뉴·콘텐츠 관리, GitHub Push와 Vercel 배포까지 한곳에서 운영하는 관리자 서비스입니다.",
    features: [
      "업체별 사이트와 템플릿 관리",
      "메뉴·화면·게시글 직접 CRUD",
      "GitHub·Vercel 배포 상태 확인",
    ],
    status: "서비스 중" as ServiceStatus,
    href: "/sw_006",
    enabled: true,
    icon: "AIW",
  },
];
