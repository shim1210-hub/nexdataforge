import type { Metadata } from "next";
import Link from "next/link";
import Sw005Footer from "./Sw005Footer";
import Sw005Header from "./Sw005Header";

const utilityMetrics = [
  { label: "등록 유틸", value: "6" },
  { label: "활성 화면", value: "6" },
  { label: "텍스트 변환", value: "ON" },
  { label: "복사 기능", value: "ON" },
];

const utilityScreens = [
  {
    description: "세로로 입력한 값을 ('값1', '값2', ...) 형식의 가로 값으로 변환합니다.",
    href: "/sw_005/horizontal-view",
    label: "TEXT LIST",
    title: "Horizontal View",
  },
  {
    description: "한 줄 JSON 문자열을 보기 좋은 계단식 JSON 형식으로 정리합니다.",
    href: "/sw_005/json-formatter",
    label: "JSON",
    title: "JSON Formatter",
  },
  {
    description: "대소문자, 공백, 중복 줄, 정렬, 비교, 정규식, Find & Replace, 케이스 변환을 처리합니다.",
    href: "/sw_005/string-tools",
    label: "STRING",
    title: "문자열 도구",
  },
  {
    description: "Unix Timestamp, 날짜 형식, UTC/KST, ISO 8601, Cron 표현식, UUID 생성을 처리합니다.",
    href: "/sw_005/date-time-tools",
    label: "DATE TIME",
    title: "날짜·시간 도구",
  },
  {
    description: "SQL 포맷, INSERT/DDL 생성, CSV·JSON 변환, Oracle/PostgreSQL 문법 변환을 처리합니다.",
    href: "/sw_005/sql-db-tools",
    label: "SQL DB",
    title: "SQL·DB 도구",
  },
  {
    description: "JS/HTML/CSS/XML 포맷, Markdown, Regex, Diff, QR Code, 색상 코드 변환을 처리합니다.",
    href: "/sw_005/code-tools",
    label: "CODE",
    title: "개발 코드 도구",
  },
];

export const metadata: Metadata = {
  title: "SW_005 웹 유틸 관리",
  description: "웹에서 사용하는 각종 유틸 도구를 분류하고 관리하는 NexDataForge SW_005 메인 화면입니다.",
};

export default function Sw005Page() {
  return (
    <main className="sw001-template-page sw005-template-page">
      <Sw005Header active="home" />

      <section id="main" className="sw001-screen sw005-screen" aria-label="SW_005 유틸 관리 화면">
        <div className="sw001-dashboard sw005-dashboard">
          <section className="sw005-hero">
            <div className="sw005-hero-copy">
              <p>WEB UTILITY MANAGEMENT</p>
              <h1>
                자주 쓰는 웹 유틸을 <span>각각의 화면에서 실행합니다.</span>
              </h1>
              <strong>
                유틸 목록을 한 화면에 섞어두지 않고, Horizontal View, JSON Formatter, 문자열 도구, 날짜·시간 도구, SQL·DB 도구, 개발 코드 도구를 독립된 작업
                화면으로 분리해 필요한 도구만 집중해서 사용할 수 있게 구성했습니다.
              </strong>
            </div>

            <div className="sw005-tool-preview" aria-label="유틸 실행 미리보기">
              <div className="sw005-preview-bar">
                <span>Utility Hub</span>
                <strong>6 Screens</strong>
              </div>
              <div className="sw005-editor-preview">
                <span>{"{"}</span>
                <p>{'"horizontalView": "ready",'}</p>
                <p>{'"jsonFormatter": "ready",'}</p>
                <p>{'"stringTools": "ready",'}</p>
                <p>{'"dateTimeTools": "ready",'}</p>
                <p>{'"sqlDbTools": "ready",'}</p>
                <p>{'"codeTools": "ready"'}</p>
                <span>{"}"}</span>
              </div>
            </div>
          </section>

          <section className="sw005-metric-grid" aria-label="유틸 관리 주요 지표">
            {utilityMetrics.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </section>

          <section className="sw001-data-panel">
            <div className="sw001-panel-heading">
              <div>
                <h2>유틸 화면</h2>
                <span>각 유틸은 별도 화면에서 기능을 제공합니다.</span>
              </div>
            </div>

            <div className="sw005-utility-grid">
              {utilityScreens.map((screen) => (
                <Link className="sw005-tool-card" href={screen.href} key={screen.title}>
                  <span>{screen.label}</span>
                  <h3>{screen.title}</h3>
                  <p>{screen.description}</p>
                  <strong>열기</strong>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      <Sw005Footer />
    </main>
  );
}
