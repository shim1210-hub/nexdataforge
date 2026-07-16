"use client";

import { useMemo, useState } from "react";

type SqlToolMode =
  | "formatter"
  | "minifier"
  | "insert"
  | "create"
  | "csvInsert"
  | "jsonInsert"
  | "tableDoc"
  | "dialect"
  | "columnCase"
  | "sample"
  | "erd";

const sqlToolOptions: Array<{ label: string; value: SqlToolMode }> = [
  { label: "SQL Formatter", value: "formatter" },
  { label: "SQL Minifier", value: "minifier" },
  { label: "INSERT문 생성", value: "insert" },
  { label: "CREATE TABLE문 생성", value: "create" },
  { label: "CSV → INSERT 변환", value: "csvInsert" },
  { label: "JSON → INSERT 변환", value: "jsonInsert" },
  { label: "테이블 정의서 → DDL 변환", value: "tableDoc" },
  { label: "Oracle ↔ PostgreSQL 문법 변환", value: "dialect" },
  { label: "컬럼명 Camel Case ↔ Snake Case 변환", value: "columnCase" },
  { label: "샘플 데이터 생성", value: "sample" },
  { label: "ERD용 컬럼 정리", value: "erd" },
];

const sampleSql = "select user_id,user_name,email from users where status='ACTIVE' order by created_at desc";
const sampleCsv = "user_id,user_name,email\nUSER001,홍길동,hong@test.com\nUSER002,김유틸,util@test.com";
const sampleJson = '[{"user_id":"USER001","user_name":"홍길동","email":"hong@test.com"}]';
const sampleColumns = "user_id,varchar(30),not null,사용자ID\nuser_name,varchar(100),not null,사용자명\ncreated_at,timestamp,not null,생성일시";

function escapeSql(value: string) {
  return value.replaceAll("'", "''");
}

function toSnake(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase();
}

function toCamel(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .map((word, index) => (index === 0 ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`))
    .join("");
}

function formatSql(sql: string) {
  return sql
    .replace(/\s+/g, " ")
    .replace(/\b(select|from|where|group by|order by|having|inner join|left join|right join|join|values|set)\b/gi, "\n$1")
    .replace(/,/g, ",\n  ")
    .trim();
}

function csvToRows(input: string) {
  const rows = input.split(/\r?\n/).filter((line) => line.trim());
  const headers = rows[0]?.split(",").map((header) => header.trim()) ?? [];
  return rows.slice(1).map((row) => {
    const values = row.split(",").map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function rowsToInsert(tableName: string, rows: Array<Record<string, string>>) {
  if (rows.length === 0) {
    return "";
  }

  const columns = Object.keys(rows[0]);
  return rows
    .map((row) => {
      const values = columns.map((column) => `'${escapeSql(String(row[column] ?? ""))}'`).join(", ");
      return `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${values});`;
    })
    .join("\n");
}

function columnsToCreateTable(tableName: string, input: string) {
  const columns = input
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const [name = "", type = "varchar(255)", nullable = "", comment = ""] = line.split(",").map((value) => value.trim());
      const nullText = nullable.toLowerCase().includes("not") ? " NOT NULL" : "";
      const commentText = comment ? ` -- ${comment}` : "";
      return `  ${name} ${type}${nullText},${commentText}`;
    });

  return `CREATE TABLE ${tableName} (\n${columns.join("\n").replace(/,$/, "")}\n);`;
}

function convertDialect(input: string, direction: string) {
  if (direction === "oracle-to-postgres") {
    return input
      .replace(/\bNVL\s*\(/gi, "COALESCE(")
      .replace(/\bSYSDATE\b/gi, "CURRENT_TIMESTAMP")
      .replace(/\bVARCHAR2\b/gi, "VARCHAR")
      .replace(/\bNUMBER\b/gi, "NUMERIC")
      .replace(/\bSYSTIMESTAMP\b/gi, "CURRENT_TIMESTAMP");
  }

  return input
    .replace(/\bCOALESCE\s*\(/gi, "NVL(")
    .replace(/\bCURRENT_TIMESTAMP\b/gi, "SYSTIMESTAMP")
    .replace(/\bVARCHAR\b/gi, "VARCHAR2")
    .replace(/\bNUMERIC\b/gi, "NUMBER");
}

function makeSampleRows(tableName: string, input: string) {
  const columns = input.split(/\r?\n/).map((line) => line.split(",")[0]?.trim()).filter(Boolean);
  const rows = Array.from({ length: 5 }, (_, index) =>
    Object.fromEntries(columns.map((column) => [column, `${column}_${String(index + 1).padStart(2, "0")}`])),
  );

  return rowsToInsert(tableName, rows);
}

export default function SqlDbToolsTool() {
  const [mode, setMode] = useState<SqlToolMode>("formatter");
  const [input, setInput] = useState(sampleSql);
  const [tableName, setTableName] = useState("users");
  const [dialectDirection, setDialectDirection] = useState("oracle-to-postgres");
  const [caseDirection, setCaseDirection] = useState("camel-to-snake");

  const output = useMemo(() => {
    if (mode === "formatter") {
      return formatSql(input);
    }

    if (mode === "minifier") {
      return input.replace(/\s+/g, " ").trim();
    }

    if (mode === "insert" || mode === "csvInsert") {
      return rowsToInsert(tableName, csvToRows(input));
    }

    if (mode === "create" || mode === "tableDoc") {
      return columnsToCreateTable(tableName, input);
    }

    if (mode === "jsonInsert") {
      try {
        const parsed = JSON.parse(input) as Array<Record<string, string>> | Record<string, string>;
        return rowsToInsert(tableName, Array.isArray(parsed) ? parsed : [parsed]);
      } catch {
        return "JSON 형식이 올바르지 않습니다.";
      }
    }

    if (mode === "dialect") {
      return convertDialect(input, dialectDirection);
    }

    if (mode === "columnCase") {
      return input
        .split(/\r?\n/)
        .map((line) => (caseDirection === "camel-to-snake" ? toSnake(line) : toCamel(line)))
        .join("\n");
    }

    if (mode === "sample") {
      return makeSampleRows(tableName, input);
    }

    return input
      .split(/\r?\n/)
      .filter((line) => line.trim())
      .map((line) => {
        const [name = "", type = "", nullable = "", comment = ""] = line.split(",").map((value) => value.trim());
        return `${name} | ${type} | ${nullable || "-"} | ${comment || "-"}`;
      })
      .join("\n");
  }, [caseDirection, dialectDirection, input, mode, tableName]);

  function handleModeChange(nextMode: SqlToolMode) {
    setMode(nextMode);

    if (nextMode === "formatter" || nextMode === "minifier" || nextMode === "dialect") {
      setInput(sampleSql);
    } else if (nextMode === "jsonInsert") {
      setInput(sampleJson);
    } else if (nextMode === "insert" || nextMode === "csvInsert") {
      setInput(sampleCsv);
    } else {
      setInput(sampleColumns);
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output).catch(() => undefined);
  }

  return (
    <div className="sw005-sql-tool">
      <label className="sw005-tool-select">
        <span>작업 선택</span>
        <select onChange={(event) => handleModeChange(event.target.value as SqlToolMode)} value={mode}>
          {sqlToolOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="sw005-string-options">
        <input onChange={(event) => setTableName(event.target.value)} placeholder="테이블명" value={tableName} />
        {mode === "dialect" ? (
          <select onChange={(event) => setDialectDirection(event.target.value)} value={dialectDirection}>
            <option value="oracle-to-postgres">Oracle → PostgreSQL</option>
            <option value="postgres-to-oracle">PostgreSQL → Oracle</option>
          </select>
        ) : null}
        {mode === "columnCase" ? (
          <select onChange={(event) => setCaseDirection(event.target.value)} value={caseDirection}>
            <option value="camel-to-snake">Camel Case → Snake Case</option>
            <option value="snake-to-camel">Snake Case → Camel Case</option>
          </select>
        ) : null}
      </div>

      <label>
        <span>Input</span>
        <textarea onChange={(event) => setInput(event.target.value)} spellCheck={false} value={input} />
      </label>

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
