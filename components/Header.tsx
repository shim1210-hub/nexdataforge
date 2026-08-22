import styles from "@/components/home/Home.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <a className={styles.logo} href="#top" aria-label="NexDataForge 홈">
          <span className={styles.logoMark}>N</span>
          <span>NexDataForge</span>
        </a>

        <nav className={styles.nav} aria-label="주요 메뉴">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#technology">Technology</a>
        </nav>
      </div>
    </header>
  );
}
