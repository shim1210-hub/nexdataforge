import type { Metadata } from "next";
import ManagementPortal from "../ManagementPortal";
export const metadata: Metadata = { title: "동네온 플랫폼 관리자" };
export default function AdminPage() { return <ManagementPortal mode="admin" />; }
