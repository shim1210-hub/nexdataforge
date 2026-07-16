"use client";

import { useMemo, useState } from "react";

type DateToolMode = "unix" | "format" | "diff" | "timezone" | "iso" | "cron" | "uuid";

const dateToolOptions: Array<{ label: string; value: DateToolMode }> = [
  { label: "Unix Timestamp 변환", value: "unix" },
  { label: "날짜 형식 변환", value: "format" },
  { label: "두 날짜 사이 일수 계산", value: "diff" },
  { label: "UTC ↔ 한국시간 변환", value: "timezone" },
  { label: "ISO 8601 변환", value: "iso" },
  { label: "Cron 표현식 해석", value: "cron" },
  { label: "UUID 생성", value: "uuid" },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date) {
  if (Number.isNaN(date.getTime())) {
    return "날짜 형식이 올바르지 않습니다.";
  }

  return [
    `Locale: ${date.toLocaleString("ko-KR")}`,
    `YYYY-MM-DD: ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `YYYY/MM/DD HH:mm:ss: ${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    `ISO: ${date.toISOString()}`,
    `Unix seconds: ${Math.floor(date.getTime() / 1000)}`,
    `Unix milliseconds: ${date.getTime()}`,
  ].join("\n");
}

function parseUnix(value: string) {
  const timestamp = Number(value.trim());

  if (!Number.isFinite(timestamp)) {
    return "숫자 timestamp를 입력해주세요.";
  }

  const milliseconds = value.trim().length <= 10 ? timestamp * 1000 : timestamp;
  return formatDate(new Date(milliseconds));
}

function convertTimezone(value: string, direction: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "날짜 형식이 올바르지 않습니다.";
  }

  if (direction === "utc-to-kst") {
    return `한국시간: ${date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}`;
  }

  const utcDate = new Date(date.getTime() - 9 * 60 * 60 * 1000);
  return `UTC: ${utcDate.toISOString()}`;
}

function explainCron(expression: string) {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    return "5필드 Cron 형식으로 입력해주세요. 예: */5 * * * *";
  }

  const [minute, hour, day, month, weekday] = parts;
  return [
    `분: ${minute}`,
    `시: ${hour}`,
    `일: ${day}`,
    `월: ${month}`,
    `요일: ${weekday}`,
    "",
    "기본 해석:",
    `${minute === "*" ? "매분" : `${minute}분`} / ${hour === "*" ? "매시간" : `${hour}시`} / ${day === "*" ? "매일" : `${day}일`} / ${month === "*" ? "매월" : `${month}월`} / ${weekday === "*" ? "모든 요일" : `${weekday}요일`}`,
  ].join("\n");
}

export default function DateTimeToolsTool() {
  const [mode, setMode] = useState<DateToolMode>("unix");
  const [input, setInput] = useState("1784188800");
  const [secondInput, setSecondInput] = useState("2026-07-23");
  const [timezoneDirection, setTimezoneDirection] = useState("utc-to-kst");
  const [uuidCount, setUuidCount] = useState("3");

  const output = useMemo(() => {
    if (mode === "unix") {
      return parseUnix(input);
    }

    if (mode === "format") {
      return formatDate(new Date(input));
    }

    if (mode === "diff") {
      const startDate = new Date(input);
      const endDate = new Date(secondInput);

      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return "두 날짜를 올바르게 입력해주세요.";
      }

      const diffDays = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      return `일수 차이: ${Math.floor(diffDays)}일\n시간 차이: ${Math.floor(diffDays * 24)}시간`;
    }

    if (mode === "timezone") {
      return convertTimezone(input, timezoneDirection);
    }

    if (mode === "iso") {
      return formatDate(new Date(input));
    }

    if (mode === "cron") {
      return explainCron(input);
    }

    const count = Math.min(Math.max(Number(uuidCount) || 1, 1), 50);
    return Array.from({ length: count }, () => crypto.randomUUID()).join("\n");
  }, [input, mode, secondInput, timezoneDirection, uuidCount]);

  function handleModeChange(nextMode: DateToolMode) {
    setMode(nextMode);

    if (nextMode === "unix") {
      setInput(String(Math.floor(Date.now() / 1000)));
    } else if (nextMode === "cron") {
      setInput("*/5 * * * *");
    } else if (nextMode === "diff") {
      setInput(new Date().toISOString().slice(0, 10));
      setSecondInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    } else {
      setInput(new Date().toISOString());
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output).catch(() => undefined);
  }

  return (
    <div className="sw005-date-tool">
      <label className="sw005-tool-select">
        <span>작업 선택</span>
        <select onChange={(event) => handleModeChange(event.target.value as DateToolMode)} value={mode}>
          {dateToolOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="sw005-string-options">
        {mode === "timezone" ? (
          <select onChange={(event) => setTimezoneDirection(event.target.value)} value={timezoneDirection}>
            <option value="utc-to-kst">UTC → 한국시간</option>
            <option value="kst-to-utc">한국시간 → UTC</option>
          </select>
        ) : null}
        {mode === "uuid" ? (
          <input onChange={(event) => setUuidCount(event.target.value)} placeholder="생성 개수" type="number" value={uuidCount} />
        ) : null}
      </div>

      {mode !== "uuid" ? (
        <label>
          <span>{mode === "cron" ? "Cron Input" : "Date / Time Input"}</span>
          <textarea onChange={(event) => setInput(event.target.value)} spellCheck={false} value={input} />
        </label>
      ) : null}

      {mode === "diff" ? (
        <label>
          <span>End Date</span>
          <textarea onChange={(event) => setSecondInput(event.target.value)} spellCheck={false} value={secondInput} />
        </label>
      ) : null}

      <div className="sw005-horizontal-actions">
        <button onClick={copyOutput} type="button">
          결과 복사
        </button>
      </div>

      <label>
        <span>Output</span>
        <textarea readOnly spellCheck={false} value={output} />
      </label>
    </div>
  );
}
