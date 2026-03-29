import { useState, useRef } from "react";
import { expenseAPI } from "../../services/api";

const CATEGORIES = ["Travel", "Meals", "Hotels", "Software", "Office Supplies", "Marketing", "Training", "Other"];
const CURRENCIES  = ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "SGD"];

export default function SubmitExpense({ editExpense, onDone, toast }) {
  const fileRef = useRef();
  const [form, setForm] = useState({
    amount:       editExpense?.amount       || "",
    currency:     editExpense?.currency     || "USD",
    category:     editExpense?.category     || "",
    expense_date: editExpense?.expense_date?.slice(0, 10) || "",
    description:  editExpense?.description  || "",
    merchant:     editExpense?.merchant     || "",
  });
  const [file,    setFile]    = useState(null);
  const [drag,    setDrag]    = useState(false);
  const [ocr,     setOcr]     = useState(null); // null | "scanning" | "done"
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount = "Must be > 0";
    if (!form.currency)     e.currency     = "Required";
    if (!form.category)     e.category     = "Required";
    if (!form.expense_date) e.expense_date = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setOcr("scanning");
    // Simulate OCR — replace with real POST /api/receipts/ocr when available
    setTimeout(() => {
      up("amount",       "247.80");
      up("expense_date", new Date().toISOString().slice(0, 10));
      up("merchant",     "Marriott Bonvoy");
      up("description",  "Hotel accommodation – business travel");
      setOcr("done");
    }, 2000);
  };

  const handleSubmit = async (isDraft) => {
    if (!isDraft && !validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (isDraft) fd.set("status", "draft");
      if (file) fd.append("receipt", file);

      if (editExpense) {
        await expenseAPI.updateExpense(editExpense._id || editExpense.id, fd);
        toast?.success("Expense updated!");
      } else {
        await expenseAPI.createExpense(fd);
        toast?.success(isDraft ? "Saved as draft." : "Expense submitted!");
      }
      onDone?.();
    } catch (err) {
      toast?.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      {/* Receipt upload / OCR */}
      <div className="card mb16">
        <div className="flex aic jb mb16">
          <div>
            <div className="sh-title">📄 Receipt Upload</div>
            <div className="text-sm text-muted mt4">OCR auto-fills form fields</div>
          </div>
          {ocr === "done" && (
            <span className="badge badge-approved"><span className="bd" />OCR Complete</span>
          )}
        </div>

        {!file ? (
          <div
            className={`upload-zone ${drag ? "drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="upload-inp"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <span className="upload-icon">📸</span>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Drop receipt or click to upload</div>
            <div className="text-sm text-muted">JPG, PNG, PDF — max 10 MB</div>
            <div className="text-sm text-amber mt8">✦ AI OCR auto-fills your form</div>
          </div>
        ) : (
          <div className="flex gap16 aic">
            <div style={{ width: 100, minHeight: 120, background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: "var(--rs)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, textAlign: "center", fontSize: 12, color: "var(--t2)", flexShrink: 0 }}>
              {ocr === "scanning"
                ? <><span style={{ fontSize: 24 }}>⊡</span><span>Scanning…</span></>
                : <><span style={{ fontSize: 24 }}>📄</span><span style={{ wordBreak: "break-all" }}>{file.name}</span></>
              }
            </div>

            {ocr === "done" && (
              <div className="f1">
                <div className="text-sm text-muted mb8">✦ Extracted — review below</div>
                {[["Amount", `$${form.amount}`], ["Date", form.expense_date], ["Merchant", form.merchant], ["Description", form.description]].map(([l, v]) => (
                  <div key={l} className="flex aic gap12" style={{ background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: "var(--rs)", padding: "8px 12px", marginBottom: 6 }}>
                    <span style={{ width: 80, fontSize: 12, color: "var(--t2)", flexShrink: 0 }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{v || "—"}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, background: "var(--gglow)", color: "var(--green)", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>✓ OCR</span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm mt8" onClick={() => { setFile(null); setOcr(null); }}>✕ Remove</button>
              </div>
            )}

            {ocr === "scanning" && (
              <div className="f1 flex fc gap8">
                {[90, 65, 75, 50].map((w, i) => (
                  <div key={i} className="shimmer" style={{ height: 14, width: `${w}%` }} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="card">
        <div className="flex aic jb mb16">
          <div className="sh-title">{editExpense ? "Edit Expense" : "Expense Details"}</div>
          {editExpense && <span className="tag">Editing #{(editExpense._id || editExpense.id)?.slice(-6)}</span>}
        </div>

        <div className="form-grid">
          <div className="fg">
            <label>Amount *</label>
            <div className="inp-wrap">
              <span className="inp-pre">$</span>
              <input className={`inp ${errors.amount ? "err" : ""}`} type="number" step="0.01" min="0" placeholder="0.00"
                value={form.amount} onChange={(e) => up("amount", e.target.value)} />
            </div>
            {errors.amount && <span className="err-msg">{errors.amount}</span>}
          </div>

          <div className="fg">
            <label>Currency *</label>
            <select className="inp" value={form.currency} onChange={(e) => up("currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="fg">
            <label>Category *</label>
            <select className={`inp ${errors.category ? "err" : ""}`} value={form.category}
              onChange={(e) => up("category", e.target.value)}>
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {errors.category && <span className="err-msg">{errors.category}</span>}
          </div>

          <div className="fg">
            <label>Expense Date *</label>
            <input className={`inp ${errors.expense_date ? "err" : ""}`} type="date"
              value={form.expense_date} onChange={(e) => up("expense_date", e.target.value)} />
            {errors.expense_date && <span className="err-msg">{errors.expense_date}</span>}
          </div>

          <div className="fg span2">
            <label>Merchant / Vendor</label>
            <input className="inp" placeholder="e.g. Delta Airlines" value={form.merchant}
              onChange={(e) => up("merchant", e.target.value)} />
          </div>

          <div className="fg span2">
            <label>Description</label>
            <textarea className="inp" placeholder="Business purpose of this expense…"
              value={form.description} onChange={(e) => up("description", e.target.value)} />
          </div>
        </div>

        <hr className="divider" />
        <div className="flex aic jb">
          <div className="flex gap8">
            <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={loading}>
              ✈ {editExpense ? "Save Changes" : "Submit Expense"}
            </button>
            {!editExpense && (
              <button className="btn btn-secondary" onClick={() => handleSubmit(true)} disabled={loading}>
                📝 Save Draft
              </button>
            )}
            {onDone && (
              <button className="btn btn-ghost" onClick={onDone}>Cancel</button>
            )}
          </div>
          <div className="text-sm text-muted">* Required fields</div>
        </div>
      </div>
    </div>
  );
}
