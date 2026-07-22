import type { Metadata } from "next";
import ManagementPortal from "../ManagementPortal";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "동네온 플랫폼 관리자" };
export default function AdminPage() { return <ManagementPortal mode="admin" kakaoJavascriptKey={process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY ?? ""} />; }
