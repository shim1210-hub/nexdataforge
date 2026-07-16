import type { Metadata } from "next";
import Link from "next/link";

const salesMetrics = [
  { label: "분석 대상 기업", value: "342" },
  { label: "총 매출", value: "128.4억" },
  { label: "전년 대비", value: "+18.7%" },
  { label: "영업이익률", value: "12.3%" },
];

const salesBars = [
  { label: "2021", height: "42%" },
  { label: "2022", height: "56%" },
  { label: "2023", height: "68%" },
  { label: "2024", height: "82%" },
  { label: "2025", height: "74%" },
  { label: "2026", height: "91%" },
];

const insightCards = [
  {
    title: "매출 성장률",
    description: "연도별 매출 흐름과 증감률을 비교해 성장 구간을 빠르게 찾습니다.",
    value: "+18.7%",
  },
  {
    title: "수익성 지표",
    description: "영업이익, 순이익, 비용 비중을 함께 보고 사업 체질을 확인합니다.",
    value: "12.3%",
  },
  {
    title: "업종 비교",
    description: "동일 업종 평균과 비교해 기업의 상대 위치를 시각화합니다.",
    value: "Top 22%",
  },
];

const financeChecklist = [
  "매출이 2년 이상 연속 성장하는지 확인",
  "영업이익률이 업종 평균보다 낮아지는 구간 탐지",
  "부채비율과 현금 흐름을 함께 비교",
  "매출 성장과 이익 성장의 괴리 여부 체크",
];

export const metadata: Metadata = {
  title: "SW_003 기업 매출 분석",
  description:
    "기업 매출과 재무 정보를 차트로 비교하고 분석하는 NexDataForge SW_003 메인 화면입니다.",
};

export default function Sw003Page() {
  return (
    <main className="sw001-template-page sw003-template-page">
      <header className="sw001-app-header">
        <div className="sw001-brand">
          <Link className="sw001-brand-mark sw003-brand-mark" href="/" aria-label="홈으로 이동">
            SW
          </Link>
          <div>
            <strong>SW_003</strong>
            <span>기업 매출 분석 · 재무 데이터</span>
          </div>
        </div>

        <nav className="sw001-menu" aria-label="SW_003 화면 메뉴">
          <a aria-current="page" className="sw001-menu-button sw003-menu-link" href="#main">
            메인화면
          </a>
          <a className="sw001-menu-button sw003-menu-link" href="#sales">
            매출
          </a>
          <a className="sw001-menu-button sw003-menu-link" href="#compare">
            비교
          </a>
          <a className="sw001-menu-button sw003-menu-link" href="#finance">
            재무
          </a>
        </nav>
      </header>

      <section id="main" className="sw001-screen sw003-screen" aria-label="SW_003 메인화면">
        <div className="sw001-dashboard sw003-dashboard">
          <section className="sw003-hero">
            <div className="sw003-hero-copy">
              <p>BUSINESS SALES ANALYTICS</p>
              <h1>
                기업 매출과 재무 흐름을 <span>한눈에 비교하는 화면</span>
              </h1>
              <strong>
                공공·기업 데이터를 기반으로 매출 성장, 수익성, 업종 평균 대비
                위치를 대시보드 형태로 정리합니다.
              </strong>
            </div>

            <div className="sw003-chart-card" aria-label="매출 추이 미리보기">
              <div className="sw003-chart-header">
                <span>Revenue Trend</span>
                <strong>2021-2026</strong>
              </div>

              <div className="sw003-bar-chart">
                {salesBars.map((bar) => (
                  <div key={bar.label}>
                    <span style={{ height: bar.height }} />
                    <strong>{bar.label}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="sw003-metric-grid" aria-label="기업 매출 주요 지표">
            {salesMetrics.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </section>

          <div className="sw003-main-layout">
            <section id="sales" className="sw001-data-panel">
              <div className="sw001-panel-heading">
                <div>
                  <h2>핵심 분석 카드</h2>
                  <span>매출, 수익성, 업종 비교를 우선 제공합니다.</span>
                </div>
              </div>

              <div className="sw003-insight-grid">
                {insightCards.map((card) => (
                  <article key={card.title}>
                    <strong>{card.value}</strong>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="finance" className="sw001-data-panel">
              <div className="sw001-panel-heading">
                <div>
                  <h2>재무 체크포인트</h2>
                  <span>메인 화면에서 우선 확인할 기준</span>
                </div>
              </div>

              <ol className="sw003-check-list">
                {financeChecklist.map((item, index) => (
                  <li key={item}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section id="compare" className="sw001-data-panel">
            <div className="sw001-panel-heading">
              <div>
                <h2>업종 평균 대비 위치</h2>
                <span>동일 업종 평균과 비교해 강점과 위험 구간을 표시합니다.</span>
              </div>
            </div>

            <div className="sw003-compare-grid">
              <article>
                <span>매출 성장</span>
                <strong>상위 22%</strong>
              </article>
              <article>
                <span>수익성</span>
                <strong>업종 평균 +3.1%p</strong>
              </article>
              <article>
                <span>안정성</span>
                <strong>관찰 필요</strong>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
