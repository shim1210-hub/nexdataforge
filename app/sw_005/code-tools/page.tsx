import type { Metadata } from "next";
import CodeToolsTool from "../CodeToolsTool";
import Sw005Footer from "../Sw005Footer";
import Sw005Header from "../Sw005Header";

export const metadata: Metadata = {
  title: "SW_005 개발 코드 도구",
  description: "Formatter, Markdown, Diff, QR, 색상 변환을 제공하는 SW_005 개발 코드 도구 화면입니다.",
};

export default function CodeToolsPage() {
  return (
    <main className="sw001-template-page sw005-template-page">
      <Sw005Header active="code" />

      <section className="sw001-screen sw005-screen" aria-label="개발 코드 도구 화면">
        <div className="sw001-dashboard sw005-dashboard">
          <section className="sw001-data-panel sw005-tool-screen">
            <div className="sw001-panel-heading sw005-inline-heading">
              <div>
                <h2>개발 코드 도구</h2>
                <span>콤보박스로 코드 관련 작업을 선택하고 포맷, 변환, 비교, 생성 작업을 수행합니다.</span>
              </div>
            </div>

            <CodeToolsTool />
          </section>
        </div>
      </section>

      <Sw005Footer />
    </main>
  );
}
