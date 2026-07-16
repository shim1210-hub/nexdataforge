export type PacketRecord = {
  contentLength: string;
  contentType: string;
  durationMs: string;
  error: string;
  fromCache: boolean;
  host: string;
  id: string;
  ip: string;
  method: string;
  pathname: string;
  query: string;
  referer: string;
  requestHeaders: Array<{ name: string; value: string }>;
  responseHeaders: Array<{ name: string; value: string }>;
  source: string;
  statusCode: string;
  statusLine: string;
  timestamp: string;
  type: string;
  url: string;
  userAgent: string;
};

type PacketStore = {
  listeners: Set<(packet: PacketRecord) => void>;
  packets: PacketRecord[];
};

const MAX_PACKET_COUNT = 250;

const globalPacketStore = globalThis as typeof globalThis & {
  __sw004PacketStore?: PacketStore;
};

function getStore() {
  if (!globalPacketStore.__sw004PacketStore) {
    globalPacketStore.__sw004PacketStore = {
      listeners: new Set(),
      packets: [],
    };
  }

  return globalPacketStore.__sw004PacketStore;
}

export function getPackets() {
  return getStore().packets;
}

export function clearPackets() {
  getStore().packets = [];
}

export function addPacket(packet: Omit<PacketRecord, "id" | "timestamp">) {
  const store = getStore();
  const packetRecord: PacketRecord = {
    ...packet,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
  };

  store.packets = [packetRecord, ...store.packets].slice(0, MAX_PACKET_COUNT);
  store.listeners.forEach((listener) => listener(packetRecord));

  return packetRecord;
}

export function subscribePackets(listener: (packet: PacketRecord) => void) {
  const store = getStore();

  store.listeners.add(listener);

  return () => {
    store.listeners.delete(listener);
  };
}
