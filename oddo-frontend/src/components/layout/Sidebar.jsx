import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/formatCurrency";

export default function Sidebar({ page, subPage, onNavigate, pendingCount }) {
  const { user, logout, isAdmin, isManager } = useAuth();

  const navSections = [
    {
      label: "Overview",
      items: [
        { id: "dashboard", icon: "◈", label: "Dashboard" },
        { id: "analytics", icon: "📊", label: "Analytics" },
      ],
    },
    {
      label: "Expenses",
      items: [
        { id: "submit",  icon: "✈",  label: "New Expense" },
        { id: "history", icon: "🗂", label: "My Expenses" },
      ],
    },
    ...(isManager ? [{
      label: "Team",
      items: [
        { id: "approvals", icon: "✓",  label: "Pending Approvals", badge: pendingCount || null },
        { id: "team",      icon: "👥", label: "Team Expenses" },
      ],
    }] : []),
    ...(isAdmin ? [{
      label: "Admin",
      items: [
        { id: "users",     icon: "🧑‍💼", label: "Users" },
        { id: "workflows", icon: "⚙",   label: "Workflows" },
        { id: "rules",     icon: "📋",  label: "Rules" },
        { id: "settings",  icon: "🔧",  label: "Settings" },
      ],
    }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-mark">EX</div>
        <div className="sb-name">ODDO<br /><span>Expenses</span></div>
      </div>

      {navSections.map((sec) => (
        <div key={sec.label} className="sb-sec">
          <div className="sb-label">{sec.label}</div>
          {sec.items.map((item) => (
            <div
              key={item.id}
              className={`nav ${page === item.id && !subPage ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-ico">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </div>
          ))}
        </div>
      ))}

      <div className="sb-user">
        <div className="avatar" onClick={() => onNavigate("profile")}>{initials(user?.name || "U")}</div>
        <div className="sb-user-info" style={{ cursor: "pointer" }} onClick={() => onNavigate("profile")}>
          <div className="sb-user-name">{user?.name || "User"}</div>
          <div className="sb-user-role">{user?.role || "employee"}</div>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" title="Sign out" onClick={logout} style={{ flexShrink: 0 }}>⏻</button>
      </div>
    </aside>
  );
}
