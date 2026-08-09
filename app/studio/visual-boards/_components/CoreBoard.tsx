"use client";

import { useState } from "react";
import { Alert, Button, IconButton, Progress, Skeleton } from "@/components/design-system";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="core-section"><div className="core-section-head"><h2>{title}</h2><span>Component v1.0</span></div>{children}</section>;
}

export function ActionSamples() {
  const [loading, setLoading] = useState(false);
  return <div className="core-stack">
    <div className="core-row"><Button>Create request</Button><Button variant="secondary">Save draft</Button><Button variant="outline">View details</Button><Button variant="ghost">Cancel</Button><Button variant="danger">Delete</Button></div>
    <div className="core-row"><Button size="small">Small</Button><Button>Medium</Button><Button size="large">Large</Button><IconButton aria-label="More actions">•••</IconButton></div>
    <div className="core-row"><Button disabled>Disabled</Button><Button loading={loading} onClick={() => setLoading(!loading)}>Try loading</Button><div className="core-button-group"><Button variant="outline">Previous</Button><Button variant="outline">Next</Button></div></div>
    <div className="core-demo-footer"><button className="core-fab" aria-label="Create new request">+</button><div><strong>Link actions</strong><div className="core-links"><a href="#usage">Open report ↗</a><a href="#usage">View all</a></div></div></div>
  </div>;
}

export function DisplaySamples() {
  const [selected, setSelected] = useState(0);
  return <div className="core-stack"><div className="core-card-grid">{["Project Atlas", "Store operations", "AI analysis"].map((name, index) => <button key={name} className={`core-card ${selected === index ? "selected" : ""}`} onClick={() => setSelected(index)}><div className="core-card-top"><span className="core-badge">{index === 1 ? "In progress" : "Ready"}</span><span>•••</span></div><strong>{name}</strong><p>{index === 0 ? "12 datasets connected" : index === 1 ? "Updated 4 minutes ago" : "3 recommendations"}</p><div className="core-meter"><i style={{ width: `${42 + index * 20}%` }} /></div></button>)}</div><div className="core-row"><span className="core-status success">Success</span><span className="core-status warning">Needs review</span><span className="core-status error">Error</span><span className="core-chip">Analytics</span><span className="core-chip selected">Selected ×</span><div className="core-avatar">ND</div><div className="core-avatar-group"><div className="core-avatar">A</div><div className="core-avatar">B</div><div className="core-avatar">+3</div></div></div><div className="core-list"><div><strong>Recent requests</strong><span>Today, 09:42</span></div><div><strong>Dataset inventory</strong><span>Yesterday</span></div><div><strong>Divider and list item</strong><span>View →</span></div></div></div>;
}

export function FeedbackSamples() {
  return <div className="core-stack"><Alert title="Analysis in progress">We are checking the latest request.</Alert><Alert action={<Button size="small" variant="outline">Open results</Button>} live="polite" title="Request completed" variant="success">Your results are ready to review.</Alert><Alert action={<Button size="small" variant="outline">Retry</Button>} live="assertive" title="Could not load data" variant="error">Check your connection and try again.</Alert><Progress label="Upload progress" value={68} /><Progress label="Preparing analysis" showValue={false} /><div className="core-card-grid" aria-busy="true" aria-label="Loading project cards"><div><Skeleton width="42%" /><Skeleton height={48} variant="rectangular" /><Skeleton width="70%" /></div><div><Skeleton width={44} variant="circular" /><Skeleton width="80%" /><Skeleton width="55%" /></div></div><div className="core-empty"><div className="core-empty-icon">—</div><strong>No requests yet</strong><span>Create a request to see it here.</span><Button>Create request</Button></div></div>;
}

export function OverlaySamples() {
  const [open, setOpen] = useState(false);
  return <div className="core-stack"><div className="core-overlay-preview"><div className="core-modal"><span className="core-eyebrow">CONFIRM ACTION</span><h3>Delete this request?</h3><p>This action cannot be undone. The saved result will be removed.</p><div className="core-modal-actions"><button className="core-btn ghost">Cancel</button><button className="core-btn danger" onClick={() => setOpen(true)}>Delete request</button></div></div></div><div className="core-overlay-row"><button className="core-btn outline" onClick={() => setOpen(!open)}>Open drawer</button><button className="core-btn secondary" onClick={() => setOpen(!open)}>Open bottom sheet</button><span className="core-tooltip">Hover or focus for help <b>?</b></span>{open && <aside className="core-drawer"><strong>Request details</strong><button aria-label="Close overlay" onClick={() => setOpen(false)}>×</button><p>Overlay content stays within the viewport and preserves a clear close action.</p></aside>}</div><div className="core-menu"><strong>Action menu</strong><button>Duplicate</button><button>Move to project</button><button className="danger-text">Delete</button></div></div>;
}
