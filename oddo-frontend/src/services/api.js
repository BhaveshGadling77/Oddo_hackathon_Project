import axios from "axios";

// ─── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap data; on 401 clear token and redirect to login
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Something went wrong";
    return Promise.reject(new Error(msg));
  }
);

// ─── Auth API  (/api/auth) ───────────────────────────────────────────────────
export const authAPI = {
  signup:         (data)       => api.post("/auth/signup", data),
  login:          (data)       => api.post("/auth/login", data),
  getMe:          ()           => api.get("/auth/me"),
  getCountries:   ()           => api.get("/auth/countries"),
  // Redirect to Google OAuth — not an axios call
  googleLogin:    ()           => { window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`; },
};

// ─── User API  (/api/users) ──────────────────────────────────────────────────
export const userAPI = {
  // GET /api/users           — admin / manager
  listUsers:  (params = {}) => api.get("/users", { params }),
  // POST /api/users          — admin only
  createUser: (data)        => api.post("/users", data),
  // GET /api/users/managers
  getManagers:()            => api.get("/users/managers"),
  // GET /api/users/:id
  getUser:    (id)          => api.get(`/users/${id}`),
  // PUT /api/users/:id
  updateUser: (id, data)    => api.put(`/users/${id}`, data),
};

// ─── Expense API  (/api/expenses) ────────────────────────────────────────────
export const expenseAPI = {
  // GET /api/expenses/stats
  getStats:       ()            => api.get("/expenses/stats"),
  // POST /api/expenses  (multipart — FormData)
  createExpense:  (formData)    => api.post("/expenses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  // GET /api/expenses?status=&category=&page=&startDate=&endDate=&submittedBy=
  listExpenses:   (params = {}) => api.get("/expenses", { params }),
  // GET /api/expenses/:id
  getExpense:     (id)          => api.get(`/expenses/${id}`),
  // PUT /api/expenses/:id  (multipart — FormData or JSON)
  updateExpense:  (id, data)    => api.put(`/expenses/${id}`, data, {
    headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
  }),
  // POST /api/expenses/:id/comments
  addComment:     (id, text)    => api.post(`/expenses/${id}/comments`, { text }),
};

// ─── Approval API  (/api/approvals) ──────────────────────────────────────────
export const approvalAPI = {
  // GET /api/approvals/pending
  getPendingApprovals: ()                    => api.get("/approvals/pending"),
  // POST /api/approvals/:id/approve
  approve:             (id, comment = "")    => api.post(`/approvals/${id}/approve`, { comment }),
  // POST /api/approvals/:id/reject
  reject:              (id, comment)         => api.post(`/approvals/${id}/reject`, { comment }),
  // GET /api/approvals/timeline/:expenseId
  getTimeline:         (expenseId)           => api.get(`/approvals/timeline/${expenseId}`),
  // POST /api/approvals/override/:expenseId  — admin only
  adminOverride:       (expenseId, status, comment) =>
    api.post(`/approvals/override/${expenseId}`, { status, comment }),
};

// ─── Workflow API  (/api/approval-flows) ─────────────────────────────────────
export const workflowAPI = {
  // GET /api/approval-flows
  listFlows:   ()         => api.get("/approval-flows"),
  // POST /api/approval-flows
  createFlow:  (data)     => api.post("/approval-flows", data),
  // PUT /api/approval-flows/:id
  updateFlow:  (id, data) => api.put(`/approval-flows/${id}`, data),
};

export default api;
