import styles from "@/components/home/Home.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <div className={styles.brandGroup}>
          <a className={styles.logo} href="#top" aria-label="NexDataForge 홈">
            <span className={styles.logoMark}>N</span>
            <span>NexDataForge</span>
          </a>

          <p className={styles.siteNote}>
            개인 연구·개발과 기술 검증을 위해 운영하는 비상업적 프로젝트 사이트
          </p>
        </div>

        <nav className={styles.nav} aria-label="주요 메뉴">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#technology">Technology</a>
        </nav>
      </div>
    </header>
  );
}
