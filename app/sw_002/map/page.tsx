import type { Metadata } from "next";
import FullMapClient from "./FullMapClient";

export const metadata: Metadata = {
  title: "주변 혜택 지도 | 동네온",
};

export default function FullMapPage() {
  return <FullMapClient kakaoJavascriptKey={process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY ?? ""} />;
}
