import type { Metadata } from "next";
import JsonFormatterTool from "../JsonFormatterTool";
import Sw005Footer from "../Sw005Footer";
import Sw005Header from "../Sw005Header";

export const metadata: Metadata = {
  title: "SW_005 JSON Formatter",
  description: "한 줄 JSON을 계단식 JSON 형식으로 변환하는 SW_005 JSON Formatter 화면입니다.",
};

export default function JsonFormatterPage() {
  return (
    <main className="sw001-template-page sw005-template-page">
      <Sw005Header active="json" />

      <section className="sw001-screen sw005-screen" aria-label="JSON Formatter 화면">
        <div className="sw001-dashboard sw005-dashboard">
          <section className="sw001-data-panel sw005-tool-screen">
            <div className="sw001-panel-heading sw005-inline-heading">
              <div>
                <h2>JSON Formatter</h2>
                <span>한 줄 JSON을 보기 좋은 계단식 JSON 형식으로 변환합니다.</span>
              </div>
            </div>

            <JsonFormatterTool />
          </section>
        </div>
      </section>

      <Sw005Footer />
    </main>
  );
}
