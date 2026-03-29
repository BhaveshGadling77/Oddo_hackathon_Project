// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = "primary", size, icon, disabled, onClick, className = "", ...rest }) {
  const cls = ["btn", `btn-${variant}`, size && `btn-${size}`, className].filter(Boolean).join(" ");
  return (
    <button className={cls} disabled={disabled} onClick={onClick} {...rest}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, prefix, className = "", ...rest }) {
  return (
    <div className="fg">
      {label && <label>{label}</label>}
      <div className={prefix ? "inp-wrap" : undefined}>
        {prefix && <span className="inp-pre">{prefix}</span>}
        <input className={`inp ${error ? "err" : ""} ${className}`} {...rest} />
      </div>
      {error && <span className="err-msg">{error}</span>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = "pending" }) {
  return (
    <span className={`badge badge-${variant}`}>
      <span className="bd" />
      {children}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "modal-wide" : ""}`}>
        <div className="modal-hd">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
export function Skeleton({ rows = 5 }) {
  return (
    <div style={{ padding: "16px 0" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer"
          style={{ height: 14, marginBottom: 12, width: `${60 + (i * 13) % 35}%` }} />
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function Empty({ icon = "🗂", title = "Nothing here", sub = "" }) {
  return (
    <div className="empty">
      <div className="empty-ico">{icon}</div>
      <div className="empty-title">{title}</div>
      {sub && <div className="text-muted text-sm">{sub}</div>}
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--b1)" }}>
      {label && <span style={{ fontSize: 13.5, color: "var(--t1)" }}>{label}</span>}
      <div onClick={onChange}
        style={{ width: 40, height: 22, borderRadius: 11, background: checked ? "var(--amber)" : "var(--b1)", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: checked ? 21 : 3, transition: "left .2s" }} />
      </div>
    </div>
  );
}
