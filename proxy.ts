import { NextResponse, type NextProxy } from "next/server";

const IGNORED_PATH_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/sw_004/api/packets",
];

function shouldCapture(pathname: string) {
  return !IGNORED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function base64Url(bytes: ArrayBuffer) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

type ProxySession = { expiresAt?: number; accessLevel?: "SUPER_ADMIN" | "SITE_USER"; companySlug?: string | null };

async function getValidSw006Session(request: Parameters<NextProxy>[0]): Promise<ProxySession | null> {
  const token = request.cookies.get("sw006_session")?.value;
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const secret = process.env.SW006_SESSION_SECRET || process.env.DATABASE_URL || "sw006-development-session-secret";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  if (expected !== suppliedSignature) return null;
  try {
    const normalized = payload.replaceAll("-", "+").replaceAll("_", "/");
    const session = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="))) as ProxySession;
    return typeof session.expiresAt === "number" && session.expiresAt > Date.now() ? session : null;
  } catch { return null; }
}

export const proxy: NextProxy = async (request, event) => {
  const response = NextResponse.next();
  const { nextUrl } = request;

  if (nextUrl.pathname.startsWith("/sw_006/api/") && nextUrl.pathname !== "/sw_006/api/auth") {
    const session = await getValidSw006Session(request);
    if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (session.accessLevel === "SITE_USER") {
      const contentApis = new Set(["/sw_006/api/sites", "/sw_006/api/boards", "/sw_006/api/posts"]);
      const readOnlyApi = nextUrl.pathname === "/sw_006/api/sites" || nextUrl.pathname === "/sw_006/api/boards";
      if (!contentApis.has(nextUrl.pathname) || (readOnlyApi && request.method !== "GET")) {
        return NextResponse.json({ error: "사이트 관리자는 콘텐츠 관리 기능만 사용할 수 있습니다." }, { status: 403 });
      }
    }
  }

  if (!shouldCapture(nextUrl.pathname)) {
    return response;
  }

  event.waitUntil(
    fetch(new URL("/sw_004/api/packets/ingest", request.url), {
      body: JSON.stringify({
        contentLength: request.headers.get("content-length") ?? "",
        contentType: request.headers.get("content-type") ?? "",
        durationMs: "",
        error: "",
        fromCache: false,
        host: request.headers.get("host") ?? "",
        ip: "",
        method: request.method,
        pathname: nextUrl.pathname,
        query: nextUrl.search,
        referer: request.headers.get("referer") ?? "",
        requestHeaders: Array.from(request.headers.entries()).map(([name, value]) => ({ name, value })),
        responseHeaders: [],
        source: "next-proxy",
        statusCode: "",
        statusLine: "",
        type: "next-route",
        url: request.url,
        userAgent: request.headers.get("user-agent") ?? "",
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    }).catch(() => undefined),
  );

  return response;
};

export const config = {
  matcher: "/:path*",
};
