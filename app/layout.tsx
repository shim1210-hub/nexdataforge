import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NexDataForge",
    template: "%s | NexDataForge",
  },
  description:
    "공공데이터와 다양한 데이터를 활용해 생활에 필요한 웹서비스를 만드는 NexDataForge입니다.",
  keywords: [
    "NexDataForge",
    "공공데이터",
    "데이터 분석",
    "웹서비스",
    "PostgreSQL",
    "Next.js",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}