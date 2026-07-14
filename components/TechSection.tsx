const technologies = [
  {
    category: "Frontend",
    items: ["Next.js", "React", "TypeScript"],
  },
  {
    category: "Backend & API",
    items: ["Next.js API", "Public Data API", "REST API"],
  },
  {
    category: "Database",
    items: ["PostgreSQL", "Supabase"],
  },
  {
    category: "Deployment",
    items: ["GitHub", "Vercel"],
  },
];

export default function TechSection() {
  return (
    <section id="technology" className="section tech-section">
      <div className="container">
        <div className="section-heading">
          <p className="section-label">TECHNOLOGY</p>
          <h2>서비스를 구성하는 기술</h2>
          <p>
            서비스 성격에 따라 기술은 달라질 수 있으며, 개발과 운영이
            지나치게 복잡하지 않은 구성을 우선합니다.
          </p>
        </div>

        <div className="tech-grid">
          {technologies.map((technology) => (
            <article className="tech-card" key={technology.category}>
              <h3>{technology.category}</h3>

              <div className="tag-list">
                {technology.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}