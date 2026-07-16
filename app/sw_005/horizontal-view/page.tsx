import type { Metadata } from "next";
import HorizontalViewTool from "../HorizontalViewTool";
import Sw005Footer from "../Sw005Footer";
import Sw005Header from "../Sw005Header";

export const metadata: Metadata = {
  title: "SW_005 Horizontal View",
  description: "세로 입력 데이터를 가로 값 목록으로 변환하는 SW_005 Horizontal View 화면입니다.",
};

export default function HorizontalViewPage() {
  return (
    <main className="sw001-template-page sw005-template-page">
      <Sw005Header active="horizontal" />

      <section className="sw001-screen sw005-screen" aria-label="Horizontal View 화면">
        <div className="sw001-dashboard sw005-dashboard">
          <section className="sw001-data-panel sw005-tool-screen">
            <div className="sw001-panel-heading sw005-inline-heading">
              <div>
                <h2>Horizontal View</h2>
                <span>{"세로로 입력한 데이터를 ('값1', '값2', ...) 형식으로 변환합니다."}</span>
              </div>
            </div>

            <HorizontalViewTool />
          </section>
        </div>
      </section>

      <Sw005Footer />
    </main>
  );
}
