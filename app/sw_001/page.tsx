import Footer from "@/components/Footer";
import { readFileSync } from "fs";
import path from "path";
import { TextDecoder } from "util";
import Sw001Client, {
  type CyberCrimeData,
  type PlaceCrimeData,
  type TimeCrimeData,
} from "./Sw001Client";

const publicDataPath = path.join(process.cwd(), "app", "sw_001", "publicdata");

const timeCsvPath = path.join(publicDataPath, "1_경찰청_범죄 발생 시간대 및 요일_20191231.csv");
const placeCsvPath = path.join(publicDataPath, "2_경찰청_범죄 발생 장소별 통계_20241231.csv");
const cyberCsvPath = path.join(
  publicDataPath,
  "3_경찰청_연도별 사이버 범죄 통계 현황_20231231.csv",
);

function readCsv(filePath: string) {
  const csv = new TextDecoder("euc-kr").decode(readFileSync(filePath));
  const [headerLine, ...bodyLines] = csv.trim().split(/\r?\n/);

  return {
    headers: headerLine.split(","),
    rows: bodyLines.map((line) => line.split(",")),
  };
}

function toNumber(value: string | undefined) {
  return Number(value?.replaceAll(",", "") ?? 0) || 0;
}

function readTimeCrimeData(): TimeCrimeData {
  const { headers, rows } = readCsv(timeCsvPath);
  const timeHeaders = headers.slice(2, 10);
  const dayHeaders = headers.slice(11, 18);
  const timeTotals = timeHeaders.map((label, index) => ({
    label,
    total: rows.reduce((sum, row) => sum + toNumber(row[index + 2]), 0),
  }));
  const dayTotals = dayHeaders.map((label, index) => ({
    label,
    total: rows.reduce((sum, row) => sum + toNumber(row[index + 11]), 0),
  }));
  const majorCategoryTotals = new Map<string, number>();

  rows.forEach((row) => {
    const knownTimeTotal = timeHeaders.reduce(
      (sum, _label, index) => sum + toNumber(row[index + 2]),
      0,
    );

    majorCategoryTotals.set(row[0], (majorCategoryTotals.get(row[0]) ?? 0) + knownTimeTotal);
  });

  const knownTotal = timeTotals.reduce((sum, item) => sum + item.total, 0);
  const unknownTotal = rows.reduce((sum, row) => sum + toNumber(row[10]), 0);
  const peakTime = timeTotals.reduce((peak, item) => (item.total > peak.total ? item : peak));
  const peakDay = dayTotals.reduce((peak, item) => (item.total > peak.total ? item : peak));

  return {
    dayTotals,
    knownTotal,
    peakDay,
    peakTime,
    rowCount: rows.length,
    sourceName: "경찰청 범죄 발생 시간대 및 요일",
    timeTotals,
    topMajorCategories: Array.from(majorCategoryTotals, ([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8),
    totalWithUnknown: knownTotal + unknownTotal,
    unknownTotal,
  };
}

function readPlaceCrimeData(): PlaceCrimeData {
  const { headers, rows } = readCsv(placeCsvPath);
  const placeHeaders = headers.slice(2);
  const placeTotals = placeHeaders
    .map((label, index) => ({
      label,
      total: rows.reduce((sum, row) => sum + toNumber(row[index + 2]), 0),
    }))
    .sort((a, b) => b.total - a.total);
  const majorCategoryTotals = new Map<string, number>();

  rows.forEach((row) => {
    const rowTotal = placeHeaders.reduce((sum, _label, index) => sum + toNumber(row[index + 2]), 0);
    majorCategoryTotals.set(row[0], (majorCategoryTotals.get(row[0]) ?? 0) + rowTotal);
  });

  const total = placeTotals.reduce((sum, item) => sum + item.total, 0);
  const unknownTotal = placeTotals.find((item) => item.label === "미상")?.total ?? 0;

  return {
    knownTotal: total - unknownTotal,
    peakPlace: placeTotals[0],
    rowCount: rows.length,
    sourceName: "경찰청 범죄 발생 장소별 통계",
    topMajorCategories: Array.from(majorCategoryTotals, ([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8),
    topPlaces: placeTotals.slice(0, 12),
    total,
    unknownTotal,
  };
}

function readCyberCrimeData(): CyberCrimeData {
  const { headers, rows } = readCsv(cyberCsvPath);
  const categoryHeaders = headers.slice(2);
  const occurrenceRows = rows.filter((row) => row[1] === "발생건수");
  const arrestRows = rows.filter((row) => row[1] === "검거건수");
  const yearTotals = occurrenceRows
    .map((row) => ({
      label: row[0],
      total: categoryHeaders.reduce((sum, _label, index) => sum + toNumber(row[index + 2]), 0),
    }))
    .sort((a, b) => Number(a.label) - Number(b.label));
  const latestOccurrenceRow = occurrenceRows.reduce((latest, row) =>
    Number(row[0]) > Number(latest[0]) ? row : latest,
  );
  const latestArrestRow = arrestRows.find((row) => row[0] === latestOccurrenceRow[0]);
  const topCategories = categoryHeaders
    .map((label, index) => ({
      label,
      total: toNumber(latestOccurrenceRow[index + 2]),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  const latestTotal = categoryHeaders.reduce(
    (sum, _label, index) => sum + toNumber(latestOccurrenceRow[index + 2]),
    0,
  );
  const latestArrestTotal =
    latestArrestRow?.slice(2).reduce((sum, value) => sum + toNumber(value), 0) ?? 0;

  return {
    arrestRate: latestTotal === 0 ? 0 : Math.round((latestArrestTotal / latestTotal) * 1000) / 10,
    latestArrestTotal,
    latestTotal,
    latestYear: latestOccurrenceRow[0],
    peakYear: yearTotals.reduce((peak, item) => (item.total > peak.total ? item : peak)),
    rowCount: rows.length,
    sourceName: "경찰청 연도별 사이버 범죄 통계 현황",
    topCategories,
    yearTotals,
  };
}

export default function Sw001Page() {
  const timeCrimeData = readTimeCrimeData();
  const placeCrimeData = readPlaceCrimeData();
  const cyberCrimeData = readCyberCrimeData();

  return (
    <>
      <Sw001Client
        cyberCrimeData={cyberCrimeData}
        placeCrimeData={placeCrimeData}
        timeCrimeData={timeCrimeData}
      />
      <Footer />
    </>
  );
}
