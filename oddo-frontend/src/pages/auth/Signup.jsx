import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";

export default function SignupPage({ onSwitch, toast }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", password: "", companyName: "", country: "",
  });
  const [countries, setCountries] = useState([]);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    authAPI.getCountries()
      .then((d) => setCountries(d.countries || d || []))
      .catch(() => {});
  }, []);

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name)                    e.name        = "Required";
    if (!form.email)                   e.email       = "Required";
    if (form.password.length < 8)      e.password    = "Min 8 characters";
    if (!form.companyName)             e.companyName = "Required";
    if (!form.country)                 e.country     = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handle = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form);
      toast?.success("Account created!");
    } catch (err) {
      toast?.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const FALLBACK_COUNTRIES = ["India","USA","UK","Germany","Australia","Canada","Singapore","UAE"];

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-logo">
          <div className="sb-mark" style={{ width: 40, height: 40, fontSize: 15 }}>EX</div>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20 }}>
            ODDO <span style={{ color: "var(--amber)" }}>Expenses</span>
          </span>
        </div>
        <div className="auth-title">Create your account</div>
        <div className="auth-sub">Set up your company expense portal</div>

        <button
          className="google-btn mb12"
          onClick={() => {
            window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`;
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or register with email</span></div>

        <form onSubmit={handle}>
          <div className="form-grid" style={{ gap: 14, marginBottom: 14 }}>
            <div className="fg">
              <label>Full name *</label>
              <input
                className={`inp ${errors.name ? "err" : ""}`}
                placeholder="Sarah Mitchell"
                value={form.name}
                onChange={(e) => up("name", e.target.value)}
              />
              {errors.name && <span className="err-msg">{errors.name}</span>}
            </div>
            <div className="fg">
              <label>Email *</label>
              <input
                className={`inp ${errors.email ? "err" : ""}`}
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => up("email", e.target.value)}
              />
              {errors.email && <span className="err-msg">{errors.email}</span>}
            </div>
            <div className="fg">
              <label>Company name *</label>
              <input
                className={`inp ${errors.companyName ? "err" : ""}`}
                placeholder="Acme Corp"
                value={form.companyName}
                onChange={(e) => up("companyName", e.target.value)}
              />
              {errors.companyName && <span className="err-msg">{errors.companyName}</span>}
            </div>
            <div className="fg">
              <label>Country *</label>
              <select
                className={`inp ${errors.country ? "err" : ""}`}
                value={form.country}
                onChange={(e) => up("country", e.target.value)}
              >
                <option value="">Select country…</option>
                {(countries.length ? countries : FALLBACK_COUNTRIES).map((c) => (
                  <option key={c.code || c} value={c.code || c}>{c.name || c}</option>
                ))}
              </select>
              {errors.country && <span className="err-msg">{errors.country}</span>}
            </div>
            <div className="fg span2">
              <label>Password * (min 8 chars)</label>
              <input
                className={`inp ${errors.password ? "err" : ""}`}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => up("password", e.target.value)}
              />
              {errors.password && <span className="err-msg">{errors.password}</span>}
            </div>
          </div>
          <button className="btn btn-primary w100" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <a onClick={onSwitch} style={{ cursor: "pointer" }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
