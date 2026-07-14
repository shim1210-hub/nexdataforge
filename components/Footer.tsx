export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-logo">NexDataForge</p>
          <p>데이터를 연결하고 생활에 필요한 서비스를 만듭니다.</p>
        </div>

        <p className="copyright">
          © {new Date().getFullYear()} NexDataForge. All rights reserved.
        </p>
      </div>
    </footer>
  );
}