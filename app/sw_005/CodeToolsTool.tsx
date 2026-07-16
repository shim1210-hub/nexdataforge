"use client";

import { useMemo, useState } from "react";

type CodeToolMode =
  | "jsFormatter"
  | "htmlFormatter"
  | "cssFormatter"
  | "xmlFormatter"
  | "yamlJson"
  | "markdown"
  | "regexBuilder"
  | "diff"
  | "escape"
  | "qr"
  | "color"
  | "httpRequest";

const codeToolOptions: Array<{ label: string; value: CodeToolMode }> = [
  { label: "JavaScript Formatter", value: "jsFormatter" },
  { label: "HTML Formatter", value: "htmlFormatter" },
  { label: "CSS Formatter", value: "cssFormatter" },
  { label: "XML Formatter", value: "xmlFormatter" },
  { label: "YAML ↔ JSON 변환", value: "yamlJson" },
  { label: "Markdown 미리보기", value: "markdown" },
  { label: "정규식 생성·검사", value: "regexBuilder" },
  { label: "코드 비교 Diff Viewer", value: "diff" },
  { label: "Escape/Unescape", value: "escape" },
  { label: "QR Code 생성", value: "qr" },
  { label: "색상 코드 변환", value: "color" },
  { label: "GET·POST 요청", value: "httpRequest" },
];

const sampleCode = "function hello(){const name='NexDataForge';console.log(name);}";
const sampleMarkdown = "# Title\n\n- item one\n- item two\n\n**bold text**";

function simpleFormat(value: string) {
  return value
    .replace(/([{};>])/g, "$1\n")
    .replace(/(<[^/!][^>]*>)/g, "\n$1")
    .replace(/(<\/[^>]+>)/g, "$1\n")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function yamlToJson(value: string) {
  const result: Record<string, string> = {};
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [key = "", ...rest] = line.split(":");
      result[key.trim()] = rest.join(":").trim();
    });
  return JSON.stringify(result, null, 2);
}

function jsonToYaml(value: string) {
  const parsed = JSON.parse(value) as Record<string, unknown>;
  return Object.entries(parsed)
    .map(([key, item]) => `${key}: ${String(item)}`)
    .join("\n");
}

function markdownToPreview(value: string) {
  return value
    .replace(/^# (.*)$/gm, "H1: $1")
    .replace(/^## (.*)$/gm, "H2: $1")
    .replace(/^\- (.*)$/gm, "• $1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)");
}

function diffLines(left: string, right: string) {
  const leftLines = left.split(/\r?\n/);
  const rightLines = right.split(/\r?\n/);
  const maxLength = Math.max(leftLines.length, rightLines.length);
  const lines: string[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    if (leftLines[index] === rightLines[index]) {
      lines.push(`  ${leftLines[index] ?? ""}`);
    } else {
      if (leftLines[index] !== undefined) {
        lines.push(`- ${leftLines[index]}`);
      }
      if (rightLines[index] !== undefined) {
        lines.push(`+ ${rightLines[index]}`);
      }
    }
  }

  return lines.join("\n");
}

function convertColor(value: string) {
  const hex = value.trim().replace("#", "");

  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return "HEX 색상값을 입력해주세요. 예: #4dd7c8";
  }

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const lightness = (max + min) / 2;
  const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1));
  const hue =
    max === min
      ? 0
      : max === r / 255
        ? 60 * (((g - b) / 255 / (max - min) + 6) % 6)
        : max === g / 255
          ? 60 * ((b - r) / 255 / (max - min) + 2)
          : 60 * ((r - g) / 255 / (max - min) + 4);

  return [`HEX: #${hex.toUpperCase()}`, `RGB: rgb(${r}, ${g}, ${b})`, `HSL: hsl(${Math.round(hue)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`].join("\n");
}

export default function CodeToolsTool() {
  const [mode, setMode] = useState<CodeToolMode>("jsFormatter");
  const [input, setInput] = useState(sampleCode);
  const [secondInput, setSecondInput] = useState("function hello() {\n  console.log('NexDataForge');\n}");
  const [escapeMode, setEscapeMode] = useState("escape");
  const [yamlDirection, setYamlDirection] = useState("json-to-yaml");
  const [regexPattern, setRegexPattern] = useState("[A-Z][a-z]+");
  const [requestMethod, setRequestMethod] = useState("GET");
  const [requestUrl, setRequestUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [requestBody, setRequestBody] = useState('{"title":"NexDataForge","body":"utility","userId":1}');
  const [requestOutput, setRequestOutput] = useState("요청 보내기 버튼을 누르면 결과가 표시됩니다.");

  const output = useMemo(() => {
    try {
      if (mode === "httpRequest") {
        return requestOutput;
      }

      if (mode === "jsFormatter" || mode === "htmlFormatter" || mode === "cssFormatter" || mode === "xmlFormatter") {
        return simpleFormat(input);
      }

      if (mode === "yamlJson") {
        return yamlDirection === "json-to-yaml" ? jsonToYaml(input) : yamlToJson(input);
      }

      if (mode === "markdown") {
        return markdownToPreview(input);
      }

      if (mode === "regexBuilder") {
        const regex = new RegExp(regexPattern, "gm");
        return (input.match(regex) ?? ["매칭 결과가 없습니다."]).join("\n");
      }

      if (mode === "diff") {
        return diffLines(input, secondInput);
      }

      if (mode === "escape") {
        return escapeMode === "escape" ? encodeURIComponent(input) : decodeURIComponent(input);
      }

      if (mode === "qr") {
        return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(input)}`;
      }

      return convertColor(input);
    } catch {
      return "입력값을 확인해주세요.";
    }
  }, [escapeMode, input, mode, regexPattern, requestOutput, secondInput, yamlDirection]);

  function handleModeChange(nextMode: CodeToolMode) {
    setMode(nextMode);

    if (nextMode === "markdown") {
      setInput(sampleMarkdown);
    } else if (nextMode === "yamlJson") {
      setInput('{"name":"NexDataForge","type":"utility"}');
    } else if (nextMode === "color") {
      setInput("#4dd7c8");
    } else if (nextMode === "qr") {
      setInput("https://www.nexdataforge.com/sw_005/");
    } else if (nextMode === "httpRequest") {
      setInput("");
    } else {
      setInput(sampleCode);
    }
  }

  async function sendRequest() {
    setRequestOutput("요청 중...");

    try {
      const response = await fetch(requestUrl, {
        body: requestMethod === "POST" ? requestBody : undefined,
        headers: requestMethod === "POST" ? { "Content-Type": "application/json" } : undefined,
        method: requestMethod,
      });
      const responseText = await response.text();

      setRequestOutput(
        [`Status: ${response.status} ${response.statusText}`, `Content-Type: ${response.headers.get("content-type") ?? "-"}`, "", responseText].join("\n"),
      );
    } catch {
      setRequestOutput("요청 실패: URL, CORS 정책 또는 네트워크 상태를 확인해주세요.");
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output).catch(() => undefined);
  }

  return (
    <div className="sw005-code-tool">
      <label className="sw005-tool-select">
        <span>작업 선택</span>
        <select onChange={(event) => handleModeChange(event.target.value as CodeToolMode)} value={mode}>
          {codeToolOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="sw005-string-options">
        {mode === "yamlJson" ? (
          <select onChange={(event) => setYamlDirection(event.target.value)} value={yamlDirection}>
            <option value="json-to-yaml">JSON → YAML</option>
            <option value="yaml-to-json">YAML → JSON</option>
          </select>
        ) : null}
        {mode === "regexBuilder" ? <input onChange={(event) => setRegexPattern(event.target.value)} placeholder="정규식" value={regexPattern} /> : null}
        {mode === "escape" ? (
          <select onChange={(event) => setEscapeMode(event.target.value)} value={escapeMode}>
            <option value="escape">Escape</option>
            <option value="unescape">Unescape</option>
          </select>
        ) : null}
        {mode === "httpRequest" ? (
          <>
            <select onChange={(event) => setRequestMethod(event.target.value)} value={requestMethod}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input onChange={(event) => setRequestUrl(event.target.value)} placeholder="Request URL" value={requestUrl} />
          </>
        ) : null}
      </div>

      {mode === "httpRequest" ? (
        <label>
          <span>Request Body</span>
          <textarea disabled={requestMethod === "GET"} onChange={(event) => setRequestBody(event.target.value)} spellCheck={false} value={requestMethod === "GET" ? "" : requestBody} />
        </label>
      ) : (
        <label>
          <span>Input</span>
          <textarea onChange={(event) => setInput(event.target.value)} spellCheck={false} value={input} />
        </label>
      )}

      {mode === "diff" ? (
        <label>
          <span>Compare Target</span>
          <textarea onChange={(event) => setSecondInput(event.target.value)} spellCheck={false} value={secondInput} />
        </label>
      ) : null}

      <div className="sw005-horizontal-actions">
        {mode === "httpRequest" ? (
          <button onClick={sendRequest} type="button">
            요청 보내기
          </button>
        ) : null}
        <button onClick={copyOutput} type="button">
          결과 복사
        </button>
      </div>

      <label>
        <span>{mode === "qr" ? "QR Code URL" : "Output"}</span>
        <textarea readOnly spellCheck={false} value={output} />
      </label>

      {mode === "qr" ? (
        <div className="sw005-qr-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="생성된 QR Code" src={output} />
        </div>
      ) : null}
    </div>
  );
}
