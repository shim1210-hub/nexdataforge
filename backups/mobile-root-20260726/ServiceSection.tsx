import ServiceCard from "@/components/ServiceCard";
import { services } from "@/data/services";

export default function ServiceSection() {
  return (
    <section id="services" className="section service-section">
      <div className="container">
        <div className="section-heading">
          <p className="section-label">OUR SERVICES</p>
          <h2>NexDataForge에서 준비하는 서비스</h2>
          <p>
            각 서비스는 독립적인 웹 애플리케이션으로 개발되며, 완성되는
            순서대로 이곳에서 공개됩니다.
          </p>
        </div>

        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}