const businessInfo = [
  { label: "상호명", value: "유틸박스" },
  { label: "주소", value: "경기도 부천" },
  { label: "대표자명", value: "심XX" },
  { label: "대표전화", value: "010-0000-0000" },
  { label: "사업자등록번호", value: "123-01-45678" },
  { label: "통신판매업신고번호", value: "제2026-부천시-00001" },
  { label: "이메일", value: "test@gmail.com" },
];

const footerLinks = [
  { label: "공지사항", href: "#notice" },
  { label: "이용약관", href: "#terms" },
  { label: "개인정보처리방침", href: "#privacy" },
  { label: "문의하기", href: "mailto:test@gmail.com" },
];

export default function Sw005Footer() {
  return (
    <footer className="sw005-footer">
      <div className="sw005-footer-inner">
        <nav className="sw005-footer-links" aria-label="SW_005 푸터 메뉴">
          {footerLinks.map((link) => (
            <a href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>

        <dl className="sw005-business-info">
          {businessInfo.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <p className="sw005-footer-copy">&copy; 2026 유틸박스. All rights reserved.</p>
      </div>
    </footer>
  );
}
