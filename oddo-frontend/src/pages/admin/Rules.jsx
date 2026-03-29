import { useState } from "react";

const CATEGORIES = ["Travel", "Meals", "Hotels", "Software", "Office Supplies", "Marketing", "Training", "Other"];

export default function Rules({ toast }) {
  const [rules, setRules] = useState([
    { id: 1, name: "Auto-approve small expenses", condition: "amount < 25", action: "auto_approve", active: true },
    { id: 2, name: "Receipt required above $50",  condition: "amount > 50",  action: "require_receipt", active: true },
    { id: 3, name: "Manager approval for travel",  condition: "category = Travel", action: "manager_approval", active: false },
  ]);
  const [modal, setModal]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm]     = useState({
    name: "", conditionField: "amount", conditionOp: "gt", conditionValue: "",
    action: "require_receipt", active: true,
  });

  const toggle = (id) =>
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r));

  const deleteRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast?.success("Rule deleted");
  };

  const save = async () => {
    if (!form.name || !form.conditionValue) { toast?.error("Fill all required fields"); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // replace with real API call
    const newRule = {
      id: Date.now(),
      name: form.name,
      condition: `${form.conditionField} ${form.conditionOp} ${form.conditionValue}`,
      action: form.action,
      active: form.active,
    };
    setRules((prev) => [...prev, newRule]);
    toast?.success("Rule created");
    setModal(false);
    setSaving(false);
    setForm({ name: "", conditionField: "amount", conditionOp: "gt", conditionValue: "", action: "require_receipt", active: true });
  };

  const ACTION_LABELS = {
    auto_approve:     "Auto Approve",
    require_receipt:  "Require Receipt",
    manager_approval: "Manager Approval",
    flag_for_review:  "Flag for Review",
  };

  const Toggle = ({ checked, onChange }) => (
    <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, background: checked ? "var(--amber)" : "var(--b1)", position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: checked ? 21 : 3, transition: "left .2s" }} />
    </div>
  );

  return (
    <div className="page">
      <div className="card mb16">
        <div className="flex aic jb mb20">
          <div>
            <div className="sh-title">Policy Rules</div>
            <div className="text-sm text-muted mt4">Automate expense handling based on conditions</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ New Rule</button>
        </div>

        {rules.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">📋</div>
            <div className="empty-title">No rules defined</div>
            <div className="text-muted text-sm">Create your first policy rule</div>
          </div>
        ) : (
          <div>
            {rules.map((rule, i) => (
              <div key={rule.id} style={{ background: "var(--s2)", border: `1px solid ${rule.active ? "var(--b1)" : "var(--b1)"}`, borderRadius: "var(--r)", padding: "16px 20px", marginBottom: 10, opacity: rule.active ? 1 : 0.6, transition: "opacity .2s" }}>
                <div className="flex aic jb">
                  <div className="flex aic gap12">
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--aglow)", border: "1px solid var(--amber)", color: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--t1)" }}>{rule.name}</div>
                      <div className="flex aic gap8 mt4">
                        <span className="tag" style={{ fontSize: 11 }}>IF: {rule.condition}</span>
                        <span style={{ color: "var(--t3)", fontSize: 12 }}>→</span>
                        <span className="badge badge-pending" style={{ fontSize: 11 }}>{ACTION_LABELS[rule.action] || rule.action}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex aic gap12">
                    <Toggle checked={rule.active} onChange={() => toggle(rule.id)} />
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteRule(rule.id)} style={{ color: "var(--red)" }}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="card" style={{ background: "var(--aglow)", border: "1px solid rgba(245,158,11,.2)" }}>
        <div className="flex aic gap12">
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--amber)" }}>How rules work</div>
            <div className="text-sm text-muted mt4">Rules are evaluated in order when an expense is submitted. The first matching rule takes effect. Toggle rules on/off without deleting them.</div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">New Policy Rule</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="flex fc gap12">
              <div className="fg">
                <label>Rule Name *</label>
                <input className="inp" placeholder="e.g. Require receipt above $50"
                  value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 8 }}>Condition *</label>
                <div className="flex gap8">
                  <select className="inp" value={form.conditionField}
                    onChange={(e) => setForm((f) => ({ ...f, conditionField: e.target.value }))}>
                    <option value="amount">Amount</option>
                    <option value="category">Category</option>
                  </select>
                  <select className="inp" style={{ width: 80 }} value={form.conditionOp}
                    onChange={(e) => setForm((f) => ({ ...f, conditionOp: e.target.value }))}>
                    <option value="gt">&gt;</option>
                    <option value="lt">&lt;</option>
                    <option value="eq">=</option>
                  </select>
                  {form.conditionField === "category" ? (
                    <select className="inp" value={form.conditionValue}
                      onChange={(e) => setForm((f) => ({ ...f, conditionValue: e.target.value }))}>
                      <option value="">Select…</option>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input className="inp" type="number" placeholder="e.g. 50"
                      value={form.conditionValue} onChange={(e) => setForm((f) => ({ ...f, conditionValue: e.target.value }))} />
                  )}
                </div>
              </div>
              <div className="fg">
                <label>Action *</label>
                <select className="inp" value={form.action}
                  onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}>
                  {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="flex aic gap12">
                <Toggle checked={form.active} onChange={() => setForm((f) => ({ ...f, active: !f.active }))} />
                <span className="text-sm text-muted">Enable rule immediately</span>
              </div>
              <div className="flex gap8 je mt8">
                <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Create Rule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
