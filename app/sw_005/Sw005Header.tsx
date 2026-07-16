import Link from "next/link";

type Sw005HeaderProps = {
  active: "home" | "horizontal" | "json" | "string" | "datetime" | "sql" | "code";
};

export default function Sw005Header({ active }: Sw005HeaderProps) {
  return (
    <header className="sw001-app-header">
      <div className="sw001-brand">
        <Link className="sw001-brand-mark sw005-brand-mark" href="/" aria-label="홈으로 이동">
          UTL
        </Link>
        <div>
          <strong>SW_005</strong>
          <span>웹 유틸 관리 · 생산성 도구 허브</span>
        </div>
      </div>

      <nav className="sw001-menu" aria-label="SW_005 화면 메뉴">
        <Link
          aria-current={active === "home" ? "page" : undefined}
          className="sw001-menu-button sw005-menu-link"
          href="/sw_005"
        >
          메인화면
        </Link>
        <Link
          aria-current={active === "horizontal" ? "page" : undefined}
          className="sw001-menu-button sw005-menu-link"
          href="/sw_005/horizontal-view"
        >
          Horizontal View
        </Link>
        <Link
          aria-current={active === "json" ? "page" : undefined}
          className="sw001-menu-button sw005-menu-link"
          href="/sw_005/json-formatter"
        >
          JSON Formatter
        </Link>
        <Link
          aria-current={active === "string" ? "page" : undefined}
          className="sw001-menu-button sw005-menu-link"
          href="/sw_005/string-tools"
        >
          문자열 도구
        </Link>
        <Link
          aria-current={active === "datetime" ? "page" : undefined}
          className="sw001-menu-button sw005-menu-link"
          href="/sw_005/date-time-tools"
        >
          날짜·시간 도구
        </Link>
        <Link
          aria-current={active === "sql" ? "page" : undefined}
          className="sw001-menu-button sw005-menu-link"
          href="/sw_005/sql-db-tools"
        >
          SQL·DB 도구
        </Link>
        <Link
          aria-current={active === "code" ? "page" : undefined}
          className="sw001-menu-button sw005-menu-link"
          href="/sw_005/code-tools"
        >
          개발 코드 도구
        </Link>
      </nav>
    </header>
  );
}
