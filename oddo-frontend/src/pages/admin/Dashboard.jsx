import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { expenseAPI } from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

function Skeleton({ rows = 4 }) {
  return (
    <div style={{ padding: "16px 0" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer" style={{ height: 14, marginBottom: 12, width: `${60 + (i * 13) % 35}%` }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expenseAPI.getStats()
      .then((d) => setStats(d.stats || d))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { label: "Total Submitted",     val: formatCurrency(stats.totalAmount),    sub: `${stats.total || 0} expenses` },
    { label: "Pending Approval",    val: formatCurrency(stats.pendingAmount),   sub: `${stats.pending || 0} waiting`, accent: true, color: "var(--amber)" },
    { label: "Approved This Month", val: formatCurrency(stats.approvedAmount),  sub: `${stats.approved || 0} expenses`, color: "var(--green)" },
    { label: "Rejected",            val: stats.rejected || 0,                   sub: "expenses", color: "var(--red)" },
  ] : [];

  return (
    <div className="page">
      <div className="flex aic jb mb20">
        <div>
          <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 800 }}>
            Good day, {user?.name?.split(" ")[0] || "User"} 👋
          </div>
          <div className="text-muted mt4">Here's your expense overview</div>
        </div>
      </div>

      {loading ? (
        <div className="stats">
          {[1,2,3,4].map((i) => (
            <div key={i} className="stat"><Skeleton rows={2} /></div>
          ))}
        </div>
      ) : (
        <div className="stats">
          {cards.map((c) => (
            <div key={c.label} className="stat">
              <div className="stat-label">{c.label}</div>
              <div className="stat-val" style={{ color: c.color || "var(--t1)" }}>{c.val}</div>
              <div className="stat-sub">{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {stats?.byCategory?.length > 0 && (
        <div className="flex gap16" style={{ alignItems: "flex-start" }}>
          <div className="card f1">
            <div className="card-title">Spending by Category</div>
            {stats.byCategory.map((c) => (
              <div key={c._id} className="flex aic jb" style={{ marginBottom: 12 }}>
                <div className="flex aic gap8">
                  <span className="tag">{c._id}</span>
                  <span className="text-muted text-sm">{c.count} expenses</span>
                </div>
                <span className="fw6">{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !stats && (
        <div className="empty">
          <div className="empty-ico">📊</div>
          <div className="empty-title">No data yet</div>
          <div className="text-muted text-sm">Submit your first expense to see stats</div>
        </div>
      )}
    </div>
  );
}
