import type { Metadata } from "next";
import ManagementPortal from "../ManagementPortal";
export const metadata: Metadata = { title: "동네온 매장 담당자" };
export default function PartnerPage() { return <ManagementPortal mode="partner" />; }
