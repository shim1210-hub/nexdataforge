import styles from "@/components/home/Home.module.css";

export default function HeroSection() {
  return (
    <section id="top" className={styles.hero}>
      <div className={`${styles.container} ${styles.heroContent}`}>
        <p className={styles.eyebrow}>NEXDATAFORGE</p>

        <h1>
          Build Intelligence.
          <span>Forge Better Systems.</span>
        </h1>

        <p className={styles.heroDescription}>
          AI와 데이터 기술로 정보를 연결하고 더 나은 판단과 운영을 돕는 서비스를
          만듭니다.
        </p>

        <div className={styles.actions}>
          <a className={`${styles.button} ${styles.primaryButton}`} href="#services">
            Explore Services
          </a>
        </div>
      </div>
    </section>
  );
}
