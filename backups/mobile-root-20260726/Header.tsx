
export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="logo" href="#top" aria-label="NexDataForge 홈">
          <span className="logo-mark">N</span>
          <span>NexDataForge</span> 
        </a>
        이 홈페이지는 현재 개발중입니다. 상업용이 아닌 개인 개발/테스트 홈페이지입니다. (Beta)
        <nav className="main-nav" aria-label="주요 메뉴">
          <a href="#about">소개</a>
          <a href="#services">서비스</a>
          <a href="#technology">기술</a>
        </nav>
      </div>
    </header>
  );
}