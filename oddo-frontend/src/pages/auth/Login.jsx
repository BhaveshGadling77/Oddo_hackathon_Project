import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage({ onSwitch, onGoogleToken, toast }) {
  const { login } = useAuth();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Required";
    if (!form.password) e.password = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handle = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      toast?.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="sb-mark" style={{ width: 40, height: 40, fontSize: 15 }}>EX</div>
          <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20 }}>
            ODDO <span style={{ color: "var(--amber)" }}>Expenses</span>
          </span>
        </div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to your expense portal</div>

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

        <div className="auth-divider"><span>or sign in with email</span></div>

        <form onSubmit={handle}>
          <div className="flex fc gap12">
            <div className="fg">
              <label>Email address</label>
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
              <label>Password</label>
              <input
                className={`inp ${errors.password ? "err" : ""}`}
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => up("password", e.target.value)}
              />
              {errors.password && <span className="err-msg">{errors.password}</span>}
            </div>
            <button className="btn btn-primary w100 mt8" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <a onClick={onSwitch} style={{ cursor: "pointer" }}>Sign up</a>
        </div>
      </div>
    </div>
  );
}
