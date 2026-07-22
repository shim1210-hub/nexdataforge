import type { Metadata } from "next";
import ManagementPortal from "../ManagementPortal";
export const metadata: Metadata = { title: "동네온 매장 담당자" };
export default function PartnerPage() { return <ManagementPortal mode="partner" kakaoJavascriptKey={process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY ?? ""} />; }
