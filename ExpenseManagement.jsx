import { useState, useRef, useCallback } from "react";

/* ─── GLOBAL STYLES ───────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:       #0d1117;
    --navy-2:     #161b22;
    --navy-3:     #21262d;
    --border:     #30363d;
    --border-2:   #3d444d;
    --text-1:     #e6edf3;
    --text-2:     #8b949e;
    --text-3:     #484f58;
    --amber:      #f59e0b;
    --amber-dim:  #92400e;
    --amber-glow: rgba(245,158,11,0.12);
    --green:      #3fb950;
    --green-dim:  #0d4429;
    --red:        #f85149;
    --red-dim:    #490202;
    --blue:       #58a6ff;
    --blue-dim:   #0c2d6b;
    --purple:     #bc8cff;
    --radius:     10px;
    --radius-sm:  6px;
    --shadow:     0 8px 32px rgba(0,0,0,0.4);
    --shadow-sm:  0 2px 8px rgba(0,0,0,0.3);
  }

  body {
    font-family: 'IBM Plex Sans', sans-serif;
    background: var(--navy);
    color: var(--text-1);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .app-shell {
    display: flex;
    min-height: 100vh;
  }

  /* ─── SIDEBAR ─────────────────────────── */
  .sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--navy-2);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--border);
  }

  .logo-mark {
    width: 34px; height: 34px;
    background: var(--amber);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 14px;
    color: var(--navy);
    flex-shrink: 0;
  }

  .logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    line-height: 1.2;
    color: var(--text-1);
  }

  .logo-text span { color: var(--amber); }

  .sidebar-section { padding: 16px 12px 8px; }

  .sidebar-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-3);
    padding: 0 8px;
    margin-bottom: 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.15s ease;
    color: var(--text-2);
    font-size: 13.5px;
    font-weight: 400;
    margin-bottom: 2px;
  }

  .nav-item:hover { background: var(--navy-3); color: var(--text-1); }

  .nav-item.active {
    background: var(--amber-glow);
    color: var(--amber);
    font-weight: 500;
  }

  .nav-icon {
    width: 18px; height: 18px;
    opacity: 0.8;
    flex-shrink: 0;
  }

  .nav-badge {
    margin-left: auto;
    background: var(--amber);
    color: var(--navy);
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 20px;
  }

  /* ─── MAIN AREA ───────────────────────── */
  .main {
    flex: 1;
    overflow-x: hidden;
    background: var(--navy);
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    background: rgba(13,17,23,0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }

  .topbar-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-1);
  }

  .topbar-subtitle { font-size: 12px; color: var(--text-2); margin-top: 1px; }

  .topbar-actions { display: flex; align-items: center; gap: 10px; }

  .avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--amber) 0%, #d97706 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    color: var(--navy);
    cursor: pointer;
  }

  .page-content { padding: 28px; }

  /* ─── CARDS / SURFACES ────────────────── */
  .card {
    background: var(--navy-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
  }

  .card-sm { padding: 16px; }

  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700;
    color: var(--text-1);
  }

  /* ─── FORM ELEMENTS ───────────────────── */
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .form-grid-3 { grid-template-columns: 1fr 1fr 1fr; }

  .form-group { display: flex; flex-direction: column; gap: 6px; }

  .form-group.span-2 { grid-column: span 2; }
  .form-group.span-3 { grid-column: span 3; }

  label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-2);
    letter-spacing: 0.02em;
  }

  .input, select, textarea {
    background: var(--navy-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-1);
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    padding: 9px 12px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 100%;
    appearance: none;
  }

  .input:focus, select:focus, textarea:focus {
    border-color: var(--amber);
    box-shadow: 0 0 0 3px var(--amber-glow);
  }

  .input-prefix {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-prefix-symbol {
    position: absolute;
    left: 12px;
    color: var(--text-2);
    font-size: 14px;
    pointer-events: none;
  }

  .input-prefix .input { padding-left: 28px; }

  textarea { resize: vertical; min-height: 80px; }

  select option { background: var(--navy-3); }

  /* ─── BUTTONS ─────────────────────────── */
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 9px 18px;
    border-radius: var(--radius-sm);
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
    text-decoration: none;
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--amber);
    color: var(--navy);
  }
  .btn-primary:hover { background: #fbbf24; box-shadow: 0 4px 16px rgba(245,158,11,0.3); }

  .btn-secondary {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-1);
  }
  .btn-secondary:hover { background: var(--navy-3); border-color: var(--border-2); }

  .btn-ghost {
    background: transparent;
    color: var(--text-2);
    padding: 7px 10px;
  }
  .btn-ghost:hover { background: var(--navy-3); color: var(--text-1); }

  .btn-danger {
    background: transparent;
    border: 1px solid var(--red);
    color: var(--red);
  }
  .btn-danger:hover { background: rgba(248,81,73,0.1); }

  .btn-sm { padding: 5px 12px; font-size: 12px; }

  .btn-icon {
    width: 32px; height: 32px;
    padding: 0;
    border-radius: var(--radius-sm);
    font-size: 14px;
  }

  /* ─── STATUS BADGES ───────────────────── */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
  }

  .badge-pending { background: rgba(245,158,11,0.12); color: var(--amber); }
  .badge-pending .badge-dot { background: var(--amber); }

  .badge-approved { background: rgba(63,185,80,0.1); color: var(--green); }
  .badge-approved .badge-dot { background: var(--green); }

  .badge-rejected { background: rgba(248,81,73,0.1); color: var(--red); }
  .badge-rejected .badge-dot { background: var(--red); }

  .badge-draft { background: rgba(139,148,158,0.1); color: var(--text-2); }
  .badge-draft .badge-dot { background: var(--text-2); }

  /* ─── TABLE ───────────────────────────── */
  .table-wrapper { overflow-x: auto; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }

  thead { background: var(--navy-3); }

  th {
    padding: 10px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-2);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  td {
    padding: 13px 14px;
    border-bottom: 1px solid var(--border);
    color: var(--text-1);
    vertical-align: middle;
  }

  tr:last-child td { border-bottom: none; }

  tr:hover td { background: rgba(255,255,255,0.02); }

  .expense-id { font-family: 'IBM Plex Sans', monospace; color: var(--text-2); font-size: 12px; }

  .amount-cell { font-weight: 600; font-variant-numeric: tabular-nums; }

  /* ─── UPLOAD ZONE ─────────────────────── */
  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--navy-3);
    position: relative;
  }

  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--amber);
    background: var(--amber-glow);
  }

  .upload-icon {
    font-size: 32px;
    margin-bottom: 12px;
    display: block;
  }

  .upload-title { font-size: 14px; font-weight: 500; color: var(--text-1); margin-bottom: 4px; }
  .upload-sub { font-size: 12px; color: var(--text-2); }

  .upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }

  /* ─── OCR PREVIEW ─────────────────────── */
  .ocr-preview {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  .receipt-thumbnail {
    width: 120px; min-height: 160px;
    background: var(--navy-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 6px;
    color: var(--text-2);
    font-size: 12px;
    flex-shrink: 0;
    padding: 16px;
    text-align: center;
  }

  .ocr-fields { flex: 1; display: flex; flex-direction: column; gap: 10px; }

  .ocr-field-row {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--navy-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 14px;
  }

  .ocr-label { font-size: 11px; color: var(--text-2); font-weight: 500; width: 90px; flex-shrink: 0; }
  .ocr-value { font-size: 13.5px; color: var(--text-1); font-weight: 500; flex: 1; }
  .ocr-confidence {
    font-size: 10px; padding: 2px 6px;
    border-radius: 4px;
    background: rgba(63,185,80,0.1);
    color: var(--green);
    font-weight: 600;
  }

  /* ─── TIMELINE ─────────────────────────── */
  .timeline { display: flex; flex-direction: column; gap: 0; }

  .timeline-item {
    display: flex;
    gap: 16px;
    padding-bottom: 24px;
    position: relative;
  }

  .timeline-item:last-child { padding-bottom: 0; }

  .timeline-line {
    width: 1px;
    background: var(--border);
    position: absolute;
    left: 15px;
    top: 28px;
    bottom: 0;
  }

  .timeline-item:last-child .timeline-line { display: none; }

  .timeline-dot {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
    border: 2px solid var(--border);
    background: var(--navy-2);
    z-index: 1;
  }

  .timeline-dot.green { border-color: var(--green); background: rgba(63,185,80,0.1); }
  .timeline-dot.amber { border-color: var(--amber); background: var(--amber-glow); }
  .timeline-dot.red { border-color: var(--red); background: rgba(248,81,73,0.1); }
  .timeline-dot.blue { border-color: var(--blue); background: rgba(88,166,255,0.1); }

  .timeline-content { flex: 1; padding-top: 4px; }
  .timeline-action { font-size: 13.5px; font-weight: 500; color: var(--text-1); }
  .timeline-meta { font-size: 12px; color: var(--text-2); margin-top: 2px; }
  .timeline-note {
    margin-top: 8px;
    background: var(--navy-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text-2);
    font-style: italic;
  }

  /* ─── DETAIL PANELS ────────────────────── */
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .detail-item { display: flex; flex-direction: column; gap: 4px; }
  .detail-label { font-size: 11px; color: var(--text-2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
  .detail-value { font-size: 14px; color: var(--text-1); font-weight: 500; }

  /* ─── STATS ────────────────────────────── */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }

  .stat-card {
    background: var(--navy-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
  }

  .stat-label { font-size: 11px; color: var(--text-2); font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; color: var(--text-1); }
  .stat-sub { font-size: 12px; color: var(--text-2); margin-top: 4px; }
  .stat-accent { color: var(--amber); }

  /* ─── MISC ─────────────────────────────── */
  .divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--text-2);
  }
  .empty-icon { font-size: 36px; margin-bottom: 12px; }
  .empty-title { font-size: 15px; font-weight: 500; color: var(--text-1); margin-bottom: 6px; }
  .empty-sub { font-size: 13px; }

  .filter-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  .search-input-wrap { position: relative; flex: 1; min-width: 200px; }
  .search-input-wrap .input { padding-left: 34px; }
  .search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--text-3); font-size: 14px; pointer-events: none; }

  .tag {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--navy-3);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 11.5px;
    color: var(--text-2);
  }

  .back-btn {
    display: inline-flex; align-items: center; gap: 6px;
    color: var(--text-2); font-size: 13px; cursor: pointer;
    margin-bottom: 20px;
    transition: color 0.15s;
  }
  .back-btn:hover { color: var(--amber); }

  .comment-box {
    background: var(--navy-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    margin-bottom: 10px;
  }
  .comment-author { font-size: 13px; font-weight: 500; color: var(--text-1); margin-bottom: 4px; }
  .comment-text { font-size: 13px; color: var(--text-2); }
  .comment-time { font-size: 11px; color: var(--text-3); margin-top: 5px; }

  .toast {
    position: fixed; bottom: 24px; right: 24px;
    background: var(--navy-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 16px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: var(--shadow);
    font-size: 13.5px;
    z-index: 100;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .progress-bar-wrap { background: var(--navy-3); border-radius: 4px; height: 4px; overflow: hidden; margin-top: 4px; }
  .progress-bar { height: 100%; background: var(--amber); border-radius: 4px; transition: width 0.4s ease; }

  .shimmer {
    background: linear-gradient(90deg, var(--navy-3) 25%, var(--border) 50%, var(--navy-3) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 4px;
    height: 16px;
  }

  @keyframes shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }

  select { cursor: pointer; }

  .gap-8 { gap: 8px; }
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .flex-col { flex-direction: column; }
  .gap-12 { gap: 12px; }
  .gap-16 { gap: 16px; }
  .gap-20 { gap: 20px; }
  .mt-4 { margin-top: 4px; }
  .mt-8 { margin-top: 8px; }
  .mt-16 { margin-top: 16px; }
  .mt-20 { margin-top: 20px; }
  .mb-16 { margin-bottom: 16px; }
  .text-sm { font-size: 12px; }
  .text-muted { color: var(--text-2); }
  .font-mono { font-family: monospace; }
  .w-full { width: 100%; }
`;

/* ─── MOCK DATA ────────────────────────────────────────────────────── */
const MOCK_EXPENSES = [
  { id: "EXP-2024-001", amount: 1250.00, currency: "USD", category: "Travel", description: "Flight to NYC for client meeting", date: "2024-01-15", status: "approved", merchant: "Delta Airlines" },
  { id: "EXP-2024-002", amount: 87.50,   currency: "USD", category: "Meals",  description: "Team lunch - Q4 planning session", date: "2024-01-18", status: "pending",  merchant: "The Capital Grille" },
  { id: "EXP-2024-003", amount: 340.00,  currency: "EUR", category: "Hotels", description: "Hotel stay - London offsite",       date: "2024-01-20", status: "rejected", merchant: "The Hoxton" },
  { id: "EXP-2024-004", amount: 22.99,   currency: "USD", category: "Software", description: "Notion subscription renewal",    date: "2024-01-22", status: "approved", merchant: "Notion Labs" },
  { id: "EXP-2024-005", amount: 195.00,  currency: "USD", category: "Travel",   description: "Uber rides for client visits",  date: "2024-01-25", status: "pending",  merchant: "Uber" },
  { id: "EXP-2024-006", amount: 58.30,   currency: "USD", category: "Meals",    description: "Working dinner with partner",   date: "2024-01-28", status: "draft",    merchant: "Nobu" },
];

const CATEGORIES = ["Travel", "Meals", "Hotels", "Software", "Office Supplies", "Marketing", "Training", "Other"];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"];

/* ─── HELPERS ──────────────────────────────────────────────────────── */
const fmtAmount = (amt, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(amt);

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    <span className="badge-dot" />
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

/* ─── ICON COMPONENTS ──────────────────────────────────────────────── */
const Icon = ({ name }) => {
  const icons = {
    plus: "＋", submit: "✈", history: "🗂", detail: "📋", draft: "📝",
    upload: "↑", scan: "⊡", edit: "✎", trash: "⌫", eye: "◉",
    back: "←", check: "✓", x: "✕", search: "⌕", filter: "⊟",
    money: "$", calendar: "📅", tag: "🏷", file: "📄", spark: "✦",
    dot: "•", arrow: "→", warn: "⚠", info: "ⓘ", clock: "◷",
  };
  return icons[name] || "○";
};

/* ─── TOAST ─────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ⓘ";
  const color = type === "success" ? "var(--green)" : type === "error" ? "var(--red)" : "var(--amber)";
  return (
    <div className="toast">
      <span style={{ color, fontSize: 16, fontWeight: 700 }}>{icon}</span>
      <span>{message}</span>
      <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} style={{ marginLeft: 8 }}>✕</button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE 1 — EXPENSE SUBMISSION
═══════════════════════════════════════════════════════════════════ */
const SubmissionPage = ({ onSuccess, editExpense }) => {
  const [form, setForm] = useState(editExpense || {
    amount: "", currency: "USD", category: "", description: "", date: "",
    merchant: "",
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [ocrState, setOcrState] = useState(null); // null | "scanning" | "done"
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.amount) e.amount = "Required";
    if (!form.category) e.category = "Required";
    if (!form.date) e.date = "Required";
    if (!form.description) e.description = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (file) => {
    if (!file) return;
    setReceiptFile(file);
    setOcrState("scanning");
    setTimeout(() => {
      setForm(f => ({
        ...f,
        amount: "247.80",
        date: "2024-01-29",
        merchant: "Marriott Bonvoy",
        description: "Hotel accommodation - business travel",
      }));
      setOcrState("done");
    }, 2000);
  };

  const handleSubmit = (isDraft) => {
    if (!isDraft && !validate()) return;
    onSuccess(isDraft ? "draft" : "submitted", form);
  };

  return (
    <div>
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 24 }}>
        {[
          { label: "Submitted This Month", value: "$3,284", sub: "12 expenses" },
          { label: "Pending Approval", value: "$542", sub: "3 expenses" },
          { label: "Monthly Budget Left", value: "$1,716", sub: "of $5,000" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Receipt Upload + OCR */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div>
            <div className="section-title">📄 Receipt Upload</div>
            <div className="text-sm text-muted mt-4">Upload a receipt for auto-fill via OCR</div>
          </div>
          {ocrState === "done" && <span className="badge badge-approved"><span className="badge-dot" />OCR Complete</span>}
        </div>

        {!receiptFile ? (
          <div
            className={`upload-zone ${dragOver ? "drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
          >
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="upload-input"
              onChange={e => handleFile(e.target.files[0])} />
            <span className="upload-icon">📸</span>
            <div className="upload-title">Drop receipt here or click to browse</div>
            <div className="upload-sub">Supports JPG, PNG, PDF — max 10 MB</div>
            <div className="upload-sub mt-8" style={{ color: "var(--amber)" }}>✦ AI-powered OCR will auto-fill your form</div>
          </div>
        ) : (
          <div className="ocr-preview">
            <div className="receipt-thumbnail">
              {ocrState === "scanning" ? (
                <>
                  <div style={{ fontSize: 28 }}>⊡</div>
                  <div>Scanning…</div>
                  <div className="progress-bar-wrap w-full">
                    <div className="progress-bar" style={{ width: "70%", animation: "shimmer 1.2s infinite" }} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 28 }}>📄</div>
                  <div style={{ wordBreak: "break-all" }}>{receiptFile.name}</div>
                </>
              )}
            </div>

            {ocrState === "done" && (
              <div className="ocr-fields">
                <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--amber)" }}>✦</span>
                  OCR extracted the following — review and confirm
                </div>
                {[
                  { label: "Amount", value: "$247.80", confidence: "98%" },
                  { label: "Date", value: "Jan 29, 2024", confidence: "97%" },
                  { label: "Merchant", value: "Marriott Bonvoy", confidence: "95%" },
                  { label: "Description", value: "Hotel accommodation", confidence: "89%" },
                ].map(f => (
                  <div key={f.label} className="ocr-field-row">
                    <span className="ocr-label">{f.label}</span>
                    <span className="ocr-value">{f.value}</span>
                    <span className="ocr-confidence">{f.confidence}</span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={() => { setReceiptFile(null); setOcrState(null); }}>
                  Remove receipt
                </button>
              </div>
            )}

            {ocrState === "scanning" && (
              <div className="ocr-fields" style={{ justifyContent: "center", display: "flex", flexDirection: "column", gap: 10 }}>
                {[90, 60, 75, 50].map((w, i) => <div key={i} className="shimmer" style={{ width: `${w}%` }} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Form */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">Expense Details</div>
          {editExpense && <span className="badge badge-draft"><span className="badge-dot" />Editing Draft</span>}
        </div>

        <div className="form-grid">
          {/* Amount + Currency */}
          <div className="form-group">
            <label>Amount *</label>
            <div className="input-prefix">
              <span className="input-prefix-symbol">$</span>
              <input className="input" type="number" placeholder="0.00" min="0" step="0.01"
                value={form.amount} onChange={e => update("amount", e.target.value)}
                style={errors.amount ? { borderColor: "var(--red)" } : {}}
              />
            </div>
            {errors.amount && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select className="input" value={form.currency} onChange={e => update("currency", e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select className="input" value={form.category} onChange={e => update("category", e.target.value)}
              style={errors.category ? { borderColor: "var(--red)" } : {}}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            {errors.category && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.category}</span>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date *</label>
            <input className="input" type="date" value={form.date} onChange={e => update("date", e.target.value)}
              style={errors.date ? { borderColor: "var(--red)" } : {}} />
            {errors.date && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.date}</span>}
          </div>

          {/* Merchant */}
          <div className="form-group span-2">
            <label>Merchant / Vendor</label>
            <input className="input" type="text" placeholder="e.g. Delta Airlines, Amazon…"
              value={form.merchant} onChange={e => update("merchant", e.target.value)} />
          </div>

          {/* Description */}
          <div className="form-group span-2">
            <label>Description *</label>
            <textarea className="input" placeholder="Describe the business purpose of this expense…"
              value={form.description} onChange={e => update("description", e.target.value)}
              style={errors.description ? { borderColor: "var(--red)" } : {}} />
            {errors.description && <span style={{ fontSize: 11, color: "var(--red)" }}>{errors.description}</span>}
          </div>
        </div>

        <hr className="divider" />

        <div className="flex items-center justify-between">
          <div className="flex gap-8">
            <button className="btn btn-primary" onClick={() => handleSubmit(false)}>
              <span>✈</span> Submit Expense
            </button>
            <button className="btn btn-secondary" onClick={() => handleSubmit(true)}>
              <span>📝</span> Save as Draft
            </button>
          </div>
          <div className="text-sm text-muted">
            * Required fields
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE 2 — EXPENSE HISTORY
═══════════════════════════════════════════════════════════════════ */
const HistoryPage = ({ expenses, onView, onEdit, onDelete }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  const filtered = expenses.filter(e => {
    const matchSearch = e.id.toLowerCase().includes(search.toLowerCase())
      || e.description.toLowerCase().includes(search.toLowerCase())
      || e.merchant.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    const matchCat = catFilter === "all" || e.category === catFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      {/* Summary stats */}
      <div className="stats-row" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Expenses", value: expenses.length, sub: "All time" },
          { label: "Total Amount", value: fmtAmount(expenses.reduce((s,e)=>s+e.amount,0)), sub: "All currencies" },
          { label: "Pending", value: expenses.filter(e=>e.status==="pending").length, sub: "Awaiting review", accent: true },
          { label: "Approved", value: expenses.filter(e=>e.status==="approved").length, sub: "This month" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.accent ? "stat-accent" : ""}`}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Filters */}
        <div className="section-header" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="section-title">Expense History</div>
          <div className="filter-bar">
            <div className="search-input-wrap" style={{ minWidth: 220 }}>
              <span className="search-icon">⌕</span>
              <input className="input" placeholder="Search by ID, merchant, description…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{ width: "auto" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              {["pending","approved","rejected","draft"].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
              ))}
            </select>
            <select className="input" style={{ width: "auto" }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Expense ID</th>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(exp => (
                    <tr key={exp.id}>
                      <td><span className="expense-id">{exp.id}</span></td>
                      <td style={{ fontWeight: 500 }}>{exp.merchant}</td>
                      <td><span className="tag">{exp.category}</span></td>
                      <td style={{ color: "var(--text-2)", fontSize: 13 }}>{fmtDate(exp.date)}</td>
                      <td className="amount-cell">{fmtAmount(exp.amount, exp.currency)}</td>
                      <td><span className="tag">{exp.currency}</span></td>
                      <td><StatusBadge status={exp.status} /></td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-ghost btn-icon btn-sm" title="View details"
                            onClick={() => onView(exp)}>◉</button>
                          {(exp.status === "draft" || exp.status === "pending") && (
                            <button className="btn btn-ghost btn-icon btn-sm" title="Edit"
                              onClick={() => onEdit(exp)}>✎</button>
                          )}
                          {exp.status === "draft" && (
                            <button className="btn btn-ghost btn-icon btn-sm" title="Delete"
                              style={{ color: "var(--red)" }}
                              onClick={() => onDelete(exp.id)}>⌫</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-16" style={{ padding: "0 4px" }}>
              <div className="text-sm text-muted">Showing {filtered.length} of {expenses.length} expenses</div>
              <div className="text-sm" style={{ fontWeight: 600 }}>
                Filtered total: <span style={{ color: "var(--amber)" }}>{fmtAmount(total)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🗂</div>
            <div className="empty-title">No expenses found</div>
            <div className="empty-sub">Try adjusting your filters or search query</div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE 3 — EXPENSE DETAILS
═══════════════════════════════════════════════════════════════════ */
const TIMELINE_EVENTS = [
  { icon: "✦", color: "amber", action: "Expense Submitted", by: "Sarah Mitchell", time: "Jan 29, 2024 · 9:14 AM", note: null },
  { icon: "◷", color: "blue",  action: "Sent for Manager Review", by: "System", time: "Jan 29, 2024 · 9:15 AM", note: null },
  { icon: "✓", color: "green", action: "Approved by Manager", by: "David Chen", time: "Jan 30, 2024 · 2:38 PM", note: "Looks good, approved for reimbursement. Please ensure future submissions include project codes." },
  { icon: "✓", color: "green", action: "Finance Processed", by: "Finance Dept.", time: "Jan 31, 2024 · 11:00 AM", note: null },
];

const COMMENTS = [
  { author: "David Chen", role: "Manager", text: "Approved. Please attach the project code in future submissions for faster processing.", time: "Jan 30, 2024 · 2:38 PM" },
  { author: "Sarah Mitchell", role: "Employee", text: "Thank you! Will do going forward.", time: "Jan 30, 2024 · 3:02 PM" },
];

const DetailsPage = ({ expense, onBack, onEdit }) => {
  const [newComment, setNewComment] = useState("");

  return (
    <div>
      <div className="back-btn" onClick={onBack}>← Back to History</div>

      {/* Header card */}
      <div className="card mb-16" style={{ marginBottom: 16 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <div>
            <div className="text-muted text-sm" style={{ marginBottom: 4 }}>Expense ID</div>
            <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 600, color: "var(--text-1)" }}>
              {expense.id}
            </div>
          </div>
          <div className="flex gap-8 items-center">
            <StatusBadge status={expense.status} />
            {(expense.status === "draft" || expense.status === "pending") && (
              <button className="btn btn-secondary btn-sm" onClick={() => onEdit(expense)}>✎ Edit</button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text-1)" }}>
            {fmtAmount(expense.amount, expense.currency)}
          </span>
          <span className="tag">{expense.currency}</span>
          <span className="tag">{expense.category}</span>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Merchant</span>
            <span className="detail-value">{expense.merchant}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date</span>
            <span className="detail-value">{fmtDate(expense.date)}</span>
          </div>
          <div className="detail-item" style={{ gridColumn: "span 2" }}>
            <span className="detail-label">Description</span>
            <span className="detail-value">{expense.description}</span>
          </div>
        </div>

        {/* Receipt placeholder */}
        <div style={{ marginTop: 20 }}>
          <div className="detail-label" style={{ marginBottom: 8 }}>Receipt</div>
          <div style={{
            background: "var(--navy-3)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 12,
            color: "var(--text-2)", fontSize: 13
          }}>
            <span style={{ fontSize: 20 }}>📄</span>
            <span>receipt_marriott_jan29.pdf</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>⬇ Download</button>
            <button className="btn btn-ghost btn-sm">◉ Preview</button>
          </div>
        </div>
      </div>

      <div className="flex gap-16" style={{ alignItems: "flex-start" }}>
        {/* Timeline */}
        <div className="card" style={{ flex: 1 }}>
          <div className="section-title" style={{ marginBottom: 20 }}>Approval Timeline</div>
          <div className="timeline">
            {TIMELINE_EVENTS.map((evt, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-line" />
                <div className={`timeline-dot ${evt.color}`}>{evt.icon}</div>
                <div className="timeline-content">
                  <div className="timeline-action">{evt.action}</div>
                  <div className="timeline-meta">{evt.by} · {evt.time}</div>
                  {evt.note && <div className="timeline-note">{evt.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="card" style={{ width: 300, flexShrink: 0 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Comments</div>
          {COMMENTS.map((c, i) => (
            <div key={i} className="comment-box">
              <div className="comment-author">{c.author} <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 11 }}>· {c.role}</span></div>
              <div className="comment-text">{c.text}</div>
              <div className="comment-time">{c.time}</div>
            </div>
          ))}
          <textarea className="input mt-8" placeholder="Add a comment…" style={{ fontSize: 13 }}
            value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} />
          <button className="btn btn-secondary btn-sm mt-8 w-full" disabled={!newComment.trim()}>
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════ */
export default function ExpenseApp() {
  const [page, setPage] = useState("submit");
  const [expenses, setExpenses] = useState(MOCK_EXPENSES);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmitSuccess = (action, form) => {
    if (action === "submitted") {
      const newExp = {
        id: `EXP-2024-00${expenses.length + 1}`,
        amount: parseFloat(form.amount),
        currency: form.currency,
        category: form.category,
        description: form.description,
        date: form.date,
        merchant: form.merchant || "Unknown",
        status: "pending",
      };
      setExpenses(prev => [newExp, ...prev]);
      showToast("Expense submitted successfully!", "success");
    } else {
      const draft = {
        id: `EXP-2024-00${expenses.length + 1}`,
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        category: form.category || "Other",
        description: form.description || "Draft",
        date: form.date || new Date().toISOString().split("T")[0],
        merchant: form.merchant || "—",
        status: "draft",
      };
      setExpenses(prev => [draft, ...prev]);
      showToast("Saved as draft.", "info");
    }
    setEditingExpense(null);
    setPage("history");
  };

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast("Draft deleted.", "info");
  };

  const handleView = (exp) => {
    setSelectedExpense(exp);
    setPage("details");
  };

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setPage("submit");
  };

  const navItems = [
    { id: "submit", label: "New Expense", icon: "✈" },
    { id: "history", label: "My Expenses", icon: "🗂", badge: expenses.filter(e => e.status === "pending").length || null },
    { id: "details", label: "Expense Details", icon: "📋", hidden: !selectedExpense },
  ];

  const pageTitles = {
    submit: { title: editingExpense ? "Edit Expense" : "New Expense", sub: "Submit a new reimbursement request" },
    history: { title: "My Expenses", sub: "View and manage your expense history" },
    details: { title: "Expense Details", sub: selectedExpense?.id || "" },
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="app-shell">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">EX</div>
            <div className="logo-text">Expense<br /><span>Manager</span></div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Employee</div>
            {navItems.filter(n => !n.hidden).map(item => (
              <div key={item.id}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => setPage(item.id)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </div>
            ))}
          </div>

          <div className="sidebar-section" style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div className="nav-item">
              <span>⚙</span>
              <span>Settings</span>
            </div>
            <div className="nav-item">
              <span>🔔</span>
              <span>Notifications</span>
              <span className="nav-badge" style={{ background: "var(--red)", color: "#fff" }}>2</span>
            </div>
          </div>

          <div style={{ padding: "12px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="avatar">SM</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Sarah Mitchell</div>
                <div style={{ fontSize: 11, color: "var(--text-2)" }}>Engineering</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{pageTitles[page]?.title}</div>
              <div className="topbar-subtitle">{pageTitles[page]?.sub}</div>
            </div>
            <div className="topbar-actions">
              {page !== "submit" && (
                <button className="btn btn-primary btn-sm" onClick={() => { setEditingExpense(null); setPage("submit"); }}>
                  + New Expense
                </button>
              )}
              <div className="avatar">SM</div>
            </div>
          </div>

          <div className="page-content">
            {page === "submit" && (
              <SubmissionPage
                onSuccess={handleSubmitSuccess}
                editExpense={editingExpense}
                key={editingExpense?.id || "new"}
              />
            )}
            {page === "history" && (
              <HistoryPage
                expenses={expenses}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            {page === "details" && selectedExpense && (
              <DetailsPage
                expense={selectedExpense}
                onBack={() => setPage("history")}
                onEdit={handleEdit}
              />
            )}
          </div>
        </main>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
