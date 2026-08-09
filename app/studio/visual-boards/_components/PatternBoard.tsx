"use client";

import { useState } from "react";

export function PatternSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="pattern-section"><div className="pattern-head"><h2>{title}</h2><span>Pattern v1.0</span></div>{children}</section>;
}

export function SearchPattern() {
  const [query, setQuery] = useState("");
  const results = query ? ["Project Atlas", "Store operations", "AI analysis"] : [];
  return <div className="pattern-stack"><label className="pattern-search-label" htmlFor="pattern-search">Search projects</label><div className="pattern-search"><input id="pattern-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by project, store, or request" /><button aria-label="Clear search" onClick={() => setQuery("")}>×</button></div><div className="pattern-chips"><button className="pattern-chip">Projects</button><button className="pattern-chip selected">Recent</button><button className="pattern-chip">Needs review</button></div><div className="pattern-results"><strong>{query ? `${results.length} results` : "Recent searches"}</strong>{results.length ? results.map((result) => <button key={result} className="pattern-result"><span>{result}</span><small>Open result →</small></button>) : <div className="pattern-empty"><strong>{query ? "No results found" : "Start with a recent search"}</strong><span>{query ? "Try a different keyword or remove a filter." : "Your recent projects will appear here."}</span></div>}</div></div>;
}

export function AuthPattern() {
  const [submitted, setSubmitted] = useState(false);
  return <div className="pattern-auth"><div className="pattern-auth-copy"><span className="pattern-eyebrow">NEXDATAFORGE</span><h3>Welcome back</h3><p>Sign in to manage projects, requests, and analysis.</p></div><form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><label>Email<input type="email" placeholder="name@company.com" required /></label><label>Password<input type="password" placeholder="Enter your password" required /></label><div className="pattern-form-meta"><label className="pattern-check"><input type="checkbox" /> Remember me</label><a href="#recovery">Forgot password?</a></div>{submitted && <div className="pattern-form-message">Demo validation passed. Authentication is not connected.</div>}<button className="pattern-primary">Sign in</button><button type="button" className="pattern-secondary">Continue with Google</button><small>New here? <a href="#signup">Create an account</a></small></form></div>;
}

export function DataStatePattern() {
  const [state, setState] = useState<"loaded" | "loading" | "empty" | "error">("loaded");
  return <div className="pattern-stack"><div className="pattern-tabs">{(["loaded", "loading", "empty", "error"] as const).map((item) => <button key={item} className={state === item ? "active" : ""} onClick={() => setState(item)}>{item}</button>)}</div><div className="pattern-table"><div className="pattern-table-toolbar"><strong>Project inventory</strong><button onClick={() => setState("loading")}>Refresh</button></div>{state === "loading" && <div className="pattern-loading">Refreshing project inventory...</div>}{state === "empty" && <div className="pattern-empty"><strong>No projects yet</strong><span>Create a project to see inventory here.</span></div>}{state === "error" && <div className="pattern-error"><strong>Could not load projects</strong><span>Check the connection and try again.</span><button onClick={() => setState("loaded")}>Try again</button></div>}{state === "loaded" && <><div className="pattern-table-row heading"><span>Name</span><span>Status</span><span>Updated</span></div>{["Project Atlas", "Store operations", "AI analysis"].map((item, index) => <div className="pattern-table-row" key={item}><span>{item}</span><span className="pattern-status">{index === 1 ? "In progress" : "Ready"}</span><span>{index + 1}h ago</span></div>)}</>}</div><div className="pattern-pagination"><button>Previous</button><strong>Page 1 of 4</strong><button>Next</button></div></div>;
}

export function WorkflowPattern() {
  const [step, setStep] = useState(1);
  const steps = ["Basic information", "Details", "Review", "Complete"];
  return <div className="pattern-stack"><div className="pattern-stepper">{steps.map((name, index) => <button key={name} className={index + 1 === step ? "current" : index + 1 < step ? "complete" : ""} onClick={() => setStep(index + 1)}><b>{index + 1}</b><span>{name}</span></button>)}</div><div className="pattern-workflow"><span className="pattern-eyebrow">STEP {step} OF {steps.length}</span><h3>{steps[step - 1]}</h3><p>{step === 4 ? "Your project is ready. Continue to view the project workspace." : "Complete this step before continuing to keep the workflow clear."}</p><div className="pattern-workflow-actions">{step > 1 && <button className="pattern-secondary" onClick={() => setStep(step - 1)}>Back</button>}{step < 4 ? <button className="pattern-primary" onClick={() => setStep(step + 1)}>Continue</button> : <button className="pattern-primary">Open project</button>}</div></div><div className="pattern-danger"><div><strong>Destructive flow</strong><span>Delete project requires explicit confirmation and separates danger from primary actions.</span></div><button className="pattern-danger-btn">Delete project</button></div></div>;
}
