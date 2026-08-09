"use client";

import { useState } from "react";
import type { ComplianceRecord, ComplianceStatus, Priority } from "./compliance-data";
import { mobileChecks, mobileTargets } from "./compliance-data";

export function ComplianceStatusBadge({ status }: { status: ComplianceStatus }) {
  return <span className={`compliance-status ${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}

export function EvidenceCard({ record }: { record: ComplianceRecord }) {
  return <article className="evidence-card"><header><div><span>{record.article}</span><h3>{record.target}</h3></div><ComplianceStatusBadge status={record.status} /></header><dl><div><dt>Evidence type</dt><dd>{record.evidenceType}</dd></div><div><dt>Evidence</dt><dd>{record.evidence}</dd></div><div><dt>Known gap</dt><dd>{record.gap}</dd></div><div><dt>Required action</dt><dd>{record.action}</dd></div><div><dt>Owner / role</dt><dd>{record.owner}</dd></div><div><dt>Recheck</dt><dd>{record.recheck}</dd></div></dl></article>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`remediation-priority ${priority.toLowerCase()}`}>{priority}</span>;
}

export function MobileAuditChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setChecked((current) => ({ ...current, [key]: !current[key] }));
  return <div className="mobile-audit-list">{mobileTargets.map((target) => <section key={target}><h3>{target}</h3><div>{mobileChecks.map((check) => { const key = `${target}-${check}`; return <label key={key}><input checked={Boolean(checked[key])} onChange={() => toggle(key)} type="checkbox" /><span>{check}</span><small>{checked[key] ? "Code / browser review marked locally" : "Not Reviewed"}</small></label>; })}</div></section>)}</div>;
}

export function ComplianceGate() {
  const steps = ["Article Mapping", "Evidence Review", "Mobile Review", "Accessibility Review", "Functional Protection Review", "Gap Review", "Compliance Decision"];
  return <ol className="compliance-gate">{steps.map((step, index) => <li key={step}><b>{index + 1}</b><div><strong>{step}</strong><span>{index < 2 ? "Source and documentation evidence available" : "Needs Review before Compliant decision"}</span></div></li>)}</ol>;
}
