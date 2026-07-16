import type { Metadata } from "next";
import Sw004Client from "./Sw004Client";

export const metadata: Metadata = {
  title: "SW_004 웹 패킷 분석",
  description:
    "다른 화면에서 발생하는 REQUEST를 실시간으로 수집해 보여주는 NexDataForge SW_004 웹 패킷 분석 화면입니다.",
};

export default function Sw004Page() {
  return <Sw004Client />;
}
