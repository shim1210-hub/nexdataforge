"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import styles from "./management.module.css";
import storeStyles from "./storeEditor.module.css";

type PostcodeResult = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  address: string;
  userSelectedType: "R" | "J";
};

type PostcodeWindow = Window & {
  kakao?: {
    Postcode: new (options: { oncomplete: (data: PostcodeResult) => void }) => { open: () => void };
    maps?: { load?: (callback: () => void) => void; services?: { Geocoder: new () => { addressSearch: (address: string, callback: (result: Array<{ x: string; y: string }>, status: string) => void) => void }; Status: { OK: string } } };
  };
};

type Mode = "partner" | "admin";
type PartnerSection = "dashboard" | "store" | "menus" | "events" | "coupons" | "stats" | "store-manage";
type AdminSection = "dashboard" | "stores" | "events" | "push" | "stats" | "users";
type Section = PartnerSection | AdminSection;
type OperatorUser = { id: string; email: string; nickname: string | null; role: "ADMIN" | "STORE_MANAGER" };

type StoreRecord = {
  id: string;
  name: string;
  category: string;
  category2: string | null;
  description: string | null;
  phone: string | null;
  zip_cd: string | null;
  address: string;
  address_detail: string | null;
  latitude: string | null;
  longitude: string | null;
  opening_hours: { open?: string; close?: string } | null;
  image_url: string | null;
};

type MenuRecord = {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  is_main: boolean;
  is_visible: boolean;
  sort_order: number;
};

type EventRecord = {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  event_type: string;
  map_icon: string;
  start_at: string;
  end_at: string;
  priority: number;
  status: string;
  view_count: string;
};
type EventTypeOption = { code: string; code_name: string };
type CommonCodeOption = { code: string; code_name: string; parent_grp_cd?: string | null };

function eventDateTime(data: FormData, name: "start" | "end") {
  const date = String(data.get(name) ?? "");
  const time = String(data.get(`${name}Time`) ?? "00:00");
  return date.includes("T") ? date : `${date}T${time}`;
}

type CouponRecord = {
  id: string;
  store_id: string;
  event_id: string | null;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  minimum_order_amount: number;
  start_at: string;
  end_at: string;
  total_quantity: number | null;
  issued_quantity: number;
  used_quantity: number;
  per_user_limit: number;
  status: string;
  image_url: string | null;
};

const businessTimeOptions = Array.from({ length: 96 }, (_, index) => {
  const hours = String(Math.floor(index / 4)).padStart(2, "0");
  const minutes = String((index % 4) * 15).padStart(2, "0");
  return `${hours}:${minutes}`;
});

const eventTypeLabels: Record<string, string> = { DISCOUNT: "할인", SOJU: "주류 행사", TIME_SALE: "타임세일", SERVICE: "서비스", RECOMMEND: "추천" };
const eventStatusLabels: Record<string, string> = { DRAFT: "작성중", SCHEDULED: "예약", ACTIVE: "진행중", ENDED: "종료", SUSPENDED: "중지" };
const couponStatusLabels: Record<string, string> = { DRAFT: "작성중", SCHEDULED: "예약", ACTIVE: "사용중", ENDED: "종료", SUSPENDED: "중지" };

const initialEvents = [
  { id: 1, title: "저녁 메뉴 20% 할인", type: "할인", period: "07.15 - 07.31", status: "진행중", icon: "HOT" },
  { id: 2, title: "메인 메뉴 주문 시 음료 무료", type: "서비스", period: "07.20 - 08.05", status: "예약", icon: "BEST" },
  { id: 3, title: "평일 오후 타임세일", type: "타임세일", period: "07.01 - 07.18", status: "종료", icon: "TIME" },
];

const stores = [
  { name: "성수 화로", owner: "김성수", category: "한식", status: "정상", events: 2, location: "서울 성동구" },
  { name: "오후의 식탁", owner: "이오후", category: "카페", status: "정상", events: 3, location: "서울 성동구" },
  { name: "바삭한 밤", owner: "박바삭", category: "치킨", status: "검토중", events: 1, location: "서울 광진구" },
  { name: "골목포차", owner: "최골목", category: "술집", status: "정상", events: 1, location: "서울 성동구" },
];

const partnerNav: { id: PartnerSection; label: string; icon: string }[] = [
  { id: "dashboard", label: "대시보드", icon: "⌂" }, { id: "store", label: "매장 정보", icon: "▣" }, { id: "menus", label: "음식메뉴 관리", icon: "☷" }, { id: "events", label: "이벤트 관리", icon: "◇" }, { id: "coupons", label: "쿠폰 관리", icon: "▰" }, { id: "stats", label: "성과 통계", icon: "↗" },
];
const adminNav: { id: AdminSection; label: string; icon: string }[] = [
  { id: "dashboard", label: "통합 대시보드", icon: "⌂" }, { id: "stores", label: "업체 관리", icon: "▣" }, { id: "events", label: "이벤트 모니터링", icon: "◇" }, { id: "push", label: "푸시 관리", icon: "◁" }, { id: "stats", label: "서비스 통계", icon: "↗" }, { id: "users", label: "사용자 관리", icon: "○" },
];

export default function ManagementPortal({ mode, kakaoJavascriptKey }: { mode: Mode; kakaoJavascriptKey?: string }) {
  const [user, setUser] = useState<OperatorUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/sw_002/api/operator-auth", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { user?: OperatorUser | null }) => {
        const expectedRole = mode === "admin" ? "ADMIN" : "STORE_MANAGER";
        setUser(result.user?.role === expectedRole ? result.user : null);
      })
      .finally(() => setChecking(false));
  }, [mode]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError("");
    const response = await fetch("/sw_002/api/operator-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, email: data.get("email"), password: data.get("password") }),
    });
    const result = await response.json() as { user?: OperatorUser; error?: string };
    if (!response.ok || !result.user) return setError(result.error ?? "로그인하지 못했습니다.");
    setUser(result.user);
  }

  async function logout() {
    // Use a browser navigation so cookie deletion is completed by the browser
    // even when an in-page fetch is stalled by the current server connection.
    window.location.assign(`/sw_002/api/operator-auth?logout=1&return=${mode}`);
  }

  if (checking) return <main className={styles.operatorGate}><p>운영자 권한을 확인하고 있습니다.</p></main>;
  if (!user) return <main className={styles.operatorGate}><form onSubmit={login}><Link href="/sw_002" className={styles.gateBrand}>동네온 고객 홈</Link><span>{mode === "admin" ? "PLATFORM ADMIN" : "STORE MANAGER"}</span><h1>{mode === "admin" ? "통합관리자 로그인" : "매장관리자 로그인"}</h1><p>고객 계정과 분리된 {mode === "admin" ? "통합관리자" : "매장관리자"} 전용 계정으로 로그인해 주세요.</p><label>운영자 이메일<input name="email" type="email" required /></label><label>운영자 비밀번호<input name="password" type="password" required /></label>{error && <em>{error}</em>}<button>운영자 로그인</button></form></main>;
  return <ManagementPortalContent mode={mode} onLogout={logout} kakaoJavascriptKey={kakaoJavascriptKey} />;
}

function ManagementPortalContent({ mode, onLogout, kakaoJavascriptKey }: { mode: Mode; onLogout: () => Promise<void>; kakaoJavascriptKey?: string }) {
  // Both operator roles use the same management workspace. The API applies
  // the data scope: store managers receive their assigned stores, while
  // administrators receive every store.
  const nav = mode === "admin"
    ? [
        ...partnerNav.filter((item) => item.id !== "store"),
      ].flatMap((item, index) => index === 0
        ? [item, { id: "store-manage" as const, label: "매장정보관리", icon: "▦" }]
        : [item])
    : partnerNav.filter((item) => item.id !== "stats");
  const [section, setSection] = useState<Section>("dashboard");
  const [storeList, setStoreList] = useState<StoreRecord[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [modal, setModal] = useState<"menu" | "menu-edit" | "event" | "event-edit" | "coupon" | "coupon-edit" | "push" | null>(null);
  const [editingMenu, setEditingMenu] = useState<MenuRecord | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<CouponRecord | null>(null);
  const [toast, setToast] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [managedStoreId, setManagedStoreId] = useState<string | null>(null);
  const title = nav.find((item) => item.id === section)?.label ?? "대시보드";
  const isPartner = mode === "partner";
  const selectedStore = storeList.find((store) => store.id === selectedStoreId) ?? null;

  const notify = useCallback((message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2300); }, []);
  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } catch {
      setLoggingOut(false);
      notify("로그아웃 처리에 실패했습니다. 다시 시도해 주세요.");
    }
  }

  useEffect(() => {
    fetch("/sw_002/api/stores", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { stores?: StoreRecord[]; error?: string };
        if (!response.ok) throw new Error(result.error || "매장 목록을 불러오지 못했습니다.");
        return result.stores ?? [];
      })
      .then((loadedStores) => {
        setStoreList(loadedStores);
        setSelectedStoreId((current) => current && loadedStores.some((store) => store.id === current) ? current : loadedStores[0]?.id ?? null);
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "매장 목록을 불러오지 못했습니다."));
  }, [notify]);

  useEffect(() => {
    if (!selectedStoreId) return;
    fetch(`/sw_002/api/menus?storeId=${encodeURIComponent(selectedStoreId)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { menus?: MenuRecord[]; error?: string };
        if (!response.ok) throw new Error(result.error || "음식메뉴를 불러오지 못했습니다.");
        setMenus(result.menus ?? []);
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "음식메뉴를 불러오지 못했습니다."));
  }, [selectedStoreId, notify]);

  useEffect(() => {
    if (!selectedStoreId) return;
    fetch(`/sw_002/api/coupons?storeId=${encodeURIComponent(selectedStoreId)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { coupons?: CouponRecord[]; error?: string };
        if (!response.ok) throw new Error(result.error || "쿠폰을 불러오지 못했습니다.");
        setCoupons(result.coupons ?? []);
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "쿠폰을 불러오지 못했습니다."));
  }, [selectedStoreId, notify]);

  useEffect(() => {
    if (!selectedStoreId) return;
    fetch(`/sw_002/api/events?storeId=${encodeURIComponent(selectedStoreId)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as { events?: EventRecord[]; error?: string };
        if (!response.ok) throw new Error(result.error || "이벤트를 불러오지 못했습니다.");
        setEvents(result.events ?? []);
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "이벤트를 불러오지 못했습니다."));
  }, [selectedStoreId, notify]);

  useEffect(() => {
    if (modal !== "event" && modal !== "event-edit") return;
    const startElement = document.querySelector('input[name="start"]') as HTMLInputElement | null;
    const form = startElement?.form ?? null;
    if (!form) return;
    const typeSelect = form.elements.namedItem("type") as HTMLSelectElement | null;
    const startInput = form.elements.namedItem("start") as HTMLInputElement | null;
    const endInput = form.elements.namedItem("end") as HTMLInputElement | null;
    if (!typeSelect || !startInput || !endInput) return;
    void fetch("/sw_002/api/events?storeId=" + encodeURIComponent(selectedStoreId ?? ""), { cache: "no-store" })
      .then((response) => response.json() as Promise<{ eventTypes?: EventTypeOption[] }>)
      .then((result) => {
        if (result.eventTypes?.length) {
          const current = typeSelect.value;
          typeSelect.replaceChildren(...result.eventTypes.map((item) => new Option(item.code_name, item.code)));
          typeSelect.value = result.eventTypes.some((item) => item.code === current) ? current : result.eventTypes[0].code;
        }
      });
    const addTimeInput = (dateInput: HTMLInputElement, name: "start" | "end", value = "") => {
      const existing = form.elements.namedItem(`${name}Time`) as HTMLInputElement | null;
      if (existing) return existing;
      const timeInput = document.createElement("input");
      timeInput.type = "time";
      timeInput.name = `${name}Time`;
      timeInput.required = true;
      timeInput.step = "60";
      timeInput.value = value || "00:00";
      timeInput.setAttribute("aria-label", name === "start" ? "시작 시간" : "종료 시간");
      timeInput.style.marginTop = "8px";
      dateInput.insertAdjacentElement("afterend", timeInput);
      return timeInput;
    };
    const toTime = (value: string) => {
      const date = new Date(value);
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };
    addTimeInput(startInput, "start", editingEvent ? toTime(editingEvent.start_at) : "");
    addTimeInput(endInput, "end", editingEvent ? toTime(editingEvent.end_at) : "");
    if (editingEvent) {
      const toDate = (value: string) => {
        const date = new Date(value);
        const pad = (number: number) => String(number).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      };
      startInput.value = toDate(editingEvent.start_at);
      endInput.value = toDate(editingEvent.end_at);
    }
  }, [modal, selectedStoreId, editingEvent]);

  async function addMenu(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStoreId) return notify("먼저 관리할 매장을 선택해 주세요.");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/sw_002/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: selectedStoreId, name: data.get("name"), price: Number(data.get("price")), category: data.get("category") }),
      });
      const result = await response.json() as { menus?: MenuRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "음식메뉴를 등록하지 못했습니다.");
      setMenus(result.menus ?? []);
      setModal(null);
      notify(`${selectedStore?.name ?? "선택 매장"}에 음식메뉴를 등록했습니다.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "음식메뉴를 등록하지 못했습니다.");
    }
  }
  async function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStoreId) return notify("먼저 관리할 매장을 선택해 주세요.");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/sw_002/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: selectedStoreId, title: data.get("title"), description: data.get("description"), eventType: data.get("type"), mapIcon: data.get("icon"), startAt: eventDateTime(data, "start"), endAt: eventDateTime(data, "end") }),
      });
      const result = await response.json() as { events?: EventRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "이벤트를 등록하지 못했습니다.");
      setEvents(result.events ?? []);
      setModal(null);
      notify(`${selectedStore?.name ?? "선택 매장"}에 이벤트를 등록했습니다.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "이벤트를 등록하지 못했습니다.");
    }
  }

  async function updateMenu(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStoreId || !editingMenu) return;
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/sw_002/api/menus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingMenu.id, storeId: selectedStoreId, name: data.get("name"), price: Number(data.get("price")), category: data.get("category") }),
      });
      const result = await response.json() as { menus?: MenuRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "음식메뉴를 수정하지 못했습니다.");
      setMenus(result.menus ?? []);
      setModal(null);
      setEditingMenu(null);
      notify("음식메뉴를 수정했습니다.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "음식메뉴를 수정하지 못했습니다.");
    }
  }

  async function updateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStoreId || !editingEvent) return;
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/sw_002/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingEvent.id, storeId: selectedStoreId, title: data.get("title"), description: data.get("description"), eventType: data.get("type"), mapIcon: data.get("icon"), startAt: eventDateTime(data, "start"), endAt: eventDateTime(data, "end") }),
      });
      const result = await response.json() as { events?: EventRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "이벤트를 수정하지 못했습니다.");
      setEvents(result.events ?? []);
      setModal(null);
      setEditingEvent(null);
      notify("이벤트를 수정했습니다.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "이벤트를 수정하지 못했습니다.");
    }
  }

  async function addCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStoreId) return notify("먼저 관리할 매장을 선택해 주세요.");
    const data = new FormData(event.currentTarget);
    const quantity = String(data.get("quantity") ?? "").trim();
    try {
      const imageUrl = await saveCouponImage(data);
      const response = await fetch("/sw_002/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStoreId,
          name: data.get("name"),
          discountType: data.get("discountType"),
          discountValue: Number(data.get("discountValue")),
          minimumOrderAmount: Number(data.get("minimumOrderAmount")),
          startAt: data.get("start"),
          endAt: data.get("end"),
          totalQuantity: quantity ? Number(quantity) : null,
          perUserLimit: Number(data.get("perUserLimit")),
          imageUrl,
        }),
      });
      const result = await response.json() as { coupons?: CouponRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "쿠폰을 등록하지 못했습니다.");
      setCoupons(result.coupons ?? []);
      setModal(null);
      notify(`${selectedStore?.name ?? "선택 매장"}에 쿠폰을 등록했습니다.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "쿠폰을 등록하지 못했습니다.");
    }
  }

  async function saveCouponImage(data: FormData, currentImageUrl = "") {
    if (!selectedStoreId) throw new Error("먼저 관리할 매장을 선택해 주세요.");
    const mode = String(data.get("imageMode") ?? "generated");
    if (mode === "keep") return currentImageUrl;
    const imageData = new FormData();
    imageData.set("storeId", selectedStoreId);
    imageData.set("mode", mode);
    imageData.set("name", String(data.get("name") ?? "동네온 쿠폰"));
    imageData.set("style", String(data.get("imageStyle") ?? "blue"));
    const discountType = String(data.get("discountType") ?? "AMOUNT");
    const discountValue = Number(data.get("discountValue"));
    imageData.set("benefit", discountType === "PERCENT" ? `${discountValue}% OFF` : discountType === "AMOUNT" ? `${discountValue.toLocaleString()}원 할인` : discountType === "GIFT" ? "SPECIAL GIFT" : "FREE SERVICE");
    const image = data.get("image");
    if (mode === "upload" && image instanceof File) imageData.set("image", image);
    const response = await fetch("/sw_002/api/coupon-images", { method: "POST", body: imageData });
    const result = await response.json() as { imageUrl?: string; error?: string };
    if (!response.ok || !result.imageUrl) throw new Error(result.error || "쿠폰 이미지를 저장하지 못했습니다.");
    return result.imageUrl;
  }

  async function updateCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStoreId || !editingCoupon) return;
    const data = new FormData(event.currentTarget);
    const quantity = String(data.get("quantity") ?? "").trim();
    try {
      const imageUrl = await saveCouponImage(data, editingCoupon.image_url ?? "");
      const response = await fetch("/sw_002/api/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCoupon.id, storeId: selectedStoreId, name: data.get("name"), discountType: data.get("discountType"), discountValue: Number(data.get("discountValue")), minimumOrderAmount: Number(data.get("minimumOrderAmount")), startAt: data.get("start"), endAt: data.get("end"), totalQuantity: quantity ? Number(quantity) : null, perUserLimit: Number(data.get("perUserLimit")), imageUrl }),
      });
      const result = await response.json() as { coupons?: CouponRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "쿠폰을 수정하지 못했습니다.");
      setCoupons(result.coupons ?? []);
      setModal(null);
      setEditingCoupon(null);
      notify("쿠폰을 수정했습니다.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "쿠폰을 수정하지 못했습니다.");
    }
  }

  return <main className={styles.app}>
    <aside className={styles.sidebar}>
      <Link href="/sw_002" className={styles.brand}><i>동</i><span><strong>동네온</strong><small>{isPartner ? "STORE PARTNER" : "PLATFORM ADMIN"}</small></span></Link>
      <div className={styles.context}><small>현재 선택 매장</small><strong>{selectedStore?.name ?? "매장 선택 필요"}</strong><span>{selectedStore ? `${selectedStore.category} · ${selectedStore.address}` : "등록 매장을 선택해 주세요"}</span></div>
      <nav>{nav.map((item) => <button key={item.id} className={section === item.id ? styles.active : ""} onClick={() => setSection(item.id)}><b>-</b><span>{item.label}</span></button>)}</nav>
      <div className={styles.sideBottom}><Link href="/sw_002">고객 화면 보기 ↗</Link><button type="button" aria-label="운영자 로그아웃" onClick={() => void handleLogout()} disabled={loggingOut}>{loggingOut ? "로그아웃 중..." : "로그아웃"}</button></div>
    </aside>
    <section className={styles.workspace}>
      <header className={styles.topbar}><div><small>{isPartner ? "매장 담당자" : "통합 관리자"} / {title}</small><h1>{title}</h1></div><div className={styles.topActions}><button>?</button><button>♢<i /></button><span><b>{isPartner ? "김성수" : "관리자"}</b><small>{isPartner ? "매장 담당자" : "통합 관리자"}</small></span></div></header>
      <div className={styles.content}>
        <section className={storeStyles.globalStoreBar}><div><small>현재 관리 매장</small><strong>{selectedStore?.name ?? "선택된 매장이 없습니다"}</strong><span>{selectedStore ? `${selectedStore.category} · ${selectedStore.address}` : "매장정보에서 신규 매장을 선택해 주세요."}</span></div><label>매장 변경<select value={selectedStoreId ?? ""} onChange={(event) => { setMenus([]); setEvents([]); setCoupons([]); setSelectedStoreId(event.target.value || null); }}><option value="" disabled>매장을 선택해 주세요</option>{storeList.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</select></label></section>
        {section === "dashboard" && <PartnerDashboard events={events} setSection={setSection} store={selectedStore} />}
        {section === "store" && <StoreEditor key={selectedStoreId ?? "new-store"} notify={notify} storeList={storeList} setStoreList={setStoreList} storeId={selectedStoreId} setStoreId={setSelectedStoreId} kakaoJavascriptKey={kakaoJavascriptKey} />}
        {section === "store-manage" && mode === "admin" && <StoreManagementPanel stores={storeList} onSelect={setManagedStoreId} />}
        {section === "menus" && <MenuManager menus={menus} setMenus={setMenus} store={selectedStore} onAdd={() => selectedStoreId ? setModal("menu") : notify("먼저 관리할 매장을 선택해 주세요.")} onEdit={(menu) => { setEditingMenu(menu); setModal("menu-edit"); }} notify={notify} />}
        {section === "events" && <EventManager events={events} setEvents={setEvents} store={selectedStore} onAdd={() => selectedStoreId ? setModal("event") : notify("먼저 관리할 매장을 선택해 주세요.")} onEdit={(event) => { setEditingEvent(event); setModal("event-edit"); }} notify={notify} />}
        {section === "coupons" && <CouponManager coupons={coupons} setCoupons={setCoupons} store={selectedStore} onAdd={() => selectedStoreId ? setModal("coupon") : notify("먼저 관리할 매장을 선택해 주세요.")} onEdit={(coupon) => { setEditingCoupon(coupon); setModal("coupon-edit"); }} notify={notify} />}
        {section === "stats" && mode === "admin" && <Stats admin />}
        {section === "stores" && <StoreManager notify={notify} />}
        {section === "push" && <PushManager onAdd={() => setModal("push")} notify={notify} />}
        {section === "users" && <UserManager />}
      </div>
    </section>
    {modal === "menu" && <Modal title="새 메뉴 등록" onClose={() => setModal(null)}><form onSubmit={addMenu}><label>메뉴명<input name="name" required placeholder="메뉴명을 입력하세요" /></label><div className={styles.formRow}><label>가격<input name="price" type="number" required placeholder="0" /></label><label>분류<select name="category"><option>식사</option><option>요리</option><option>음료</option><option>디저트</option></select></label></div><ModalButtons close={() => setModal(null)} label="메뉴 등록" /></form></Modal>}
    {modal === "menu-edit" && editingMenu && <Modal title="음식메뉴 수정" onClose={() => setModal(null)}><form onSubmit={updateMenu}><label>메뉴명<input name="name" required defaultValue={editingMenu.name} /></label><div className={styles.formRow}><label>가격<input name="price" type="number" min="0" required defaultValue={editingMenu.price} /></label><label>분류<select name="category" defaultValue={editingMenu.category}><option>식사</option><option>요리</option><option>음료</option><option>디저트</option><option>기타</option></select></label></div><ModalButtons close={() => setModal(null)} label="수정 저장" /></form></Modal>}
    {modal === "event" && <Modal title="이벤트 등록" onClose={() => setModal(null)}><form onSubmit={addEvent}><label>이벤트명<input name="title" required placeholder="이벤트 제목" /></label><div className={styles.formRow}><label>유형<select name="type"><option value="DISCOUNT">할인</option><option value="SERVICE">서비스</option><option value="TIME_SALE">타임세일</option><option value="RECOMMEND">추천</option><option value="SOJU">주류 행사</option></select></label><label>지도 아이콘<select name="icon"><option>HOT</option><option>BEST</option><option>COUPON</option><option>FREE</option><option>CLOSING_SOON</option></select></label></div><div className={styles.formRow}><label>시작일<input name="start" type="date" required /></label><label>종료일<input name="end" type="date" required /></label></div><ModalButtons close={() => setModal(null)} label="이벤트 등록" /></form></Modal>}
    {modal === "event-edit" && editingEvent && <Modal title="이벤트 수정" onClose={() => setModal(null)}><form onSubmit={updateEvent}><label>이벤트명<input name="title" required defaultValue={editingEvent.title} /></label><div className={styles.formRow}><label>유형<select name="type" defaultValue={editingEvent.event_type}><option value="DISCOUNT">할인</option><option value="SERVICE">서비스</option><option value="TIME_SALE">타임세일</option><option value="RECOMMEND">추천</option><option value="SOJU">주류 행사</option></select></label><label>지도 아이콘<select name="icon" defaultValue={editingEvent.map_icon}><option>HOT</option><option>BEST</option><option>COUPON</option><option>FREE</option><option>CLOSING_SOON</option></select></label></div><div className={styles.formRow}><label>시작일<input name="start" type="date" required defaultValue={editingEvent.start_at.slice(0, 10)} /></label><label>종료일<input name="end" type="date" required defaultValue={editingEvent.end_at.slice(0, 10)} /></label></div><ModalButtons close={() => setModal(null)} label="수정 저장" /></form></Modal>}
    {modal === "coupon" && <Modal title="쿠폰 등록" onClose={() => setModal(null)}><CouponForm onSubmit={addCoupon} onClose={() => setModal(null)} /></Modal>}
    {modal === "coupon-edit" && editingCoupon && <Modal title="쿠폰 수정" onClose={() => setModal(null)}><CouponForm coupon={editingCoupon} onSubmit={updateCoupon} onClose={() => setModal(null)} /></Modal>}
    {modal === "push" && <Modal title="푸시 알림 발송" onClose={() => setModal(null)}><form onSubmit={(event) => { event.preventDefault(); setModal(null); notify("푸시 발송을 예약했습니다."); }}><label>알림 제목<input required placeholder="알림 제목" /></label><label>알림 내용<textarea required rows={4} placeholder="사용자에게 보낼 내용을 입력하세요" /></label><div className={styles.formRow}><label>대상<select><option>전체 사용자</option><option>1km 이내 사용자</option><option>쿠폰 관심 사용자</option></select></label><label>발송<select><option>즉시 발송</option><option>예약 발송</option></select></label></div><ModalButtons close={() => setModal(null)} label="발송 예약" /></form></Modal>}
    {managedStoreId && mode === "admin" && <Modal title="매장정보 수정" wide onClose={() => setManagedStoreId(null)}><StoreEditor key={`managed-${managedStoreId}`} notify={notify} storeList={storeList} setStoreList={setStoreList} storeId={managedStoreId} setStoreId={setManagedStoreId} kakaoJavascriptKey={kakaoJavascriptKey} /></Modal>}
    {toast && <div className={styles.toast}>{toast}</div>}
  </main>;
}

function PageHead({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) { return <div className={styles.pageHead}><div><span>{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>{action}</div>; }
function PartnerDashboard({ events, setSection, store }: { events: EventRecord[]; setSection: (s: Section) => void; store: StoreRecord | null }) { return <><PageHead eyebrow="STORE OVERVIEW" title={`${store?.name ?? "선택 매장"}, 오늘의 운영 현황`} text="매장 노출과 이벤트 성과를 한눈에 확인하세요." action={<button className={styles.primary} onClick={() => setSection("events")}>＋ 이벤트 등록</button>} /><Metrics values={[["오늘 지도 클릭","328","+12.4%"],["쿠폰 다운로드","84","+8.2%"],["쿠폰 사용","31","사용률 36.9%"],["진행중 이벤트",String(events.filter(e=>e.status === "ACTIVE").length),`전체 ${events.length}건`]]} /><div className={styles.dashGrid}><Chart title="최근 7일 이벤트 조회" /><section className={styles.panel}><PanelHead title="최근 이벤트" text="선택 매장 DB 기준" /><div className={styles.compactList}>{events.slice(0,3).map(e=><div key={e.id}><i>{e.map_icon}</i><span><b>{e.title}</b><small>{new Date(e.start_at).toLocaleDateString("ko-KR")} - {new Date(e.end_at).toLocaleDateString("ko-KR")}</small></span><Status value={eventStatusLabels[e.status] ?? e.status}/></div>)}</div></section></div><section className={styles.guide}><b>{store?.name ?? "선택 매장"} 노출 상태를 확인하세요</b><p>대표 메뉴와 진행 중 이벤트가 선택한 매장을 기준으로 관리됩니다.</p><button onClick={() => setSection("store")}>매장 정보 확인 →</button></section></>; }
function AdminDashboard({ setSection }: { setSection:(s:Section)=>void }) { return <><PageHead eyebrow="PLATFORM OVERVIEW" title="동네온 서비스 현황" text="전체 업체와 이벤트, 쿠폰 사용 현황을 확인하세요." action={<button className={styles.primary} onClick={()=>setSection("stores")}>업체 검토 3건</button>} /><Metrics values={[["등록 업체","128","이번 달 +14"],["활성 이벤트","284","오늘 +23"],["쿠폰 다운로드","12.8K","+18.6%"],["푸시 클릭률","8.4%","목표 대비 +1.2%"]]} /><div className={styles.dashGrid}><Chart title="서비스 이용 추이" /><section className={styles.panel}><PanelHead title="업체 승인 대기" text="사업자 정보 검토 필요" /><div className={styles.compactList}>{stores.slice(1).map((s,i)=><div key={s.name}><i>{i+1}</i><span><b>{s.name}</b><small>{s.location} · {s.category}</small></span><Status value={s.status}/></div>)}</div></section></div></>; }
function StoreManagementPanel({ stores: storeList, onSelect }: { stores: StoreRecord[]; onSelect: (id: string) => void }) {
  return <><PageHead eyebrow="STORE MANAGEMENT" title="매장정보관리" text="등록된 모든 매장을 확인하고 매장 정보를 수정합니다." /><section className={styles.panel}><div className={styles.tableHead}><span>매장명</span><span>업종</span><span>주소</span><span>상태</span><span /></div>{storeList.length === 0 ? <div className={storeStyles.emptyMenus}>등록된 매장이 없습니다.</div> : storeList.map((store) => <div className={styles.tableRow} key={store.id}><span><i>{store.name.slice(0, 1)}</i><b>{store.name}<small>{store.phone || "연락처 미등록"}</small></b></span><span>{store.category}</span><span>{store.address}</span><Status value="정상" /><span><button type="button" onClick={() => onSelect(store.id)}>수정</button></span></div>)}</section></>;
}
function Metrics({ values }: { values:string[][] }) { return <div className={styles.metrics}>{values.map((v,i)=><article key={v[0]}><span>{v[0]}</span><strong>{v[1]}</strong><small className={i===3?styles.neutral:""}>{v[2]}</small></article>)}</div>; }
function Chart({ title }: { title:string }) { return <section className={styles.panel}><PanelHead title={title} text="실시간 집계 기준" /><div className={styles.chart}><div className={styles.chartBars}>{[42,58,49,72,64,82,91].map((h,i)=><i key={i} style={{height:`${h}%`}}><b>{["월","화","수","목","금","토","일"][i]}</b></i>)}</div></div></section>; }
function StoreEditor({ notify, storeList, setStoreList, storeId, setStoreId, kakaoJavascriptKey }: {
  notify: (message: string) => void;
  storeList: StoreRecord[];
  setStoreList: React.Dispatch<React.SetStateAction<StoreRecord[]>>;
  storeId: string | null;
  setStoreId: React.Dispatch<React.SetStateAction<string | null>>;
  kakaoJavascriptKey?: string;
}) {
  const initialStore = storeList.find((store) => store.id === storeId);
  const [name, setName] = useState(initialStore?.name ?? "");
  const [category, setCategory] = useState(initialStore?.category ?? "");
  const [category2, setCategory2] = useState(initialStore?.category2 ?? "");
  const [description, setDescription] = useState(initialStore?.description ?? "");
  const [phone, setPhone] = useState(initialStore?.phone ?? "");
  const [postcodeReady, setPostcodeReady] = useState(false);
  const [zonecode, setZonecode] = useState(initialStore?.zip_cd ?? "");
  const [address, setAddress] = useState(initialStore?.address ?? "");
  const [detailAddress, setDetailAddress] = useState(initialStore?.address_detail ?? "");
  const [latitude, setLatitude] = useState(initialStore?.latitude ?? "");
  const [longitude, setLongitude] = useState(initialStore?.longitude ?? "");
  const [openTime, setOpenTime] = useState(initialStore?.opening_hours?.open ?? "11:30");
  const [closeTime, setCloseTime] = useState(initialStore?.opening_hours?.close ?? "22:00");
  const [imageUrl, setImageUrl] = useState(initialStore?.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [majorCategories, setMajorCategories] = useState<CommonCodeOption[]>([]);
  const [middleCategories, setMiddleCategories] = useState<CommonCodeOption[]>([]);
  const [majorCategory, setMajorCategory] = useState("");
  const coordinateLookupRef = useRef<Promise<{ latitude: number; longitude: number }> | null>(null);

  useEffect(() => {
    void fetch("/sw_002/api/store-categories", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as {
          majorCategories?: CommonCodeOption[];
          middleCategories?: CommonCodeOption[];
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "업종 목록을 불러오지 못했습니다.");
        return result;
      })
      .then(({ majorCategories = [], middleCategories = [] }) => {
        setMajorCategories(majorCategories);
        setMiddleCategories(middleCategories);
        const initialMajor = majorCategories.some((item) => item.code === category)
          ? category
          : majorCategories[0]?.code || "";
        setMajorCategory(initialMajor);
        setCategory(initialMajor);
        const availableMiddle = middleCategories.filter((item) => item.parent_grp_cd === initialMajor);
        setCategory2((current) => availableMiddle.some((item) => item.code === current)
          ? current
          : availableMiddle[0]?.code || "");
      })
      .catch((error: unknown) => notify(error instanceof Error ? error.message : "업종 목록을 불러오지 못했습니다."));
  }, [notify]);

  function startNewStore() {
    setStoreId(null);
    setName("");
    setCategory("");
    setCategory2("");
    setDescription("");
    setPhone("");
    setZonecode("");
    setAddress("");
    setDetailAddress("");
    setLatitude("");
    setLongitude("");
    setOpenTime("09:00");
    setCloseTime("18:00");
    setImageUrl("");
    setImageFile(null);
    setImagePreview("");
  }

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  async function uploadStoreImage(savedStoreId: string, file: File) {
    const formData = new FormData();
    formData.set("storeId", String(savedStoreId));
    formData.set("image", file);
    const response = await fetch("/sw_002/api/store-images", { method: "POST", body: formData });
    const result = await response.json() as { asset?: { storage_path: string }; error?: string };
    if (!response.ok || !result.asset) throw new Error(result.error || "매장 이미지를 저장하지 못했습니다.");
    return result.asset.storage_path;
  }

  async function resolveCoordinates(targetAddress: string) {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const kakaoApi = (window as PostcodeWindow).kakao;
      const services = kakaoApi?.maps?.services;
      if (services?.Geocoder && services.Status?.OK) {
        return await new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
          const geocoder = new services.Geocoder();
          geocoder.addressSearch(targetAddress, (results, status) => {
            const latitudeValue = Number(results[0]?.y);
            const longitudeValue = Number(results[0]?.x);
            if (status === services.Status.OK && Number.isFinite(latitudeValue) && Number.isFinite(longitudeValue)) {
              resolve({ latitude: latitudeValue, longitude: longitudeValue });
            } else {
              reject(new Error("선택한 주소의 위도·경도를 찾지 못했습니다. 주소를 다시 검색해 주세요."));
            }
          });
        });
      }
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }
    throw new Error("카카오 지도 좌표 서비스를 불러오지 못했습니다. JavaScript 키와 등록 도메인을 확인해 주세요.");
  }

  async function saveStore() {
    if (saving) return;
    setSaving(true);

    try {
      if (!address.trim()) throw new Error("주소를 검색해 선택해 주세요.");
      const currentLatitude = Number(latitude);
      const currentLongitude = Number(longitude);
      const coordinates = Number.isFinite(currentLatitude) && Number.isFinite(currentLongitude) && latitude && longitude
        ? { latitude: currentLatitude, longitude: currentLongitude }
        : coordinateLookupRef.current
          ? await coordinateLookupRef.current
          : await resolveCoordinates(address);
      coordinateLookupRef.current = null;
      setLatitude(String(coordinates.latitude));
      setLongitude(String(coordinates.longitude));

      let response: Response;
      try {
        response = await fetch("/sw_002/api/stores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: storeId, name, category, category2, description, phone, zipCd: zonecode, address, addressDetail: detailAddress, openTime, closeTime, latitude: coordinates.latitude, longitude: coordinates.longitude }),
        });
      } catch {
        throw new Error("매장 저장 API에 연결하지 못했습니다. 서버가 최신 빌드로 실행 중인지 확인해 주세요.");
      }
      const result = await response.json() as { store?: StoreRecord; error?: string };

      if (!response.ok || !result.store) {
        throw new Error(result.error || "매장 정보를 저장하지 못했습니다.");
      }

      let savedStore = { ...result.store, image_url: imageUrl };
      setStoreId(savedStore.id);
      setLatitude(savedStore.latitude ?? "");
      setLongitude(savedStore.longitude ?? "");
      setStoreList((current) => current.some((store) => store.id === savedStore.id)
        ? current.map((store) => store.id === savedStore.id ? savedStore : store)
        : [...current, savedStore]);

      if (imageFile) {
        const savedImageUrl = await uploadStoreImage(result.store.id, imageFile);
        savedStore = { ...savedStore, image_url: savedImageUrl };
      }

      setImageUrl(savedStore.image_url ?? "");
      setImageFile(null);
      setImagePreview("");
      setStoreList((current) => current.some((store) => store.id === savedStore.id)
        ? current.map((store) => store.id === savedStore.id ? savedStore : store)
        : [...current, savedStore]);
      notify(`매장 정보를 저장했습니다. (sw002_stores ID: ${savedStore.id})`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "매장 정보를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function selectImage(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("이미지 파일만 선택할 수 있습니다.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    notify("이미지를 선택했습니다. 변경사항 저장을 눌러 등록해 주세요.");
  }

  function openAddressSearch() {
    const postcodeApi = (window as PostcodeWindow).kakao;

    if (!postcodeReady || !postcodeApi?.Postcode) {
      notify("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    new postcodeApi.Postcode({
      oncomplete: (data) => {
        const selectedAddress = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setZonecode(data.zonecode);
        setAddress(selectedAddress || data.address);
        setLatitude("");
        setLongitude("");
        const geocoder = postcodeApi.maps?.services?.Geocoder ? new postcodeApi.maps.services.Geocoder() : null;
        const addressForGeocode = selectedAddress || data.address;
        if (geocoder && postcodeApi.maps?.services?.Status.OK) {
          coordinateLookupRef.current = new Promise((resolve, reject) => {
            geocoder.addressSearch(addressForGeocode, (results, status) => {
              if (status === postcodeApi.maps?.services?.Status.OK && results[0]) {
                const longitudeValue = Number(results[0].x);
                const latitudeValue = Number(results[0].y);
                if (Number.isFinite(latitudeValue) && Number.isFinite(longitudeValue)) {
                  setLongitude(String(longitudeValue));
                  setLatitude(String(latitudeValue));
                  resolve({ latitude: latitudeValue, longitude: longitudeValue });
                  return;
                }
              }
              reject(new Error("선택한 주소의 좌표를 확인하지 못했습니다. 주소를 다시 검색해 주세요."));
            });
          });
          void coordinateLookupRef.current.catch(() => undefined);
        }
        setDetailAddress("");
        notify("주소를 선택했습니다. 상세주소를 입력해 주세요.");
      },
    }).open();
  }

  return <>
    <Script src="https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" onReady={() => setPostcodeReady(true)} onError={() => notify("주소 검색 서비스를 불러오지 못했습니다.")} />
    {kakaoJavascriptKey && (
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(kakaoJavascriptKey.trim())}&libraries=services&autoload=false`}
        strategy="afterInteractive"
        onReady={() => {
          const maps = (window as PostcodeWindow).kakao?.maps;
          if (maps?.load) {
            maps.load(() => undefined);
          }
        }}
        onError={() => notify("카카오 지도 SDK를 불러오지 못했습니다. JavaScript 키와 등록 도메인을 확인해 주세요.")}
      />
    )}
    <PageHead eyebrow="STORE PROFILE" title="매장 기본정보" text="여러 매장을 등록하고 매장별 정보를 관리합니다." action={<button className={styles.primary} onClick={saveStore} disabled={saving}>{saving ? "저장 중..." : "변경사항 저장"}</button>} />
    <section className={storeStyles.storeSelector}><div><strong>{storeId ? "선택 매장 정보 수정" : "신규 매장 등록"}</strong><span>{storeId ? "위의 현재 관리 매장에서 다른 매장을 선택할 수 있습니다." : "아래 정보를 입력하고 저장해 주세요."}</span></div><button type="button" onClick={startNewStore}>＋ 신규 매장 추가</button><span>등록된 매장 {storeList.length}개</span></section>
    <section className={`${styles.formPanel} ${!storeId ? storeStyles.newStoreForm : ""}`}>
      <div className={`${styles.storeCover} ${storeStyles.storeCover}`} style={(imagePreview || imageUrl) ? { backgroundImage: `url("${imagePreview || imageUrl}")` } : undefined}>
        {!imagePreview && !imageUrl && <span>🥘</span>}
        <label className={storeStyles.imageButton}>대표 이미지 찾기<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => selectImage(event.target.files?.[0])} /></label>
        <small>{imageFile ? imageFile.name : imageUrl ? "등록된 대표 이미지" : "JPG·PNG·WEBP·GIF / 최대 10MB"}</small>
      </div>
      <div className={styles.fields}>
        <div className={storeStyles.storeIdentityRow}>
          <label>업체명<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <div className={storeStyles.categoryFields}>
            <span>업종</span>
            <label>대분류<select value={majorCategory} onChange={(event) => { const nextMajor = event.target.value; const availableMiddle = middleCategories.filter((item) => item.parent_grp_cd === nextMajor); setMajorCategory(nextMajor); setCategory(nextMajor); setCategory2(availableMiddle[0]?.code || ""); }}>{majorCategories.map((item) => <option key={item.code} value={item.code}>{item.code_name}</option>)}</select></label>
            <label>중분류<select value={category2} onChange={(event) => setCategory2(event.target.value)}>{middleCategories.filter((item) => item.parent_grp_cd === majorCategory).map((item) => <option key={item.code} value={item.code}>{item.code_name}</option>)}</select></label>
          </div>
        </div>
        <div className={storeStyles.addressBlock}>
          <span>주소</span>
          <div className={storeStyles.addressSearchRow}>
            <input value={zonecode} readOnly aria-label="우편번호" />
            <input value={address} readOnly aria-label="기본 주소" />
            <button type="button" onClick={openAddressSearch}>{postcodeReady ? "주소 검색" : "검색 준비 중"}</button>
          </div>
          <input value={detailAddress} onChange={(event) => setDetailAddress(event.target.value)} placeholder="상세주소를 입력해 주세요" aria-label="상세 주소" />
          <small>공공 도로명주소 데이터에서 검색하여 선택합니다.</small>
        </div>
        <label>전화번호<input value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
        <div className={storeStyles.businessHours}>
          <span>영업시간</span>
          <div>
            <select value={openTime} onChange={(event) => setOpenTime(event.target.value)} aria-label="영업 시작 시간">{businessTimeOptions.map((time) => <option key={`open-${time}`} value={time}>{time}</option>)}</select>
            <b>부터</b>
            <select value={closeTime} onChange={(event) => setCloseTime(event.target.value)} aria-label="영업 종료 시간">{businessTimeOptions.map((time) => <option key={`close-${time}`} value={time}>{time}</option>)}</select>
            <b>까지</b>
          </div>
        </div>
        <label className={styles.wide}>매장 소개<textarea rows={5} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      </div>
    </section>
    <section className={styles.mapBox}><div><span>지도 좌표</span><b>{latitude && longitude ? `${latitude}, ${longitude}` : "주소 저장 후 좌표가 표시됩니다"}</b><small>주소 검색 결과를 위도·경도로 변환하여 DB에 저장합니다.</small></div><button onClick={saveStore} disabled={saving}>주소 좌표 다시 저장</button></section>
  </>;
}
function MenuManager({ menus, setMenus, store, onAdd, onEdit, notify }: {
  menus: MenuRecord[];
  setMenus: React.Dispatch<React.SetStateAction<MenuRecord[]>>;
  store: StoreRecord | null;
  onAdd: () => void;
  onEdit: (menu: MenuRecord) => void;
  notify: (message: string) => void;
}) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("전체 분류");
  const normalizedKeyword = searchKeyword.trim().toLocaleLowerCase("ko-KR");
  const filteredMenus = menus.filter((menu) => {
    const matchesKeyword = !normalizedKeyword
      || menu.name.toLocaleLowerCase("ko-KR").includes(normalizedKeyword)
      || menu.category.toLocaleLowerCase("ko-KR").includes(normalizedKeyword)
      || (menu.description ?? "").toLocaleLowerCase("ko-KR").includes(normalizedKeyword);
    const matchesCategory = categoryFilter === "전체 분류" || menu.category === categoryFilter;
    return matchesKeyword && matchesCategory;
  });
  const menuCategories = Array.from(new Set(menus.map((menu) => menu.category)));

  async function changeVisibility(menu: MenuRecord) {
    if (!store) return notify("먼저 관리할 매장을 선택해 주세요.");
    try {
      const response = await fetch("/sw_002/api/menus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: menu.id, storeId: store.id, isVisible: !menu.is_visible }),
      });
      const result = await response.json() as { menus?: MenuRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "노출 상태를 변경하지 못했습니다.");
      setMenus(result.menus ?? []);
      notify(`${menu.name} 노출 상태를 변경했습니다.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "노출 상태를 변경하지 못했습니다.");
    }
  }

  async function deleteMenu(menu: MenuRecord) {
    if (!store) return notify("먼저 관리할 매장을 선택해 주세요.");
    if (!window.confirm(`${menu.name} 메뉴를 삭제하시겠습니까?`)) return;
    try {
      const response = await fetch(`/sw_002/api/menus?id=${encodeURIComponent(menu.id)}&storeId=${encodeURIComponent(store.id)}`, { method: "DELETE" });
      const result = await response.json() as { menus?: MenuRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "음식메뉴를 삭제하지 못했습니다.");
      setMenus(result.menus ?? []);
      notify(`${menu.name} 메뉴를 삭제했습니다.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "음식메뉴를 삭제하지 못했습니다.");
    }
  }

  return <>
    <PageHead eyebrow="FOOD MENU MANAGEMENT" title="음식메뉴 관리" text={`${store?.name ?? "선택 매장"}의 음식메뉴를 실제 데이터베이스에서 관리합니다.`} action={<button className={styles.primary} onClick={onAdd}>＋ 음식메뉴 등록</button>} />
    <section className={styles.panel}>
      <div className={styles.toolbar}><input value={searchKeyword} onChange={(event) => setSearchKeyword(event.target.value)} placeholder="메뉴명·분류 검색" aria-label="음식메뉴 검색" /><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="음식메뉴 분류"><option>전체 분류</option>{menuCategories.map((category) => <option key={category}>{category}</option>)}</select>{(searchKeyword || categoryFilter !== "전체 분류") && <button className={storeStyles.searchReset} type="button" onClick={() => { setSearchKeyword(""); setCategoryFilter("전체 분류"); }}>검색 초기화</button>}</div>
      <div className={styles.menuRows}>
        {!store && <div className={storeStyles.emptyMenus}>관리할 매장을 먼저 선택해 주세요.</div>}
        {store && menus.length === 0 && <div className={storeStyles.emptyMenus}>등록된 음식메뉴가 없습니다. 새 메뉴를 등록해 주세요.</div>}
        {store && menus.length > 0 && filteredMenus.length === 0 && <div className={storeStyles.emptyMenus}>검색 조건에 맞는 음식메뉴가 없습니다.</div>}
        {store && filteredMenus.map((menu) => <article key={menu.id}><div className={styles.menuImage}>🍽️</div><span><b>{menu.name}</b><small>{menu.category} · {menu.price.toLocaleString()}원</small></span>{menu.is_main && <em>대표메뉴</em>}<label className={styles.toggle}><input type="checkbox" checked={menu.is_visible} onChange={() => changeVisibility(menu)} /><i /></label><button onClick={() => onEdit(menu)}>수정</button><button onClick={() => deleteMenu(menu)}>삭제</button></article>)}
      </div>
    </section>
  </>;
}
function EventManager({ events, setEvents, store, onAdd, onEdit, notify }: { events: EventRecord[]; setEvents: React.Dispatch<React.SetStateAction<EventRecord[]>>; store: StoreRecord | null; onAdd: () => void; onEdit: (event: EventRecord) => void; notify: (message: string) => void }) {
  async function deleteEvent(event: EventRecord) {
    if (!store) return notify("먼저 관리할 매장을 선택해 주세요.");
    if (!window.confirm(`${event.title} 이벤트를 삭제하시겠습니까?`)) return;
    try {
      const response = await fetch(`/sw_002/api/events?id=${encodeURIComponent(event.id)}&storeId=${encodeURIComponent(store.id)}`, { method: "DELETE" });
      const result = await response.json() as { events?: EventRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "이벤트를 삭제하지 못했습니다.");
      setEvents(result.events ?? []);
      notify(`${event.title} 이벤트를 삭제했습니다.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "이벤트를 삭제하지 못했습니다.");
    }
  }

  return <><PageHead eyebrow="EVENT MANAGEMENT" title="이벤트 관리" text={`${store?.name ?? "선택 매장"}의 이벤트를 실제 데이터베이스에서 관리합니다.`} action={<button className={styles.primary} onClick={onAdd}>＋ 이벤트 등록</button>} /><section className={styles.panel}><div className={styles.tableHead}><span>이벤트</span><span>유형</span><span>기간</span><span>상태</span><span /></div>{!store && <div className={storeStyles.emptyMenus}>관리할 매장을 먼저 선택해 주세요.</div>}{store && events.length === 0 && <div className={storeStyles.emptyMenus}>등록된 이벤트가 없습니다. 새 이벤트를 등록해 주세요.</div>}{store && events.map((event) => <div className={styles.tableRow} key={event.id}><span><i>{event.map_icon}</i><b>{event.title}</b></span><span>{eventTypeLabels[event.event_type] ?? event.event_type}</span><span>{new Date(event.start_at).toLocaleDateString("ko-KR")} - {new Date(event.end_at).toLocaleDateString("ko-KR")}</span><Status value={eventStatusLabels[event.status] ?? event.status} /><span><button onClick={() => onEdit(event)}>수정</button><button onClick={() => deleteEvent(event)}>삭제</button></span></div>)}</section></>;
}
function CouponForm({ coupon, onSubmit, onClose }: { coupon?: CouponRecord; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  const [name, setName] = useState(coupon?.name ?? "");
  const [discountType, setDiscountType] = useState(coupon?.discount_type ?? "AMOUNT");
  const [discountValue, setDiscountValue] = useState(coupon?.discount_value ?? 0);
  const [imageMode, setImageMode] = useState(coupon?.image_url ? "keep" : "generated");
  const [imageStyle, setImageStyle] = useState("blue");
  const [filePreview, setFilePreview] = useState("");

  useEffect(() => () => { if (filePreview) URL.revokeObjectURL(filePreview); }, [filePreview]);
  const benefit = discountType === "PERCENT" ? `${discountValue}% OFF` : discountType === "AMOUNT" ? `${discountValue.toLocaleString()}원 할인` : discountType === "GIFT" ? "SPECIAL GIFT" : "FREE SERVICE";
  const previewImage = imageMode === "keep" ? coupon?.image_url ?? "" : imageMode === "upload" ? filePreview : "";

  return <form onSubmit={onSubmit}>
    <div className={`${storeStyles.couponPreview} ${storeStyles[`coupon_${imageStyle}`]}`} style={previewImage ? { backgroundImage: `url("${previewImage}")` } : undefined}>
      {!previewImage && <><small>DONGNEON COUPON</small><strong>{name || "쿠폰명을 입력하세요"}</strong><b>{benefit}</b><span>동네에서 만나는 오늘의 특별한 혜택</span></>}
    </div>
    <div className={styles.formRow}><label>이미지 방식<select name="imageMode" value={imageMode} onChange={(event) => setImageMode(event.target.value)}>{coupon?.image_url && <option value="keep">현재 이미지 유지</option>}<option value="generated">미리보기 디자인으로 생성</option><option value="upload">이미지 파일 업로드</option></select></label>{imageMode === "generated" && <label>디자인 색상<select name="imageStyle" value={imageStyle} onChange={(event) => setImageStyle(event.target.value)}><option value="blue">블루</option><option value="coral">코랄</option><option value="green">그린</option></select></label>}{imageMode === "upload" && <label>이미지 파일<input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required onChange={(event) => { const file = event.target.files?.[0]; if (file) setFilePreview(URL.createObjectURL(file)); }} /></label>}</div>
    <label>쿠폰명<input name="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="쿠폰명을 입력하세요" /></label>
    <div className={styles.formRow}><label>할인 유형<select name="discountType" value={discountType} onChange={(event) => setDiscountType(event.target.value)}><option value="AMOUNT">금액 할인</option><option value="PERCENT">비율 할인</option><option value="GIFT">증정</option><option value="SERVICE">서비스</option></select></label><label>할인값<input name="discountValue" type="number" min="0" required value={discountValue} onChange={(event) => setDiscountValue(Number(event.target.value))} /></label></div>
    <div className={styles.formRow}><label>최소 주문금액<input name="minimumOrderAmount" type="number" min="0" required defaultValue={coupon?.minimum_order_amount ?? 0} /></label><label>총 발급 수량<input name="quantity" type="number" min="0" placeholder="비우면 무제한" defaultValue={coupon?.total_quantity ?? ""} /></label></div>
    <div className={styles.formRow}><label>시작일<input name="start" type="date" required defaultValue={coupon?.start_at.slice(0, 10)} /></label><label>종료일<input name="end" type="date" required defaultValue={coupon?.end_at.slice(0, 10)} /></label></div>
    <label>1인당 사용 한도<input name="perUserLimit" type="number" min="1" required defaultValue={coupon?.per_user_limit ?? 1} /></label>
    <ModalButtons close={onClose} label={coupon ? "수정 저장" : "쿠폰 등록"} />
  </form>;
}

function CouponManager({ coupons, setCoupons, store, onAdd, onEdit, notify }: { coupons: CouponRecord[]; setCoupons: React.Dispatch<React.SetStateAction<CouponRecord[]>>; store: StoreRecord | null; onAdd: () => void; onEdit: (coupon: CouponRecord) => void; notify: (message: string) => void }) {
  async function deleteCoupon(coupon: CouponRecord) {
    if (!store) return notify("먼저 관리할 매장을 선택해 주세요.");
    if (!window.confirm(`${coupon.name} 쿠폰을 삭제하시겠습니까?`)) return;
    try {
      const response = await fetch(`/sw_002/api/coupons?id=${encodeURIComponent(coupon.id)}&storeId=${encodeURIComponent(store.id)}`, { method: "DELETE" });
      const result = await response.json() as { coupons?: CouponRecord[]; error?: string };
      if (!response.ok) throw new Error(result.error || "쿠폰을 삭제하지 못했습니다.");
      setCoupons(result.coupons ?? []);
      notify(`${coupon.name} 쿠폰을 삭제했습니다.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "쿠폰을 삭제하지 못했습니다.");
    }
  }

  return <><PageHead eyebrow="COUPON MANAGEMENT" title="쿠폰 관리" text={`${store?.name ?? "선택 매장"}의 쿠폰을 실제 데이터베이스에서 관리합니다.`} action={<button className={styles.primary} onClick={onAdd}>＋ 쿠폰 만들기</button>} /><section className={styles.panel}><div className={styles.tableHead}><span>쿠폰명</span><span>발급</span><span>사용</span><span>상태</span><span /></div>{!store && <div className={storeStyles.emptyMenus}>관리할 매장을 먼저 선택해 주세요.</div>}{store && coupons.length === 0 && <div className={storeStyles.emptyMenus}>등록된 쿠폰이 없습니다. 새 쿠폰을 등록해 주세요.</div>}{store && coupons.map((coupon) => <div className={styles.tableRow} key={coupon.id}><span>{coupon.image_url ? <i className={storeStyles.couponThumb} style={{ backgroundImage: `url("${coupon.image_url}")` }} /> : <i>％</i>}<b>{coupon.name}<small>{coupon.discount_type === "PERCENT" ? `${coupon.discount_value}% 할인` : coupon.discount_type === "AMOUNT" ? `${coupon.discount_value.toLocaleString()}원 할인` : coupon.discount_type === "GIFT" ? "증정 쿠폰" : "서비스 쿠폰"}</small></b></span><span>{coupon.issued_quantity}건 / {coupon.total_quantity ?? "무제한"}</span><span>{coupon.used_quantity}건</span><Status value={couponStatusLabels[coupon.status] ?? coupon.status} /><span><button onClick={() => onEdit(coupon)}>수정</button><button onClick={() => deleteCoupon(coupon)}>삭제</button></span></div>)}</section></>;
}
function StoreManager({notify}:{notify:(s:string)=>void}) { return <><PageHead eyebrow="STORE CONTROL" title="업체 관리" text="입점 업체의 상태와 지도 노출 여부를 관리합니다."/><section className={styles.panel}><div className={styles.toolbar}><input placeholder="업체명 또는 대표자 검색"/><select><option>전체 상태</option><option>정상</option><option>검토중</option></select></div><div className={styles.tableHead}><span>업체</span><span>업종</span><span>이벤트</span><span>상태</span><span/></div>{stores.map(s=><div className={styles.tableRow} key={s.name}><span><i>{s.name.slice(0,1)}</i><b>{s.name}<small>{s.location} · {s.owner}</small></b></span><span>{s.category}</span><span>{s.events}건</span><Status value={s.status}/><span><button onClick={()=>notify(`${s.name} 업체 상세를 확인합니다.`)}>상세</button><button>승인</button></span></div>)}</section></>; }
function EventMonitor({notify}:{notify:(s:string)=>void}) { return <><PageHead eyebrow="EVENT MONITOR" title="이벤트 모니터링" text="전체 업체의 이벤트 노출과 정책 위반 여부를 확인합니다."/><section className={styles.panel}><div className={styles.tableHead}><span>업체·이벤트</span><span>유형</span><span>노출기간</span><span>검수</span><span/></div>{initialEvents.map((e,i)=><div className={styles.tableRow} key={e.id}><span><i>{e.icon}</i><b>{stores[i].name}<small>{e.title}</small></b></span><span>{e.type}</span><span>{e.period}</span><Status value={i===1?"검토필요":"정상"}/><span><button onClick={()=>notify("이벤트 상세를 확인합니다.")}>검토</button></span></div>)}</section></>; }
function PushManager({onAdd}:{onAdd:()=>void;notify:(s:string)=>void}) { return <><PageHead eyebrow="PUSH CENTER" title="푸시 관리" text="대상 조건과 발송 시간을 설정하고 결과를 확인합니다." action={<button className={styles.primary} onClick={onAdd}>＋ 새 알림</button>}/><Metrics values={[["오늘 발송","8,420","성공 98.7%"],["평균 오픈율","24.8%","+3.2%"],["쿠폰 전환","8.4%","+1.1%"],["발송 대기","2건","예약 완료"]]}/><section className={styles.panel}><PanelHead title="최근 발송 이력" text="최근 30일"/><div className={styles.compactList}>{[["성수동 오늘의 쿠폰","8,420명","발송완료"],["주말 치킨 할인 모음","2,180명","발송완료"],["종료 임박 쿠폰 안내","840명","예약"]].map(x=><div key={x[0]}><i>◁</i><span><b>{x[0]}</b><small>{x[1]}</small></span><Status value={x[2]}/></div>)}</div></section></>; }
function Stats({admin}:{admin:boolean}) { return <><PageHead eyebrow="PERFORMANCE" title={admin?"서비스 통계":"성과 통계"} text={admin?"지역·업체·이벤트별 서비스 성과를 분석합니다.":"지도 노출부터 쿠폰 사용까지의 성과를 확인합니다."}/><Metrics values={[["지도 클릭","2,840","+14.2%"],["상세 조회","1,920","전환 67.6%"],["쿠폰 저장","482","전환 25.1%"],["쿠폰 사용","171","사용률 35.5%"]]}/><div className={styles.dashGrid}><Chart title="일자별 이용 추이"/><section className={styles.panel}><PanelHead title={admin?"인기 지역":"인기 혜택"} text="최근 30일 기준"/><div className={styles.ranking}>{["성수동 할인 이벤트","치킨 5천원 쿠폰","카페 디저트 혜택","주말 타임세일"].map((x,i)=><div key={x}><b>{i+1}</b><span>{x}</span><em>{[842,621,488,351][i].toLocaleString()}</em></div>)}</div></section></div></>; }
function UserManager() { return <><PageHead eyebrow="USER CONTROL" title="사용자 관리" text="회원 상태와 쿠폰·알림 이용 현황을 확인합니다."/><Metrics values={[["전체 회원","18.4K","이번 달 +824"],["활성 회원","12.7K","활성률 69%"],["알림 동의","9.8K","동의율 53%"],["휴면·탈퇴","1.2K","이번 달 48"]]}/><section className={styles.panel}><div className={styles.toolbar}><input placeholder="이메일 또는 닉네임 검색"/><select><option>전체 회원</option><option>정상</option><option>휴면</option></select></div><div className={styles.compactList}>{["동네탐험가","쿠폰수집가","성수마실","오늘뭐먹지"].map((x,i)=><div key={x}><i>U{i+1}</i><span><b>{x}</b><small>user{i+1}@example.com · 쿠폰 {i+2}개</small></span><Status value="정상"/></div>)}</div></section></>; }
function PanelHead({title,text}:{title:string;text:string}) { return <div className={styles.panelHead}><div><h3>{title}</h3><p>{text}</p></div><button>더보기 →</button></div>; }
function Status({value}:{value:string}) { return <em className={`${styles.status} ${["정상","진행중","사용중","발송완료"].includes(value)?styles.good:["검토중","검토필요","예약"].includes(value)?styles.wait:styles.off}`}>{value}</em>; }
function Modal({title,onClose,children,wide}:{title:string;onClose:()=>void;children:React.ReactNode;wide?:boolean}) { return <div className={styles.backdrop} onMouseDown={onClose}><section className={`${styles.modal} ${wide ? styles.wideModal : ""}`} onMouseDown={e=>e.stopPropagation()}><header><h2>{title}</h2><button type="button" onClick={onClose}>×</button></header>{children}</section></div>; }
function ModalButtons({close,label}:{close:()=>void;label:string}) { return <footer><button type="button" onClick={close}>취소</button><button className={styles.primary}>{label}</button></footer>; }
