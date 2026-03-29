import { useAuth } from "../../context/AuthContext";
import { initials } from "../../utils/formatCurrency";

const PAGE_TITLES = {
  dashboard:  { title: "Dashboard",           sub: "Your expense overview" },
  submit:     { title: "New Expense",          sub: "Submit a reimbursement request" },
  history:    { title: "My Expenses",          sub: "View and manage your expenses" },
  approvals:  { title: "Pending Approvals",    sub: "Review and action team requests" },
  team:       { title: "Team Expenses",        sub: "All team submissions" },
  analytics:  { title: "Analytics & Reports",  sub: "Spending insights" },
  users:      { title: "User Management",      sub: "Manage team members and roles" },
  workflows:  { title: "Approval Workflows",   sub: "Configure approval chains" },
  rules:      { title: "Policy Rules",         sub: "Automate expense handling" },
  settings:   { title: "Settings",             sub: "Company policy and configuration" },
  profile:    { title: "My Profile",           sub: "Account settings and stats" },
};

export default function Navbar({ page, subPage, onNavigate, onNotifClick, notifCount = 0 }) {
  const { user } = useAuth();
  const current = PAGE_TITLES[page] || PAGE_TITLES.dashboard;
  const title   = subPage === "edit" ? "Edit Expense" : subPage === "detail" ? "Expense Details" : current.title;

  return (
    <div className="topbar">
      <div>
        <div className="tb-title">{title}</div>
        <div className="tb-sub">{current.sub}</div>
      </div>

      <div className="tb-right">
        {page !== "submit" && !subPage && (
          <button className="btn btn-primary btn-sm"
            onClick={() => onNavigate("submit")}>
            + New Expense
          </button>
        )}

        {/* Notification bell */}
        <button
          onClick={onNotifClick}
          style={{ position: "relative", background: "transparent", border: "1px solid var(--b1)", borderRadius: "var(--rs)", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--t2)", fontSize: 15 }}
        >
          🔔
          {notifCount > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, background: "var(--red)", color: "#fff", fontSize: 9, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)" }}>
              {notifCount}
            </span>
          )}
        </button>

        <div className="avatar" onClick={() => onNavigate("profile")}>{initials(user?.name || "U")}</div>
      </div>
    </div>
  );
}
