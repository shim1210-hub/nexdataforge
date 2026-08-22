import type { Service } from "@/data/services";
import styles from "@/components/home/Home.module.css";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className={styles.serviceCard}>
      <div className={styles.serviceCardTop}>
        <span className={styles.serviceIcon} aria-hidden="true">
          {service.icon}
        </span>

        <span className={styles.statusBadge}>{service.status}</span>
      </div>

      <h3>{service.title}</h3>
      <p className={styles.serviceDescription}>{service.description}</p>

      <ul className={styles.featureList}>
        {service.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      {service.enabled ? (
        <a className={styles.serviceLink} href={service.href}>
          서비스 이용하기 →
        </a>
      ) : (
        <span className={`${styles.serviceLink} ${styles.serviceLinkDisabled}`}>
          준비 중
        </span>
      )}
    </article>
  );
}
