import ServiceCard from "@/components/ServiceCard";
import styles from "@/components/home/Home.module.css";
import { services } from "@/data/services";

export default function ServiceSection() {
  return (
    <section id="services" className={`${styles.section} ${styles.servicesSection}`}>
      <div className={styles.container}>
        <div className={`${styles.sectionHeading} ${styles.darkSectionHeading}`}>
          <p className={styles.sectionLabel}>OUR SERVICES</p>
          <h2>NexDataForge Services</h2>
          <p>
            각 서비스는 독립적인 웹 애플리케이션으로 개발되며, 완성되는
            순서대로 이곳에서 공개됩니다.
          </p>
        </div>

        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
