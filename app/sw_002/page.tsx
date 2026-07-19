import type { Metadata } from "next";
import Sw002Client from "./Sw002Client";

export const metadata: Metadata = {
  title: "동네온 | 우리 동네 이벤트·쿠폰 지도",
  description: "내 주변 매장의 이벤트와 쿠폰을 지도에서 발견하는 지역 혜택 플랫폼",
};

export default function Sw002Page() {
  return (
    <Sw002Client
      kakaoJavascriptKey={process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY ?? ""}
    />
  );
}
