import { clearPackets, getPackets } from "@/app/sw_004/packet-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    packets: getPackets(),
    total: getPackets().length,
  });
}

export async function DELETE() {
  clearPackets();

  return Response.json({
    ok: true,
    packets: [],
    total: 0,
  });
}
