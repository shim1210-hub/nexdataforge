export default function HeroSection() {
  return (
    <section id="top" className="hero-section">
      <div className="hero-background" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
      </div>

      <div className="container hero-content">
        <p className="eyebrow">PUBLIC DATA · WEB SERVICE · DATA VISUALIZATION</p>

        <h1>
          데이터를 연결하여
          <br />
          <span>생활에 필요한 서비스</span>를 만듭니다.
        </h1>

        <p className="hero-description">
          NexDataForge는 공공데이터와 다양한 데이터를 수집·분석하고,
          누구나 쉽게 이용할 수 있는 웹서비스로 만드는 개인 프로젝트
          플랫폼입니다.
        </p>

        <div className="hero-actions">
          <a className="button button-primary" href="#services">
            서비스 살펴보기
          </a>

          <a className="button button-secondary" href="#about">
            NexDataForge 소개
          </a>
        </div>

        <div className="hero-stat-list">
          <div>
            <strong>3</strong>
            <span>Planned Services</span>
          </div>

          <div>
            <strong>Open Data</strong>
            <span>Public API Integration</span>
          </div>

          <div>
            <strong>PostgreSQL</strong>
            <span>Data Platform</span>
          </div>
        </div>
      </div>
    </section>
  );
}