import type { Metadata } from "next";
import StringToolsTool from "../StringToolsTool";
import Sw005Footer from "../Sw005Footer";
import Sw005Header from "../Sw005Header";

export const metadata: Metadata = {
  title: "SW_005 문자열 도구",
  description: "문자열 변환, 정리, 비교, 정규식 테스트를 제공하는 SW_005 문자열 도구 화면입니다.",
};

export default function StringToolsPage() {
  return (
    <main className="sw001-template-page sw005-template-page">
      <Sw005Header active="string" />

      <section className="sw001-screen sw005-screen" aria-label="문자열 도구 화면">
        <div className="sw001-dashboard sw005-dashboard">
          <section className="sw001-data-panel sw005-tool-screen">
            <div className="sw001-panel-heading sw005-inline-heading">
              <div>
                <h2>문자열 도구</h2>
                <span>콤보박스로 작업을 선택하고 문자열 변환, 정리, 비교, 검색을 수행합니다.</span>
              </div>
            </div>

            <StringToolsTool />
          </section>
        </div>
      </section>

      <Sw005Footer />
    </main>
  );
}
