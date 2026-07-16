import type { Metadata } from "next";
import DateTimeToolsTool from "../DateTimeToolsTool";
import Sw005Footer from "../Sw005Footer";
import Sw005Header from "../Sw005Header";

export const metadata: Metadata = {
  title: "SW_005 날짜·시간 도구",
  description: "Unix Timestamp, 날짜 형식, UTC/KST, ISO 8601, Cron, UUID를 처리하는 SW_005 날짜·시간 도구 화면입니다.",
};

export default function DateTimeToolsPage() {
  return (
    <main className="sw001-template-page sw005-template-page">
      <Sw005Header active="datetime" />

      <section className="sw001-screen sw005-screen" aria-label="날짜·시간 도구 화면">
        <div className="sw001-dashboard sw005-dashboard">
          <section className="sw001-data-panel sw005-tool-screen">
            <div className="sw001-panel-heading sw005-inline-heading">
              <div>
                <h2>날짜·시간 도구</h2>
                <span>콤보박스로 날짜·시간 작업을 선택하고 변환, 계산, 생성 작업을 수행합니다.</span>
              </div>
            </div>

            <DateTimeToolsTool />
          </section>
        </div>
      </section>

      <Sw005Footer />
    </main>
  );
}
