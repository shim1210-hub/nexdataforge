"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ReferenceHome.module.css";

type ReferenceStore = {
  id: string;
  category: string | null;
  name: string;
  image_url: string | null;
  event_title: string | null;
  description: string | null;
  latitude: string;
  longitude: string;
  jibun_address: string | null;
  events: Array<{ title: string; description: string | null; eventType: string; endAt: string | null; mapIcon: string | null; status?: string }>;
  coupons?: Array<{ id: string }>;
};
type CategoryOption = { code: string; code_name: string };
type SavedStore = { id: string; name: string; imageUrl: string | null; benefit: string };

function categoryIcon(label: string) {
  if (/한식/.test(label)) return "🍚";
  if (/중식/.test(label)) return "🥟";
  if (/일식/.test(label)) return "🍣";
  if (/양식/.test(label)) return "🍝";
  if (/고기|구이/.test(label)) return "🥩";
  if (/주점|포차|술집/.test(label)) return "🍻";
  if (/카페|디저트|베이커리/.test(label)) return "☕";
  return "🍽️";
}

function eventIcon(label: string) {
  if (/전체/.test(label)) return "🔥";
  if (/가격|할인/.test(label)) return "％";
  if (/주류|술/.test(label)) return "🍻";
  if (/1\+1|증정/.test(label)) return "🎁";
  if (/쿠폰/.test(label)) return "🎟️";
  if (/서비스/.test(label)) return "♡";
  if (/타임/.test(label)) return "◷";
  return "✦";
}

function badgeClass(icon: string) {
  const normalized = icon.toUpperCase().replace(/[^A-Z_]/g, "");
  return normalized === "HOT" || normalized === "BEST" || normalized === "COUPON" || normalized === "FREE" || normalized === "CLOSING_SOON"
    ? `badge_${normalized}`
    : "badge_default";
}

function distanceInMeters(a: number, b: number, c: number, d: number) {
  const r = 6371000;
  const x = (c - a) * Math.PI / 180;
  const y = (d - b) * Math.PI / 180;
  const v = Math.sin(x / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(y / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v));
}

export default function ReferenceHome({
  isLoggedIn = false,
  savedStoreCount = 0,
  savedStores = [],
  onLogin,
  onFavorite,
  onBrowseStores,
}: {
  isLoggedIn?: boolean;
  savedStoreCount?: number;
  savedStores?: SavedStore[];
  onLogin?: () => void;
  onFavorite?: (storeId: string) => void;
  onBrowseStores?: () => void;
}) {
  const [cards, setCards] = useState<ReadonlyArray<readonly [string, string, string, string, string, string, number, number]>>([]);
  const [stores, setStores] = useState<ReferenceStore[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventTypes, setEventTypes] = useState<CategoryOption[]>([]);
  const [selectedEventType, setSelectedEventType] = useState("");
  const [selectedTime, setSelectedTime] = useState("now");
  const [radius, setRadius] = useState("1km");
  const [location, setLocation] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationCenter, setLocationCenter] = useState({ latitude: 37.5036, longitude: 126.7660 });
  const [selectedStoreCenter, setSelectedStoreCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationHistory, setLocationHistory] = useState<Array<{ label: string; latitude: number; longitude: number }>>([]);
  const [locationMessage, setLocationMessage] = useState("");
  const locationHydrated = useRef(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);
  const mapMarkersRef = useRef<any[]>([]);
  const mapOverlaysRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const visibleStores = useMemo(() => {
    const locatedStores = stores.filter((store) => Number.isFinite(Number(store.latitude)) && Number.isFinite(Number(store.longitude)));
    const limit = radius.endsWith("m") ? Number(radius.replace("m", "")) : Number(radius.replace("km", "")) * 1000;
    const regionName = location.match(/[가-힣]+(?:동|읍|면|리)\b/)?.[0] || location.trim().split(/\s+/).filter(Boolean).pop() || "";
    const normalizedRegionName = regionName.replace(/\s/g, "");
    return locatedStores.filter((store) => {
      const normalizedJibunAddress = (store.jibun_address || "").replace(/\s/g, "");
      const sameAdministrativeDong = Boolean(normalizedRegionName && normalizedJibunAddress.includes(normalizedRegionName));
      const withinRadius = distanceInMeters(locationCenter.latitude, locationCenter.longitude, Number(store.latitude), Number(store.longitude)) <= limit;
      return sameAdministrativeDong || withinRadius;
    });
  }, [location, locationCenter, radius, stores]);

  const timeVisibleStores = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999);
    const endOfWeek = new Date(now); endOfWeek.setDate(now.getDate() + 7); endOfWeek.setHours(23, 59, 59, 999);
    return visibleStores.filter((store) => store.events.some((event) => {
      const endAt = event.endAt ? new Date(event.endAt) : null;
      if (selectedTime === "now") return event.status === "ACTIVE" || !endAt || endAt >= now;
      if (!endAt) return false;
      if (selectedTime === "today") return endAt >= now && endAt <= endOfToday;
      if (selectedTime === "week") return endAt >= now && endAt <= endOfWeek;
      return endAt >= now && [0, 6].includes(endAt.getDay());
    }));
  }, [selectedTime, visibleStores]);

  const frequentNeighborhoods = useMemo(() => {
    const counts = new Map<string, number>();
    stores.forEach((store) => {
      const match = (store.jibun_address || "").match(/[가-힣]+동/);
      if (match) counts.set(match[0], (counts.get(match[0]) ?? 0) + 1);
    });
    const popular = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
    const recent = locationHistory.map((item) => {
      const name = item.label.match(/[가-힣]+동/)?.[0] || item.label;
      return { name, count: counts.get(name) ?? 0 };
    });
    const merged = [...recent, ...popular].filter((item, index, list) => list.findIndex((candidate) => candidate.name === item.name) === index);
    return merged.slice(0, 3);
  }, [locationHistory, stores]);

  useEffect(() => {
    const container = document.querySelector(`.${styles.neighborhood}`);
    if (!container || !frequentNeighborhoods.length) return;
    container.replaceChildren(...frequentNeighborhoods.map((item) => {
      const element = document.createElement("b");
      element.textContent = item.name;
      const detail = document.createElement("small");
      detail.textContent = `현재 ${item.count}개 혜택`;
      element.append(detail);
      return element;
    }));
  }, [frequentNeighborhoods]);

  useEffect(() => {
    const statCards = Array.from(document.querySelectorAll(`.${styles.stats} article`));
    const activeEvents = stores.reduce((count, store) => count + store.events.filter((event) => event.status === "ACTIVE").length, 0);
    const coupons = stores.reduce((count, store) => count + (store.coupons?.length || 0), 0);
    const values = [String(activeEvents), String(coupons), isLoggedIn ? String(savedStoreCount) : "로그인"];
    statCards.forEach((card, index) => {
      const value = card.querySelector("b");
      if (value) value.textContent = values[index];
      if (index === 2 && !isLoggedIn) card.classList.add(styles.loginStat);
      if (index === 2 && isLoggedIn) card.classList.remove(styles.loginStat);
    });
  }, [isLoggedIn, savedStoreCount, stores]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("sw002-selected-location");
      if (saved) {
        const parsed = JSON.parse(saved) as { label?: string; latitude?: number; longitude?: number };
        if (parsed.label && Number.isFinite(parsed.latitude) && Number.isFinite(parsed.longitude)) {
          setLocation(parsed.label);
          setLocationCenter({ latitude: parsed.latitude!, longitude: parsed.longitude! });
          setLocationHistory([{ label: parsed.label, latitude: parsed.latitude!, longitude: parsed.longitude! }]);
        }
      }
    } catch { /* ignore invalid local storage */ }
    locationHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!locationHydrated.current || location === "지역을 선택하세요") return;
    window.localStorage.setItem("sw002-selected-location", JSON.stringify({ label: location, ...locationCenter }));
  }, [location, locationCenter]);

  function searchLocation(query = locationSearch) {
    const maps = (window as Window & { kakao?: { maps?: any } }).kakao?.maps;
    if (!maps?.services || !query.trim()) { setLocationMessage("주소를 입력해 주세요."); return; }
    const geocoder = new maps.services.Geocoder();
    geocoder.addressSearch(query.trim(), (result: Array<{ address_name: string; x: string; y: string }>, status: string) => {
      if (status !== maps.services.Status.OK || !result[0]) { setLocationMessage("검색 결과가 없습니다. 주소를 다시 확인해 주세요."); return; }
      const parts = result[0].address_name.split(" ");
      const address = (result[0] as any).address;
      const district = address ? [address.region_2depth_name, address.region_3depth_name, address.region_4depth_name].filter(Boolean).join(" ") : parts.slice(0, 3).join(" ");
      setRadius("1km");
      setLocationCenter({ latitude: Number(result[0].y), longitude: Number(result[0].x) });
      setSelectedStoreCenter(null);
      setLocationHistory((history) => history.some((item) => item.label === district) ? history : [{ label: district, latitude: Number(result[0].y), longitude: Number(result[0].x) }, ...history].slice(0, 5));
      setLocation(district);
      setLocationMessage("");
      setLocationOpen(false);
      setLocationSearch("");
    });
  }

  useEffect(() => {
    const buttons = Array.from(document.querySelectorAll(`.${styles.radius} button`));
    buttons.forEach((button) => button.classList.toggle(styles.active, button.textContent?.trim() === radius));
    const handlers = buttons.map((button) => {
      const handler = () => {
        const nextRadius = button.textContent?.trim() || "500m";
        setRadius(nextRadius);
        buttons.forEach((item) => item.classList.toggle(styles.active, item === button));
      };
      button.addEventListener("click", handler);
      return [button, handler] as const;
    });
    return () => handlers.forEach(([button, handler]) => button.removeEventListener("click", handler));
  }, [radius]);

  useEffect(() => {
    const button = document.querySelector(`.${styles.location}`);
    if (!button) return;
    const label = button.querySelector("b");
    if (label) label.textContent = location;
    const open = () => setLocationOpen(true);
    button.addEventListener("click", open);
    return () => button.removeEventListener("click", open);
  }, [location]);

  useEffect(() => {
    if (!locationOpen) return;
    const options = document.querySelector(`.${styles.locationOptions}`);
    if (!options || options.querySelector(".locationSearch")) return;
    options.querySelectorAll(":scope > button").forEach((button) => button.remove());
    const row = document.createElement("div");
    row.className = styles.locationSearch;
    row.innerHTML = `<input placeholder="주소를 입력하세요"><button>검색</button>`;
    const input = row.querySelector("input") as HTMLInputElement;
    input.addEventListener("input", () => setLocationSearch(input.value));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchLocation(input.value);
      }
    });
    row.querySelector("button")?.addEventListener("click", () => searchLocation(input.value));
    options.prepend(row);
    const message = document.createElement("small");
    message.className = styles.locationMessage;
    options.append(message);
  }, [locationOpen]);

  useEffect(() => {
    const message = document.querySelector(`.${styles.locationMessage}`);
    if (message) message.textContent = locationMessage;
  }, [locationMessage]);

  useEffect(() => {
    if (!locationOpen || !locationHistory.length) return;
    const options = document.querySelector(`.${styles.locationOptions}`);
    if (!options) return;
    let history = options.querySelector(".locationHistory") as HTMLElement | null;
    if (!history) { history = document.createElement("div"); history.className = styles.locationHistory; options.append(history); }
    history.innerHTML = "";
    const heading = document.createElement("small"); heading.textContent = "최근 선택 지역"; heading.className = styles.locationHistoryHeading; history.append(heading);
    locationHistory.forEach((item) => {
      const row = document.createElement("div"); row.className = styles.locationHistoryRow;
      row.innerHTML = `<span>${item.label}${item.label === location ? " · 현재 기준" : ""}</span><button aria-label="${item.label}을 기준 지역으로 선택">+</button>`;
      row.querySelector("button")?.addEventListener("click", () => { setLocation(item.label); setLocationCenter({ latitude: item.latitude, longitude: item.longitude }); setLocationOpen(false); });
      history?.append(row);
    });
  }, [locationHistory, locationOpen]);

  useEffect(() => {
    if (!locationOpen) return;
    const modal = document.querySelector(`.${styles.locationModal}`) as HTMLElement | null;
    const handle = modal?.querySelector("header") as HTMLElement | null;
    if (!modal || !handle) return;
    let dragging = false; let startX = 0; let startY = 0; let offsetX = 0; let offsetY = 0;
    const down = (event: Event) => { const point = event as PointerEvent; if ((point.target as HTMLElement).closest("button")) return; dragging = true; startX = point.clientX - offsetX; startY = point.clientY - offsetY; handle.setPointerCapture(point.pointerId); };
    const move = (event: Event) => { if (!dragging) return; const point = event as PointerEvent; offsetX = point.clientX - startX; offsetY = point.clientY - startY; modal.style.transform = `translate(${offsetX}px, ${offsetY}px)`; };
    const up = () => { dragging = false; };
    handle.style.cursor = "move"; handle.addEventListener("pointerdown", down); handle.addEventListener("pointermove", move); handle.addEventListener("pointerup", up);
    return () => { handle.removeEventListener("pointerdown", down); handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", up); };
  }, [locationOpen]);

  useEffect(() => {
    Promise.all([
      fetch("/sw_002/api/map-stores", { cache: "no-store" }).then((response) => response.json() as Promise<{ stores?: ReferenceStore[] }>),
      fetch("/sw_002/api/store-categories", { cache: "no-store" }).then((response) => response.json() as Promise<{ majorCategories?: CategoryOption[]; eventTypes?: CategoryOption[] }>),
    ])
      .then(([storeResult, categoryResult]) => {
        const loadedStores = storeResult.stores ?? [];
        const loadedCategories = categoryResult.majorCategories ?? [];
        setStores(loadedStores);
        setCategories(loadedCategories);
        setEventTypes(categoryResult.eventTypes ?? []);
        setSelectedCategory("");
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const cardSource = location ? timeVisibleStores : stores;
    const filteredStores = (selectedCategory ? cardSource.filter((store) => store.category === selectedCategory) : cardSource)
      .filter((store) => !selectedEventType || store.events.some((event) => event.eventType === selectedEventType))
      .filter((store) => store.events.length > 0)
      .filter((store) => Boolean(store.image_url))
      .slice(0, 3);
    setCards(filteredStores.map((store) => {
      const event = store.events.find((item) => !selectedEventType || item.eventType === selectedEventType) ?? store.events[0];
      const title = event.title;
      const offer = event?.description?.trim() ? `${title} · ${event.description.trim()}` : title;
      return [store.id, store.name, offer, "주변", store.image_url!, event.mapIcon || "EVENT", Number(store.latitude), Number(store.longitude)] as const;
    }));
  }, [location, selectedCategory, selectedEventType, stores, timeVisibleStores]);

  useEffect(() => {
    return;
    const maps = (window as Window & { kakao?: { maps?: any } }).kakao?.maps;
    const mapElement = document.querySelector(`.${styles.map}`) as HTMLElement | null;
    if (!mapElement || !maps) return;
    maps.load(() => {
      if (!mapElement) return;
      const valid = timeVisibleStores.filter((store) => Number.isFinite(Number(store.latitude)) && Number.isFinite(Number(store.longitude)));
      const center = selectedStoreCenter ?? locationCenter;
      const map = new maps.Map(mapElement, { center: new maps.LatLng(center.latitude, center.longitude), level: radius === "500m" ? 4 : radius === "1km" ? 5 : radius === "3km" ? 6 : 7 });
      const bounds = new maps.LatLngBounds();
      valid.forEach((store) => {
        const position = new maps.LatLng(Number(store.latitude), Number(store.longitude));
        bounds.extend(position);
        const marker = new maps.Marker({ map, position });
        marker.setMap(map);
        maps.event?.addListener?.(marker, "click", () => { setSelectedStoreCenter({ latitude: Number(store.latitude), longitude: Number(store.longitude) }); map.setCenter(position); });
        if (store.events.some((event) => event.status === "ACTIVE") && maps.CustomOverlay) {
          const label = document.createElement("span");
          label.textContent = "진행중";
          label.style.cssText = "display:block;padding:4px 8px;border-radius:999px;background:#20a566;color:#fff;font:700 11px Arial;box-shadow:0 3px 10px #0003;white-space:nowrap";
          new maps.CustomOverlay({ map, position, content: label, yAnchor: 2.1 });
        }
      });
      if (valid.length > 1) map.setBounds(bounds, 35);
      map.setCenter(new maps.LatLng(center.latitude, center.longitude));
      map.setLevel?.(radius === "500m" ? 4 : radius === "1km" ? 5 : radius === "3km" ? 6 : 7);
    });
  }, [locationCenter, radius, selectedStoreCenter, timeVisibleStores]);

  useEffect(() => {
    return;
    let cancelled = false;
    const timer = window.setInterval(() => {
      const maps = (window as Window & { kakao?: { maps?: any } }).kakao?.maps;
      const mapElement = mapRef.current;
      if (cancelled || !maps || !mapElement) return;
      window.clearInterval(timer);
      maps.load(() => {
        if (cancelled) return;
        const first = visibleStores[0];
        const center = selectedStoreCenter ?? locationCenter;
        const map = new maps.Map(mapElement, { center: new maps.LatLng(center.latitude, center.longitude), level: radius === "500m" ? 4 : radius === "1km" ? 5 : radius === "3km" ? 6 : 7 });
        const bounds = new maps.LatLngBounds();
        visibleStores.forEach((store) => {
          const position = new maps.LatLng(Number(store.latitude), Number(store.longitude));
          bounds.extend(position);
          const marker = new maps.Marker({ map, position });
          marker.setMap(map);
          maps.event?.addListener?.(marker, "click", () => { setSelectedStoreCenter({ latitude: Number(store.latitude), longitude: Number(store.longitude) }); map.setCenter(position); });
          if (maps.CustomOverlay) {
            const isActive = store.events.some((event) => event.status === "ACTIVE");
            const label = document.createElement("span");
            label.textContent = isActive ? `진행중 · ${store.name}` : store.name;
            label.style.cssText = `display:block;padding:5px 9px;border:2px solid #fff;border-radius:999px;background:${isActive ? "#20a566" : "#246bfd"};color:#fff;font:700 11px Arial;box-shadow:0 3px 10px #0003;white-space:nowrap;cursor:pointer`;
            label.onclick = () => {
              setSelectedStoreCenter({ latitude: Number(store.latitude), longitude: Number(store.longitude) });
              map.setCenter(position);
            };
            new maps.CustomOverlay({ map, position, content: label, yAnchor: 2.1 });
          }
        });
        if (visibleStores.length > 1) map.setBounds(bounds, 35);
        map.setCenter(new maps.LatLng(center.latitude, center.longitude));
        map.setLevel?.(radius === "500m" ? 4 : radius === "1km" ? 5 : radius === "3km" ? 6 : 7);
      });
    }, 100);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [locationCenter, radius, selectedStoreCenter, visibleStores]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setInterval(() => {
      const maps = (window as Window & { kakao?: { maps?: any } }).kakao?.maps;
      const mapElement = mapRef.current;
      if (cancelled || !maps || !mapElement || kakaoMapRef.current) return;
      window.clearInterval(timer);
      maps.load(() => {
        if (cancelled || kakaoMapRef.current) return;
        kakaoMapRef.current = new maps.Map(mapElement, {
          center: new maps.LatLng(locationCenter.latitude, locationCenter.longitude),
          level: 5,
        });
        setMapReady(true);
      });
    }, 100);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      mapMarkersRef.current.forEach((marker) => marker.setMap(null));
      mapOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
      mapMarkersRef.current = [];
      mapOverlaysRef.current = [];
      kakaoMapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const maps = (window as Window & { kakao?: { maps?: any } }).kakao?.maps;
    const map = kakaoMapRef.current;
    if (!mapReady || !maps || !map) return;

    mapMarkersRef.current.forEach((marker) => marker.setMap(null));
    mapOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
    mapMarkersRef.current = [];
    mapOverlaysRef.current = [];

    visibleStores.forEach((store) => {
      const latitude = Number(store.latitude);
      const longitude = Number(store.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      const position = new maps.LatLng(latitude, longitude);
      const marker = new maps.Marker({ position });
      marker.setMap(map);
      maps.event?.addListener?.(marker, "click", () => setSelectedStoreCenter({ latitude, longitude }));
      mapMarkersRef.current.push(marker);

      const active = store.events.some((event) => event.status === "ACTIVE");
      if (active && maps.CustomOverlay) {
        const label = document.createElement("button");
        label.type = "button";
        label.textContent = "진행중";
        label.style.cssText = "padding:5px 9px;border:2px solid #fff;border-radius:999px;background:#20a566;color:#fff;font:700 11px Arial;box-shadow:0 3px 10px #0003;white-space:nowrap;cursor:pointer";
        label.onclick = () => setSelectedStoreCenter({ latitude, longitude });
        const overlay = new maps.CustomOverlay({ map, position, content: label, yAnchor: 2.1 });
        mapOverlaysRef.current.push(overlay);
      }
    });
  }, [mapReady, visibleStores]);

  useEffect(() => {
    const maps = (window as Window & { kakao?: { maps?: any } }).kakao?.maps;
    const map = kakaoMapRef.current;
    if (!mapReady || !maps || !map) return;
    const center = selectedStoreCenter ?? locationCenter;
    map.setCenter(new maps.LatLng(center.latitude, center.longitude));
    map.setLevel(radius === "500m" ? 4 : radius === "1km" ? 5 : radius === "3km" ? 6 : 7);
  }, [locationCenter, mapReady, radius, selectedStoreCenter]);

  useEffect(() => {
    const maps = (window as Window & { kakao?: { maps?: any } }).kakao?.maps;
    const map = kakaoMapRef.current;
    if (!mapReady || !maps || !map || selectedStoreCenter || !location) return;
    const regionName = location.match(/[가-힣]+(?:동|읍|면|리)/)?.[0] || "";
    const regionStores = visibleStores.filter((store) => regionName && (store.jibun_address || "").replace(/\s/g, "").includes(regionName));
    if (!regionStores.length) return;
    const latitude = regionStores.reduce((sum, store) => sum + Number(store.latitude), 0) / regionStores.length;
    const longitude = regionStores.reduce((sum, store) => sum + Number(store.longitude), 0) / regionStores.length;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    map.setCenter(new maps.LatLng(latitude, longitude));
    map.setLevel(radius === "500m" ? 4 : radius === "1km" ? 5 : radius === "3km" ? 6 : 7);
  }, [location, mapReady, radius, selectedStoreCenter, visibleStores]);

  useEffect(() => {
    const buttons = Array.from(document.querySelectorAll(`.${styles.time} button`)).slice(1) as HTMLButtonElement[];
    const values = ["now", "today", "week", "weekend"];
    buttons.forEach((button, index) => {
      button.classList.toggle(styles.active, values[index] === selectedTime);
      button.onclick = () => setSelectedTime(values[index]);
    });
    return () => buttons.forEach((button) => { button.onclick = null; });
  }, [selectedTime]);

  useEffect(() => {
    const categoryButton = document.querySelector(`.${styles.categoryPlaceholder}`) as HTMLButtonElement | null;
    const allLink = document.querySelector(`.${styles.heading} a`) as HTMLElement | null;
    if (categoryButton) {
      categoryButton.disabled = false;
      categoryButton.onclick = () => onBrowseStores?.();
    }
    if (allLink) {
      allLink.setAttribute("role", "button");
      allLink.tabIndex = 0;
      allLink.onclick = () => onBrowseStores?.();
      allLink.onkeydown = (event) => { if (event.key === "Enter" || event.key === " ") onBrowseStores?.(); };
    }
    return () => {
      if (categoryButton) categoryButton.onclick = null;
      if (allLink) { allLink.onclick = null; allLink.onkeydown = null; }
    };
  }, [onBrowseStores]);

  const activeBenefitCount = stores.reduce(
    (count, store) => count + store.events.filter((event) => event.status === "ACTIVE").length,
    0,
  );
  const availableCouponCount = stores.reduce((count, store) => count + (store.coupons?.length ?? 0), 0);
  const statCards = [
    { icon: "▣", value: activeBenefitCount, title: "진행 혜택", description: "지금 이용 가능" },
    { icon: "▰", value: availableCouponCount, title: "할인 쿠폰", description: "다운로드 가능" },
    { icon: "♥", value: isLoggedIn ? savedStoreCount : 0, title: "찜한 매장", description: isLoggedIn ? "저장된 매장" : "로그인 후 확인" },
  ];

  return <section className={`${styles.page} ${!isLoggedIn ? styles.loggedOut : ""}`}>
    {locationOpen && <div className={styles.locationModalBackdrop} onMouseDown={() => setLocationOpen(false)}><section className={styles.locationModal} onMouseDown={(event) => event.stopPropagation()}><header><div><span>LOCATION</span><h2>기준 지역을 선택하세요</h2><p>상세 주소 없이 동네 단위로 선택합니다.</p></div><button onClick={() => setLocationOpen(false)}>×</button></header><div className={styles.locationOptions}></div></section></div>}
    <div className={styles.hero}><div><h1>우리 동네<br /><em>혜택</em>을 켜는 시간</h1><p>지금 내 주변<br />받을 수 있는 혜택은?</p><small>500m 안의 할인 · 쿠폰 · 타임세일을<br />지금 바로 찾아보세요.</small></div><div className={styles.stats}>{statCards.map((card) => <article key={card.title}><i>{card.icon}</i><b>{card.value}</b><span>{card.title}</span><small>{card.description}</small></article>)}</div></div>
    <div className={styles.controls}><div className={styles.row+" "+styles.time}><button className={styles.location}>📍 <b>{location}</b><span>변경 ›</span></button><button className={styles.active}>🔥 지금 이용 가능</button><button>오늘</button><button>이번 주</button><button>주말</button></div><div className={styles.row+" "+styles.radius}>{["500m","1km","3km","5km"].map((x,i)=><button className={i===0?styles.active:""} key={x}>{x}</button>)}</div><div className={styles.row+" "+styles.category}>{categories.map((item) => <button className={selectedCategory === item.code ? styles.active : ""} key={item.code} onClick={() => setSelectedCategory(selectedCategory === item.code ? "" : item.code)}><i>{categoryIcon(item.code_name)}</i>{item.code_name}</button>)}<button type="button" className={styles.categoryPlaceholder} disabled><i>🍽️</i>기타</button></div><div className={styles.row+" "+styles.benefit}><button className={`${styles.benefitButton} ${!selectedEventType ? styles.active : ""}`} onClick={() => setSelectedEventType("")}><i>{eventIcon("전체 혜택")}</i>전체 혜택</button>{eventTypes.map((item) => <button className={`${styles.benefitButton} ${selectedEventType === item.code ? styles.active : ""}`} key={item.code} onClick={() => setSelectedEventType(selectedEventType === item.code ? "" : item.code)}><i>{eventIcon(item.code_name)}</i>{item.code_name}</button>)}</div></div>
    <div className={styles.heading}><h2>🔥 지금 받을 수 있는 혜택</h2><a>전체보기 ›</a></div><div className={styles.cards}>{cards.map(([storeId,name,offer,distance,image,badge,latitude,longitude])=><article className={styles.card} key={storeId}><div className={styles.photo} style={{backgroundImage:`url(${image})`}}><b className={styles[badgeClass(badge)]}>{badge}</b></div><div className={styles.cardBody}><h3>{name}<small>{distance}</small></h3><p>{offer}</p><footer>🟢 진행중　 ◷ <i>등록 이벤트</i></footer><nav className={styles.actions}><button type="button">🎟 쿠폰받기</button><button type="button" onClick={() => window.open(`https://map.kakao.com/link/to/${encodeURIComponent(name)},${latitude},${longitude}`, "_blank", "noopener,noreferrer")}>⌖ 길찾기</button><button type="button" onClick={() => isLoggedIn ? onFavorite?.(storeId) : onLogin?.()}>♡ 찜</button></nav></div></article>)}</div>
    <div className={styles.heading}><h2>📍 주변 혜택 지도</h2></div><div className={styles.map}><div ref={mapRef} className={styles.mapCanvas} /><span className={styles.legend}>🟢 진행중　 🟠 곧 종료　 🔴 종료 임박　 🟣 쿠폰 사용 가능</span><button className={styles.mapMore} onClick={() => window.open("/sw_002/map", "_blank", "noopener,noreferrer")}>지도 크게보기 ↗</button></div>
    <div className={styles.bottom}><article className={styles.panel}><h2>⭐ 내가 찜한 매장의 새 혜택</h2>{isLoggedIn ? savedStores.length ? savedStores.slice(0, 2).map((store) => <div className={styles.saved} key={store.id}>{store.imageUrl ? <img src={store.imageUrl} alt="" /> : <span className={styles.savedPlaceholder}>STORE</span>}<span><b>{store.name}</b><small>{store.benefit}</small></span></div>) : <div className={styles.savedEmpty}><b>아직 찜한 매장이 없어요</b><small>마음에 드는 매장을 찜하면 새로운 혜택을 빠르게 확인할 수 있어요.</small></div> : <div className={styles.savedLogin}><span>♥</span><b>로그인하고 찜한 매장의 혜택을 확인하세요</b><small>관심 매장을 저장하고 새로운 할인·쿠폰 소식을 한곳에서 받아보세요.</small><button type="button" onClick={onLogin}>고객 로그인</button></div>}</article><article className={styles.panel}><h2>📍 자주 가는 동네　<a>관리 ›</a></h2><div className={styles.neighborhood}></div></article></div>
  </section>;
}

