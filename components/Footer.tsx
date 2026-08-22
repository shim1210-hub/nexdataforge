import styles from "@/components/home/Home.module.css";

const footerColumns = [
  {
    title: "Services",
    links: [
      { label: "DongneOn", href: "/sw_002" },
      { label: "Util", href: "/sw_005" },
      { label: "AI Website Factory", href: "/sw_006" },
      { label: "MetaSys", href: "/sw_007" },
      { label: "Data Analytics", href: "/sw_003" },
      { label: "AI Assistant · Coming Soon" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "About", href: "#about" },
      { label: "Services", href: "#services" },
      { label: "Technology", href: "#technology" },
    ],
  },
  {
    title: "Contact",
    links: [{ label: "hello@nexdataforge.com", href: "mailto:hello@nexdataforge.com" }],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} ${styles.footerMain}`}>
        <div className={styles.footerBrand}>
          <a className={styles.footerLogo} href="#top" aria-label="NexDataForge 홈">
            <span className={styles.footerLogoMark}>N</span>
            <span>NexDataForge</span>
          </a>

          <p>
            AI와 데이터 기술로
            <br />
            실용적인 웹 서비스를 만듭니다.
          </p>
        </div>

        <div className={styles.footerLinks}>
          {footerColumns.map((column) => (
            <nav aria-label={column.title} className={styles.footerColumn} key={column.title}>
              <h3>{column.title}</h3>

              {column.links.map((link) =>
                link.href ? (
                  <a href={link.href} key={link.label}>
                    {link.label}
                  </a>
                ) : (
                  <span key={link.label}>{link.label}</span>
                ),
              )}
            </nav>
          ))}
        </div>
      </div>

      <div className={`${styles.container} ${styles.footerBottom}`}>
        <p>&copy; 2026 NexDataForge</p>

        <div className={styles.footerLegal}>
          <a href="#top">Back to top</a>
          <a href="mailto:hello@nexdataforge.com">hello@nexdataforge.com</a>
        </div>
      </div>
    </footer>
  );
}
