import type { Service } from "@/data/services";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="service-card">
      <div className="service-card-top">
        <span className="service-icon" aria-hidden="true">
          {service.icon}
        </span>

        <span className="status-badge">{service.status}</span>
      </div>

      <p className="service-id">{service.id}</p>
      <h3>{service.title}</h3>
      <p className="service-description">{service.description}</p>

      <ul className="feature-list">
        {service.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      {service.enabled ? (
        <a className="service-link" href={service.href}>
          서비스 이용하기 →
        </a>
      ) : (
        <span className="service-link service-link-disabled">
          서비스 준비 중
        </span>
      )}
    </article>
  );
}