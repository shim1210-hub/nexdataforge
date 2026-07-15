"use client";

import { useState } from "react";

type Sw001ViewId = "main" | "time" | "place" | "cyber" | "map";

type DataPoint = {
  label: string;
  total: number;
};

export type TimeCrimeData = {
  dayTotals: DataPoint[];
  knownTotal: number;
  peakDay: DataPoint;
  peakTime: DataPoint;
  rowCount: number;
  sourceName: string;
  timeTotals: DataPoint[];
  topMajorCategories: DataPoint[];
  totalWithUnknown: number;
  unknownTotal: number;
};

export type PlaceCrimeData = {
  knownTotal: number;
  peakPlace: DataPoint;
  rowCount: number;
  sourceName: string;
  topMajorCategories: DataPoint[];
  topPlaces: DataPoint[];
  total: number;
  unknownTotal: number;
};

export type CyberCrimeData = {
  arrestRate: number;
  latestArrestTotal: number;
  latestTotal: number;
  latestYear: string;
  peakYear: DataPoint;
  rowCount: number;
  sourceName: string;
  topCategories: DataPoint[];
  yearTotals: DataPoint[];
};

type Sw001ClientProps = {
  cyberCrimeData: CyberCrimeData;
  placeCrimeData: PlaceCrimeData;
  timeCrimeData: TimeCrimeData;
};

const sw001Views: Array<{
  id: Sw001ViewId;
  label: string;
  title: string;
}> = [
  { id: "main", label: "메인화면", title: "메인화면" },
  { id: "time", label: "시간대별", title: "시간대별" },
  { id: "place", label: "장소별", title: "장소별" },
  { id: "cyber", label: "사이버별", title: "사이버별" },
  { id: "map", label: "지도검색", title: "지도검색(지역별 범죄)" },
];

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function getPercent(value: number, max: number) {
  if (max === 0) {
    return 0;
  }

  return Math.max(6, Math.round((value / max) * 100));
}

export default function Sw001Client({
  cyberCrimeData,
  placeCrimeData,
  timeCrimeData,
}: Sw001ClientProps) {
  const [activeViewId, setActiveViewId] = useState<Sw001ViewId>("main");
  const activeView = sw001Views.find((view) => view.id === activeViewId) ?? sw001Views[0];

  return (
    <main className="sw001-template-page">
      <header className="sw001-app-header">
        <div className="sw001-brand">
          <span className="sw001-brand-mark">SW</span>
          <div>
            <strong>SW_001</strong>
            <span>범죄 안전 데이터</span>
          </div>
        </div>

        <nav className="sw001-menu" aria-label="SW_001 화면 메뉴">
          {sw001Views.map((view) => (
            <button
              aria-current={activeView.id === view.id ? "page" : undefined}
              className="sw001-menu-button"
              key={view.id}
              onClick={() => setActiveViewId(view.id)}
              type="button"
            >
              {view.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="sw001-screen" aria-labelledby="sw001-screen-title">
        <div className="sw001-screen-toolbar">
          <div>
            <p>SW_001</p>
            <h1 id="sw001-screen-title">{activeView.title}</h1>
          </div>
          <span>{activeView.id === "map" ? "Template" : "Data View"}</span>
        </div>

        {activeView.id === "main" && (
          <MainOverview
            cyberCrimeData={cyberCrimeData}
            placeCrimeData={placeCrimeData}
            timeCrimeData={timeCrimeData}
          />
        )}
        {activeView.id === "time" && <TimeCrimeDashboard data={timeCrimeData} />}
        {activeView.id === "place" && <PlaceCrimeDashboard data={placeCrimeData} />}
        {activeView.id === "cyber" && <CyberCrimeDashboard data={cyberCrimeData} />}
        {activeView.id === "map" && <Placeholder title={activeView.title} />}
      </section>
    </main>
  );
}

function MainOverview({
  cyberCrimeData,
  placeCrimeData,
  timeCrimeData,
}: Sw001ClientProps) {
  const preventionItems = [
    "야간 이동이 많은 시간대에는 조명이 밝고 사람이 많은 동선을 선택합니다.",
    "주거지, 도로, 통행로처럼 발생 건수가 높은 장소는 방범 시설과 순찰 밀도를 우선 점검합니다.",
    "직거래와 온라인 결제는 공식 안전결제, 거래 이력 확인, 의심 링크 차단을 기본으로 합니다.",
    "지역 데이터는 민원, 신고, 시설 위치 정보와 함께 보며 반복 발생 지점을 먼저 개선합니다.",
  ];

  return (
    <div className="sw001-dashboard">
      <section className="sw001-overview-hero">
        <p>PUBLIC SAFETY DATA DASHBOARD</p>
        <h2>범죄 발생 패턴을 한눈에 보고 예방 의사결정을 돕는 화면입니다.</h2>
        <span>
          시간대, 장소, 사이버 범죄 데이터를 탭별로 정리해 위험이 커지는 조건을 빠르게
          파악하고 생활 안전·지역 관리·온라인 피해 예방에 활용할 수 있도록 구성했습니다.
        </span>
      </section>

      <div className="sw001-overview-grid">
        <OverviewCard
          title="시간대별 범죄현황"
          description={`발생 건수가 가장 많은 시간대는 ${timeCrimeData.peakTime.label}이며, ${formatNumber(
            timeCrimeData.peakTime.total,
          )}건으로 집계됩니다. 야간과 퇴근 이후 시간대의 순찰·귀가 안전 대책을 검토하는 데 활용할 수 있습니다.`}
        />
        <OverviewCard
          title="장소별 범죄현황"
          description={`장소 기준 최다 발생 항목은 ${placeCrimeData.peakPlace.label}입니다. 주거지, 도로, 통행로, 상점 등 생활 접점별 취약 지점을 비교해 시설 개선 우선순위를 잡을 수 있습니다.`}
        />
        <OverviewCard
          title="사이버별 범죄현황"
          description={`${cyberCrimeData.latestYear}년 사이버 범죄 발생 건수는 ${formatNumber(
            cyberCrimeData.latestTotal,
          )}건입니다. 직거래 사기, 기타 사이버사기, 명예훼손·모욕 등 주요 유형을 중심으로 예방 안내가 필요합니다.`}
        />
      </div>

      <section className="sw001-data-panel">
        <div className="sw001-panel-heading">
          <h3>범죄 발생을 줄이기 위한 활용 방법</h3>
          <span>데이터 기반 예방</span>
        </div>

        <div className="sw001-prevention-list">
          {preventionItems.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function TimeCrimeDashboard({ data }: { data: TimeCrimeData }) {
  const maxTimeTotal = Math.max(...data.timeTotals.map((item) => item.total));
  const maxDayTotal = Math.max(...data.dayTotals.map((item) => item.total));
  const maxCategoryTotal = Math.max(...data.topMajorCategories.map((item) => item.total));

  return (
    <div className="sw001-dashboard">
      <div className="sw001-dashboard-intro">
        <div>
          <p>{data.sourceName}</p>
          <h2>시간대별 범죄 발생 흐름</h2>
          <span>2019년 12월 31일 기준 공개 CSV {data.rowCount}개 세부 분류 집계</span>
        </div>
      </div>

      <div className="sw001-summary-grid">
        <SummaryCard label="전체 건수" value={formatNumber(data.totalWithUnknown)} helper="시간 미상 포함" />
        <SummaryCard label="최다 시간대" value={data.peakTime.label} helper={`${formatNumber(data.peakTime.total)}건`} />
        <SummaryCard label="최다 요일" value={`${data.peakDay.label}요일`} helper={`${formatNumber(data.peakDay.total)}건`} />
        <SummaryCard label="시간 미상" value={formatNumber(data.unknownTotal)} helper="원천 데이터 미상 컬럼" />
      </div>

      <div className="sw001-data-layout">
        <section className="sw001-data-panel sw001-time-panel" aria-label="시간대별 범죄 발생 건수">
          <div className="sw001-panel-heading">
            <h3>시간대별 발생 건수</h3>
            <span>총 {formatNumber(data.knownTotal)}건</span>
          </div>

          <HorizontalBars data={data.timeTotals} max={maxTimeTotal} />
        </section>

        <section className="sw001-data-panel" aria-label="요일별 범죄 발생 건수">
          <div className="sw001-panel-heading">
            <h3>요일별 분포</h3>
            <span>금요일 최고</span>
          </div>

          <VerticalBars data={data.dayTotals} max={maxDayTotal} />
        </section>
      </div>

      <RankPanel
        data={data.topMajorCategories}
        max={maxCategoryTotal}
        subtitle="시간대가 확인된 건 기준"
        title="범죄 대분류 순위"
      />
    </div>
  );
}

function PlaceCrimeDashboard({ data }: { data: PlaceCrimeData }) {
  const maxPlaceTotal = Math.max(...data.topPlaces.map((item) => item.total));
  const maxCategoryTotal = Math.max(...data.topMajorCategories.map((item) => item.total));

  return (
    <div className="sw001-dashboard">
      <div className="sw001-dashboard-intro">
        <div>
          <p>{data.sourceName}</p>
          <h2>장소별 범죄 발생 현황</h2>
          <span>2024년 12월 31일 기준 공개 CSV {data.rowCount}개 세부 분류 집계</span>
        </div>
      </div>

      <div className="sw001-summary-grid">
        <SummaryCard label="전체 건수" value={formatNumber(data.total)} helper="장소 미상 포함" />
        <SummaryCard label="최다 장소" value={data.peakPlace.label} helper={`${formatNumber(data.peakPlace.total)}건`} />
        <SummaryCard label="장소 확인" value={formatNumber(data.knownTotal)} helper="미상 제외" />
        <SummaryCard label="장소 미상" value={formatNumber(data.unknownTotal)} helper="원천 데이터 미상 컬럼" />
      </div>

      <div className="sw001-data-layout">
        <section className="sw001-data-panel" aria-label="장소별 범죄 발생 상위 항목">
          <div className="sw001-panel-heading">
            <h3>장소별 상위 발생</h3>
            <span>상위 12개 장소</span>
          </div>

          <HorizontalBars data={data.topPlaces} max={maxPlaceTotal} />
        </section>

        <RankPanel
          data={data.topMajorCategories}
          max={maxCategoryTotal}
          subtitle="전체 장소 합산"
          title="범죄 대분류 순위"
        />
      </div>
    </div>
  );
}

function CyberCrimeDashboard({ data }: { data: CyberCrimeData }) {
  const maxYearTotal = Math.max(...data.yearTotals.map((item) => item.total));
  const maxCategoryTotal = Math.max(...data.topCategories.map((item) => item.total));

  return (
    <div className="sw001-dashboard">
      <div className="sw001-dashboard-intro">
        <div>
          <p>{data.sourceName}</p>
          <h2>연도별 사이버 범죄 현황</h2>
          <span>{data.rowCount}개 연도·구분 행을 기준으로 발생건수와 최신 연도 유형을 집계</span>
        </div>
      </div>

      <div className="sw001-summary-grid">
        <SummaryCard label="최신 연도" value={data.latestYear} helper={`${formatNumber(data.latestTotal)}건 발생`} />
        <SummaryCard label="검거 건수" value={formatNumber(data.latestArrestTotal)} helper={`${data.latestYear}년 기준`} />
        <SummaryCard label="검거율" value={`${data.arrestRate}%`} helper="발생 대비 검거" />
        <SummaryCard label="최다 연도" value={data.peakYear.label} helper={`${formatNumber(data.peakYear.total)}건`} />
      </div>

      <div className="sw001-data-layout">
        <section className="sw001-data-panel" aria-label="연도별 사이버 범죄 발생 건수">
          <div className="sw001-panel-heading">
            <h3>연도별 발생 추이</h3>
            <span>발생건수 기준</span>
          </div>

          <VerticalBars data={data.yearTotals} max={maxYearTotal} />
        </section>

        <RankPanel
          data={data.topCategories}
          max={maxCategoryTotal}
          subtitle={`${data.latestYear}년 발생건수`}
          title="사이버 범죄 유형 상위"
        />
      </div>
    </div>
  );
}

function OverviewCard({ description, title }: { description: string; title: string }) {
  return (
    <article className="sw001-overview-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function SummaryCard({ helper, label, value }: { helper: string; label: string; value: string }) {
  return (
    <article className="sw001-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{helper}</p>
    </article>
  );
}

function HorizontalBars({ data, max }: { data: DataPoint[]; max: number }) {
  return (
    <div className="sw001-time-bars">
      {data.map((item) => (
        <div className="sw001-time-row" key={item.label}>
          <span title={item.label}>{item.label}</span>
          <div className="sw001-bar-track">
            <div style={{ width: `${getPercent(item.total, max)}%` }} />
          </div>
          <strong>{formatNumber(item.total)}</strong>
        </div>
      ))}
    </div>
  );
}

function VerticalBars({ data, max }: { data: DataPoint[]; max: number }) {
  return (
    <div className="sw001-day-bars">
      {data.map((item) => (
        <div className="sw001-day-item" key={item.label}>
          <div>
            <span style={{ height: `${getPercent(item.total, max)}%` }} />
          </div>
          <strong>{item.label}</strong>
          <small>{formatNumber(item.total)}</small>
        </div>
      ))}
    </div>
  );
}

function RankPanel({
  data,
  max,
  subtitle,
  title,
}: {
  data: DataPoint[];
  max: number;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="sw001-data-panel" aria-label={title}>
      <div className="sw001-panel-heading">
        <h3>{title}</h3>
        <span>{subtitle}</span>
      </div>

      <div className="sw001-rank-list">
        {data.map((item, index) => (
          <div className="sw001-rank-row" key={item.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong title={item.label}>{item.label}</strong>
            <div className="sw001-bar-track">
              <div style={{ width: `${getPercent(item.total, max)}%` }} />
            </div>
            <em>{formatNumber(item.total)}건</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="sw001-placeholder">
      <div className="sw001-placeholder-grid" aria-hidden="true" />
      <div className="sw001-placeholder-copy">
        <strong>{title}</strong>
        <p>콘텐츠 준비 중</p>
      </div>
    </div>
  );
}
