"use client";

import { useMemo, useState } from "react";

function buildHorizontalValue(input: string) {
  return input
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => `'${value.replaceAll("'", "\\'")}'`)
    .join(", ");
}

export default function HorizontalViewTool() {
  const [input, setInput] = useState("값1\n값2\n값3");
  const [output, setOutput] = useState("('값1', '값2', '값3')");
  const [copyStatus, setCopyStatus] = useState("");

  const inputCount = useMemo(
    () => input.split(/\r?\n/).map((value) => value.trim()).filter(Boolean).length,
    [input],
  );

  function convertToHorizontal() {
    const convertedValue = buildHorizontalValue(input);
    setOutput(convertedValue ? `(${convertedValue})` : "");
    setCopyStatus("");
  }

  async function copyOutput() {
    if (!output) {
      setCopyStatus("복사할 결과가 없습니다.");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("복사 완료");
    } catch {
      setCopyStatus("복사 권한을 확인해주세요.");
    }
  }

  return (
    <div className="sw005-horizontal-tool">
      <label>
        <span>Vertical Input</span>
        <textarea
          onChange={(event) => setInput(event.target.value)}
          placeholder={"값1\n값2\n값3"}
          spellCheck={false}
          value={input}
        />
      </label>

      <div className="sw005-horizontal-actions">
        <button onClick={convertToHorizontal} type="button">
          변환
        </button>
        <button onClick={copyOutput} type="button">
          복사
        </button>
        <span>{inputCount}개 항목</span>
      </div>

      <label>
        <span>Horizontal Output</span>
        <textarea readOnly spellCheck={false} value={output} />
      </label>

      {copyStatus ? <p>{copyStatus}</p> : null}
    </div>
  );
}
