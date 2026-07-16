"use client";

import { useMemo, useState } from "react";

type ToolMode =
  | "case"
  | "trim"
  | "dedupe"
  | "removeBlank"
  | "sort"
  | "count"
  | "compare"
  | "regex"
  | "replace"
  | "naming"
  | "encoding";

const toolOptions: Array<{ label: string; value: ToolMode }> = [
  { label: "대문자·소문자 변환", value: "case" },
  { label: "앞뒤 공백 제거", value: "trim" },
  { label: "중복 줄 제거", value: "dedupe" },
  { label: "빈 줄 제거", value: "removeBlank" },
  { label: "문자열 정렬", value: "sort" },
  { label: "단어·문자·줄 수 계산", value: "count" },
  { label: "문자열 비교", value: "compare" },
  { label: "정규식 테스트", value: "regex" },
  { label: "Find & Replace", value: "replace" },
  { label: "Camel Case, Snake Case, Kebab Case 변환", value: "naming" },
  { label: "인코딩/디코딩", value: "encoding" },
];

function toWords(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^\p{L}\p{N}]+/u)
    .map((word) => word.trim())
    .filter(Boolean);
}

function toCamelCase(value: string) {
  return toWords(value)
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      return index === 0 ? lowerWord : `${lowerWord.charAt(0).toUpperCase()}${lowerWord.slice(1)}`;
    })
    .join("");
}

function toSnakeCase(value: string) {
  return toWords(value).map((word) => word.toLowerCase()).join("_");
}

function toKebabCase(value: string) {
  return toWords(value).map((word) => word.toLowerCase()).join("-");
}

function textToBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  return btoa(String.fromCodePoint(...bytes));
}

function base64ToText(value: string) {
  const binary = atob(value.trim());
  const bytes = Uint8Array.from(binary, (character) => character.codePointAt(0) ?? 0);
  return new TextDecoder().decode(bytes);
}

function textToUtf8Hex(value: string) {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");
}

function utf8HexToText(value: string) {
  const bytes = value
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((item) => Number.parseInt(item.replace(/^0x/i, ""), 16));
  return new TextDecoder().decode(Uint8Array.from(bytes));
}

export default function StringToolsTool() {
  const [mode, setMode] = useState<ToolMode>("case");
  const [input, setInput] = useState("NexDataForge\nutility tools\nUtility Tools");
  const [compareInput, setCompareInput] = useState("NexDataForge\nutility tools");
  const [findValue, setFindValue] = useState("Utility");
  const [replaceValue, setReplaceValue] = useState("String");
  const [regexValue, setRegexValue] = useState("[A-Z][a-z]+");
  const [caseMode, setCaseMode] = useState("upper");
  const [sortMode, setSortMode] = useState("asc");
  const [namingMode, setNamingMode] = useState("camel");
  const [encodingType, setEncodingType] = useState("base64");
  const [encodingDirection, setEncodingDirection] = useState("encode");

  const output = useMemo(() => {
    const lines = input.split(/\r?\n/);

    if (mode === "case") {
      return caseMode === "upper" ? input.toUpperCase() : input.toLowerCase();
    }

    if (mode === "trim") {
      return lines.map((line) => line.trim()).join("\n");
    }

    if (mode === "dedupe") {
      return Array.from(new Set(lines)).join("\n");
    }

    if (mode === "removeBlank") {
      return lines.filter((line) => line.trim()).join("\n");
    }

    if (mode === "sort") {
      return [...lines].sort((a, b) => (sortMode === "asc" ? a.localeCompare(b) : b.localeCompare(a))).join("\n");
    }

    if (mode === "count") {
      const words = input.trim() ? input.trim().split(/\s+/).length : 0;
      return [`문자 수: ${input.length}`, `공백 제외 문자 수: ${input.replace(/\s/g, "").length}`, `단어 수: ${words}`, `줄 수: ${lines.length}`].join("\n");
    }

    if (mode === "compare") {
      return input === compareInput ? "두 문자열이 같습니다." : "두 문자열이 다릅니다.";
    }

    if (mode === "regex") {
      try {
        const regex = new RegExp(regexValue, "gm");
        const matches = input.match(regex) ?? [];
        return matches.length > 0 ? matches.join("\n") : "매칭 결과가 없습니다.";
      } catch {
        return "정규식 형식이 올바르지 않습니다.";
      }
    }

    if (mode === "replace") {
      return input.replaceAll(findValue, replaceValue);
    }

    if (mode === "encoding") {
      try {
        if (encodingType === "url") {
          return encodingDirection === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
        }

        if (encodingType === "utf8") {
          return encodingDirection === "encode" ? textToUtf8Hex(input) : utf8HexToText(input);
        }

        return encodingDirection === "encode" ? textToBase64(input) : base64ToText(input);
      } catch {
        return "인코딩/디코딩 입력값을 확인해주세요.";
      }
    }

    if (namingMode === "snake") {
      return toSnakeCase(input);
    }

    if (namingMode === "kebab") {
      return toKebabCase(input);
    }

    return toCamelCase(input);
  }, [caseMode, compareInput, encodingDirection, encodingType, findValue, input, mode, namingMode, regexValue, replaceValue, sortMode]);

  async function copyOutput() {
    await navigator.clipboard.writeText(output).catch(() => undefined);
  }

  return (
    <div className="sw005-string-tool">
      <label className="sw005-tool-select">
        <span>작업 선택</span>
        <select onChange={(event) => setMode(event.target.value as ToolMode)} value={mode}>
          {toolOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="sw005-string-options">
        {mode === "case" ? (
          <select onChange={(event) => setCaseMode(event.target.value)} value={caseMode}>
            <option value="upper">대문자</option>
            <option value="lower">소문자</option>
          </select>
        ) : null}
        {mode === "sort" ? (
          <select onChange={(event) => setSortMode(event.target.value)} value={sortMode}>
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        ) : null}
        {mode === "naming" ? (
          <select onChange={(event) => setNamingMode(event.target.value)} value={namingMode}>
            <option value="camel">Camel Case</option>
            <option value="snake">Snake Case</option>
            <option value="kebab">Kebab Case</option>
          </select>
        ) : null}
        {mode === "regex" ? <input onChange={(event) => setRegexValue(event.target.value)} placeholder="정규식" value={regexValue} /> : null}
        {mode === "replace" ? (
          <>
            <input onChange={(event) => setFindValue(event.target.value)} placeholder="Find" value={findValue} />
            <input onChange={(event) => setReplaceValue(event.target.value)} placeholder="Replace" value={replaceValue} />
          </>
        ) : null}
        {mode === "encoding" ? (
          <>
            <select onChange={(event) => setEncodingType(event.target.value)} value={encodingType}>
              <option value="utf8">UTF-8</option>
              <option value="base64">Base64</option>
              <option value="url">URL Encoding</option>
            </select>
            <select onChange={(event) => setEncodingDirection(event.target.value)} value={encodingDirection}>
              <option value="encode">인코딩</option>
              <option value="decode">디코딩</option>
            </select>
          </>
        ) : null}
      </div>

      <label>
        <span>Input</span>
        <textarea onChange={(event) => setInput(event.target.value)} spellCheck={false} value={input} />
      </label>

      {mode === "compare" ? (
        <label>
          <span>Compare Target</span>
          <textarea onChange={(event) => setCompareInput(event.target.value)} spellCheck={false} value={compareInput} />
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
