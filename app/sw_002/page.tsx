import type { Metadata } from "next";
import Link from "next/link";

const serviceMetrics = [
  { label: "등록 예정 매장", value: "128" },
  { label: "오늘 주문 지표", value: "2.4K" },
  { label: "평균 배달 시간", value: "31분" },
  { label: "리뷰 수집률", value: "87%" },
];

const categoryCards = [
  {
    title: "한식",
    description: "국밥, 찌개, 백반처럼 자주 찾는 동네 식사 메뉴를 빠르게 비교합니다.",
    tag: "POPULAR",
  },
  {
    title: "분식",
    description: "떡볶이, 김밥, 튀김 메뉴의 가격과 배달 가능 시간을 한 화면에서 봅니다.",
    tag: "FAST",
  },
  {
    title: "카페",
    description: "커피, 디저트, 포장 가능 여부와 피크 시간대를 함께 확인합니다.",
    tag: "LOCAL",
  },
];

const orderSteps = [
  "지역 선택",
  "메뉴 비교",
  "배달 조건 확인",
  "주문 연결",
];

const storeCards = [
  { name: "범안 김밥", meta: "분식 · 18-28분", score: "4.8" },
  { name: "강남 도시락", meta: "한식 · 25-35분", score: "4.6" },
  { name: "서초 커피바", meta: "카페 · 12-20분", score: "4.9" },
];

export const metadata: Metadata = {
  title: "SW_002 배달잇",
  description:
    "동네 음식점과 배달 정보를 비교하고 관리하는 NexDataForge SW_002 메인 화면입니다.",
};

export default function Sw002Page() {
  return (
    <main className="sw001-template-page sw002-template-page">
      <header className="sw001-app-header">
        <div className="sw001-brand">
          <Link className="sw001-brand-mark sw002-brand-mark" href="/" aria-label="홈으로 이동">
            SW
          </Link>
          <div>
            <strong>SW_002</strong>
            <span>배달잇 · 동네 음식점 데이터</span>
          </div>
        </div>

        <nav className="sw001-menu" aria-label="SW_002 화면 메뉴">
          <a aria-current="page" className="sw001-menu-button sw002-menu-link" href="#main">
            메인화면
          </a>
          <a className="sw001-menu-button sw002-menu-link" href="#stores">
            매장
          </a>
          <a className="sw001-menu-button sw002-menu-link" href="#orders">
            주문
          </a>
          <a className="sw001-menu-button sw002-menu-link" href="#reviews">
            리뷰
          </a>
        </nav>
      </header>

      <section id="main" className="sw001-screen sw002-screen" aria-label="SW_002 메인화면">
        <div className="sw001-dashboard sw002-dashboard">
          <section className="sw002-hero">
            <div className="sw002-hero-copy">
              <p>LOCAL FOOD DELIVERY DASHBOARD</p>
              <h1>
                동네 음식점과 배달 정보를 <span>한 번에 비교하는 화면</span>
              </h1>
              <strong>
                지역별 음식점, 메뉴, 배달 가능 시간, 리뷰 데이터를 모아 사용자가
                빠르게 선택할 수 있는 생활형 서비스입니다.
              </strong>
            </div>

            <div className="sw002-order-card" aria-label="주문 검색 미리보기">
              <div className="sw002-search-bar">
                <span>배달 주소</span>
                <strong>서울시 강남구 서초구</strong>
              </div>

              <div className="sw002-map-preview">
                <span className="sw002-pin sw002-pin-one">한식</span>
                <span className="sw002-pin sw002-pin-two">분식</span>
                <span className="sw002-pin sw002-pin-three">카페</span>
              </div>
            </div>
          </section>

          <section className="sw002-metric-grid" aria-label="배달잇 주요 지표">
            {serviceMetrics.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </section>

          <div className="sw002-main-layout">
            <section className="sw001-data-panel">
              <div className="sw001-panel-heading">
                <div>
                  <h2>카테고리별 탐색</h2>
                  <span>자주 쓰는 메뉴 그룹부터 우선 구성합니다.</span>
                </div>
              </div>

              <div className="sw002-category-grid">
                {categoryCards.map((category) => (
                  <article key={category.title}>
                    <span>{category.tag}</span>
                    <h3>{category.title}</h3>
                    <p>{category.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="orders" className="sw001-data-panel">
              <div className="sw001-panel-heading">
                <div>
                  <h2>주문 흐름</h2>
                  <span>메인 화면에서 보여줄 기본 프로세스</span>
                </div>
              </div>

              <ol className="sw002-step-list">
                {orderSteps.map((step, index) => (
                  <li key={step}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step}</strong>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section id="stores" className="sw001-data-panel">
            <div className="sw001-panel-heading">
              <div>
                <h2>추천 매장 미리보기</h2>
                <span>실제 목록 화면으로 확장될 영역입니다.</span>
              </div>
            </div>

            <div className="sw002-store-grid">
              {storeCards.map((store) => (
                <article key={store.name}>
                  <div>
                    <h3>{store.name}</h3>
                    <span>{store.meta}</span>
                  </div>
                  <strong>{store.score}</strong>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
