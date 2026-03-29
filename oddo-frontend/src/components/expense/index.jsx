// ─── StatusBadge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="bd" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

// ─── ExpenseCard ──────────────────────────────────────────────────────────────
import { formatCurrency, formatDate } from "../../utils/formatCurrency";

export function ExpenseCard({ expense, onView, onEdit }) {
  const id = expense._id || expense.id;
  return (
    <div style={{ background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: "var(--r)", padding: 16, marginBottom: 10 }}>
      <div className="flex aic jb mb8">
        <div className="flex aic gap8">
          <span className="tag">{expense.category}</span>
          <StatusBadge status={expense.status} />
        </div>
        <span style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 18 }}>
          {formatCurrency(expense.amount, expense.currency)}
        </span>
      </div>
      <div style={{ fontWeight: 500, marginBottom: 4 }}>{expense.merchant || "—"}</div>
      <div className="text-sm text-muted mb12">{formatDate(expense.expense_date || expense.date)}</div>
      <div className="flex gap8">
        <button className="btn btn-ghost btn-sm" onClick={() => onView?.(expense)}>View</button>
        {["draft", "pending"].includes(expense.status) && (
          <button className="btn btn-secondary btn-sm" onClick={() => onEdit?.(expense)}>Edit</button>
        )}
      </div>
    </div>
  );
}

// ─── ReceiptUploader ──────────────────────────────────────────────────────────
import { useRef, useState } from "react";

export function ReceiptUploader({ onFile }) {
  const fileRef = useRef();
  const [drag, setDrag] = useState(false);

  const handle = (f) => {
    if (!f) return;
    onFile?.(f);
  };

  return (
    <div
      className={`upload-zone ${drag ? "drag" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => fileRef.current.click()}
    >
      <input ref={fileRef} type="file" accept="image/*,.pdf" className="upload-inp"
        onChange={(e) => handle(e.target.files[0])} />
      <span className="upload-icon">📸</span>
      <div style={{ fontWeight: 500, marginBottom: 4 }}>Drop receipt or click to upload</div>
      <div className="text-sm text-muted">JPG, PNG, PDF — max 10 MB</div>
    </div>
  );
}
