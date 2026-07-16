const INGEST_URL = "http://localhost:3000/sw_004/api/packets/ingest";
const IGNORED_PROTOCOLS = ["chrome:", "chrome-extension:", "devtools:", "edge:", "about:"];
const IGNORED_PATH_PREFIXES = ["/sw_004/api/packets"];
const pendingRequests = new Map();

function shouldCapture(urlText) {
  try {
    const url = new URL(urlText);

    if (IGNORED_PROTOCOLS.includes(url.protocol)) {
      return false;
    }

    if (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      url.port === "3000" &&
      IGNORED_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function getHeader(headers = [], name) {
  return headers.find((header) => header.name.toLowerCase() === name)?.value ?? "";
}

function normalizeHeaders(headers = []) {
  return headers.map((header) => ({
    name: header.name,
    value: header.value ?? "",
  }));
}

function buildPayload(details, request) {
  const url = new URL(details.url);
  const requestHeaders = request?.requestHeaders ?? [];
  const responseHeaders = request?.responseHeaders ?? [];

  return {
    contentLength: getHeader(responseHeaders, "content-length") || getHeader(requestHeaders, "content-length"),
    contentType: getHeader(responseHeaders, "content-type") || getHeader(requestHeaders, "content-type"),
    durationMs: String(Date.now() - (request?.startedAt ?? Date.now())),
    error: details.error ?? "",
    fromCache: Boolean(details.fromCache),
    host: url.host,
    ip: details.ip ?? request?.ip ?? "",
    method: details.method ?? request?.method ?? "GET",
    pathname: url.pathname,
    query: url.search,
    referer: getHeader(requestHeaders, "referer"),
    requestHeaders,
    responseHeaders,
    source: "chrome-extension",
    statusCode: details.statusCode ? String(details.statusCode) : request?.statusCode ?? "",
    statusLine: details.statusLine ?? request?.statusLine ?? "",
    type: details.type ?? request?.type ?? "",
    url: details.url,
    userAgent: getHeader(requestHeaders, "user-agent"),
  };
}

async function sendPacket(details) {
  if (!shouldCapture(details.url)) {
    return;
  }

  const request = pendingRequests.get(details.requestId);
  pendingRequests.delete(details.requestId);

  await fetch(INGEST_URL, {
    body: JSON.stringify(buildPayload(details, request)),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).catch(() => undefined);
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!shouldCapture(details.url)) {
      return;
    }

    pendingRequests.set(details.requestId, {
      method: details.method,
      startedAt: Date.now(),
      type: details.type,
    });
  },
  { urls: ["<all_urls>"] },
);

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (!shouldCapture(details.url)) {
      return;
    }

    const request = pendingRequests.get(details.requestId) ?? {
      method: details.method,
      startedAt: Date.now(),
      type: details.type,
    };

    pendingRequests.set(details.requestId, {
      ...request,
      requestHeaders: normalizeHeaders(details.requestHeaders),
    });
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"],
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (!shouldCapture(details.url)) {
      return;
    }

    const request = pendingRequests.get(details.requestId) ?? {
      method: details.method,
      startedAt: Date.now(),
      type: details.type,
    };

    pendingRequests.set(details.requestId, {
      ...request,
      ip: details.ip ?? request.ip ?? "",
      responseHeaders: normalizeHeaders(details.responseHeaders),
      statusCode: details.statusCode ? String(details.statusCode) : "",
      statusLine: details.statusLine ?? "",
    });
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
);

chrome.webRequest.onCompleted.addListener(sendPacket, { urls: ["<all_urls>"] });
chrome.webRequest.onErrorOccurred.addListener(sendPacket, { urls: ["<all_urls>"] });
