import { getAuthToken, ensureTokenValid, clearAuth } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function jsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...authHeaders() };
}

async function call<T = any>(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown, retry = true): Promise<T> {
  // Always ensure token is valid before making the request
  await ensureTokenValid();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: jsonHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  
  // Handle 401/403 - force-expire token and retry once
  if ((res.status === 401 || res.status === 403) && retry) {
    const refreshToken = localStorage.getItem("ss-refresh-token");
    if (!refreshToken) {
      clearAuth();
      throw new Error("Your session has expired. Please log in again.");
    }
    // Force token expiry so ensureTokenValid will refresh
    localStorage.setItem("ss-token-expiry", "0");
    await ensureTokenValid();
    const newToken = getAuthToken();
    if (newToken) return call<T>(method, path, body, false);
    clearAuth();
    throw new Error("Your session has expired. Please log in again.");
  }
  
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

// Order edits / refunds
export const fetchOrderEdits = async (orderId: string) => {
  const r = await call<{ data: any[] }>("GET", `/api/admin/orders/${orderId}/edits`);
  return r.data;
};

export const postOrderEdit = async (orderId: string, payload: { changes?: any; note?: string }) => {
  const r = await call<{ data: any }>("POST", `/api/admin/orders/${orderId}/edits`, payload);
  return r.data;
};

export const refundOrder = async (orderId: string, payload: { amount: number; reason?: string; gateway_refund?: boolean }) => {
  const r = await call<{ message?: string }>("POST", `/api/admin/orders/${orderId}/refund`, payload);
  return r;
};

export const deleteOrder = async (orderId: string) => {
  const r = await call<{ message?: string }>("DELETE", `/api/admin/orders/${orderId}`);
  return r;
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

export interface AdminPermissionGroup {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, any>;
  is_default: boolean;
  user_count: number;
  users?: AdminUser[];
}

export const fetchPermissionGroups = async () => {
  const r = await call<{ data: AdminPermissionGroup[] }>("GET", "/api/admin/permissions");
  return r.data;
};

export const fetchPermissionGroup = async (id: string) => {
  const r = await call<{ data: AdminPermissionGroup }>("GET", `/api/admin/permissions/${id}`);
  return r.data;
};

export const assignUserPermissionGroup = async (userId: string, groupId: string) => {
  const r = await call<{ success: boolean }>("POST", "/api/admin/permissions/assign", { user_id: userId, group_id: groupId });
  return r;
};

export const unassignUserPermissionGroup = async (userId: string, groupId: string) => {
  const r = await call<{ success: boolean }>("DELETE", "/api/admin/permissions/assign", { user_id: userId, group_id: groupId });
  return r;
};

// ── Products ─────────────────────────────────────────────────────────────────
export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  category_slug?: string;
  sub_category?: string | null;
  description: string | null;
  price: number;
  price_usd?: number;
  original_price?: number | null;
  original_price_usd?: number | null;
  currency: string;
  quantity_in_stock: number;
  main_image_url: string | null;
  gallery?: string[];
  badge: string | null;
  fabric: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
}

export const fetchAdminProducts = async (params?: { category?: string; sub_category?: string; is_active?: boolean; search?: string; page?: number; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.append("category", params.category);
  if (params?.sub_category) qs.append("sub_category", params.sub_category);
  if (params?.is_active !== undefined) qs.append("is_active", String(params.is_active));
  if (params?.search) qs.append("search", params.search);
  if (params?.page !== undefined) qs.append("page", String(params.page));
  if (params?.limit !== undefined) qs.append("limit", String(params.limit));
  const r = await call<{ data: AdminProduct[]; total?: number; page?: number; totalPages?: number }>("GET", `/api/admin/products/list${qs.toString() ? `?${qs}` : ""}`);
  return r;
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

export const deleteProductsBulk = async (ids: string[]) => {
  await Promise.all(ids.map((id) => call("DELETE", `/api/products/${id}`)));
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

// ── Analytics
export const fetchCategoryAnalytics = async () => {
  const r = await call<{ data: any[] }>("GET", "/api/admin/analytics/categories");
  return r.data;
};

export const fetchTopProducts = async () => {
  const r = await call<{ data: any[] }>("GET", "/api/admin/analytics/top-products");
  return r.data;
};

export const fetchSalesReport = async (start_date?: string, end_date?: string) => {
  const qs = new URLSearchParams({ ...(start_date ? { start_date } : {}), ...(end_date ? { end_date } : {}) }).toString();
  const r = await call<{ data: any[] }>("GET", `/api/admin/reports/sales${qs ? `?${qs}` : ''}`);
  return r.data;
};

// ── Notifications (admin)
export const fetchNotifications = async (unreadOnly = false) => {
  const r = await call<{ data: any[] }>("GET", `/api/admin/notifications${unreadOnly ? '?unread_only=true' : ''}`);
  return r.data;
};

export const fetchUnreadCount = async () => {
  const r = await call<{ data: { count: number } }>("GET", "/api/admin/notifications/unread-count");
  return r.data.count;
};

export const createNotification = async (payload: { title: string; body?: string; type?: string; meta?: any }) => {
  const r = await call<{ data: any }>("POST", "/api/admin/notifications", payload);
  return r.data;
};

export const markNotificationRead = async (id: string) => {
  await call("PATCH", `/api/admin/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  await call("PATCH", `/api/admin/notifications/mark-all-read`);
};

export const archiveNotification = async (id: string) => {
  await call("PATCH", `/api/admin/notifications/${id}/archive`);
};

export const deleteNotification = async (id: string) => {
  await call("DELETE", `/api/admin/notifications/${id}`);
};

// ── FAQ
export const fetchFaqs = async () => {
  const r = await call<{ data: any[] }>("GET", "/api/admin/faqs");
  return r.data;
};

export const createFaq = async (payload: { question: string; answer: string; is_active?: boolean }) => {
  const r = await call<{ data: any }>("POST", "/api/admin/faqs", payload);
  return r.data;
};

export const updateFaq = async (id: string, payload: { question: string; answer: string; is_active?: boolean }) => {
  await call("PUT", `/api/admin/faqs/${id}`, payload);
};

export const deleteFaqClient = async (id: string) => {
  await call("DELETE", `/api/admin/faqs/${id}`);
};

// ── Reviews
export const fetchReviews = async (opts: { product_id?: string; approved?: boolean } = {}) => {
  const qs = new URLSearchParams({ ...(opts.product_id ? { product_id: opts.product_id } : {}), ...(opts.approved !== undefined ? { approved: String(opts.approved) } : {}) }).toString();
  const r = await call<{ data: any[] }>("GET", `/api/admin/reviews${qs ? `?${qs}` : ''}`);
  return r.data;
};

export const approveReview = async (id: string, approve = true) => {
  await call("PUT", `/api/admin/reviews/${id}/approve`, { approve });
};

export const deleteReview = async (id: string) => {
  await call("DELETE", `/api/admin/reviews/${id}`);
};

// ── Newsletter
export const subscribeNewsletter = async (payload: { email: string; name?: string }) => {
  const r = await call<{ data: any }>("POST", "/api/newsletter/subscribe", payload);
  return r.data;
};

export const fetchSubscribers = async () => {
  const r = await call<{ data: any[] }>("GET", "/api/admin/newsletter/subscribers");
  return r.data;
};

export const unsubscribeSubscriber = async (id: string) => {
  await call("PATCH", `/api/admin/newsletter/subscribers/${id}/unsubscribe`);
};

export const deleteSubscriber = async (id: string) => {
  await call("DELETE", `/api/admin/newsletter/subscribers/${id}`);
};

// ── Categories (admin) ───────────────────────────────────────────────────────
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
}

export const fetchCategories = async () => {
  const r = await call<{ data: AdminCategory[] }>("GET", "/api/categories/admin/all");
  return r.data;
};

export const createCategory = async (payload: { name: string; description?: string; image_url?: string }) => {
  const r = await call<{ data: AdminCategory }>("POST", "/api/categories", payload);
  return r.data;
};

export const updateCategory = async (id: string, payload: { name?: string; description?: string; image_url?: string; is_active?: boolean }) => {
  const r = await call<{ data: AdminCategory }>("PUT", `/api/categories/${id}`, payload);
  return r.data;
};

export const deleteCategory = async (id: string) => {
  await call("DELETE", `/api/categories/${id}`);
};

// ── Banners (admin)
export interface AdminBanner {
  id: string;
  title?: string | null;
  caption?: string | null;
  image_url?: string | null;
  link?: string | null;
  location?: string;
  sort_order?: number;
  is_active?: boolean;
}

export const fetchBanners = async () => {
  const r = await call<{ data: AdminBanner[] }>("GET", "/api/admin/banners");
  return r.data;
};

export const createBanner = async (payload: Partial<AdminBanner>) => {
  const r = await call<{ data: AdminBanner }>("POST", "/api/admin/banners", payload);
  return r.data;
};

export const updateBanner = async (id: string, payload: Partial<AdminBanner>) => {
  const r = await call<{ data: AdminBanner }>("PUT", `/api/admin/banners/${id}`, payload);
  return r.data;
};

export const deleteBanner = async (id: string) => {
  await call("DELETE", `/api/admin/banners/${id}`);
};

// ── Coupons (admin) ───────────────────────────────────────────────────────
export interface AdminCoupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number;
  uses: number;
  expires_at?: string | null;
  is_active: boolean;
}

export const fetchCoupons = async () => {
  const r = await call<{ data: AdminCoupon[] }>("GET", "/api/admin/coupons");
  return r.data;
};

export const createCoupon = async (payload: Partial<AdminCoupon> & { code: string }) => {
  const r = await call<{ data: AdminCoupon }>("POST", "/api/admin/coupons", payload);
  return r.data;
};

export const updateCoupon = async (id: string, payload: Partial<AdminCoupon>) => {
  const r = await call<{ data: AdminCoupon }>("PUT", `/api/admin/coupons/${id}`, payload);
  return r.data;
};

export const deleteCoupon = async (id: string) => {
  await call("DELETE", `/api/admin/coupons/${id}`);
};

// ── Inventory (admin) ───────────────────────────────────────────────────────
export const fetchAdminInventory = async (params?: { low_stock_only?: boolean }) => {
  const qs = new URLSearchParams(params as any).toString();
  const r = await call<{ data: any[] }>("GET", `/api/admin/inventory${qs ? `?${qs}` : ""}`);
  return r.data;
};

export const updateInventory = async (productId: string, quantity_in_stock: number) => {
  const r = await call<{ data: any }>("PUT", `/api/admin/inventory/${productId}`, { quantity_in_stock });
  return r.data;
};

// ── Media (admin) ───────────────────────────────────────────────────────────
export const fetchMedia = async (params?: { search?: string; limit?: number; offset?: number }) => {
  await ensureTokenValid();
  const qs = new URLSearchParams(params as any).toString();
  const url = `${API_BASE}/api/media${qs ? `?${qs}` : ""}`;
  console.log("Fetching media from:", url);
  const res = await fetch(url, { headers: { ...authHeaders() } });
  if (res.status === 401 || res.status === 403) {
    localStorage.setItem('ss-token-expiry', '0');
    await ensureTokenValid();
    const res2 = await fetch(url, { headers: { ...authHeaders() } });
    const data2 = await res2.json();
    if (!res2.ok) throw new Error(data2?.error || data2?.message || "Request failed");
    return data2.data as any[];
  }
  const data = await res.json();
  console.log("Media response:", { status: res.status, data });
  if (!res.ok) throw new Error(data?.error || data?.message || "Request failed");
  return data.data as any[];
};

export const uploadMedia = async (file: File) => {
  await ensureTokenValid();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/media/upload`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.setItem('ss-token-expiry', '0');
    await ensureTokenValid();
    const res2 = await fetch(`${API_BASE}/api/media/upload`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: form,
    });
    const data2 = await res2.json();
    if (!res2.ok) throw new Error(data2?.error || data2?.message || "Upload failed");
    return data2.data;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || "Upload failed");
  return data.data;
};

export const uploadMediaBatch = async (files: File[], onProgress?: (uploaded: number, total: number) => void) => {
  await ensureTokenValid();
  const form = new FormData();
  for (const file of files) {
    form.append("files", file);
  }
  const res = await fetch(`${API_BASE}/api/media/upload/batch`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.setItem('ss-token-expiry', '0');
    await ensureTokenValid();
    const res2 = await fetch(`${API_BASE}/api/media/upload/batch`, {
      method: "POST",
      headers: { ...authHeaders() },
      body: form,
    });
    const data2 = await res2.json();
    if (!res2.ok) throw new Error(data2?.error || data2?.message || "Batch upload failed");
    return data2.data;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || "Batch upload failed");
  return data.data;
};

export const addMediaUrl = async (payload: { url: string; file_name?: string; media_type?: string; alt_text?: string; category?: string }) => {
  const r = await call<{ data: any }>("POST", "/api/media/add-url", payload);
  return r.data;
};

export const updateMedia = async (mediaId: string, payload: { file_name?: string; alt_text?: string; category?: string }) => {
  const r = await call<{ data: any }>("PUT", `/api/media/${mediaId}`, payload);
  return r.data;
};

export const deleteMedia = async (mediaId: string) => {
  await call("DELETE", `/api/media/${mediaId}`);
};

export const syncMediaLibrary = async () => {
  const r = await call<{ 
    success: boolean; 
    message: string; 
    added: number;
    synced: number;
    orphanedCount: number;
  }>("POST", "/api/media/sync/cloudinary", {});
  return r;
};

// ── Payment config ──────────────────────────────────────────────────────────
export const fetchPaymentConfig = async () => {
  const r = await call<{ data: any }>("GET", "/api/admin/payment-config");
  return r.data;
};

export const updatePaymentConfig = async (cfg: any) => {
  const r = await call<{ data: any }>("PUT", "/api/admin/payment-config", cfg);
  return r.data;
};
