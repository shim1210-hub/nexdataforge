"use client";

import { useState } from "react";

const sampleJson =
  '{"requesterKey":"USER001","requesterEmail":"hcseo17@naver.com","service":"SW_005","enabled":true}';

export default function JsonFormatterTool() {
  const [input, setInput] = useState(sampleJson);
  const [output, setOutput] = useState(JSON.stringify(JSON.parse(sampleJson), null, 2));
  const [status, setStatus] = useState("");

  function formatJson() {
    try {
      const parsedJson = JSON.parse(input);
      setOutput(JSON.stringify(parsedJson, null, 2));
      setStatus("변환 완료");
    } catch {
      setStatus("JSON 형식이 올바르지 않습니다.");
    }
  }

  async function copyOutput() {
    if (!output) {
      setStatus("복사할 결과가 없습니다.");
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setStatus("복사 완료");
    } catch {
      setStatus("복사 권한을 확인해주세요.");
    }
  }

  return (
    <div className="sw005-json-tool">
      <label>
        <span>JSON Input</span>
        <textarea
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleJson}
          spellCheck={false}
          value={input}
        />
      </label>

      <div className="sw005-horizontal-actions">
        <button onClick={formatJson} type="button">
          변환
        </button>
        <button onClick={copyOutput} type="button">
          복사
        </button>
      </div>

      <label>
        <span>Formatted JSON</span>
        <textarea readOnly spellCheck={false} value={output} />
      </label>

      {status ? <p>{status}</p> : null}
    </div>
  );
}
