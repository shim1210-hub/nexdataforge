import Link from "next/link";
export default function ProjectsPage() { return <main className="studio-page"><div className="studio-shell"><Link href="/studio">← Studio</Link><p className="studio-eyebrow">PROJECTS</p><h1>프로젝트별 Design Book</h1><p className="studio-lede">공통 원칙을 제품의 사용자 흐름과 화면 명세로 번역합니다.</p><Link className="studio-button" href="/studio/projects/bidme">bidme 열기</Link></div></main>; }
