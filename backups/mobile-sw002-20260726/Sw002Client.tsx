"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import mapStyles from "./map.module.css";
import styles from "./sw002.module.css";
import ReferenceHome from "./ReferenceHome";

type Tab = "home" | "stores" | "events" | "favorites" | "my";
type ViewType = "MAP_PIN" | "STORE_DETAIL";

type CustomerUser = { id: string; email: string; nickname: string | null; role: string };
type StoreEvent = { id: string; title: string; description: string | null; eventType: string; mapIcon: string; startAt: string | null; endAt: string | null; status: string };
type StoreCoupon = { id: string; name: string; description: string | null; discountType: string; discountValue: number; minimumOrderAmount: number; usageInstructions: string | null; startAt: string | null; endAt: string | null; imageUrl: string | null };

type MapStoreRow = {
  id: string;
  name: string;
  category: string | null;
  category2: string | null;
  description: string | null;
  phone: string | null;
  address: string;
  address_detail: string | null;
  jibun_address: string | null;
  opening_hours: Record<string, unknown> | null;
  latitude: string;
  longitude: string;
  image_url: string | null;
  event_title: string | null;
  map_icon: string | null;
  end_at: string | null;
  events: StoreEvent[];
  coupons: StoreCoupon[];
};

type MapStore = MapStoreRow & {
  latitudeNumber: number;
  longitudeNumber: number;
  categoryLabel: string;
  badge: string;
  offer: string;
  tone: "orange" | "violet" | "blue" | "green";
  emoji: string;
};

type KakaoMap = {
  setBounds: (bounds: unknown, padding?: number) => void;
  setCenter: (position: unknown) => void;
  relayout?: () => void;
};

type KakaoMarker = { setMap: (map: KakaoMap | null) => void };

type KakaoMaps = {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => unknown;
  LatLngBounds: new () => { extend: (position: unknown) => void };
  Map: new (
    container: HTMLElement,
    options: { center: unknown; level: number },
  ) => KakaoMap;
  Marker: new (options: { map: KakaoMap; position: unknown }) => KakaoMarker;
  event: {
    addListener: (
      target: KakaoMarker,
      eventName: string,
      handler: () => void,
    ) => void;
  };
};

type KakaoWindow = Window & { kakao?: { maps: KakaoMaps } };

const toneList = ["orange", "violet", "blue", "green"] as const;

function categoryEmoji(category: string) {
  if (/카페|디저트|베이커리/.test(category)) return "☕";
  if (/치킨|닭/.test(category)) return "🍗";
  if (/주점|술/.test(category)) return "🍻";
  if (/분식/.test(category)) return "🍜";
  return "🍽️";
}

function formatOpeningHours(openingHours: Record<string, unknown> | null) {
  if (!openingHours) return "영업시간 미등록";
  const open = openingHours.open ?? openingHours.start ?? openingHours.open_time;
  const close = openingHours.close ?? openingHours.end ?? openingHours.close_time;
  if (typeof open === "string" && typeof close === "string") {
    return `${open} ~ ${close}`;
  }
  return "요일별 영업시간 등록됨";
}

function getAnonymousSessionId() {
  const storageKey = "sw002-anonymous-session-id";
  const saved = window.localStorage.getItem(storageKey);
  if (saved) return saved;
  const created =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(storageKey, created);
  return created;
}

function distanceInMeters(latitude1: number, longitude1: number, latitude2: number, longitude2: number) {
  const earthRadius = 6371000;
  const latitudeDelta = ((latitude2 - latitude1) * Math.PI) / 180;
  const longitudeDelta = ((longitude2 - longitude1) * Math.PI) / 180;
  const value = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos((latitude1 * Math.PI) / 180) * Math.cos((latitude2 * Math.PI) / 180) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export default function Sw002Client({
  kakaoJavascriptKey,
}: {
  kakaoJavascriptKey: string;
}) {
  const [tab, setTab] = useState<Tab>("home");
  const [category, setCategory] = useState("전체");
  const [radius, setRadius] = useState("1km");
  const [stores, setStores] = useState<MapStore[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [savedCoupons, setSavedCoupons] = useState<string[]>([]);
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [detailStore, setDetailStore] = useState<MapStore | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mapScriptReady, setMapScriptReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const markerRefs = useRef<KakaoMarker[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadStores() {
      try {
        const response = await fetch("/sw_002/api/map-stores", {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as {
          stores?: MapStoreRow[];
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error ?? "매장 조회 실패");

        const mapped = (payload.stores ?? [])
          .map((store, index): MapStore | null => {
            const latitudeNumber = Number(store.latitude);
            const longitudeNumber = Number(store.longitude);
            if (!Number.isFinite(latitudeNumber) || !Number.isFinite(longitudeNumber)) {
              return null;
            }
            const categoryLabel = store.category?.trim() || "기타";
            return {
              ...store,
              latitudeNumber,
              longitudeNumber,
              categoryLabel,
              badge: store.map_icon?.trim() || (store.event_title ? "EVENT" : "STORE"),
              offer: store.events[0]
                ? `${store.events[0].title}${store.events[0].description?.trim() ? ` · ${store.events[0].description.trim()}` : ""}`
                : store.event_title?.trim() || store.description?.trim() || "매장 상세 정보를 확인해 보세요.",
              tone: toneList[index % toneList.length],
              emoji: categoryEmoji(categoryLabel),
            };
          })
          .filter((store): store is MapStore => store !== null);

        setStores(mapped);
        setSelected((current) => current ?? mapped[0]?.id ?? null);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLoadError(error instanceof Error ? error.message : "매장 정보를 불러오지 못했습니다.");
        }
      } finally {
        setLoading(false);
      }
    }
    void loadStores();
    return () => controller.abort();
  }, []);

  const loadFavorites = useCallback(async () => {
    const response = await fetch("/sw_002/api/favorites", { cache: "no-store" });
    if (!response.ok) return setSavedCoupons([]);
    const payload = (await response.json()) as { storeIds?: string[] };
    setSavedCoupons(payload.storeIds ?? []);
  }, []);

  useEffect(() => {
    async function loadSession() {
      const response = await fetch("/sw_002/api/customer-auth", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { user?: CustomerUser | null };
      setUser(payload.user ?? null);
      if (payload.user) await loadFavorites();
    }
    void loadSession();
  }, [loadFavorites]);

  const categories = useMemo(
    () => ["전체", ...Array.from(new Set(stores.map((store) => store.categoryLabel)))],
    [stores],
  );

  const visibleStores = useMemo(
    () => {
      const categoryStores = category === "전체"
        ? stores
        : stores.filter((store) => store.categoryLabel === category);
      const center = stores[0];
      const radiusMeters = radius.endsWith("m")
        ? Number(radius.replace("m", ""))
        : Number(radius.replace("km", "")) * 1000;
      if (!center || !Number.isFinite(radiusMeters)) return categoryStores;
      return categoryStores.filter((store) => distanceInMeters(
        center.latitudeNumber,
        center.longitudeNumber,
        store.latitudeNumber,
        store.longitudeNumber,
      ) <= radiusMeters);
    },
    [category, radius, stores],
  );

  const selectedStore =
    stores.find((store) => store.id === selected) ?? visibleStores[0] ?? stores[0] ?? null;

  const recordView = useCallback((store: MapStore, viewType: ViewType) => {
    const anonymousSessionId = getAnonymousSessionId();
    void fetch("/sw_002/api/store-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: store.id,
        viewType,
        anonymousSessionId,
        latitude: store.latitudeNumber,
        longitude: store.longitudeNumber,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  const selectStore = useCallback(
    (store: MapStore, viewType: ViewType) => {
      setSelected(store.id);
      recordView(store, viewType);
      const maps = (window as KakaoWindow).kakao?.maps;
      if (maps && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(
          new maps.LatLng(store.latitudeNumber, store.longitudeNumber),
        );
      }
    },
    [recordView],
  );

  useEffect(() => {
    const maps = (window as KakaoWindow).kakao?.maps;
    if (tab !== "home" || !mapScriptReady || !maps || !mapElementRef.current || visibleStores.length === 0) {
      return;
    }

    let cancelled = false;
    maps.load(() => {
      if (cancelled || !mapElementRef.current) return;
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];

      const first = visibleStores[0];
      const map = new maps.Map(mapElementRef.current, {
        center: new maps.LatLng(first.latitudeNumber, first.longitudeNumber),
        level: 4,
      }) as KakaoMap;
      const bounds = new maps.LatLngBounds();

      markerRefs.current = visibleStores.map((store): KakaoMarker => {
        const position = new maps.LatLng(store.latitudeNumber, store.longitudeNumber);
        bounds.extend(position);
        const marker = new maps.Marker({ map, position }) as KakaoMarker;
        maps.event.addListener(marker, "click", () => selectStore(store, "MAP_PIN"));
        return marker;
      });

      if (visibleStores.length > 1) map.setBounds(bounds, 70);
      mapInstanceRef.current = map;
      setMapError("");
      window.setTimeout(() => map.relayout?.(), 0);
    });

    return () => {
      cancelled = true;
      markerRefs.current.forEach((marker) => marker.setMap(null));
      markerRefs.current = [];
      mapInstanceRef.current = null;
    };
  }, [mapScriptReady, selectStore, tab, visibleStores]);

  async function saveCoupon(id: string) {
    if (!user) {
      setAuthMode("login");
      setAuthOpen(true);
      setAuthError("즐겨찾기를 저장하려면 로그인해 주세요.");
      return;
    }
    const isSaved = savedCoupons.includes(id);
    const response = await fetch(`/sw_002/api/favorites${isSaved ? `?storeId=${id}` : ""}`, {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: isSaved ? undefined : JSON.stringify({ storeId: id }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setToast(payload.error ?? "즐겨찾기를 처리하지 못했습니다.");
    } else {
      setSavedCoupons((current) => isSaved ? current.filter((storeId) => storeId !== id) : [...current, id]);
      setToast(isSaved ? "즐겨찾기에서 삭제했습니다." : "내 매장에 저장했습니다.");
    }
    window.setTimeout(() => setToast(""), 2200);
  }

  function openStoreDetail(store: MapStore) {
    recordView(store, "STORE_DETAIL");
    setDetailStore(store);
  }

  async function submitAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setAuthBusy(true);
    setAuthError("");
    const response = await fetch("/sw_002/api/customer-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: authMode, email: form.get("email"), password: form.get("password"), nickname: form.get("nickname") }),
    });
    const payload = (await response.json()) as { user?: CustomerUser; error?: string };
    setAuthBusy(false);
    if (!response.ok || !payload.user) return setAuthError(payload.error ?? "로그인하지 못했습니다.");
    setUser(payload.user);
    setAuthOpen(false);
    await loadFavorites();
    setToast(`${payload.user.nickname || payload.user.email}님, 반갑습니다.`);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function logout() {
    const response = await fetch("/sw_002/api/customer-auth", { method: "DELETE", cache: "no-store", credentials: "include" });
    if (!response.ok) {
      setToast("로그아웃하지 못했습니다. 다시 시도해 주세요.");
      window.setTimeout(() => setToast(""), 2200);
      return;
    }
    const sessionResponse = await fetch("/sw_002/api/customer-auth", {
      cache: "no-store",
      credentials: "include",
    });
    const sessionPayload = sessionResponse.ok
      ? await sessionResponse.json() as { user?: CustomerUser | null }
      : { user: null };
    if (sessionPayload.user) {
      setToast("로그아웃 세션을 정리하지 못했습니다. 다시 시도해 주세요.");
      window.setTimeout(() => setToast(""), 2200);
      return;
    }
    setUser(null);
    setSavedCoupons([]);
    setTab("home");
  }

  return (
    <main className={styles.shell}>
      {kakaoJavascriptKey && (
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(kakaoJavascriptKey)}&autoload=false&libraries=services`}
          strategy="afterInteractive"
          onReady={() => setMapScriptReady(true)}
          onError={() => setMapError("카카오 지도를 불러오지 못했습니다. 앱 키와 등록 도메인을 확인해 주세요.")}
        />
      )}

      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="동네온 홈">
          <i>♟</i><span><strong>동네온</strong><small>LOCAL BENEFIT MAP</small></span>
        </Link>
        <nav className={styles.desktopNav} aria-label="주요 메뉴">
          {([['home','홈'],['stores','매장'],['events','이벤트'],['favorites','찜']] as [Tab,string][]).map(([id,label]) => <button key={id} className={tab === id ? styles.activeNav : ""} onClick={() => setTab(id)}>{label}</button>)}
        </nav>
        <div className={styles.headerActions}>{user ? <button className={styles.login} onClick={() => setTab("my")}>{user.nickname || "고객 마이"}</button> : <button className={styles.login} onClick={() => setAuthOpen(true)}>고객 로그인</button>}</div>
      </header>

      {tab === "home" && <ReferenceHome isLoggedIn={Boolean(user)} savedStoreCount={savedCoupons.length} savedStores={stores.filter((store) => savedCoupons.includes(store.id)).map((store) => ({ id: store.id, name: store.name, imageUrl: store.image_url, benefit: store.offer }))} onLogin={() => setAuthOpen(true)} onFavorite={(storeId) => void saveCoupon(storeId)} onBrowseStores={() => setTab("stores")} />}

      {tab === "stores" && <StoreBrowser stores={stores} onStore={openStoreDetail} />}
      {tab === "events" && <SimpleScreen eyebrow="ACTIVE EVENTS" title="이벤트" description="현재 이벤트가 등록된 매장을 확인하세요." stores={stores.filter((store) => store.events.length > 0)} onStore={openStoreDetail} />}
      {tab === "favorites" && (user ? <SimpleScreen eyebrow="SAVED STORES" title="찜한 매장" description="즐겨찾기로 저장한 매장과 이벤트를 확인하세요." stores={stores.filter((store) => savedCoupons.includes(store.id))} onStore={openStoreDetail} empty="아직 저장한 매장이 없습니다. 매장에서 관심 매장을 저장해 보세요." /> : <LoginRequired onLogin={() => setAuthOpen(true)} />)}
      {tab === "my" && (user ? <MyScreen user={user} radius={radius} setRadius={setRadius} savedCount={savedCoupons.length} storeCount={stores.length} onLogout={logout} /> : <LoginRequired onLogin={() => setAuthOpen(true)} />)}

      <footer className={styles.siteFooter}>
        <div className={styles.footerMain}><div><nav className={styles.footerLinks} aria-label="정책 및 안내"><a href="#notice">공지사항</a><a href="#terms">이용약관</a><a href="#privacy">개인정보처리방침</a><a href="#location">위치기반서비스 이용약관</a><a href="mailto:test@gmail.com">문의하기</a></nav><div className={styles.businessInfo}><p><b>상호명</b> 동네온　 <b>대표자</b> 홍길동　 <b>사업자등록번호</b> 123-45-67890</p><p><b>주소</b> 경기도 부천시 길주로 210　 <b>대표전화</b> 010-1234-5678　 <b>이메일</b> help@dongneon.com</p></div><p className={styles.copyright}>© 2026 동네온. All rights reserved.</p></div><div className={styles.socialLinks}><a aria-label="인스타그램">◎</a><a aria-label="페이스북">f</a><a aria-label="채팅">●</a></div></div>
      </footer>

      <nav className={styles.mobileNav}>{([['home','-','홈'],['stores','-','매장'],['events','-','이벤트'],['favorites','-','찜']] as [Tab,string,string][]).map(([id,icon,label]) => <button key={id} className={tab === id ? styles.mobileActive : ""} onClick={() => setTab(id)}><b>{icon}</b><span>{label}</span>{id === 'favorites' && savedCoupons.length > 0 && <i>{savedCoupons.length}</i>}</button>)}</nav>

      {filterOpen && <div className={styles.modalBackdrop} onMouseDown={() => setFilterOpen(false)}><section className={styles.filterModal} onMouseDown={(event) => event.stopPropagation()}><header><div><span>MAP FILTER</span><h2>어떤 매장을 찾으세요?</h2></div><button onClick={() => setFilterOpen(false)}>×</button></header><div><label>표시 반경</label><div className={styles.pills}>{["500m","1km","3km","5km","10km"].map((item) => <button key={item} className={radius === item ? styles.pillActive : ""} onClick={() => setRadius(item)}>{item}</button>)}</div><label>업종</label><div className={styles.pills}>{categories.map((item) => <button key={item} className={category === item ? styles.pillActive : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div><footer><button onClick={() => { setRadius("1km"); setCategory("전체"); }}>초기화</button><button onClick={() => setFilterOpen(false)}>매장 {visibleStores.length}개 보기</button></footer></section></div>}
      {detailStore && <StoreDetailModal store={detailStore} favorite={savedCoupons.includes(detailStore.id)} onFavorite={() => void saveCoupon(detailStore.id)} onClose={() => setDetailStore(null)} />}
      {authOpen && <div className={styles.modalBackdrop} onMouseDown={() => setAuthOpen(false)}><form className={mapStyles.authModal} onSubmit={submitAuth} onMouseDown={(event) => event.stopPropagation()}><header><div><span>CUSTOMER ACCOUNT ONLY</span><h2>{authMode === "login" ? "고객 로그인" : "고객 회원가입"}</h2><p className={mapStyles.authNotice}>내 매장과 마이 메뉴를 이용하는 고객 전용 계정입니다. 매장관리자·통합관리자 계정과는 별개입니다.</p></div><button type="button" onClick={() => setAuthOpen(false)}>×</button></header>{authMode === "register" && <label>닉네임<input name="nickname" maxLength={100} placeholder="표시할 이름" /></label>}<label>고객 이메일<input name="email" type="email" required autoComplete="email" placeholder="customer@example.com" /></label><label>고객 비밀번호<input name="password" type="password" required autoComplete={authMode === "login" ? "current-password" : "new-password"} placeholder="개발 중에는 1도 사용 가능" /></label>{authError && <p className={mapStyles.authError}>{authError}</p>}<button className={mapStyles.authSubmit} disabled={authBusy}>{authBusy ? "처리 중..." : authMode === "login" ? "고객 로그인" : "고객 회원가입"}</button><button type="button" className={mapStyles.authSwitch} onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}>{authMode === "login" ? "고객 계정이 없나요? 회원가입" : "고객 계정이 있나요? 로그인"}</button></form></div>}
      {toast && <div className={styles.toast}>{toast}</div>}
    </main>
  );
}

function StoreBrowser({ stores, onStore }: { stores: MapStore[]; onStore: (store: MapStore) => void }) {
  const [majorCategories, setMajorCategories] = useState<Array<{ code: string; code_name: string }>>([]);
  const [middleCategories, setMiddleCategories] = useState<Array<{ code: string; code_name: string; parent_grp_cd: string }>>([]);
  const [eventTypes, setEventTypes] = useState<Array<{ code: string; code_name: string }>>([]);
  const [major, setMajor] = useState("");
  const [middle, setMiddle] = useState("");
  const [eventType, setEventType] = useState("");
  const [locationLabel, setLocationLabel] = useState("");

  useEffect(() => {
    void fetch("/sw_002/api/store-categories", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        setMajorCategories(result.allMajorCategories ?? result.majorCategories ?? []);
        setMiddleCategories(result.middleCategories ?? []);
        setEventTypes(result.eventTypes ?? []);
      });
    try {
      const saved = JSON.parse(localStorage.getItem("sw002-selected-location") || "{}") as { label?: string };
      setLocationLabel(saved.label ?? "");
    } catch {}
  }, []);

  const regionName = locationLabel.match(/[가-힣]+(?:동|읍|면|리)/)?.[0] || "";
  const availableMiddle = middleCategories.filter((item) => item.parent_grp_cd === major);
  const filtered = stores.filter((store) =>
    (!regionName || (store.jibun_address || "").includes(regionName))
    && (!major || store.category === major)
    && (!middle || store.category2 === middle)
    && (!eventType || store.events.some((event) => event.eventType === eventType)),
  );

  return <section className={styles.subPage}>
    <div className={styles.subHead}><span>STORE EXPLORER</span><h1>매장 찾기</h1><p>{locationLabel || "선택 지역"}의 업종과 이벤트를 선택해 매장을 찾아보세요.</p></div>
    <div className={styles.categories}><button className={!major ? styles.selectedCategory : ""} onClick={() => { setMajor(""); setMiddle(""); }}>전체</button>{majorCategories.map((item) => <button key={item.code} className={major === item.code ? styles.selectedCategory : ""} onClick={() => { setMajor(item.code); setMiddle(""); }}><i>{categoryEmoji(item.code_name)}</i><span>{item.code_name}</span></button>)}</div>
    {major && availableMiddle.length > 0 && <div className={styles.quickFilters}><button className={!middle ? styles.activeFilter : ""} onClick={() => setMiddle("")}>전체 중분류</button>{availableMiddle.map((item) => <button key={item.code} className={middle === item.code ? styles.activeFilter : ""} onClick={() => setMiddle(item.code)}>{item.code_name}</button>)}</div>}
    <div className={styles.quickFilters}><button className={!eventType ? styles.activeFilter : ""} onClick={() => setEventType("")}>전체 이벤트</button>{eventTypes.map((item) => <button key={item.code} className={eventType === item.code ? styles.activeFilter : ""} onClick={() => setEventType(item.code)}>{item.code_name}</button>)}</div>
    <div className={styles.sectionTitle}><div><span>{regionName || "전체 지역"}</span><h2>검색 결과 {filtered.length}개</h2></div></div>
    {filtered.length ? <div className={styles.eventList}>{filtered.map((store) => <article key={store.id}><div className={styles.listEmoji}>{store.image_url ? <img src={store.image_url} alt="" /> : store.emoji}</div><div><span className={`${styles.badge} ${styles[store.tone]}`}>{store.badge}</span><small>{store.categoryLabel} · {store.jibun_address || store.address}</small><h2>{store.name}</h2><p>{store.offer}</p></div><button onClick={() => onStore(store)}>상세 보기</button></article>)}</div> : <div className={styles.empty}>선택한 조건에 해당하는 매장이 없습니다.</div>}
  </section>;
}

function SimpleScreen({ eyebrow, title, description, stores, onStore, empty }: { eyebrow: string; title: string; description: string; stores: MapStore[]; onStore: (store: MapStore) => void; empty?: string }) {
  return <section className={styles.subPage}><div className={styles.subHead}><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{stores.length ? <div className={styles.eventList}>{stores.map((store) => <article key={store.id}><div className={styles.listEmoji}>{store.emoji}</div><div><span className={`${styles.badge} ${styles[store.tone]}`}>{store.badge}</span><small>{store.categoryLabel} · {store.address}</small><h2>{store.name}</h2><p>{store.offer}</p></div><button onClick={() => onStore(store)}>상세 조회</button></article>)}</div> : <div className={styles.empty}>{empty}</div>}</section>;
}

function StoreDetailModal({ store, favorite, onFavorite, onClose }: { store: MapStore; favorite: boolean; onFavorite: () => void; onClose: () => void }) {
  return <div className={styles.modalBackdrop} onMouseDown={onClose}><section className={mapStyles.detailModal} onMouseDown={(event) => event.stopPropagation()}><header><div><span>{store.categoryLabel}</span><h2>{store.name}</h2><p>{store.address}{store.address_detail ? ` ${store.address_detail}` : ""}</p></div><button onClick={onClose}>×</button></header><div className={mapStyles.detailActions}><button onClick={onFavorite}>{favorite ? "★ 내 매장에서 삭제" : "☆ 내 매장에 저장"}</button><a href={`tel:${store.phone || ""}`}>{store.phone ? "전화하기" : "전화번호 미등록"}</a></div><section className={mapStyles.benefitSection}><h3>진행 중인 이벤트 <b>{store.events.length}</b></h3>{store.events.length ? <div className={mapStyles.benefitList}>{store.events.map((event) => <article key={event.id}><span>{event.mapIcon || "EVENT"}</span><div><h4>{event.title}</h4><p>{event.description || "매장에서 제공하는 이벤트입니다."}</p><small>{formatPeriod(event.startAt, event.endAt)} · {event.status === "ACTIVE" ? "진행 중" : "예정"}</small></div></article>)}</div> : <p className={mapStyles.noBenefit}>현재 진행 중인 이벤트가 없습니다.</p>}</section><section className={mapStyles.benefitSection}><h3>사용 가능한 쿠폰 <b>{store.coupons.length}</b></h3>{store.coupons.length ? <div className={mapStyles.benefitList}>{store.coupons.map((coupon) => <article key={coupon.id}><span>COUPON</span><div><h4>{coupon.name}</h4><p>{coupon.description || discountLabel(coupon)}</p><small>{formatPeriod(coupon.startAt, coupon.endAt)}{coupon.minimumOrderAmount > 0 ? ` · ${coupon.minimumOrderAmount.toLocaleString()}원 이상` : ""}</small></div></article>)}</div> : <p className={mapStyles.noBenefit}>현재 사용 가능한 쿠폰이 없습니다.</p>}</section><dl className={mapStyles.storeInfo}><div><dt>영업시간</dt><dd>{formatOpeningHours(store.opening_hours)}</dd></div><div><dt>전화번호</dt><dd>{store.phone || "미등록"}</dd></div><div><dt>매장 소개</dt><dd>{store.description || "등록된 소개가 없습니다."}</dd></div></dl></section></div>;
}

function formatPeriod(startAt: string | null, endAt: string | null) {
  const format = (value: string | null) => value ? new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric" }).format(new Date(value)) : "상시";
  return `${format(startAt)} ~ ${format(endAt)}`;
}

function discountLabel(coupon: StoreCoupon) {
  if (coupon.discountType === "PERCENT") return `${coupon.discountValue}% 할인`;
  if (coupon.discountType === "AMOUNT") return `${coupon.discountValue.toLocaleString()}원 할인`;
  if (coupon.discountType === "GIFT") return "상품 증정 쿠폰";
  return "서비스 제공 쿠폰";
}

function LoginRequired({ onLogin }: { onLogin: () => void }) {
  return <section className={styles.subPage}><div className={styles.empty}><h2>로그인이 필요한 메뉴입니다.</h2><p>로그인하면 즐겨찾기로 저장한 매장과 관심 정보를 여러 기기에서 확인할 수 있습니다.</p><button className={mapStyles.loginRequiredButton} onClick={onLogin}>고객 로그인</button></div></section>;
}

function MyScreen({ user, radius, setRadius, savedCount, storeCount, onLogout }: { user: CustomerUser; radius: string; setRadius: (value: string) => void; savedCount: number; storeCount: number; onLogout: () => void }) {
  return <section className={styles.subPage}><div className={styles.subHead}><span>MY LOCAL BENEFIT</span><h1>{user.nickname || user.email}님의 동네온</h1><p>관심 매장과 지도 표시 조건을 관리하세요.</p><button className={mapStyles.logoutButton} onClick={onLogout}>로그아웃</button></div><div className={styles.myGrid}><article><span>내 매장</span><strong>{savedCount}</strong><small>즐겨찾기로 저장한 매장</small></article><article><span>등록 매장</span><strong>{storeCount}</strong><small>지도 좌표 연동</small></article><section><h2>계정 정보</h2><p>{user.email}</p><h2>지도 설정</h2><label>표시 반경<select value={radius} onChange={(event) => setRadius(event.target.value)}>{["500m","1km","3km","5km","10km"].map((item) => <option key={item}>{item}</option>)}</select></label></section></div></section>;
}

