"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import styles from "./fullMap.module.css";

type StoreEvent = { id: string; title: string; status: string };
type Store = {
  id: string; name: string; category: string | null; address: string; address_detail: string | null;
  jibun_address: string | null; latitude: string; longitude: string; image_url: string | null;
  events: StoreEvent[];
};

export default function FullMapClient({ kakaoJavascriptKey }: { kakaoJavascriptKey: string }) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [radius, setRadius] = useState("1km");
  const [center, setCenter] = useState({ latitude: 37.46835, longitude: 126.82195 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sw002-selected-location") || "{}") as { latitude?: number; longitude?: number };
      if (Number.isFinite(saved.latitude) && Number.isFinite(saved.longitude)) setCenter({ latitude: saved.latitude!, longitude: saved.longitude! });
    } catch {}
    void fetch("/sw_002/api/map-stores", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ stores?: Store[] }>)
      .then((data) => setStores(data.stores ?? []));
  }, []);

  const filteredStores = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return stores.filter((store) => !normalized || `${store.name} ${store.category ?? ""} ${store.jibun_address ?? ""}`.toLowerCase().includes(normalized));
  }, [keyword, stores]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const maps = (window as any).kakao?.maps;
    if (!maps) return;
    markersRef.current.forEach((marker) => marker.setMap(null));
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];
    filteredStores.forEach((store) => {
      const latitude = Number(store.latitude);
      const longitude = Number(store.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      const position = new maps.LatLng(latitude, longitude);
      const marker = new maps.Marker({ map: mapRef.current, position });
      maps.event.addListener(marker, "click", () => {
        setSelectedId(store.id);
        mapRef.current.setCenter(position);
      });
      markersRef.current.push(marker);
      if (store.events.some((event) => event.status === "ACTIVE") && maps.CustomOverlay) {
        const label = document.createElement("span");
        label.textContent = "진행중";
        label.className = styles.activeOverlay;
        const overlay = new maps.CustomOverlay({ map: mapRef.current, position, content: label, yAnchor: 2.1 });
        overlaysRef.current.push(overlay);
      }
    });
  }, [filteredStores, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const maps = (window as any).kakao?.maps;
    mapRef.current.setCenter(new maps.LatLng(center.latitude, center.longitude));
    mapRef.current.setLevel(radius === "500m" ? 4 : radius === "1km" ? 5 : radius === "3km" ? 6 : 7);
  }, [center, radius, ready]);

  const selectedStore = stores.find((store) => store.id === selectedId);

  return <main className={styles.page}>
    {kakaoJavascriptKey && <Script src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(kakaoJavascriptKey)}&autoload=false`} strategy="afterInteractive" onLoad={() => {
      const maps = (window as any).kakao?.maps;
      maps?.load(() => {
        if (!mapElementRef.current || mapRef.current) return;
        mapRef.current = new maps.Map(mapElementRef.current, { center: new maps.LatLng(center.latitude, center.longitude), level: 5 });
        setReady(true);
      });
    }} />}
    <header><div><b>동네온</b><span>주변 혜택 전체 지도</span></div><button onClick={() => window.close()}>창 닫기 ×</button></header>
    <section className={styles.layout}>
      <aside>
        <h1>등록 매장 <b>{filteredStores.length}</b></h1>
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="매장명·업종·동네 검색" />
        <div className={styles.radius}>{["500m","1km","3km","5km"].map((item) => <button key={item} className={radius === item ? styles.active : ""} onClick={() => setRadius(item)}>{item}</button>)}</div>
        <div className={styles.list}>{filteredStores.map((store) => <button key={store.id} className={selectedId === store.id ? styles.selected : ""} onClick={() => { setSelectedId(store.id); setCenter({ latitude: Number(store.latitude), longitude: Number(store.longitude) }); }}><span>{store.image_url ? <img src={store.image_url} alt="" /> : "STORE"}</span><div><b>{store.name}</b><small>{store.jibun_address || store.address}</small><em>{store.events.some((event) => event.status === "ACTIVE") ? "● 진행중" : "등록 매장"}</em></div></button>)}</div>
      </aside>
      <div className={styles.mapWrap}><div ref={mapElementRef} className={styles.map} />{!kakaoJavascriptKey && <p>카카오 지도 키가 설정되지 않았습니다.</p>}{selectedStore && <article className={styles.detail}><button onClick={() => setSelectedId("")}>×</button><b>{selectedStore.name}</b><span>{selectedStore.address}{selectedStore.address_detail ? ` ${selectedStore.address_detail}` : ""}</span><small>{selectedStore.events[0]?.title || "현재 등록된 이벤트가 없습니다."}</small><a href={`https://map.kakao.com/link/to/${encodeURIComponent(selectedStore.name)},${selectedStore.latitude},${selectedStore.longitude}`} target="_blank" rel="noreferrer">카카오맵 길찾기 ↗</a></article>}</div>
    </section>
  </main>;
}
