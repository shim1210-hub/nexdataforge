import { readFileSync } from "fs";
import path from "path";
import { TextDecoder } from "util";
import { Client } from "pg";
import Sw001Footer from "./Sw001Footer";
import Sw001Client, {
  type CyberCrimeData,
  type InsaDbData,
  type PlaceCrimeData,
  type RegionCrimeData,
  type TimeCrimeData,
} from "./Sw001Client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const publicDataPath = path.join(process.cwd(), "app", "sw_001", "publicdata");

type PgClient = {
  connect: () => Promise<unknown>;
  end: () => Promise<void>;
  query: (sql: string) => Promise<{
    fields: Array<{ name: string }>;
    rows: Array<Record<string, unknown>>;
  }>;
};

const timeCsvPath = path.join(publicDataPath, "1_경찰청_범죄 발생 시간대 및 요일_20191231.csv");
const placeCsvPath = path.join(publicDataPath, "2_경찰청_범죄 발생 장소별 통계_20241231.csv");
const cyberCsvPath = path.join(
  publicDataPath,
  "3_경찰청_연도별 사이버 범죄 통계 현황_20231231.csv",
);
const regionCsvPath = path.join(publicDataPath, "4_경찰청_범죄 발생 지역별 통계_20241231.csv");

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

function stringifyDbValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

async function readInsaDbData(): Promise<InsaDbData> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      columns: [],
      error: "DATABASE_URL 환경 변수가 설정되어 있지 않습니다.",
      rows: [],
      sourceName: "PostgreSQL DATABASE_URL",
      total: 0,
    };
  }

  let client: PgClient | undefined;

  try {
    client = createPgClient(databaseUrl);
    await client.connect();

    const result = await client.query(
      `
        select
          b.seq,
          b.dept_cd,
          a.dept_nm,
          b.name,
          b.birth,
          b.reg_date
        from insa b
        left join dept a on a.dept_cd = b.dept_cd
        order by b.seq desc
        limit 100
      `,
    );
    const columns = result.fields.map((field) => field.name);
    const rows = result.rows.map((row) =>
      Object.fromEntries(columns.map((column) => [column, stringifyDbValue(row[column])])),
    );

    return {
      columns,
      rows,
      sourceName: "PostgreSQL insa",
      total: rows.length,
    };
  } catch (error) {
    return {
      columns: [],
      error: error instanceof Error ? error.message : "알 수 없는 DB 연결 오류가 발생했습니다.",
      rows: [],
      sourceName: "PostgreSQL insa",
      total: 0,
    };
  } finally {
    await client?.end().catch(() => undefined);
  }
}

function createPgClient(databaseUrl: string): PgClient {
  return new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });
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
  const majorCategoryDayTotals = new Map<string, number[]>();

  rows.forEach((row) => {
    const knownTimeTotal = timeHeaders.reduce(
      (sum, _label, index) => sum + toNumber(row[index + 2]),
      0,
    );

    majorCategoryTotals.set(row[0], (majorCategoryTotals.get(row[0]) ?? 0) + knownTimeTotal);

    const currentDayTotals = majorCategoryDayTotals.get(row[0]) ?? dayHeaders.map(() => 0);
    dayHeaders.forEach((_label, index) => {
      currentDayTotals[index] += toNumber(row[index + 11]);
    });
    majorCategoryDayTotals.set(row[0], currentDayTotals);
  });

  const knownTotal = timeTotals.reduce((sum, item) => sum + item.total, 0);
  const unknownTotal = rows.reduce((sum, row) => sum + toNumber(row[10]), 0);
  const peakTime = timeTotals.reduce((peak, item) => (item.total > peak.total ? item : peak));
  const peakDay = dayTotals.reduce((peak, item) => (item.total > peak.total ? item : peak));

  return {
    dayTotals,
    daySeriesOptions: [
      {
        dayTotals,
        label: "전체",
        total: dayTotals.reduce((sum, item) => sum + item.total, 0),
      },
      ...Array.from(majorCategoryDayTotals, ([label, totals]) => ({
        dayTotals: dayHeaders.map((dayLabel, index) => ({
          label: dayLabel,
          total: totals[index],
        })),
        label,
        total: totals.reduce((sum, value) => sum + value, 0),
      }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
    ],
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

function splitRegionLabel(label: string) {
  if (label === "세종시") {
    return { city: "세종시", province: "세종시" };
  }

  const [province, ...cityParts] = label.split(" ");

  return {
    city: cityParts.join(" ") || province,
    province,
  };
}

function readRegionCrimeData(): RegionCrimeData {
  const { headers, rows } = readCsv(regionCsvPath);
  const regionHeaders = headers.slice(2);
  const regionTotals = regionHeaders.map((label, index) => ({
    label,
    total: rows.reduce((sum, row) => sum + toNumber(row[index + 2]), 0),
  }));
  const domesticCities = regionTotals
    .filter((item) => !item.label.startsWith("외국 "))
    .map((item) => {
      const { city, province } = splitRegionLabel(item.label);

      return {
        label: city,
        province,
        total: item.total,
      };
    });
  const provinceTotalMap = new Map<string, number>();

  domesticCities.forEach((city) => {
    provinceTotalMap.set(city.province, (provinceTotalMap.get(city.province) ?? 0) + city.total);
  });

  const provinceTotals = Array.from(provinceTotalMap, ([label, total]) => ({ label, total })).sort(
    (a, b) => b.total - a.total,
  );
  const topCities = domesticCities.sort((a, b) => b.total - a.total);

  return {
    cities: topCities,
    domesticTotal: domesticCities.reduce((sum, city) => sum + city.total, 0),
    foreignTotal: regionTotals
      .filter((item) => item.label.startsWith("외국 "))
      .reduce((sum, item) => sum + item.total, 0),
    peakCity: topCities[0],
    peakProvince: provinceTotals[0],
    provinceTotals,
    rowCount: rows.length,
    sourceName: "경찰청 범죄 발생 지역별 통계",
    topCities: topCities.slice(0, 20),
  };
}

export default async function Sw001Page() {
  const timeCrimeData = readTimeCrimeData();
  const placeCrimeData = readPlaceCrimeData();
  const cyberCrimeData = readCyberCrimeData();
  const regionCrimeData = readRegionCrimeData();
  const insaDbData = await readInsaDbData();
  const kakaoJavascriptKey = process.env.NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY ?? "";

  return (
    <>
      <Sw001Client
        cyberCrimeData={cyberCrimeData}
        insaDbData={insaDbData}
        kakaoJavascriptKey={kakaoJavascriptKey}
        placeCrimeData={placeCrimeData}
        regionCrimeData={regionCrimeData}
        timeCrimeData={timeCrimeData}
      />
      <Sw001Footer />
    </>
  );
}
