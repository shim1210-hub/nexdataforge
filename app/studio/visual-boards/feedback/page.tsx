import { BoardFrame } from "../_components/BoardFrame";
import { FeedbackSamples, Section } from "../_components/CoreBoard";

export default function CoreFeedbackBoard() { return <BoardFrame title="Feedback Board" version="Component v1.0" status="Visual Preview: Available" scope="Core feedback patterns" component="Alert · Progress · Loading · Empty · Error"><p>Feedback explains what happened, what is happening, and what the user can do next without relying on motion or color alone.</p><Section title="Alert, progress, and empty states"><FeedbackSamples /></Section><Section title="Accessibility Notes"><p>Errors include a clear title and recovery action. Progress includes a text value, while loading states preserve layout stability.</p></Section></BoardFrame>; }
