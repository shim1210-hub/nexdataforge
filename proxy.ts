import { NextResponse, type NextProxy } from "next/server";

const IGNORED_PATH_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/sw_004/api/packets",
];

function shouldCapture(pathname: string) {
  return !IGNORED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const proxy: NextProxy = (request, event) => {
  const response = NextResponse.next();
  const { nextUrl } = request;

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
