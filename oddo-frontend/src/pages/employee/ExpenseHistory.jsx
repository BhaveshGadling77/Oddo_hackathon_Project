import { useState, useCallback, useEffect } from "react";
import { expenseAPI } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/formatCurrency";

const CATEGORIES = ["Travel", "Meals", "Hotels", "Software", "Office Supplies", "Marketing", "Training", "Other"];

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    <span className="bd" />
    {status?.charAt(0).toUpperCase() + status?.slice(1)}
  </span>
);

export default function ExpenseHistory({ onView, onEdit, toast }) {
  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filters,  setFilters]  = useState({ search: "", status: "", category: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.category) params.category = filters.category;
      const data = await expenseAPI.listExpenses(params);
      setExpenses(data.expenses || data || []);
    } catch {
      toast?.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.category]);

  useEffect(() => { load(); }, [load]);

  const visible = expenses.filter((e) => {
    if (!filters.search) return true;
    const s = filters.search.toLowerCase();
    return (
      e.description?.toLowerCase().includes(s) ||
      e.merchant?.toLowerCase().includes(s) ||
      (e._id || e.id)?.toLowerCase().includes(s)
    );
  });

  const statCards = [
    { label: "Total",    val: expenses.length,                                          sub: "all expenses" },
    { label: "Pending",  val: expenses.filter((e) => e.status === "pending").length,   sub: "awaiting review", color: "var(--amber)" },
    { label: "Approved", val: expenses.filter((e) => e.status === "approved").length,  sub: "approved", color: "var(--green)" },
    { label: "Amount",   val: formatCurrency(expenses.reduce((s, e) => s + (e.amount || 0), 0)), sub: "total submitted" },
  ];

  return (
    <div className="page">
      <div className="stats">
        {statCards.map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-val" style={{ color: s.color || "var(--t1)" }}>{s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex aic jb mb16" style={{ flexWrap: "wrap", gap: 10 }}>
          <div className="sh-title">My Expenses</div>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            <div className="search-wrap" style={{ minWidth: 220 }}>
              <span className="search-ico">⌕</span>
              <input className="inp" placeholder="Search ID, merchant, desc…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
            </div>
            <select className="inp" style={{ width: "auto" }} value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option>
              {["draft", "pending", "approved", "rejected"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select className="inp" style={{ width: "auto" }} value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={load}>↺ Refresh</button>
          </div>
        </div>

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
                  <th>Expense ID</th><th>Merchant</th><th>Category</th>
                  <th>Date</th><th>Amount</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((exp) => (
                  <tr key={exp._id || exp.id}>
                    <td><span className="font-mono text-muted">{(exp._id || exp.id)?.slice(-8)}</span></td>
                    <td style={{ fontWeight: 500 }}>{exp.merchant || "—"}</td>
                    <td><span className="tag">{exp.category}</span></td>
                    <td className="text-muted text-sm">{formatDate(exp.expense_date || exp.date)}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(exp.amount, exp.currency)}</td>
                    <td><StatusBadge status={exp.status} /></td>
                    <td>
                      <div className="flex gap4">
                        <button className="btn btn-ghost btn-icon btn-sm" title="View" onClick={() => onView?.(exp)}>◉</button>
                        {["draft", "pending"].includes(exp.status) && (
                          <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => onEdit?.(exp)}>✎</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <div className="empty-ico">🗂</div>
            <div className="empty-title">No expenses found</div>
            <div className="text-muted text-sm">Adjust filters or submit a new expense</div>
          </div>
        )}
      </div>
    </div>
  );
}
