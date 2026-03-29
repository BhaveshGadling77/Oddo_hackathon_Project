import { useState, useEffect } from "react";
import { workflowAPI, userAPI } from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="modal-hd">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function WorkflowBuilder({ toast }) {
  const [flows,    setFlows]    = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editFlow, setEditFlow] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({
    name: "",
    steps: [{ role: "manager", order: 1 }],
    conditions: { minAmount: "", maxAmount: "", categories: [] },
  });

  const load = async () => {
    setLoading(true);
    try {
      const [fd, md] = await Promise.all([workflowAPI.listFlows(), userAPI.getManagers()]);
      setFlows(fd.flows || fd || []);
      setManagers(md.managers || md || []);
    } catch { toast?.error("Failed to load workflows"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditFlow(null);
    setForm({ name: "", steps: [{ role: "manager", order: 1 }], conditions: { minAmount: "", maxAmount: "", categories: [] } });
    setModal(true);
  };

  const openEdit = (flow) => {
    setEditFlow(flow);
    setForm({
      name: flow.name,
      steps: flow.steps || [{ role: "manager", order: 1 }],
      conditions: flow.conditions || { minAmount: "", maxAmount: "", categories: [] },
    });
    setModal(true);
  };

  const addStep    = () => setForm((f) => ({ ...f, steps: [...f.steps, { role: "manager", order: f.steps.length + 1 }] }));
  const removeStep = (i) => setForm((f) => ({ ...f, steps: f.steps.filter((_, idx) => idx !== i) }));
  const updateStep = (i, key, val) =>
    setForm((f) => ({ ...f, steps: f.steps.map((s, idx) => idx === i ? { ...s, [key]: val } : s) }));

  const save = async () => {
    if (!form.name)          { toast?.error("Flow name required"); return; }
    if (!form.steps.length)  { toast?.error("Add at least one step"); return; }
    setSaving(true);
    try {
      if (editFlow) {
        await workflowAPI.updateFlow(editFlow._id || editFlow.id, form);
        toast?.success("Workflow updated");
      } else {
        await workflowAPI.createFlow(form);
        toast?.success("Workflow created");
      }
      setModal(false);
      load();
    } catch (err) {
      toast?.error(err.message || "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="flex aic jb mb16">
          <div>
            <div className="sh-title">Approval Workflows</div>
            <div className="text-sm text-muted mt4">Define multi-step approval chains per policy</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ New Workflow</button>
        </div>

        {loading ? (
          <div style={{ padding: "16px 0" }}>
            {[80, 65, 75].map((w, i) => (
              <div key={i} className="shimmer" style={{ height: 80, marginBottom: 12, borderRadius: 10 }} />
            ))}
          </div>
        ) : flows.length ? flows.map((flow) => (
          <div key={flow._id || flow.id} style={{ background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: "var(--r)", padding: 18, marginBottom: 12 }}>
            <div className="flex aic jb mb12">
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{flow.name}</div>
                <div className="text-sm text-muted mt4">
                  {flow.steps?.length || 0} step{flow.steps?.length !== 1 ? "s" : ""}
                  {flow.conditions?.minAmount && ` · Min ${formatCurrency(flow.conditions.minAmount)}`}
                  {flow.conditions?.maxAmount && ` · Max ${formatCurrency(flow.conditions.maxAmount)}`}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(flow)}>✎ Edit</button>
            </div>
            <div className="flex gap8" style={{ flexWrap: "wrap" }}>
              {(flow.steps || []).map((s, i) => (
                <div key={i} className="flex aic gap6" style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: "var(--rs)", padding: "6px 12px", fontSize: 12 }}>
                  <span style={{ background: "var(--aglow)", color: "var(--amber)", border: "1px solid var(--amber)", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                    {i + 1}
                  </span>
                  <span className="text-muted">{s.role}</span>
                  {i < (flow.steps?.length - 1) && <span style={{ color: "var(--t3)", marginLeft: 4 }}>→</span>}
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="empty">
            <div className="empty-ico">⚙</div>
            <div className="empty-title">No workflows yet</div>
            <div className="text-muted text-sm">Create your first approval workflow</div>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editFlow ? "Edit Workflow" : "New Workflow"}>
        <div className="flex fc gap14">
          <div className="fg">
            <label>Workflow Name *</label>
            <input className="inp" placeholder="e.g. Standard Employee Flow" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>

          <div>
            <div className="flex aic jb mb8">
              <label>Approval Steps *</label>
              <button className="btn btn-ghost btn-sm" onClick={addStep}>+ Add Step</button>
            </div>
            {form.steps.map((step, i) => (
              <div key={i} className="step-row">
                <div className="step-num">{i + 1}</div>
                <select className="inp" style={{ flex: 1 }} value={step.role}
                  onChange={(e) => updateStep(i, "role", e.target.value)}>
                  {["admin", "manager", "finance"].map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
                {form.steps.length > 1 && (
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeStep(i)}
                    style={{ color: "var(--red)", flexShrink: 0 }}>✕</button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8 }}>Conditions (optional)</label>
            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="fg">
                <label>Min Amount ($)</label>
                <input className="inp" type="number" placeholder="0" value={form.conditions.minAmount}
                  onChange={(e) => setForm((f) => ({ ...f, conditions: { ...f.conditions, minAmount: e.target.value } }))} />
              </div>
              <div className="fg">
                <label>Max Amount ($)</label>
                <input className="inp" type="number" placeholder="∞" value={form.conditions.maxAmount}
                  onChange={(e) => setForm((f) => ({ ...f, conditions: { ...f.conditions, maxAmount: e.target.value } }))} />
              </div>
            </div>
          </div>

          <div className="flex gap8 je">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save Workflow"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
