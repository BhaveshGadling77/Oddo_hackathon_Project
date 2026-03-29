import { useState, useEffect, useCallback } from "react";
import { expenseAPI, approvalAPI, userAPI } from "../../services/api";
import { formatCurrency, formatDate, initials } from "../../utils/formatCurrency";

const CATEGORIES = ["Travel", "Meals", "Hotels", "Software", "Office Supplies", "Marketing", "Training", "Other"];

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { bg: "rgba(245,158,11,.12)", col: "#f59e0b" },
    approved: { bg: "rgba(63,185,80,.1)",   col: "#3fb950" },
    rejected: { bg: "rgba(248,81,73,.1)",   col: "#f85149" },
    draft:    { bg: "rgba(139,148,158,.1)", col: "#8b949e" },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: s.bg, color: s.col }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.col }} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export default function TeamExpenses({ onView, toast }) {
  const [expenses,      setExpenses]      = useState([]);
  const [members,       setMembers]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(new Set());
  const [rejectModal,   setRejectModal]   = useState(null);
  const [rejectComment, setRejectComment] = useState("");
  const [acting,        setActing]        = useState(null);
  const [filters, setFilters] = useState({
    search: "", status: "", category: "", employeeId: "", startDate: "", endDate: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status)     params.status     = filters.status;
      if (filters.category)   params.category   = filters.category;
      if (filters.employeeId) params.submittedBy = filters.employeeId;
      if (filters.startDate)  params.startDate  = filters.startDate;
      if (filters.endDate)    params.endDate    = filters.endDate;

      const [ed, ud] = await Promise.all([
        expenseAPI.listExpenses(params),
        userAPI.listUsers({ role: "employee" }),
      ]);
      setExpenses(ed.expenses || ed || []);
      setMembers(ud.users || ud || []);
    } catch { toast?.error("Failed to load team expenses"); }
    finally { setLoading(false); }
  }, [filters.status, filters.category, filters.employeeId, filters.startDate, filters.endDate]);

  useEffect(() => { load(); }, [load]);

  const visible = expenses.filter((e) => {
    if (!filters.search) return true;
    const s = filters.search.toLowerCase();
    return (
      e.merchant?.toLowerCase().includes(s) ||
      e.description?.toLowerCase().includes(s) ||
      (e._id || e.id)?.toLowerCase().includes(s) ||
      e.submittedBy?.name?.toLowerCase().includes(s)
    );
  });

  const toggleSelect = (id) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    const pending = visible.filter((e) => e.status === "pending");
    if (selected.size === pending.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pending.map((e) => e._id || e.id)));
    }
  };

  const bulkApprove = async () => {
    setActing("bulk");
    let approved = 0;
    for (const id of selected) {
      try {
        await approvalAPI.approve(id, "Bulk approved");
        approved++;
      } catch {}
    }
    toast?.success(`${approved} expense${approved !== 1 ? "s" : ""} approved`);
    setSelected(new Set());
    load();
    setActing(null);
  };

  const approve = async (id) => {
    setActing(id);
    try {
      await approvalAPI.approve(id, "Approved via team view");
      toast?.success("Approved ✓");
      setExpenses((prev) => prev.map((e) => (e._id || e.id) === id ? { ...e, status: "approved" } : e));
    } catch (err) { toast?.error(err.message || "Failed"); }
    finally { setActing(null); }
  };

  const reject = async () => {
    if (!rejectComment.trim()) { toast?.error("Reason required"); return; }
    const id = rejectModal._id || rejectModal.id;
    setActing(id);
    try {
      await approvalAPI.reject(id, rejectComment);
      toast?.success("Rejected");
      setExpenses((prev) => prev.map((e) => (e._id || e.id) === id ? { ...e, status: "rejected" } : e));
      setRejectModal(null);
      setRejectComment("");
    } catch (err) { toast?.error(err.message || "Failed"); }
    finally { setActing(null); }
  };

  const pendingInView = visible.filter((e) => e.status === "pending");

  return (
    <div className="page">
      {/* Stats */}
      <div className="stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { label: "Total Expenses", val: expenses.length },
          { label: "Pending",  val: expenses.filter((e) => e.status === "pending").length,  color: "var(--amber)" },
          { label: "Approved", val: expenses.filter((e) => e.status === "approved").length, color: "var(--green)" },
          { label: "Total Amount", val: formatCurrency(expenses.reduce((s, e) => s + (e.amount || 0), 0)) },
        ].map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-val" style={{ color: s.color || "var(--t1)" }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Filters */}
        <div className="flex aic jb mb16" style={{ flexWrap: "wrap", gap: 10 }}>
          <div className="sh-title">Team Expenses</div>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            <div className="search-wrap" style={{ minWidth: 200 }}>
              <span className="search-ico">⌕</span>
              <input className="inp" placeholder="Search…" value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
            </div>
            <select className="inp" style={{ width: "auto" }} value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option>
              {["draft","pending","approved","rejected"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select className="inp" style={{ width: "auto" }} value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="inp" style={{ width: "auto" }} value={filters.employeeId}
              onChange={(e) => setFilters((f) => ({ ...f, employeeId: e.target.value }))}>
              <option value="">All Employees</option>
              {members.map((m) => (
                <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>
              ))}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={load}>↺</button>
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div style={{ background: "var(--aglow)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "var(--rs)", padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--amber)" }}>{selected.size} selected</span>
            <button className="btn btn-success btn-sm" onClick={bulkApprove} disabled={acting === "bulk"}>
              {acting === "bulk" ? "Approving…" : "✓ Bulk Approve"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "16px 0" }}>
            {[80, 65, 75, 55, 70].map((w, i) => (
              <div key={i} className="shimmer" style={{ height: 14, marginBottom: 14, width: `${w}%` }} />
            ))}
          </div>
        ) : visible.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox"
                      checked={selected.size > 0 && selected.size === pendingInView.length}
                      onChange={toggleAll}
                      style={{ cursor: "pointer" }}
                    />
                  </th>
                  <th>Employee</th><th>Category</th><th>Merchant</th>
                  <th>Date</th><th>Amount</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((exp) => {
                  const id = exp._id || exp.id;
                  const canSelect = exp.status === "pending";
                  return (
                    <tr key={id}>
                      <td>
                        {canSelect && (
                          <input type="checkbox" checked={selected.has(id)}
                            onChange={() => toggleSelect(id)} style={{ cursor: "pointer" }} />
                        )}
                      </td>
                      <td>
                        <div className="flex aic gap8">
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                            {initials(exp.submittedBy?.name || "?")}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{exp.submittedBy?.name || "Employee"}</div>
                            <div className="text-xs text-muted">{exp.submittedBy?.email || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="tag">{exp.category}</span></td>
                      <td>{exp.merchant || "—"}</td>
                      <td className="text-muted text-sm">{formatDate(exp.expense_date || exp.date)}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(exp.amount, exp.currency)}</td>
                      <td><StatusBadge status={exp.status} /></td>
                      <td>
                        <div className="flex gap4">
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onView?.(exp)}>◉</button>
                          {exp.status === "pending" && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => approve(id)} disabled={acting === id}>✓</button>
                              <button className="btn btn-danger btn-sm" onClick={() => { setRejectModal(exp); setRejectComment(""); }} disabled={acting === id}>✕</button>
                            </>
                          )}
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
            <div className="empty-ico">📋</div>
            <div className="empty-title">No expenses found</div>
            <div className="text-muted text-sm">Try changing filters</div>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setRejectModal(null)}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">✕ Reject Expense</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <div className="mb12 text-muted text-sm">
              Rejecting: <strong style={{ color: "var(--t1)" }}>{formatCurrency(rejectModal?.amount, rejectModal?.currency)}</strong>
            </div>
            <div className="fg mb16">
              <label>Rejection Reason *</label>
              <textarea className="inp" rows={4} placeholder="Explain why…"
                value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} />
            </div>
            <div className="flex gap8 je">
              <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={reject} disabled={!rejectComment.trim()}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
