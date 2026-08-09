import { BoardFrame } from "../_components/BoardFrame";

const swatches = [["--ndf-brand-primary", "#4DD7C8", "핵심 행동"], ["--ndf-brand-secondary", "#5D8DFF", "보조 행동"], ["--ndf-bg", "#07111F", "페이지 배경"], ["--ndf-surface", "#112236", "정보 표면"], ["--ndf-success", "#45C486", "성공"], ["--ndf-warning", "#F0B44B", "주의"], ["--ndf-error", "#F06B6B", "오류"], ["--ndf-ai-primary", "#9B8CFF", "AI 제안"]];

export default function ColorBoard() { return <BoardFrame title="Color Board" version="Foundation v1.0" status="Visual Preview: Available" scope="A4 · Global"><p>색은 장식이 아니라 행동과 상태의 의미를 전달한다. NexDataForge의 기본은 차분한 dark blue 기반에 teal primary와 indigo secondary를 사용하고, AI는 purple 계열로 구분한다.</p><div className="color-swatches">{swatches.map(([name, value, purpose]) => <div className="color-swatch" key={name}><span style={{ backgroundColor: value }} /><strong>{name}</strong><code>{value}</code><small>{purpose}</small></div>)}</div></BoardFrame>;
}
