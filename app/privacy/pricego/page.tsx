import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "PriceGo 개인정보처리방침",
  description:
    "NexDataForge가 제공하는 PriceGo 앱의 개인정보처리방침입니다.",
};

const policySections = [
  {
    title: "1. 서비스 안내",
    content: (
      <p>
        PriceGo는 해외여행 중 외화 가격을 한국 원화로 쉽게 환산해주는
        여행용 환율 계산 앱입니다.
      </p>
    ),
  },
  {
    title: "2. 개인정보의 수집",
    content: (
      <>
        <p>
          PriceGo는 사용자의 이름, 연락처, 주소, 위치정보, 계정정보를
          수집하지 않습니다.
        </p>
        <p>
          또한 광고 식별자, 위치정보, 연락처 및 계정정보를 수집하지
          않습니다.
        </p>
      </>
    ),
  },
  {
    title: "3. 기기 권한의 이용",
    content: (
      <ul>
        <li>
          <strong>마이크 권한</strong>: 사용자가 말한 가격을 인식하기 위해
          사용됩니다.
        </li>
        <li>
          <strong>카메라 권한</strong>: 가격표, 메뉴판, 영수증 등의 금액을
          인식하기 위해 사용됩니다.
        </li>
      </ul>
    ),
  },
  {
    title: "4. 음성 및 이미지 데이터",
    content: (
      <p>
        마이크를 통해 입력된 음성 데이터와 카메라로 촬영한 이미지는
        NexDataForge 서버에 저장하지 않습니다.
      </p>
    ),
  },
  {
    title: "5. 외부 환율 API 이용",
    content: (
      <>
        <p>
          PriceGo는 최신 환율을 조회하기 위해 외부 환율 API에 접속할 수
          있습니다. 환율 API 요청 시 사용자의 개인 식별 정보는 전송하지
          않습니다.
        </p>
        <p>
          단, Google Play, Android 운영체제 및 외부 환율 API 제공자가
          자체적으로 처리하는 기술 정보는 각 제공자의 개인정보처리방침과
          정책을 따를 수 있습니다.
        </p>
      </>
    ),
  },
  {
    title: "6. 기기 내부 저장 정보",
    content: (
      <p>
        원활한 앱 이용을 위해 앱 설정, 선택 국가, 최근 환율 정보 등이
        사용자의 기기 내부 저장소에 저장될 수 있습니다.
      </p>
    ),
  },
  {
    title: "7. 제3자 제공",
    content: (
      <p>
        PriceGo는 사용자의 개인정보를 제3자에게 판매하거나 공유하지
        않습니다.
      </p>
    ),
  },
  {
    title: "8. 권한 철회",
    content: (
      <p>
        사용자는 Android 설정에서 언제든지 PriceGo에 부여한 마이크 및
        카메라 권한을 철회할 수 있습니다. 권한을 철회하면 해당 권한이
        필요한 음성 또는 이미지 인식 기능의 이용이 제한될 수 있습니다.
      </p>
    ),
  },
];

export default function PriceGoPrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/" aria-label="NexDataForge 홈">
            <span className={styles.brandMark} aria-hidden="true">
              N
            </span>
            <span>NexDataForge</span>
          </Link>
          <span className={styles.product}>PriceGo</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>PRIVACY POLICY</p>
          <h1>PriceGo 개인정보처리방침</h1>
          <p className={styles.introduction}>
            NexDataForge는 PriceGo 이용자의 개인정보를 중요하게 생각하며,
            앱에서 이용되는 정보와 권한을 투명하게 안내합니다.
          </p>
          <dl className={styles.summary}>
            <div>
              <dt>운영자</dt>
              <dd>NexDataForge</dd>
            </div>
            <div>
              <dt>시행일</dt>
              <dd>2026년 8월 16일</dd>
            </div>
          </dl>
        </div>

        <article className={styles.policy}>
          {policySections.map((section) => (
            <section className={styles.section} key={section.title}>
              <h2>{section.title}</h2>
              <div className={styles.sectionBody}>{section.content}</div>
            </section>
          ))}

          <section className={styles.section}>
            <h2>9. 개인정보 관련 문의</h2>
            <div className={styles.contact}>
              <strong>NexDataForge</strong>
              <a href="mailto:hyunsuk.shim@nexdataforge.com">
                hyunsuk.shim@nexdataforge.com
              </a>
            </div>
          </section>

          <aside className={styles.notice}>
            본 개인정보처리방침은 PriceGo 앱의 기능 변경, 관련 법령 또는
            서비스 운영 정책에 따라 변경될 수 있습니다.
          </aside>
        </article>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>© 2026 NexDataForge. All rights reserved.</span>
          <Link href="/">NexDataForge 홈</Link>
        </div>
      </footer>
    </div>
  );
}
