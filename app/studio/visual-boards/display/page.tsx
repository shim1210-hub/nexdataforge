import { BoardFrame } from "../_components/BoardFrame";
import { DisplaySamples, Section } from "../_components/CoreBoard";

export default function DisplayBoard() { return <BoardFrame title="Display Board" version="Component v1.0" status="Visual Preview: Available" scope="Core information patterns" component="Card · Badge · Chip · Avatar · List"><p>Information surfaces remain scannable across project, store, request, and analysis contexts. Selection is communicated with structure and color together.</p><Section title="Cards, status, and list"><DisplaySamples /></Section><Section title="Accessibility Notes"><p>Cards with actions use a real button, status labels remain readable without color, and list rows preserve a predictable reading order.</p></Section></BoardFrame>; }
