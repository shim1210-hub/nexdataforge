"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";

type Sw001ViewId = "main" | "time" | "place" | "cyber" | "map";

type DataPoint = {
  label: string;
  total: number;
};

type CategoryChartType = "pie" | "bar" | "line";

type DaySeriesOption = {
  dayTotals: DataPoint[];
  label: string;
  total: number;
};

export type TimeCrimeData = {
  dayTotals: DataPoint[];
  daySeriesOptions: DaySeriesOption[];
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

type RegionCityData = DataPoint & {
  province: string;
};

export type RegionCrimeData = {
  cities: RegionCityData[];
  domesticTotal: number;
  foreignTotal: number;
  peakCity: RegionCityData;
  peakProvince: DataPoint;
  provinceTotals: DataPoint[];
  rowCount: number;
  sourceName: string;
  topCities: RegionCityData[];
};

type Sw001ClientProps = {
  cyberCrimeData: CyberCrimeData;
  placeCrimeData: PlaceCrimeData;
  regionCrimeData: RegionCrimeData;
  timeCrimeData: TimeCrimeData;
};

type MainOverviewProps = Pick<
  Sw001ClientProps,
  "cyberCrimeData" | "placeCrimeData" | "timeCrimeData"
>;

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

const categoryChartOptions: Array<{
  label: string;
  value: CategoryChartType;
}> = [
  { label: "원그래프", value: "pie" },
  { label: "막대그래프", value: "bar" },
  { label: "선그래프", value: "line" },
];

const mapProvincePins = [
  { label: "서울", lat: 37.5665, lng: 126.978 },
  { label: "인천", lat: 37.4563, lng: 126.7052 },
  { label: "경기도", lat: 37.4138, lng: 127.5183 },
  { label: "강원도", lat: 37.8228, lng: 128.1555 },
  { label: "충북", lat: 36.8, lng: 127.7 },
  { label: "충남", lat: 36.5184, lng: 126.8 },
  { label: "세종시", lat: 36.4801, lng: 127.289 },
  { label: "대전", lat: 36.3504, lng: 127.3845 },
  { label: "경북", lat: 36.4919, lng: 128.8889 },
  { label: "대구", lat: 35.8714, lng: 128.6014 },
  { label: "전북", lat: 35.7175, lng: 127.153 },
  { label: "광주", lat: 35.1595, lng: 126.8526 },
  { label: "전남", lat: 34.8679, lng: 126.991 },
  { label: "울산", lat: 35.5384, lng: 129.3114 },
  { label: "부산", lat: 35.1796, lng: 129.0756 },
  { label: "경남", lat: 35.4606, lng: 128.2132 },
  { label: "제주", lat: 33.4996, lng: 126.5312 },
];

const osmMapBounds = {
  east: 131.2,
  north: 39.6,
  south: 32.9,
  west: 124.3,
  zoom: 7,
};

function projectToOsmPixel(lat: number, lng: number, zoom: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const scale = 256 * 2 ** zoom;

  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

function getOsmViewport() {
  const northWest = projectToOsmPixel(osmMapBounds.north, osmMapBounds.west, osmMapBounds.zoom);
  const southEast = projectToOsmPixel(osmMapBounds.south, osmMapBounds.east, osmMapBounds.zoom);
  const width = southEast.x - northWest.x;
  const height = southEast.y - northWest.y;
  const minTileX = Math.floor(northWest.x / 256);
  const maxTileX = Math.floor(southEast.x / 256);
  const minTileY = Math.floor(northWest.y / 256);
  const maxTileY = Math.floor(southEast.y / 256);
  const tiles = [];

  for (let x = minTileX; x <= maxTileX; x += 1) {
    for (let y = minTileY; y <= maxTileY; y += 1) {
      tiles.push({
        key: `${x}-${y}`,
        left: ((x * 256 - northWest.x) / width) * 100,
        top: ((y * 256 - northWest.y) / height) * 100,
        url: `https://tile.openstreetmap.org/${osmMapBounds.zoom}/${x}/${y}.png`,
        width: (256 / width) * 100,
      });
    }
  }

  return {
    height,
    northWest,
    tiles,
    width,
  };
}

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
  regionCrimeData,
  timeCrimeData,
}: Sw001ClientProps) {
  const [activeViewId, setActiveViewId] = useState<Sw001ViewId>("main");
  const activeView = sw001Views.find((view) => view.id === activeViewId) ?? sw001Views[0];

  return (
    <main className="sw001-template-page">
      <header className="sw001-app-header">
        <div className="sw001-brand">
          <Link className="sw001-brand-mark" href="/" aria-label="홈으로 이동">
            SW
          </Link>
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

      <section className="sw001-screen" aria-label={activeView.title}>
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
        {activeView.id === "map" && <RegionMapDashboard data={regionCrimeData} />}
      </section>
    </main>
  );
}

function MainOverview({
  cyberCrimeData,
  placeCrimeData,
  timeCrimeData,
}: MainOverviewProps) {
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
  const [selectedCategoryChartType, setSelectedCategoryChartType] =
    useState<CategoryChartType>("pie");
  const [selectedDaySeriesLabel, setSelectedDaySeriesLabel] = useState(
    data.daySeriesOptions[0]?.label ?? "전체",
  );
  const fallbackDaySeries = data.daySeriesOptions[0] ?? {
    dayTotals: data.dayTotals,
    label: "전체",
    total: data.dayTotals.reduce((sum, item) => sum + item.total, 0),
  };
  const selectedDaySeries =
    data.daySeriesOptions.find((option) => option.label === selectedDaySeriesLabel) ??
    fallbackDaySeries;
  const maxTimeTotal = Math.max(...data.timeTotals.map((item) => item.total));
  const maxDayTotal = Math.max(...selectedDaySeries.dayTotals.map((item) => item.total));
  const maxCategoryTotal = Math.max(...data.topMajorCategories.map((item) => item.total));
  const selectedPeakDay = selectedDaySeries.dayTotals.reduce((peak, item) =>
    item.total > peak.total ? item : peak,
  );

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
            <div>
              <h3>요일별 분포</h3>
              <span>
                {selectedDaySeries.label} · {selectedPeakDay.label}요일 최고
              </span>
            </div>

            <label className="sw001-select-control">
              <span>그래프 선택</span>
              <select
                aria-label="요일별 분포 그래프 선택"
                onChange={(event) => setSelectedDaySeriesLabel(event.target.value)}
                value={selectedDaySeries.label}
              >
                {data.daySeriesOptions.map((option) => (
                  <option key={option.label} value={option.label}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <VerticalBars data={selectedDaySeries.dayTotals} max={maxDayTotal} />
        </section>
      </div>

      <CategoryChartPanel
        chartType={selectedCategoryChartType}
        data={data.topMajorCategories}
        max={maxCategoryTotal}
        onChartTypeChange={setSelectedCategoryChartType}
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

function RegionMapDashboard({ data }: { data: RegionCrimeData }) {
  const [selectedProvince, setSelectedProvince] = useState(data.peakProvince.label);
  const mapViewport = getOsmViewport();
  const provinceMap = new Map(data.provinceTotals.map((item) => [item.label, item]));
  const selectedProvinceData = provinceMap.get(selectedProvince) ?? data.peakProvince;
  const selectedCities = data.cities
    .filter((city) => city.province === selectedProvinceData.label)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const maxProvinceTotal = Math.max(...data.provinceTotals.map((item) => item.total));
  const maxCityTotal = Math.max(...selectedCities.map((item) => item.total), 0);

  return (
    <div className="sw001-dashboard">
      <div className="sw001-dashboard-intro">
        <div>
          <p>{data.sourceName}</p>
          <h2>지역별 범죄 발생 지도검색</h2>
          <span>2024년 12월 31일 기준 공개 CSV {data.rowCount}개 세부 분류를 시도·시군구 단위로 집계</span>
        </div>
      </div>

      <div className="sw001-summary-grid">
        <SummaryCard label="국내 전체" value={formatNumber(data.domesticTotal)} helper="외국 컬럼 제외" />
        <SummaryCard label="최다 시도" value={data.peakProvince.label} helper={`${formatNumber(data.peakProvince.total)}건`} />
        <SummaryCard label="최다 시군구" value={data.peakCity.label} helper={`${data.peakCity.province} · ${formatNumber(data.peakCity.total)}건`} />
        <SummaryCard label="외국 집계" value={formatNumber(data.foreignTotal)} helper="원천 데이터 외국 컬럼" />
      </div>

      <div className="sw001-map-layout">
        <section className="sw001-data-panel" aria-label="지역별 범죄 발생 지도">
          <div className="sw001-panel-heading">
            <div>
              <h3>시도별 지도</h3>
              <span>지역을 선택하면 시군구 순위가 바뀝니다.</span>
            </div>
          </div>

          <div className="sw001-korea-map" aria-label="대한민국 시도별 범죄 발생 통계 지도">
            <div className="sw001-osm-tiles" aria-hidden="true">
              {mapViewport.tiles.map((tile) => (
                <span
                  key={tile.key}
                  style={
                    {
                      "--tile-left": `${tile.left}%`,
                      "--tile-top": `${tile.top}%`,
                      "--tile-url": `url(${tile.url})`,
                      "--tile-width": `${tile.width}%`,
                    } as CSSProperties
                  }
                />
              ))}
            </div>

            {mapProvincePins.map((pin) => {
              const provinceData = provinceMap.get(pin.label);
              const intensity = maxProvinceTotal === 0 ? 0 : (provinceData?.total ?? 0) / maxProvinceTotal;
              const regionAlpha = 0.08 + intensity * 0.24;
              const markerScale = 0.78 + intensity * 0.72;
              const point = projectToOsmPixel(pin.lat, pin.lng, osmMapBounds.zoom);
              const pinX = ((point.x - mapViewport.northWest.x) / mapViewport.width) * 100;
              const pinY = ((point.y - mapViewport.northWest.y) / mapViewport.height) * 100;

              return (
                <button
                  aria-current={selectedProvinceData.label === pin.label ? "true" : undefined}
                  className="sw001-map-region"
                  key={pin.label}
                  onClick={() => setSelectedProvince(pin.label)}
                  style={
                    {
                      "--marker-scale": markerScale,
                      "--pin-x": `${pinX}%`,
                      "--pin-y": `${pinY}%`,
                      "--region-alpha": regionAlpha,
                    } as CSSProperties
                  }
                  type="button"
                >
                  <strong>{pin.label}</strong>
                  <span>{formatNumber(provinceData?.total ?? 0)}</span>
                </button>
              );
            })}

            <a
              className="sw001-map-attribution"
              href="https://www.openstreetmap.org/copyright"
              rel="noreferrer"
              target="_blank"
            >
              © OpenStreetMap contributors
            </a>
          </div>
        </section>

        <section className="sw001-data-panel" aria-label="선택 지역 시군구 범죄 발생 통계">
          <div className="sw001-panel-heading">
            <div>
              <h3>{selectedProvinceData.label} 상세</h3>
              <span>총 {formatNumber(selectedProvinceData.total)}건</span>
            </div>
          </div>

          <HorizontalBars data={selectedCities} max={maxCityTotal} />
        </section>
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

function CategoryChartPanel({
  chartType,
  data,
  max,
  onChartTypeChange,
  subtitle,
  title,
}: {
  chartType: CategoryChartType;
  data: DataPoint[];
  max: number;
  onChartTypeChange: (chartType: CategoryChartType) => void;
  subtitle: string;
  title: string;
}) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <section className="sw001-data-panel" aria-label={title}>
      <div className="sw001-panel-heading">
        <div>
          <h3>{title}</h3>
          <span>{subtitle}</span>
        </div>

        <label className="sw001-select-control">
          <span>그래프 선택</span>
          <select
            aria-label="범죄 대분류 순위 그래프 선택"
            onChange={(event) => onChartTypeChange(event.target.value as CategoryChartType)}
            value={chartType}
          >
            {categoryChartOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {chartType === "pie" && <CategoryPieChart data={data} total={total} />}
      {chartType === "bar" && <CategoryBarChart data={data} max={max} />}
      {chartType === "line" && <CategoryLineChart data={data} max={max} />}
    </section>
  );
}

function CategoryPieChart({
  data,
  total,
}: {
  data: DataPoint[];
  total: number;
}) {
  const colors = ["#65f4df", "#7bb6ff", "#f5c86b", "#ff8f7a", "#b69cff", "#71d48a", "#f18fc4", "#a9b7c9"];
  const gradientStopParts = data.reduce<{
    parts: string[];
    accumulatedPercent: number;
  }>(
    (result, item, index) => {
      const share = total === 0 ? 0 : (item.total / total) * 100;
      const start = result.accumulatedPercent;
      const end = start + share;

      return {
        accumulatedPercent: end,
        parts: [...result.parts, `${colors[index % colors.length]} ${start}% ${end}%`],
      };
    },
    { accumulatedPercent: 0, parts: [] },
  );
  const gradientStops = gradientStopParts.parts.join(", ");

  return (
    <div className="sw001-pie-layout">
      <div
        aria-label="범죄 대분류 비율 원그래프"
        className="sw001-pie-chart"
        role="img"
        style={{ background: `conic-gradient(${gradientStops})` }}
      >
        <span>{formatNumber(total)}건</span>
      </div>

      <div className="sw001-pie-legend">
        {data.map((item, index) => {
          const share = total === 0 ? 0 : Math.round((item.total / total) * 1000) / 10;

          return (
            <article key={item.label}>
              <i style={{ background: colors[index % colors.length] }} />
              <strong title={item.label}>{item.label}</strong>
              <span>{share}%</span>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function CategoryBarChart({ data, max }: { data: DataPoint[]; max: number }) {
  return <HorizontalBars data={data} max={max} />;
}

function CategoryLineChart({ data, max }: { data: DataPoint[]; max: number }) {
  const points = data.map((item, index) => {
    const x = data.length <= 1 ? 50 : (index / (data.length - 1)) * 100;
    const y = 88 - (max === 0 ? 0 : (item.total / max) * 72);

    return { ...item, x, y };
  });
  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="sw001-line-chart">
      <svg aria-label="범죄 대분류 선그래프" preserveAspectRatio="none" viewBox="0 0 100 100">
        <polyline points={polylinePoints} />
        {points.map((point) => (
          <circle cx={point.x} cy={point.y} key={point.label} r="1.9" />
        ))}
      </svg>

      <div className="sw001-line-labels">
        {points.map((item) => (
          <article key={item.label}>
            <strong title={item.label}>{item.label}</strong>
            <span>{formatNumber(item.total)}건</span>
          </article>
        ))}
      </div>
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
