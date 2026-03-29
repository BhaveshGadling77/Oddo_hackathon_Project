import { useQuery, useMutation } from "@tanstack/react-query";

const BASE_URL = "http://localhost:5000";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "manager" | "employee";
  department: string;
}

export interface Expense {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  receiptUrl?: string;
  status: "pending" | "approved" | "rejected";
  submittedBy: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStats {
  totalAmount: number;
  totalSubmitted: number;
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  pendingAmount: number;
  approvedAmount: number;
  byCategory: { category: string; amount: number; count: number }[];
}

export interface Workflow {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  steps: { role: string; action: string }[];
  createdAt: string;
}

export interface PaginatedExpenses {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) {
    const err: any = new Error(json?.message || "API Error");
    err.response = { data: json };
    throw err;
  }
  return json;
}

// ─── Auth Hooks ──────────────────────────────────────────────────────────────

export function useLogin(options?: any) {
  return useMutation({
    mutationFn: ({ data }: { data: { email: string; password: string } }) =>
      apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    ...options?.mutation,
  });
}

export function useRegister(options?: any) {
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    ...options?.mutation,
  });
}

export function useGetMe(options?: any) {
  return useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () =>
      apiFetch("/api/auth/me", { headers: options?.request?.headers || {} }),
    ...options?.query,
  });
}

// ─── Expense Hooks ───────────────────────────────────────────────────────────

export function useGetExpenses(params?: { limit?: number; page?: number; status?: string }, options?: any) {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.page) query.set("page", String(params.page));
  if (params?.status) query.set("status", params.status);
  const qs = query.toString() ? `?${query.toString()}` : "";

  return useQuery({
    queryKey: ["/api/expenses", params],
    queryFn: () =>
      apiFetch(`/api/expenses${qs}`, { headers: options?.request?.headers || {} }),
    ...options?.query,
  });
}

export function useGetExpenseById(id: string, options?: any) {
  return useQuery({
    queryKey: ["/api/expenses", id],
    queryFn: () =>
      apiFetch(`/api/expenses/${id}`, { headers: options?.request?.headers || {} }),
    enabled: !!id,
    ...options?.query,
  });
}

export function useCreateExpense(options?: any) {
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      apiFetch("/api/expenses", {
        method: "POST",
        body: JSON.stringify(data),
        headers: options?.request?.headers || {},
      }),
    ...options?.mutation,
  });
}

export function useGetExpenseStats(options?: any) {
  return useQuery({
    queryKey: ["/api/expenses/stats"],
    queryFn: () =>
      apiFetch("/api/expenses/stats", { headers: options?.request?.headers || {} }),
    ...options?.query,
  });
}

// ─── User Hooks ──────────────────────────────────────────────────────────────

export function useGetUsers(options?: any) {
  return useQuery({
    queryKey: ["/api/users"],
    queryFn: () =>
      apiFetch("/api/users", { headers: options?.request?.headers || {} }),
    ...options?.query,
  });
}

export function useUpdateUser(options?: any) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiFetch(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: options?.request?.headers || {},
      }),
    ...options?.mutation,
  });
}

export function useDeleteUser(options?: any) {
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiFetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: options?.request?.headers || {},
      }),
    ...options?.mutation,
  });
}

// ─── Approval Hooks ──────────────────────────────────────────────────────────

export function useGetApprovals(options?: any) {
  return useQuery({
    queryKey: ["/api/expenses/pending"],
    queryFn: () =>
      apiFetch("/api/expenses?status=pending", { headers: options?.request?.headers || {} }),
    ...options?.query,
  });
}

export function useApproveExpense(options?: any) {
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiFetch(`/api/expenses/${id}/approve`, {
        method: "POST",
        headers: options?.request?.headers || {},
      }),
    ...options?.mutation,
  });
}

export function useRejectExpense(options?: any) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { reason?: string } }) =>
      apiFetch(`/api/expenses/${id}/reject`, {
        method: "POST",
        body: JSON.stringify(data || {}),
        headers: options?.request?.headers || {},
      }),
    ...options?.mutation,
  });
}

// ─── Workflow Hooks ──────────────────────────────────────────────────────────

export function useGetWorkflows(options?: any) {
  return useQuery({
    queryKey: ["/api/workflows"],
    queryFn: () =>
      apiFetch("/api/workflows", { headers: options?.request?.headers || {} }),
    ...options?.query,
  });
}

export function useGetWorkflowById(id: string, options?: any) {
  return useQuery({
    queryKey: ["/api/workflows", id],
    queryFn: () =>
      apiFetch(`/api/workflows/${id}`, { headers: options?.request?.headers || {} }),
    enabled: !!id,
    ...options?.query,
  });
}

export function useCreateWorkflow(options?: any) {
  return useMutation({
    mutationFn: ({ data }: { data: any }) =>
      apiFetch("/api/workflows", {
        method: "POST",
        body: JSON.stringify(data),
        headers: options?.request?.headers || {},
      }),
    ...options?.mutation,
  });
}

export function useUpdateWorkflow(options?: any) {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiFetch(`/api/workflows/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: options?.request?.headers || {},
      }),
    ...options?.mutation,
  });
}

export function useDeleteWorkflow(options?: any) {
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiFetch(`/api/workflows/${id}`, {
        method: "DELETE",
        headers: options?.request?.headers || {},
      }),
    ...options?.mutation,
  });
}
