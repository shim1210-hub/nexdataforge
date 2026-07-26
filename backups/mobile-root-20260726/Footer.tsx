const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "Public Data Platform", href: "#services" },
      { label: "Data Visualization", href: "#services" },
      { label: "API Integration", href: "#services" },
      { label: "Service Roadmap", href: "#technology" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Technology Stack", href: "#technology" },
      { label: "Open Data Strategy", href: "#about" },
      { label: "Project Notes", href: "#about" },
      { label: "Contact", href: "mailto:hello@nexdataforge.com" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Technology", href: "#technology" },
      { label: "Status", href: "#top" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <a className="footer-logo" href="#top" aria-label="NexDataForge 홈">
            <span className="footer-logo-mark">N</span>
            <span>NexDataForge</span>
          </a>

          <p>
            공공 데이터와 웹 서비스를 연결해 일상에 필요한 데이터 제품을
            설계하고 구현합니다.
          </p>

          <div className="footer-status" aria-label="Service status">
            <span className="footer-status-dot" />
            New services in active planning
          </div>
        </div>

        <div className="footer-links">
          {footerColumns.map((column) => (
            <nav aria-label={column.title} className="footer-column" key={column.title}>
              <h3>{column.title}</h3>

              {column.links.map((link) => (
                <a href={link.href} key={link.label}>
                  {link.label}
                </a>
              ))}
            </nav>
          ))}
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} NexDataForge. All rights reserved.</p>

        <div className="footer-legal">
          <a href="#top">Back to top</a>
          <a href="mailto:hello@nexdataforge.com">hello@nexdataforge.com</a>
        </div>
      </div>
    </footer>
  );
}
