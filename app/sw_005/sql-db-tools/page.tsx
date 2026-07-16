import type { Metadata } from "next";
import SqlDbToolsTool from "../SqlDbToolsTool";
import Sw005Footer from "../Sw005Footer";
import Sw005Header from "../Sw005Header";

export const metadata: Metadata = {
  title: "SW_005 SQL·DB 도구",
  description: "SQL 포맷, DDL, INSERT, DB 문법 변환을 제공하는 SW_005 SQL·DB 도구 화면입니다.",
};

export default function SqlDbToolsPage() {
  return (
    <main className="sw001-template-page sw005-template-page">
      <Sw005Header active="sql" />

      <section className="sw001-screen sw005-screen" aria-label="SQL·DB 도구 화면">
        <div className="sw001-dashboard sw005-dashboard">
          <section className="sw001-data-panel sw005-tool-screen">
            <div className="sw001-panel-heading sw005-inline-heading">
              <div>
                <h2>SQL·DB 도구</h2>
                <span>콤보박스로 SQL·DB 작업을 선택하고 포맷, 생성, 변환 작업을 수행합니다.</span>
              </div>
            </div>

            <SqlDbToolsTool />
          </section>
        </div>
      </section>

      <Sw005Footer />
    </main>
  );
}
