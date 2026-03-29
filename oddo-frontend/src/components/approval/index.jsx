import { formatDate } from "../../utils/formatCurrency";

// ─── ApprovalTimeline ─────────────────────────────────────────────────────────
export function ApprovalTimeline({ timeline = [] }) {
  const dotColor = (action = "") => {
    if (action.includes("approve") || action.includes("submit")) return "green";
    if (action.includes("reject"))                                return "red";
    if (action.includes("pending") || action.includes("review")) return "amber";
    return "blue";
  };

  if (!timeline.length) {
    return <div className="text-muted text-sm">No timeline events yet.</div>;
  }

  return (
    <div className="timeline">
      {timeline.map((evt, i) => (
        <div key={i} className="tl-item">
          <div className="tl-line" />
          <div className={`tl-dot ${dotColor(evt.action || evt.status)}`}>
            {evt.action?.includes("approve") ? "✓" : evt.action?.includes("reject") ? "✕" : "●"}
          </div>
          <div className="tl-body">
            <div className="tl-action">{evt.action || evt.status}</div>
            <div className="tl-meta">
              {evt.actor?.name || evt.by || "System"} · {formatDate(evt.createdAt || evt.date)}
            </div>
            {evt.comment && <div className="tl-note">{evt.comment}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── RuleBuilder ──────────────────────────────────────────────────────────────
import { useState } from "react";

export function RuleBuilder({ steps = [], onChange }) {
  const addStep = () => onChange?.([...steps, { role: "manager", order: steps.length + 1 }]);

  const removeStep = (i) =>
    onChange?.(steps.filter((_, idx) => idx !== i));

  const updateStep = (i, key, val) =>
    onChange?.(steps.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)));

  return (
    <div>
      <div className="flex aic jb mb8">
        <label>Approval Steps *</label>
        <button className="btn btn-ghost btn-sm" onClick={addStep}>+ Add Step</button>
      </div>
      {steps.map((step, i) => (
        <div key={i} className="step-row">
          <div className="step-num">{i + 1}</div>
          <select className="inp" style={{ flex: 1 }} value={step.role}
            onChange={(e) => updateStep(i, "role", e.target.value)}>
            {["admin", "manager", "finance"].map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
          {steps.length > 1 && (
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeStep(i)}
              style={{ color: "var(--red)", flexShrink: 0 }}>✕</button>
          )}
        </div>
      ))}
    </div>
  );
}
