/**
 * ODDO — Expense Management System
 * App.jsx — root shell, routing, toast system, CSS tokens
 *
 * Backend routes consumed:
 *   /api/auth        → authAPI   (AuthContext)
 *   /api/users       → userAPI
 *   /api/expenses    → expenseAPI
 *   /api/approvals   → approvalAPI
 *   /api/approval-flows → workflowAPI
 */
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { approvalAPI } from "./services/api";

// ── Pages ────────────────────────────────────────────────────────────────────
import LoginPage    from "./pages/auth/Login";
import SignupPage   from "./pages/auth/Signup";
import Dashboard    from "./pages/admin/Dashboard";
import Users        from "./pages/admin/Users";
import WorkflowBuilder from "./pages/admin/WorkflowBuilder";
import Rules        from "./pages/admin/Rules";
import SubmitExpense   from "./pages/employee/SubmitExpense";
import ExpenseHistory  from "./pages/employee/ExpenseHistory";
import PendingApprovals from "./pages/manager/PendingApprovals";
import TeamExpenses    from "./pages/manager/TeamExpenses";

// ── Imported from your existing files ────────────────────────────────────────
import AnalyticsPage    from "./pages/AnalyticsPage";
import ProfilePage      from "./pages/ProfilePage";
import SettingsPage     from "./pages/SettingsPage";
import NotificationsPanel from "./components/Notifications";

// ── Layout ───────────────────────────────────────────────────────────────────
import Sidebar from "./components/layout/Sidebar";
import Navbar  from "./components/layout/Navbar";

// ── Expense detail (inline — used across employee + manager + approvals) ─────
import { expenseAPI } from "./services/api";
import { formatCurrency, formatDate, initials } from "./utils/formatCurrency";
import { ApprovalTimeline } from "./components/approval/index";

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL DESIGN TOKENS + CSS
═══════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d1117;--s1:#161b22;--s2:#21262d;--s3:#2d333b;
  --b1:#30363d;--b2:#444c56;
  --t1:#e6edf3;--t2:#8b949e;--t3:#484f58;
  --amber:#f59e0b;--aglow:rgba(245,158,11,.12);
  --green:#3fb950;--gglow:rgba(63,185,80,.1);
  --red:#f85149;--rglow:rgba(248,81,73,.1);
  --blue:#58a6ff;--bglow:rgba(88,166,255,.1);
  --purple:#bc8cff;
  --r:10px;--rs:6px;
}
body{font-family:'IBM Plex Sans',sans-serif;background:var(--bg);color:var(--t1);min-height:100vh;overflow-x:hidden}
.shell{display:flex;min-height:100vh}
.sidebar{width:240px;flex-shrink:0;background:var(--s1);border-right:1px solid var(--b1);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
.sb-logo{display:flex;align-items:center;gap:10px;padding:20px 20px 16px;border-bottom:1px solid var(--b1)}
.sb-mark{width:34px;height:34px;background:var(--amber);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:var(--bg);flex-shrink:0}
.sb-name{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;line-height:1.3;color:var(--t1)}
.sb-name span{color:var(--amber)}
.sb-sec{padding:14px 10px 6px}
.sb-label{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--t3);padding:0 8px;margin-bottom:5px}
.nav{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:var(--rs);cursor:pointer;color:var(--t2);font-size:13.5px;margin-bottom:2px;transition:all .15s}
.nav:hover{background:var(--s2);color:var(--t1)}
.nav.active{background:var(--aglow);color:var(--amber);font-weight:500}
.nav-ico{font-size:15px;width:18px;text-align:center}
.nav-badge{margin-left:auto;background:var(--red);color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:20px}
.sb-user{padding:14px 18px;border-top:1px solid var(--b1);display:flex;align-items:center;gap:10px;margin-top:auto}
.avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--amber),#d97706);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:var(--bg);flex-shrink:0;cursor:pointer}
.sb-user-info{flex:1;min-width:0}
.sb-user-name{font-size:13px;font-weight:500;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-user-role{font-size:11px;color:var(--t2);text-transform:capitalize}
.topbar{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:rgba(13,17,23,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--b1)}
.tb-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700}
.tb-sub{font-size:12px;color:var(--t2);margin-top:1px}
.tb-right{display:flex;align-items:center;gap:10px}
.main{flex:1;overflow-x:hidden;min-width:0}
.page{padding:28px}
.card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:24px}
.card-sm{padding:16px}
.card-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;margin-bottom:16px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.stat{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:18px 20px}
.stat-label{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--t2);margin-bottom:8px}
.stat-val{font-family:'Syne',sans-serif;font-size:26px;font-weight:700}
.stat-sub{font-size:12px;color:var(--t2);margin-top:4px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 18px;border-radius:var(--rs);font-family:'IBM Plex Sans',sans-serif;font-size:13.5px;font-weight:500;cursor:pointer;border:none;transition:all .15s;white-space:nowrap;text-decoration:none}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn-primary{background:var(--amber);color:var(--bg)}
.btn-primary:hover:not(:disabled){background:#fbbf24;box-shadow:0 4px 16px rgba(245,158,11,.3)}
.btn-secondary{background:transparent;border:1px solid var(--b1);color:var(--t1)}
.btn-secondary:hover:not(:disabled){background:var(--s2)}
.btn-ghost{background:transparent;color:var(--t2);padding:7px 10px}
.btn-ghost:hover:not(:disabled){background:var(--s2);color:var(--t1)}
.btn-success{background:transparent;border:1px solid var(--green);color:var(--green)}
.btn-success:hover:not(:disabled){background:var(--gglow)}
.btn-danger{background:transparent;border:1px solid var(--red);color:var(--red)}
.btn-danger:hover:not(:disabled){background:var(--rglow)}
.btn-sm{padding:5px 12px;font-size:12px}
.btn-icon{width:32px;height:32px;padding:0}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.fg3{grid-template-columns:1fr 1fr 1fr}
.span2{grid-column:span 2}
.span3{grid-column:span 3}
.fg{display:flex;flex-direction:column;gap:6px}
label{font-size:12px;font-weight:500;color:var(--t2)}
.inp{background:var(--s2);border:1px solid var(--b1);border-radius:var(--rs);color:var(--t1);font-family:'IBM Plex Sans',sans-serif;font-size:14px;padding:9px 12px;outline:none;transition:border-color .15s,box-shadow .15s;width:100%;appearance:none}
.inp:focus{border-color:var(--amber);box-shadow:0 0 0 3px var(--aglow)}
.inp.err{border-color:var(--red)}
textarea.inp{resize:vertical;min-height:80px}
select.inp{cursor:pointer}
.inp-wrap{position:relative;display:flex;align-items:center}
.inp-pre{position:absolute;left:12px;color:var(--t2);font-size:14px;pointer-events:none}
.inp-wrap .inp{padding-left:26px}
.err-msg{font-size:11px;color:var(--red)}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13.5px}
thead{background:var(--s2)}
th{padding:10px 14px;text-align:left;font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--t2);border-bottom:1px solid var(--b1);white-space:nowrap}
td{padding:12px 14px;border-bottom:1px solid var(--b1);color:var(--t1);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.02)}
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:600}
.bd{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.badge-pending{background:var(--aglow);color:var(--amber)} .badge-pending .bd{background:var(--amber)}
.badge-approved{background:var(--gglow);color:var(--green)} .badge-approved .bd{background:var(--green)}
.badge-rejected{background:var(--rglow);color:var(--red)} .badge-rejected .bd{background:var(--red)}
.badge-draft{background:rgba(139,148,158,.1);color:var(--t2)} .badge-draft .bd{background:var(--t2)}
.badge-admin{background:rgba(188,140,255,.1);color:var(--purple)} .badge-admin .bd{background:var(--purple)}
.badge-manager{background:var(--bglow);color:var(--blue)} .badge-manager .bd{background:var(--blue)}
.badge-employee{background:var(--aglow);color:var(--amber)} .badge-employee .bd{background:var(--amber)}
.tag{display:inline-flex;align-items:center;gap:4px;background:var(--s2);border:1px solid var(--b1);border-radius:4px;padding:2px 8px;font-size:11.5px;color:var(--t2)}
.upload-zone{border:2px dashed var(--b1);border-radius:var(--r);padding:32px;text-align:center;cursor:pointer;transition:all .2s;background:var(--s2);position:relative}
.upload-zone:hover,.upload-zone.drag{border-color:var(--amber);background:var(--aglow)}
.upload-icon{font-size:28px;margin-bottom:10px;display:block}
.upload-inp{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%}
.timeline{display:flex;flex-direction:column}
.tl-item{display:flex;gap:14px;padding-bottom:22px;position:relative}
.tl-item:last-child{padding-bottom:0}
.tl-line{width:1px;background:var(--b1);position:absolute;left:15px;top:30px;bottom:0}
.tl-item:last-child .tl-line{display:none}
.tl-dot{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;border:2px solid var(--b1);background:var(--s1);z-index:1}
.tl-dot.green{border-color:var(--green);background:var(--gglow)}
.tl-dot.amber{border-color:var(--amber);background:var(--aglow)}
.tl-dot.red{border-color:var(--red);background:var(--rglow)}
.tl-dot.blue{border-color:var(--blue);background:var(--bglow)}
.tl-body{flex:1;padding-top:3px}
.tl-action{font-size:13.5px;font-weight:500}
.tl-meta{font-size:12px;color:var(--t2);margin-top:2px}
.tl-note{margin-top:8px;background:var(--s2);border:1px solid var(--b1);border-radius:var(--rs);padding:9px 12px;font-size:13px;color:var(--t2);font-style:italic}
.divider{border:none;border-top:1px solid var(--b1);margin:20px 0}
.flex{display:flex} .fc{flex-direction:column} .aic{align-items:center} .jb{justify-content:space-between} .jc{justify-content:center} .je{justify-content:flex-end}
.gap4{gap:4px} .gap8{gap:8px} .gap12{gap:12px} .gap16{gap:16px} .gap20{gap:20px}
.mt4{margin-top:4px} .mt8{margin-top:8px} .mt12{margin-top:12px} .mt16{margin-top:16px} .mt20{margin-top:20px}
.mb8{margin-bottom:8px} .mb12{margin-bottom:12px} .mb16{margin-bottom:16px} .mb20{margin-bottom:20px}
.w100{width:100%} .f1{flex:1} .mw0{min-width:0}
.text-sm{font-size:12px} .text-xs{font-size:11px} .text-muted{color:var(--t2)} .text-amber{color:var(--amber)} .text-green{color:var(--green)} .text-red{color:var(--red)}
.font-mono{font-family:monospace;font-size:12px}
.fw6{font-weight:600} .fw7{font-weight:700}
.sh-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700}
.shimmer{background:linear-gradient(90deg,var(--s2) 25%,var(--b1) 50%,var(--s2) 75%);background-size:200% 100%;animation:shim 1.4s infinite;border-radius:4px}
@keyframes shim{from{background-position:200% 0}to{background-position:-200% 0}}
.toast-wrap{position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:8px}
.toast{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:12px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.4);font-size:13.5px;animation:slideUp .25s ease;min-width:280px}
@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:28px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto}
.modal-wide{max-width:680px}
.modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.modal-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700}
.auth-shell{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);padding:24px}
.auth-card{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:40px;width:100%;max-width:440px}
.auth-logo{display:flex;align-items:center;gap:10px;margin-bottom:32px;justify-content:center}
.auth-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;text-align:center;margin-bottom:6px}
.auth-sub{font-size:13px;color:var(--t2);text-align:center;margin-bottom:28px}
.auth-footer{text-align:center;margin-top:20px;font-size:13px;color:var(--t2)}
.auth-footer a{color:var(--amber);cursor:pointer;text-decoration:none}
.auth-divider{display:flex;align-items:center;gap:12px;margin:20px 0}
.auth-divider span{font-size:12px;color:var(--t3)}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--b1)}
.google-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:10px;background:var(--s2);border:1px solid var(--b1);border-radius:var(--rs);color:var(--t1);font-size:14px;cursor:pointer;transition:all .15s;font-family:'IBM Plex Sans',sans-serif}
.google-btn:hover{background:var(--s3);border-color:var(--b2)}
.search-wrap{position:relative;flex:1;min-width:180px}
.search-wrap .inp{padding-left:34px}
.search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--t3);pointer-events:none}
.empty{text-align:center;padding:48px 20px;color:var(--t2)}
.empty-ico{font-size:36px;margin-bottom:12px}
.empty-title{font-size:15px;font-weight:500;color:var(--t1);margin-bottom:6px}
.filter-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:20px}
.comment{background:var(--s2);border:1px solid var(--b1);border-radius:var(--rs);padding:12px 14px;margin-bottom:10px}
.comment-author{font-size:13px;font-weight:500;margin-bottom:3px}
.comment-text{font-size:13px;color:var(--t2)}
.comment-time{font-size:11px;color:var(--t3);margin-top:5px}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.detail-item{display:flex;flex-direction:column;gap:4px}
.detail-label{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--t2);font-weight:500}
.detail-val{font-size:14px;font-weight:500}
.step-row{display:flex;align-items:center;gap:10px;background:var(--s2);border:1px solid var(--b1);border-radius:var(--rs);padding:10px 14px;margin-bottom:8px}
.step-num{width:24px;height:24px;border-radius:50%;background:var(--aglow);border:1px solid var(--amber);color:var(--amber);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
`;

/* ═══════════════════════════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════════════════════════ */
let _addToast = () => {};

export function useToast() {
  return {
    success: (msg) => _addToast(msg, "success"),
    error:   (msg) => _addToast(msg, "error"),
    info:    (msg) => _addToast(msg, "info"),
  };
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  _addToast = (msg, type) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };
  const icons = {
    success: { icon: "✓", color: "var(--green)" },
    error:   { icon: "✕", color: "var(--red)" },
    info:    { icon: "ⓘ", color: "var(--amber)" },
  };
  return (
    <>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span style={{ color: icons[t.type]?.color, fontWeight: 700, fontSize: 16 }}>
              {icons[t.type]?.icon}
            </span>
            <span>{t.msg}</span>
            <button className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              style={{ marginLeft: "auto" }}>✕</button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   EXPENSE DETAIL PAGE — shared across employee, manager, approvals
   GET /api/expenses/:id
   GET /api/approvals/timeline/:expenseId
   POST /api/expenses/:id/comments
   POST /api/approvals/override/:expenseId  (admin)
═══════════════════════════════════════════════════════════════════ */
function ExpenseDetailPage({ expense: initial, onBack, onEdit }) {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [expense,  setExpense]  = useState(initial);
  const [timeline, setTimeline] = useState([]);
  const [comment,  setComment]  = useState("");
  const [posting,  setPosting]  = useState(false);
  const [overrideModal, setOverrideModal] = useState(false);
  const [overrideForm,  setOverrideForm]  = useState({ status: "approved", comment: "" });

  const expId = initial._id || initial.id;

  useEffect(() => {
    expenseAPI.getExpense(expId).then((d) => setExpense(d.expense || d)).catch(() => {});
    approvalAPI.getTimeline(expId).then((d) => setTimeline(d.timeline || d || [])).catch(() => {});
  }, [expId]);

  const postComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await expenseAPI.addComment(expId, comment);
      toast.success("Comment posted");
      setComment("");
      const d = await expenseAPI.getExpense(expId);
      setExpense(d.expense || d);
    } catch { toast.error("Failed to post comment"); }
    finally { setPosting(false); }
  };

  const handleOverride = async () => {
    try {
      await approvalAPI.adminOverride(expId, overrideForm.status, overrideForm.comment);
      toast.success(`Status overridden to ${overrideForm.status}`);
      setOverrideModal(false);
      const d = await expenseAPI.getExpense(expId);
      setExpense(d.expense || d);
    } catch (err) { toast.error(err.message || "Override failed"); }
  };

  return (
    <div className="page">
      <div className="flex aic gap8 mb16" style={{ cursor: "pointer", color: "var(--t2)" }} onClick={onBack}>
        ← Back
      </div>

      <div className="card mb16">
        <div className="flex aic jb mb16">
          <div>
            <div className="text-muted text-xs mb4">EXPENSE ID</div>
            <div className="font-mono" style={{ fontSize: 15, fontWeight: 600 }}>{expId}</div>
          </div>
          <div className="flex aic gap8">
            <span className={`badge badge-${expense.status}`}>
              <span className="bd" />{expense.status?.charAt(0).toUpperCase() + expense.status?.slice(1)}
            </span>
            {["draft", "pending"].includes(expense.status) && (
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit?.(expense)}>✎ Edit</button>
            )}
            {isAdmin && (
              <button className="btn btn-ghost btn-sm" onClick={() => setOverrideModal(true)}>⚡ Override</button>
            )}
          </div>
        </div>

        <div style={{ fontFamily: "Syne", fontSize: 34, fontWeight: 800, marginBottom: 16 }}>
          {formatCurrency(expense.amount, expense.currency)}
          <span className="tag" style={{ fontSize: 13, marginLeft: 12 }}>{expense.currency}</span>
          <span className="tag" style={{ fontSize: 13, marginLeft: 6 }}>{expense.category}</span>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Merchant</span>
            <span className="detail-val">{expense.merchant || "—"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date</span>
            <span className="detail-val">{formatDate(expense.expense_date || expense.date)}</span>
          </div>
          <div className="detail-item" style={{ gridColumn: "span 2" }}>
            <span className="detail-label">Description</span>
            <span className="detail-val">{expense.description || "—"}</span>
          </div>
        </div>

        {expense.receiptUrl && (
          <div className="flex aic gap12 mt16" style={{ background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: "var(--rs)", padding: "12px 14px" }}>
            <span style={{ fontSize: 20 }}>📄</span>
            <span className="text-muted text-sm">Receipt attached</span>
            <a className="btn btn-ghost btn-sm" href={expense.receiptUrl} target="_blank" rel="noreferrer"
              style={{ marginLeft: "auto" }}>⬇ Download</a>
          </div>
        )}
      </div>

      <div className="flex gap16" style={{ alignItems: "flex-start" }}>
        {/* Timeline */}
        <div className="card f1">
          <div className="card-title">Approval Timeline</div>
          <ApprovalTimeline timeline={timeline} />
        </div>

        {/* Comments */}
        <div className="card" style={{ width: 300, flexShrink: 0 }}>
          <div className="card-title">Comments</div>
          {(expense.comments || []).length === 0 && (
            <div className="text-muted text-sm mb12">No comments yet.</div>
          )}
          {(expense.comments || []).map((c, i) => (
            <div key={i} className="comment">
              <div className="comment-author">{c.author?.name || c.author || "User"}</div>
              <div className="comment-text">{c.text}</div>
              <div className="comment-time">{formatDate(c.createdAt)}</div>
            </div>
          ))}
          <textarea className="inp mt8" rows={3} placeholder="Add a comment…"
            value={comment} onChange={(e) => setComment(e.target.value)} />
          <button className="btn btn-secondary btn-sm w100 mt8" onClick={postComment}
            disabled={!comment.trim() || posting}>
            {posting ? "Posting…" : "Post Comment"}
          </button>
        </div>
      </div>

      {/* Admin override modal */}
      {overrideModal && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setOverrideModal(false)}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">⚡ Admin Override</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setOverrideModal(false)}>✕</button>
            </div>
            <div className="fg mb12">
              <label>Set Status</label>
              <select className="inp" value={overrideForm.status}
                onChange={(e) => setOverrideForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="fg mb16">
              <label>Reason / Comment</label>
              <textarea className="inp" placeholder="Reason for override…"
                value={overrideForm.comment}
                onChange={(e) => setOverrideForm((f) => ({ ...f, comment: e.target.value }))} />
            </div>
            <div className="flex gap8 je">
              <button className="btn btn-ghost" onClick={() => setOverrideModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleOverride}>Apply Override</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   APP SHELL
═══════════════════════════════════════════════════════════════════ */
function AppShell() {
  const { isAdmin, isManager } = useAuth();
  const toast = useToast();
  const [page,            setPage]            = useState("dashboard");
  const [subPage,         setSubPage]         = useState(null);   // "detail" | "edit"
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [pendingCount,    setPendingCount]    = useState(0);
  const [showNotifs,      setShowNotifs]      = useState(false);

  useEffect(() => {
    if (isManager) {
      approvalAPI.getPendingApprovals()
        .then((d) => setPendingCount((d.expenses || d.pending || d || []).length))
        .catch(() => {});
    }
  }, [isManager]);

  const navigate = (id) => { setPage(id); setSubPage(null); setSelectedExpense(null); };

  const viewExpense = (exp) => { setSelectedExpense(exp); setSubPage("detail"); };
  const editExpense = (exp) => { setSelectedExpense(exp); setSubPage("edit"); setPage("submit"); };

  const toastProp = {
    success: (m) => _addToast(m, "success"),
    error:   (m) => _addToast(m, "error"),
    info:    (m) => _addToast(m, "info"),
  };

  const isDetailPage = subPage === "detail" && selectedExpense;
  const isEditPage   = subPage === "edit"   && selectedExpense && page === "submit";

  return (
    <div className="shell">
      <Sidebar page={page} subPage={subPage} onNavigate={navigate} pendingCount={pendingCount} />

      <main className="main">
        <Navbar
          page={page}
          subPage={subPage}
          onNavigate={navigate}
          onNotifClick={() => setShowNotifs(true)}
          notifCount={2}
        />

        {/* ── Shared: Expense Detail ─────────────────────────────────── */}
        {isDetailPage && (
          <ExpenseDetailPage
            expense={selectedExpense}
            onBack={() => setSubPage(null)}
            onEdit={editExpense}
          />
        )}

        {/* ── Pages (hidden when detail is shown) ───────────────────── */}
        {!isDetailPage && (
          <>
            {page === "dashboard" && <Dashboard />}

            {page === "analytics" && <AnalyticsPage />}

            {page === "profile" && (
              <ProfilePage addToast={(msg, type) => _addToast(msg, type)} />
            )}

            {page === "settings" && isAdmin && (
              <SettingsPage addToast={(msg, type) => _addToast(msg, type)} />
            )}

            {page === "submit" && !isEditPage && (
              <SubmitExpense toast={toastProp} onDone={() => navigate("history")} />
            )}

            {page === "submit" && isEditPage && (
              <SubmitExpense
                editExpense={selectedExpense}
                toast={toastProp}
                onDone={() => navigate("history")}
              />
            )}

            {page === "history" && (
              <ExpenseHistory
                toast={toastProp}
                onView={viewExpense}
                onEdit={editExpense}
              />
            )}

            {page === "approvals" && (
              <PendingApprovals toast={toastProp} onView={viewExpense} />
            )}

            {page === "team" && isManager && (
              <TeamExpenses toast={toastProp} onView={viewExpense} />
            )}

            {page === "users"     && isAdmin && <Users toast={toastProp} />}
            {page === "workflows" && isAdmin && <WorkflowBuilder toast={toastProp} />}
            {page === "rules"     && isAdmin && <Rules toast={toastProp} />}
          </>
        )}
      </main>

      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [authPage, setAuthPage] = useState("login");

  return (
    <>
      <style>{CSS}</style>
      <AuthProvider>
        <ToastProvider>
          <AppContent authPage={authPage} setAuthPage={setAuthPage} />
        </ToastProvider>
      </AuthProvider>
    </>
  );
}

function AppContent({ authPage, setAuthPage }) {
  const { user, loading } = useAuth();
  const toast = useToast();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div className="flex fc aic gap12">
          <div className="sb-mark" style={{ width: 48, height: 48, fontSize: 18 }}>EX</div>
          <div className="text-muted text-sm">Loading…</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return authPage === "login"
      ? <LoginPage  toast={toast} onSwitch={() => setAuthPage("signup")} />
      : <SignupPage toast={toast} onSwitch={() => setAuthPage("login")} />;
  }

  return <AppShell />;
}
