import type { Metadata } from "next";
import Sw006Client from "./Sw006Client";
import LoginScreen from "./LoginScreen";
import { cookies } from "next/headers";
import { SW006_SESSION_COOKIE, verifySessionToken } from "@/lib/sw006-auth";

export const metadata: Metadata = {
  title: "AI Website Factory",
  description: "사이트 생성부터 콘텐츠 운영과 배포까지 관리하는 AI Website Factory 관리자 콘솔",
};

export default async function Sw006Page() {
  const session = verifySessionToken((await cookies()).get(SW006_SESSION_COOKIE)?.value);
  if (!session) return <LoginScreen />;
  return <Sw006Client currentUser={{ loginId: session.loginId, displayName: session.displayName, accessLevel: session.accessLevel, companySlug: session.companySlug }} />;
}
