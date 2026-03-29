import { useState, useEffect } from "react";
import { approvalAPI } from "../../services/api";
import { formatCurrency, formatDate, initials } from "../../utils/formatCurrency";

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    <span className="bd" />
    {status?.charAt(0).toUpperCase() + status?.slice(1)}
  </span>
);

export default function PendingApprovals({ onView, toast }) {
  const [items,        setItems]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [rejectModal,  setRejectModal]  = useState(null);
  const [rejectComment,setRejectComment]= useState("");
  const [acting,       setActing]       = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await approvalAPI.getPendingApprovals();
      setItems(data.expenses || data.pending || data || []);
    } catch {
      toast?.error("Failed to load approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setActing(id);
    try {
      await approvalAPI.approve(id, "Approved via portal");
      toast?.success("Expense approved ✓");
      setItems((prev) => prev.filter((e) => (e._id || e.id) !== id));
    } catch (err) {
      toast?.error(err.message || "Failed to approve");
    } finally { setActing(null); }
  };

  const reject = async () => {
    if (!rejectComment.trim()) { toast?.error("Please provide a rejection reason"); return; }
    const id = rejectModal._id || rejectModal.id;
    setActing(id);
    try {
      await approvalAPI.reject(id, rejectComment);
      toast?.success("Expense rejected");
      setItems((prev) => prev.filter((e) => (e._id || e.id) !== id));
      setRejectModal(null);
      setRejectComment("");
    } catch (err) {
      toast?.error(err.message || "Failed to reject");
    } finally { setActing(null); }
  };

  const totalAmount = items.reduce((s, e) => s + (e.amount || 0), 0);
  const oldest = items[items.length - 1];

  return (
    <div className="page">
      <div className="stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {[
          { label: "Pending Review", val: items.length,                   color: "var(--amber)" },
          { label: "Total Amount",   val: formatCurrency(totalAmount) },
          { label: "Oldest Request", val: oldest ? formatDate(oldest.createdAt) : "—" },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-val" style={{ color: s.color || "var(--t1)" }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex aic jb mb16">
          <div className="sh-title">Pending Approvals</div>
          <button className="btn btn-ghost btn-sm" onClick={load}>↺ Refresh</button>
        </div>

        {loading ? (
          <div style={{ padding: "16px 0" }}>
            {[80, 65, 75, 55, 70].map((w, i) => (
              <div key={i} className="shimmer" style={{ height: 14, marginBottom: 14, width: `${w}%` }} />
            ))}
          </div>
        ) : items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>Category</th><th>Merchant</th>
                  <th>Date</th><th>Amount</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((exp) => {
                  const id = exp._id || exp.id;
                  return (
                    <tr key={id}>
                      <td>
                        <div className="flex aic gap8">
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {initials(exp.submittedBy?.name || exp.employee?.name || "?")}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>
                              {exp.submittedBy?.name || exp.employee?.name || "Employee"}
                            </div>
                            <div className="text-xs text-muted">{exp.submittedBy?.email || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="tag">{exp.category}</span></td>
                      <td>{exp.merchant || "—"}</td>
                      <td className="text-muted text-sm">{formatDate(exp.expense_date || exp.date)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(exp.amount, exp.currency)}</td>
                      <td>
                        <div className="flex gap8">
                          <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => onView?.(exp)}>◉</button>
                          <button className="btn btn-success btn-sm" onClick={() => approve(id)} disabled={acting === id}>
                            ✓ Approve
                          </button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => { setRejectModal(exp); setRejectComment(""); }}
                            disabled={acting === id}>
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <div className="empty-ico">🎉</div>
            <div className="empty-title">All caught up!</div>
            <div className="text-muted text-sm">No pending approvals right now</div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setRejectModal(null)}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">✕ Reject Expense</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <div className="mb12 text-muted text-sm">
              Rejecting: <strong style={{ color: "var(--t1)" }}>{formatCurrency(rejectModal?.amount, rejectModal?.currency)}</strong> — {rejectModal?.merchant || "expense"}
            </div>
            <div className="fg mb16">
              <label>Rejection Reason *</label>
              <textarea className="inp" rows={4} placeholder="Explain why this expense is being rejected…"
                value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} />
            </div>
            <div className="flex gap8 je">
              <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={reject} disabled={!rejectComment.trim()}>
                Reject Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
