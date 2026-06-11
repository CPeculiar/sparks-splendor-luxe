import { getAuthToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function call<T = any>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || "Request failed");
  return data;
}

// ── Stats ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  recent_orders: AdminOrder[];
  low_stock_products: { id: string; name: string; quantity_in_stock: number; price: number }[];
}

export const fetchStats = async () => {
  const r = await call<{ data: AdminStats }>("GET", "/api/admin/dashboard/stats");
  return r.data;
};

// ── Orders ───────────────────────────────────────────────────────────────────
export interface AdminOrder {
  id: string;
  order_number: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  subtotal: number;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export const fetchOrders = async (params?: { status?: string; search?: string }) => {
  const qs = new URLSearchParams(params as any).toString();
  const r = await call<{ data: AdminOrder[] }>("GET", `/api/admin/orders${qs ? `?${qs}` : ""}`);
  return r.data;
};

export const updateOrderStatus = async (id: string, order_status: string) => {
  const r = await call<{ data: AdminOrder }>("PUT", `/api/admin/orders/${id}/status`, { order_status });
  return r.data;
};

// ── Customers / Users ────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: "customer" | "admin" | "super_admin";
  status: "active" | "inactive" | "suspended" | "blocked";
  profile_image: string | null;
  created_at: string;
}

export const fetchUsers = async (params?: { search?: string }) => {
  const qs = new URLSearchParams(params as any).toString();
  const r = await call<{ data: AdminUser[]; total: number }>("GET", `/api/admin/users${qs ? `?${qs}` : ""}`);
  return r;
};

export const updateUserStatus = async (id: string, status: string) => {
  const r = await call<{ data: AdminUser }>("PUT", `/api/admin/users/${id}/status`, { status });
  return r.data;
};

export const updateUserRole = async (id: string, role: string) => {
  const r = await call<{ data: AdminUser }>("PUT", `/api/admin/users/${id}/role`, { role });
  return r.data;
};

export const deleteUser = async (id: string) => {
  await call("DELETE", `/api/admin/users/${id}`);
};

export const createAdminUser = async (data: { email: string; password: string; first_name?: string; last_name?: string }) => {
  const r = await call<{ data: AdminUser }>("POST", "/api/admin/users/admin", data);
  return r.data;
};

// ── Products ─────────────────────────────────────────────────────────────────
export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  category_slug?: string;
  description: string | null;
  price: number;
  currency: string;
  quantity_in_stock: number;
  main_image_url: string | null;
  badge: string | null;
  fabric: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
}

export const fetchAdminProducts = async () => {
  const r = await call<{ data: AdminProduct[] }>("GET", "/api/products");
  return r.data;
};

export const createProduct = async (product: Partial<AdminProduct> & { colors?: string[]; sizes?: string[] }) => {
  const r = await call<{ data: AdminProduct }>("POST", "/api/products", product);
  return r.data;
};

export const updateProduct = async (id: string, patch: Partial<AdminProduct> & { colors?: string[]; sizes?: string[] }) => {
  const r = await call<{ data: AdminProduct }>("PUT", `/api/products/${id}`, patch);
  return r.data;
};

export const deleteProduct = async (id: string) => {
  await call("DELETE", `/api/products/${id}`);
};

// ── Transactions ─────────────────────────────────────────────────────────────
export interface AdminTransaction {
  id: string;
  reference: string;
  amount: number;
  status: string;
  transaction_type: string;
  description: string | null;
  user_email: string | null;
  created_at: string;
}

export const fetchTransactions = async () => {
  const r = await call<{ data: AdminTransaction[] }>("GET", "/api/admin/transactions");
  return r.data;
};
