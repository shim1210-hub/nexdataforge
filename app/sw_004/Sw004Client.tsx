"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PacketRecord } from "./packet-store";

type PacketApiResponse = {
  packets: PacketRecord[];
};

const methodLabels = ["ALL", "GET", "POST", "PATCH", "DELETE", "PUT"];

function formatPacketTime(timestamp: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp));
}

function formatDuration(durationMs: string) {
  const value = Number(durationMs);

  if (!Number.isFinite(value) || value <= 0) {
    return "-";
  }

  return `${Math.round(value)}ms`;
}

function getStatusLabel(packet: PacketRecord) {
  if (packet.error) {
    return "ERR";
  }

  return packet.statusCode || "-";
}

function HeaderDump({
  headers,
  title,
}: {
  headers: Array<{ name: string; value: string }>;
  title: string;
}) {
  if (headers.length === 0) {
    return null;
  }

  return (
    <section className="sw004-header-dump">
      <h3>{title}</h3>
      <div>
        {headers.map((header, index) => (
          <p key={`${header.name}-${index}`}>
            <strong>{header.name}</strong>
            <span>{header.value || "-"}</span>
          </p>
        ))}
      </div>
    </section>
  );
}

export default function Sw004Client() {
  const [activeMethod, setActiveMethod] = useState("ALL");
  const [connectionStatus, setConnectionStatus] = useState("연결 준비 중");
  const [isPaused, setIsPaused] = useState(false);
  const [packets, setPackets] = useState<PacketRecord[]>([]);
  const [selectedPacketId, setSelectedPacketId] = useState("");

  const filteredPackets = useMemo(() => {
    if (activeMethod === "ALL") {
      return packets;
    }

    return packets.filter((packet) => packet.method === activeMethod);
  }, [activeMethod, packets]);

  const selectedPacket = packets.find((packet) => packet.id === selectedPacketId) ?? packets[0];
  const errorCount = packets.filter((packet) => packet.error || Number(packet.statusCode) >= 400).length;
  const browserCount = packets.filter((packet) => packet.source === "chrome-extension").length;
  const averageDuration = useMemo(() => {
    const durations = packets.map((packet) => Number(packet.durationMs)).filter((value) => Number.isFinite(value) && value > 0);

    if (durations.length === 0) {
      return "-";
    }

    return `${Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)}ms`;
  }, [packets]);

  useEffect(() => {
    let isMounted = true;

    fetch("/sw_004/api/packets")
      .then((response) => response.json() as Promise<PacketApiResponse>)
      .then((result) => {
        if (isMounted) {
          setPackets(result.packets);
        }
      })
      .catch(() => {
        if (isMounted) {
          setConnectionStatus("초기 로그 조회 실패");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/sw_004/api/packets/events");

    eventSource.addEventListener("open", () => {
      setConnectionStatus("실시간 수집 중");
    });

    eventSource.addEventListener("snapshot", (event) => {
      if (isPaused) {
        return;
      }

      setPackets(JSON.parse((event as MessageEvent).data) as PacketRecord[]);
    });

    eventSource.addEventListener("packet", (event) => {
      if (isPaused) {
        return;
      }

      const packet = JSON.parse((event as MessageEvent).data) as PacketRecord;

      setPackets((currentPackets) => [packet, ...currentPackets].slice(0, 250));
      setSelectedPacketId(packet.id);
    });

    eventSource.addEventListener("error", () => {
      setConnectionStatus("재연결 대기 중");
    });

    return () => {
      eventSource.close();
    };
  }, [isPaused]);

  async function clearPackets() {
    await fetch("/sw_004/api/packets", {
      method: "DELETE",
    });
    setPackets([]);
    setSelectedPacketId("");
  }

  return (
    <main className="sw001-template-page sw004-template-page">
      <header className="sw001-app-header">
        <div className="sw001-brand">
          <Link className="sw001-brand-mark sw004-brand-mark" href="/" aria-label="홈으로 이동">
            PKT
          </Link>
          <div>
            <strong>SW_004</strong>
            <span>웹 패킷 분석 · 실시간 요청 로그</span>
          </div>
        </div>

        <nav className="sw001-menu" aria-label="SW_004 화면 메뉴">
          <a aria-current="page" className="sw001-menu-button sw004-menu-link" href="#main">
            모니터
          </a>
          <a className="sw001-menu-button sw004-menu-link" href="#packets">
            패킷
          </a>
          <a className="sw001-menu-button sw004-menu-link" href="#detail">
            상세
          </a>
        </nav>
      </header>

      <section id="main" className="sw001-screen sw004-screen" aria-label="SW_004 패킷 분석 화면">
        <div className="sw001-dashboard sw004-dashboard">
          <section className="sw004-hero">
            <div>
              <p>LIVE WEB PACKET MONITOR</p>
              <h1>
                브라우저에서 발생한 HTTP 요청을 <span>실시간으로 수집합니다.</span>
              </h1>
              <strong>
                확장 프로그램을 켜면 다른 탭에서 네이버 같은 외부 사이트를 열 때도 요청 URL, 상태코드,
                응답헤더, 소요시간, 오류 정보를 이 화면에서 확인할 수 있습니다.
              </strong>
            </div>

            <div className="sw004-live-card">
              <span className="sw004-pulse" />
              <strong>{connectionStatus}</strong>
              <p>{isPaused ? "화면 업데이트 일시정지" : "EventSource 연결 활성화"}</p>
            </div>
          </section>

          <section className="sw004-metric-grid" aria-label="패킷 수집 지표">
            <article>
              <span>전체 요청</span>
              <strong>{packets.length}</strong>
            </article>
            <article>
              <span>브라우저 수집</span>
              <strong>{browserCount}</strong>
            </article>
            <article>
              <span>오류/4xx 이상</span>
              <strong>{errorCount}</strong>
            </article>
            <article>
              <span>평균 응답시간</span>
              <strong>{averageDuration}</strong>
            </article>
          </section>

          <div className="sw004-tool-row">
            <div className="sw004-method-tabs" aria-label="HTTP 메서드 필터">
              {methodLabels.map((method) => (
                <button
                  aria-pressed={activeMethod === method}
                  key={method}
                  onClick={() => setActiveMethod(method)}
                  type="button"
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="sw004-actions">
              <button onClick={() => setIsPaused((current) => !current)} type="button">
                {isPaused ? "재개" : "일시정지"}
              </button>
              <button onClick={clearPackets} type="button">
                로그 비우기
              </button>
            </div>
          </div>

          <div className="sw004-main-layout">
            <section id="packets" className="sw001-data-panel">
              <div className="sw001-panel-heading">
                <div>
                  <h2>REQUEST 패킷 목록</h2>
                  <span>최신 요청이 가장 위에 표시됩니다.</span>
                </div>
              </div>

              {filteredPackets.length === 0 ? (
                <div className="sw004-empty">아직 수집된 요청이 없습니다.</div>
              ) : (
                <div className="sw004-packet-list">
                  {filteredPackets.map((packet) => (
                    <button
                      aria-current={selectedPacket?.id === packet.id ? "true" : undefined}
                      key={packet.id}
                      onClick={() => setSelectedPacketId(packet.id)}
                      type="button"
                    >
                      <span>{formatPacketTime(packet.timestamp)}</span>
                      <strong>{packet.method}</strong>
                      <b>{getStatusLabel(packet)}</b>
                      <em>{packet.url || `${packet.pathname}${packet.query}`}</em>
                      <small>{formatDuration(packet.durationMs)}</small>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section id="detail" className="sw001-data-panel">
              <div className="sw001-panel-heading">
                <div>
                  <h2>패킷 상세</h2>
                  <span>선택한 요청과 응답 헤더 요약</span>
                </div>
              </div>

              {selectedPacket ? (
                <>
                  <dl className="sw004-detail-list">
                    <div>
                      <dt>시간</dt>
                      <dd>{new Date(selectedPacket.timestamp).toLocaleString("ko-KR")}</dd>
                    </div>
                    <div>
                      <dt>소스</dt>
                      <dd>{selectedPacket.source || "next-proxy"}</dd>
                    </div>
                    <div>
                      <dt>타입</dt>
                      <dd>{selectedPacket.type || "-"}</dd>
                    </div>
                    <div>
                      <dt>메서드</dt>
                      <dd>{selectedPacket.method}</dd>
                    </div>
                    <div>
                      <dt>상태</dt>
                      <dd>{selectedPacket.statusLine || selectedPacket.statusCode || selectedPacket.error || "-"}</dd>
                    </div>
                    <div>
                      <dt>소요시간</dt>
                      <dd>{formatDuration(selectedPacket.durationMs)}</dd>
                    </div>
                    <div>
                      <dt>URL</dt>
                      <dd>{selectedPacket.url || `${selectedPacket.pathname}${selectedPacket.query}`}</dd>
                    </div>
                    <div>
                      <dt>경로</dt>
                      <dd>{selectedPacket.pathname || "-"}</dd>
                    </div>
                    <div>
                      <dt>Host</dt>
                      <dd>{selectedPacket.host || "-"}</dd>
                    </div>
                    <div>
                      <dt>IP</dt>
                      <dd>{selectedPacket.ip || "-"}</dd>
                    </div>
                    <div>
                      <dt>Cache</dt>
                      <dd>{selectedPacket.fromCache ? "브라우저 캐시" : "-"}</dd>
                    </div>
                    <div>
                      <dt>Content-Type</dt>
                      <dd>{selectedPacket.contentType || "-"}</dd>
                    </div>
                    <div>
                      <dt>Content-Length</dt>
                      <dd>{selectedPacket.contentLength || "0"}</dd>
                    </div>
                    <div>
                      <dt>Referer</dt>
                      <dd>{selectedPacket.referer || "-"}</dd>
                    </div>
                    <div>
                      <dt>User-Agent</dt>
                      <dd>{selectedPacket.userAgent || "-"}</dd>
                    </div>
                    {selectedPacket.error ? (
                      <div>
                        <dt>Error</dt>
                        <dd>{selectedPacket.error}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <HeaderDump headers={selectedPacket.responseHeaders} title="Response Headers" />
                  <HeaderDump headers={selectedPacket.requestHeaders} title="Request Headers" />
                </>
              ) : (
                <div className="sw004-empty">패킷을 선택하면 상세 정보가 표시됩니다.</div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
