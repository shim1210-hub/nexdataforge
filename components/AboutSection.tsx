import styles from "@/components/home/Home.module.css";

const values = [
  {
    number: "01",
    title: "데이터 연결",
    description:
      "공공데이터와 외부 API를 연결해 흩어진 정보를 하나의 서비스로 구성합니다.",
  },
  {
    number: "02",
    title: "정보 시각화",
    description:
      "복잡한 데이터를 지도, 표, 그래프로 표현해 쉽게 이해할 수 있도록 합니다.",
  },
  {
    number: "03",
    title: "생활형 서비스",
    description:
      "단순한 기술 구현을 넘어 실제 생활에 활용할 수 있는 서비스를 만듭니다.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className={`${styles.section} ${styles.aboutSection}`}>
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionLabel}>ABOUT NEXDATAFORGE</p>
          <h2>데이터에서 시작해 서비스로 완성합니다.</h2>
          <p>
            NexDataForge는 데이터 수집, 저장, 분석, 시각화와 웹서비스
            개발 과정을 하나씩 구현하고 기록하는 포트폴리오 프로젝트입니다.
          </p>
        </div>

        <div className={styles.valueGrid}>
          {values.map((value) => (
            <article className={styles.valueCard} key={value.number}>
              <span>{value.number}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
