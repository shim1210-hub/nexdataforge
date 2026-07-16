import { addPacket } from "@/app/sw_004/packet-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PacketPayload = {
  contentLength?: string;
  contentType?: string;
  durationMs?: string;
  error?: string;
  fromCache?: boolean;
  host?: string;
  ip?: string;
  method?: string;
  pathname?: string;
  query?: string;
  referer?: string;
  requestHeaders?: Array<{ name: string; value: string }>;
  responseHeaders?: Array<{ name: string; value: string }>;
  source?: string;
  statusCode?: string;
  statusLine?: string;
  type?: string;
  url?: string;
  userAgent?: string;
};

function normalizePacketValue(value: string | undefined) {
  return value?.trim() ?? "";
}

export async function POST(request: Request) {
  const payload = (await request.json()) as PacketPayload;
  const packet = addPacket({
    contentLength: normalizePacketValue(payload.contentLength),
    contentType: normalizePacketValue(payload.contentType),
    durationMs: normalizePacketValue(payload.durationMs),
    error: normalizePacketValue(payload.error),
    fromCache: Boolean(payload.fromCache),
    host: normalizePacketValue(payload.host),
    ip: normalizePacketValue(payload.ip),
    method: normalizePacketValue(payload.method),
    pathname: normalizePacketValue(payload.pathname),
    query: normalizePacketValue(payload.query),
    referer: normalizePacketValue(payload.referer),
    requestHeaders: payload.requestHeaders ?? [],
    responseHeaders: payload.responseHeaders ?? [],
    source: normalizePacketValue(payload.source),
    statusCode: normalizePacketValue(payload.statusCode),
    statusLine: normalizePacketValue(payload.statusLine),
    type: normalizePacketValue(payload.type),
    url: normalizePacketValue(payload.url),
    userAgent: normalizePacketValue(payload.userAgent),
  });

  return Response.json({ ok: true, packet });
}
