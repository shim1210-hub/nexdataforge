"use client";

import { useEffect, useState } from "react";
import styles from "./ReferenceHome.module.css";

type ReferenceStore = {
  id: string;
  category: string | null;
  name: string;
  image_url: string | null;
  event_title: string | null;
  description: string | null;
  events: Array<{ title: string; description: string | null; eventType: string; endAt: string | null; mapIcon: string | null }>;
};
type CategoryOption = { code: string; code_name: string };

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

export default function ReferenceHome() {
  const [cards, setCards] = useState<ReadonlyArray<readonly [string, string, string, string, string]>>([]);
  const [stores, setStores] = useState<ReferenceStore[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventTypes, setEventTypes] = useState<CategoryOption[]>([]);
  const [selectedEventType, setSelectedEventType] = useState("");

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
        return loadedStores;
      })
      .then((loadedStores) => {
        const registeredCards = loadedStores.filter((store) => store.events.length > 0).slice(0, 3).map((store) => {
          const event = store.events[0];
          const title = event?.title || store.event_title || "진행 중인 혜택";
          const offer = event?.description?.trim() ? `${title} · ${event.description.trim()}` : title;
          const image = store.image_url || "";
          const badge = event?.mapIcon || "EVENT";
          return [store.name, offer, "주변", image, badge] as const;
        });
        if (registeredCards.length) setCards(registeredCards);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const filteredStores = (selectedCategory ? stores.filter((store) => store.category === selectedCategory) : stores)
      .filter((store) => !selectedEventType || store.events.some((event) => event.eventType === selectedEventType))
      .filter((store) => store.events.length > 0)
      .slice(0, 3);
    setCards(filteredStores.map((store) => {
      const event = store.events[0];
      const title = event?.title || store.event_title || "진행 중인 혜택";
      const offer = event?.description?.trim() ? `${title} · ${event.description.trim()}` : title;
      return [store.name, offer, "주변", store.image_url || "", event?.mapIcon || "EVENT"] as const;
    }));
  }, [selectedCategory, selectedEventType, stores]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setInterval(() => {
      const maps = (window as Window & { kakao?: { maps?: any } }).kakao?.maps;
      const mapElement = document.querySelector(`.${styles.map}`);
      if (cancelled || !(mapElement instanceof HTMLElement) || !maps) return;
      window.clearInterval(timer);
      maps.load(() => {
        if (!cancelled) {
          new maps.Map(mapElement, {
            center: new maps.LatLng(37.5036, 126.7660),
            level: 5,
          });
        }
      });
    }, 100);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  return <section className={styles.page}>
    <div className={styles.hero}><div><h1>우리 동네<br /><em>혜택</em>을 켜는 시간</h1><p>지금 내 주변<br />받을 수 있는 혜택은?</p><small>500m 안의 할인 · 쿠폰 · 타임세일을<br />지금 바로 찾아보세요.</small></div><div className={styles.stats}>{[["▣","37","진행 혜택","지금 이용 가능"],["▰","25","할인 쿠폰","다운로드 가능"],["♥","12","찜한 매장","새 혜택 3건"]].map(([icon,num,title,sub])=><article key={title}><i>{icon}</i><b>{num}</b><span>{title}</span><small>{sub}</small></article>)}</div></div>
    <div className={styles.controls}><div className={styles.row+" "+styles.time}><button className={styles.location}>📍 <b>부천시 중동</b><span>변경 ›</span></button><button className={styles.active}>🔥 지금 이용 가능</button><button>오늘</button><button>이번 주</button><button>주말</button></div><div className={styles.row+" "+styles.radius}>{["500m","1km","3km","5km"].map((x,i)=><button className={i===0?styles.active:""} key={x}>{x}</button>)}</div><div className={styles.row+" "+styles.category}>{categories.map((item) => <button className={selectedCategory === item.code ? styles.active : ""} key={item.code} onClick={() => setSelectedCategory(selectedCategory === item.code ? "" : item.code)}><i>{categoryIcon(item.code_name)}</i>{item.code_name}</button>)}<button type="button" className={styles.categoryPlaceholder} disabled><i>🍽️</i>기타</button></div><div className={styles.row+" "+styles.benefit}><button className={`${styles.benefitButton} ${!selectedEventType ? styles.active : ""}`} onClick={() => setSelectedEventType("")}><i>{eventIcon("전체 혜택")}</i>전체 혜택</button>{eventTypes.map((item) => <button className={`${styles.benefitButton} ${selectedEventType === item.code ? styles.active : ""}`} key={item.code} onClick={() => setSelectedEventType(selectedEventType === item.code ? "" : item.code)}><i>{eventIcon(item.code_name)}</i>{item.code_name}</button>)}</div></div>
    <div className={styles.heading}><h2>🔥 지금 받을 수 있는 혜택</h2><a>전체보기 ›</a></div><div className={styles.cards}>{cards.map(([name,offer,distance,image,badge])=><article className={styles.card} key={name}><div className={styles.photo} style={{backgroundImage:`url(${image})`}}><b className={styles[badgeClass(badge)]}>{badge}</b></div><div className={styles.cardBody}><h3>{name}<small>{distance}</small></h3><p>{offer}</p><footer>🟢 진행중　 ◷ <i>등록 이벤트</i></footer><nav className={styles.actions}><button>🎟 쿠폰받기</button><button>⌖ 길찾기</button><button>♡ 찜</button></nav></div></article>)}</div>
    <div className={styles.heading}><h2>📍 주변 혜택 지도</h2></div><div className={styles.map}><div className={styles.pins}>{["🔥","％","🏪","🎟","🔥","🏪","％","🏪","🔥"].map((x,i)=><i key={i} style={{left:`${12+(i*19)%78}%`,top:`${18+(i*29)%62}%`}}>{x}</i>)}</div><b className={styles.center}>●</b><span className={styles.legend}>🟢 진행중　 🟠 곧 종료　 🔴 종료 임박　 🟣 쿠폰 사용 가능</span><button className={styles.mapMore}>지도 크게보기 ↗</button></div>
    <div className={styles.bottom}><article className={styles.panel}><h2>⭐ 내가 찜한 매장의 새 혜택</h2><div className={styles.saved}><img src="/sw_002/uploads/4-d0316f0d-1246-4265-bf63-23e9d91d0895.jpg" alt="" /><span><b>육즙집</b><small>직화 닭발 2,000원 할인<br />180m</small></span><i>◷ 45분 남음</i></div><div className={styles.saved}><img src="/sw_002/uploads/5-cbc9b292-be9a-4218-9734-79855482d0dc.jpg" alt="" /><span><b>당과원(디저트)</b><small>아메리카노 1+1</small></span><i>◷ 오늘 18:00까지</i></div></article><article className={styles.panel}><h2>📍 자주 가는 동네　<a>관리 ›</a></h2><div className={styles.neighborhood}><b>중동<small>현재 37개 혜택</small></b><b>상동<small>24개 혜택</small></b><b>역곡<small>18개 혜택</small></b></div><p className={styles.notice}>🔔 관심 동네에 새로운 혜택이 등록되면 알려드릴게요!<button>알림 설정하기</button></p></article></div>
  </section>;
}
