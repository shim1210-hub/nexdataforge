import { getPackets, subscribePackets } from "@/app/sw_004/packet-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function encodeSse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET() {
  const encoder = new TextEncoder();
  let pingInterval: ReturnType<typeof setInterval> | undefined;
  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(encodeSse("snapshot", getPackets())));

      unsubscribe = subscribePackets((packet) => {
        controller.enqueue(encoder.encode(encodeSse("packet", packet)));
      });

      pingInterval = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15000);
    },
    cancel() {
      unsubscribe?.();

      if (pingInterval) {
        clearInterval(pingInterval);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
    },
  });
}
