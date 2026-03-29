import { useState, useEffect } from "react";
import { userAPI } from "../../services/api";
import { initials } from "../../utils/formatCurrency";

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const RoleBadge = ({ role }) => (
  <span className={`badge badge-${role}`}>
    <span className="bd" />{role?.charAt(0).toUpperCase() + role?.slice(1)}
  </span>
);

export default function Users({ toast }) {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form,     setForm]     = useState({ name: "", email: "", password: "", role: "employee" });
  const [search,   setSearch]   = useState("");
  const [saving,   setSaving]   = useState(false);

  const load = async (params = {}) => {
    setLoading(true);
    try {
      const data = await userAPI.listUsers(params);
      setUsers(data.users || data || []);
    } catch { toast?.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: "", email: "", password: "", role: "employee" });
    setModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.email) { toast?.error("Name and email required"); return; }
    setSaving(true);
    try {
      if (editUser) {
        const payload = { name: form.name, role: form.role };
        if (form.password) payload.password = form.password;
        await userAPI.updateUser(editUser._id || editUser.id, payload);
        toast?.success("User updated");
      } else {
        if (form.password.length < 8) { toast?.error("Password min 8 chars"); setSaving(false); return; }
        await userAPI.createUser(form);
        toast?.success("User created");
      }
      setModal(false);
      load();
    } catch (err) {
      toast?.error(err.message || "Save failed");
    } finally { setSaving(false); }
  };

  const visible = users.filter((u) =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {["admin", "manager", "employee"].map((role) => ({
          label: role.charAt(0).toUpperCase() + role.slice(1) + "s",
          val: users.filter((u) => u.role === role).length,
        })).concat([{ label: "Total Users", val: users.length }]).map((s) => (
          <div key={s.label} className="stat">
            <div className="stat-label">{s.label}</div>
            <div className="stat-val">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex aic jb mb16">
          <div className="sh-title">User Management</div>
          <div className="flex gap8 aic">
            <div className="search-wrap" style={{ minWidth: 200 }}>
              <span className="search-ico">⌕</span>
              <input className="inp" placeholder="Search name or email…" value={search}
                onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={openCreate}>+ New User</button>
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
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {visible.map((u) => (
                  <tr key={u._id || u.id}>
                    <td>
                      <div className="flex aic gap10">
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials(u.name)}</div>
                        <span style={{ fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td>
                      <span className={`badge ${u.isActive !== false ? "badge-approved" : "badge-rejected"}`}>
                        <span className="bd" />{u.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(u)}>✎</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <div className="empty-ico">👥</div>
            <div className="empty-title">No users found</div>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editUser ? "Edit User" : "Create User"}>
        <div className="flex fc gap12">
          <div className="fg">
            <label>Full Name *</label>
            <input className="inp" placeholder="Sarah Mitchell" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="fg">
            <label>Email *</label>
            <input className="inp" type="email" placeholder="user@company.com" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={!!editUser} />
          </div>
          <div className="fg">
            <label>Role *</label>
            <select className="inp" value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {["admin", "manager", "employee"].map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label>{editUser ? "New Password (leave blank to keep)" : "Password * (min 8 chars)"}</label>
            <input className="inp" type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="flex gap8 je mt8">
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
