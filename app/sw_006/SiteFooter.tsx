import styles from "./footer-preview.module.css";

export type SiteFooterData = {
  companyName?: string | null;
  representativeName?: string | null;
  businessNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  copyrightText?: string | null;
  siteByText?: string | null;
};

export default function SiteFooter({ footer, siteName }: { footer: SiteFooterData | null; siteName: string }) {
  const companyName = footer?.companyName || siteName;
  const details = [
    ["대표자", footer?.representativeName],
    ["사업자등록번호", footer?.businessNumber],
    ["대표 이메일", footer?.email],
    ["전화번호", footer?.phone],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return <div className={styles.body}>
    <header>
      <div><strong>{companyName}</strong><p>신뢰와 가치를 만드는 기업</p></div>
    </header>
    <div className={styles.details}>
      {details.map(([label, value]) => <dl key={label}><dt>{label}</dt><dd>{value}</dd></dl>)}
      {footer?.address && <dl className={styles.address}><dt>주소</dt><dd>{footer.address}</dd></dl>}
    </div>
    <div className={styles.bottom}>
      <small>{footer?.copyrightText || `Copyright © ${new Date().getFullYear()} ${companyName}. All Rights Reserved.`}</small>
      {footer?.siteByText && <em>Site by {footer.siteByText}</em>}
    </div>
  </div>;
}
