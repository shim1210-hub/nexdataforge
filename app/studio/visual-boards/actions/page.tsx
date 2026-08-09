import { BoardFrame } from "../_components/BoardFrame";
import { ActionSamples, Section } from "../_components/CoreBoard";

export default function ActionBoard() { return <BoardFrame title="Action Board" version="Component v1.0" status="Visual Preview: Available" scope="Core interaction patterns" component="Button · Button Group · FAB · Link Action"><p>Clear, predictable actions for repeated product workflows. Every sample exposes focus, disabled, loading, size, and danger distinctions.</p><Section title="Button and action group"><ActionSamples /></Section><Section title="Accessibility Notes"><p>Use semantic buttons for actions, visible focus rings, 44px minimum touch targets, and accessible names for icon-only controls.</p></Section></BoardFrame>; }
