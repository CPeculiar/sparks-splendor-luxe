export interface AuthUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: "super_admin" | "admin" | "customer";
  profile_image?: string | null;
}

const TOKEN_KEY = "ss-auth-token";
const REFRESH_TOKEN_KEY = "ss-refresh-token";
const USER_KEY = "ss-auth-user";
const TOKEN_EXPIRY_KEY = "ss-token-expiry";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function saveToken(token: string, expiresIn: string = "15m") {
  localStorage.setItem(TOKEN_KEY, token);
  const expiryTime = Date.now() + parseExpiry(expiresIn);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

function saveRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

function parseExpiry(expiresIn: string): number {
  const match = expiresIn.match(/(\d+)([smhd])/);
  if (!match) return 15 * 60 * 1000;
  const [, value, unit] = match;
  const num = parseInt(value);
  switch (unit) {
    case "s": return num * 1000;
    case "m": return num * 60 * 1000;
    case "h": return num * 60 * 60 * 1000;
    case "d": return num * 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000;
  }
}

function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function isTokenExpiringSoon(): boolean {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  const expiryTime = parseInt(expiry);
  const timeUntilExpiry = expiryTime - Date.now();
  return timeUntilExpiry < 60000; // also catches already-expired (negative value)
}

let _refreshPromise: Promise<boolean> | null = null;

export async function ensureTokenValid(): Promise<void> {
  if (!isTokenExpiringSoon()) return;
  const refreshToken = getRefreshToken();
  if (!refreshToken) return; // let the 401 retry handle it

  // Deduplicate concurrent refresh calls
  if (!_refreshPromise) {
    _refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const data = await response.json();
        if (!response.ok) return false;
        saveToken(data.token, "15m");
        if (data.refreshToken) saveRefreshToken(data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        _refreshPromise = null;
      }
    })();
  }
  await _refreshPromise;
}

export function getCurrentUser(): AuthUser | null {
  const value = localStorage.getItem(USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  // Notify same-tab listeners (storage event only fires cross-tab natively)
  window.dispatchEvent(new Event("storage"));
}

export async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  return fetchJson<T>(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

async function fetchJson<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  await ensureTokenValid();
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // If 401/403 and we haven't retried yet, force-refresh the token and retry once
  if ((response.status === 401 || response.status === 403) && !isRetry) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && refreshData.token) {
          saveToken(refreshData.token, "15m");
          if (refreshData.refreshToken) saveRefreshToken(refreshData.refreshToken);
          return fetchJson<T>(path, options, true);
        }
      } catch {}
    }
    // Refresh failed — clear auth and notify
    clearAuth();
    throw new Error("Session expired. Please sign in again.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }
  return data as T;
}

export async function login(email: string, password: string) {
  const data = await fetchJson<{ token: string; refreshToken: string; user: AuthUser; message: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
  saveToken(data.token);
  saveRefreshToken(data.refreshToken);
  saveUser(data.user);
  return data.user;
}

export async function register(
  email: string,
  password: string,
  first_name?: string,
  last_name?: string,
  phone?: string,
) {
  const data = await fetchJson<{
    success: boolean;
    requiresVerification?: boolean;
    email?: string;
    message?: string;
    token?: string;
    user?: AuthUser;
  }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password, first_name, last_name, phone }),
    },
  );

  if (data.requiresVerification) {
    return { requiresVerification: true, email: data.email || email };
  }

  if (data.token && data.user) {
    saveToken(data.token);
    saveUser(data.user);
    return data.user;
  }

  throw new Error("Registration failed: no token or verification required");
}

export async function googleLogin(id_token: string) {
  const data = await fetchJson<{ token: string; refreshToken: string; user: AuthUser }>(
    "/api/auth/google",
    {
      method: "POST",
      body: JSON.stringify({ id_token }),
    },
  );
  saveToken(data.token);
  saveRefreshToken(data.refreshToken);
  saveUser(data.user);
  return data.user;
}

export async function loadUser() {
  const data = await fetchJson<{ user: AuthUser }>("/api/auth/me");
  saveUser(data.user);
  return data.user;
}

export interface UserOrder {
  id: string;
  order_number: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  items?: any[];
  payments?: any[];
}

export interface UserAddress {
  id: string;
  user_id: string;
  type: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserOrders() {
  const data = await fetchJson<{ data: UserOrder[] }>("/api/orders/user");
  return data.data;
}

export async function updateProfile(profile: Partial<AuthUser>) {
  const data = await fetchJson<{ user: AuthUser }>("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
  saveUser(data.user);
  return data.user;
}

export async function changePassword(current_password: string, new_password: string) {
  return fetchJson<{ message: string }>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password, new_password }),
  });
}

export async function forgotPassword(email: string) {
  return fetchJson<{ message: string; resetLink?: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, new_password: string) {
  return fetchJson<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password }),
  });
}

export async function resendVerificationEmail(email: string) {
  return fetchJson<{ success: boolean; message: string }>("/api/auth/resend-verification-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function getUserAddresses() {
  return fetchJson<{ success: boolean; data: UserAddress[] }>("/api/addresses");
}

export async function createAddress(address: Partial<UserAddress>) {
  return fetchJson<{ success: boolean; data: UserAddress }>("/api/addresses", {
    method: "POST",
    body: JSON.stringify(address),
  });
}

export async function updateAddress(addressId: string, address: Partial<UserAddress>) {
  return fetchJson<{ success: boolean; data: UserAddress }>(`/api/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(address),
  });
}

export async function deleteAddress(addressId: string) {
  return fetchJson<{ success: boolean; message: string }>(`/api/addresses/${addressId}`, {
    method: "DELETE",
  });
}

export async function getAnalyticsMetrics() {
  return fetchJson<any>("/api/analytics/metrics");
}

export async function getAnalyticsSales(days: number = 30) {
  return fetchJson<any>(`/api/analytics/sales?days=${days}`);
}

export async function getAnalyticsTopProducts(days: number = 30) {
  return fetchJson<any>(`/api/analytics/top-products?days=${days}`);
}

export async function getAnalyticsOrderStatus(days: number = 30) {
  return fetchJson<any>(`/api/analytics/order-status?days=${days}`);
}

export async function getAnalyticsPaymentStatus(days: number = 30) {
  return fetchJson<any>(`/api/analytics/payment-status?days=${days}`);
}

export async function getHeroSlides() {
  return fetchJson<any>("/api/hero-slides");
}

export async function getAdminHeroSlides() {
  return fetchJson<any>("/api/hero-slides/admin/all");
}

export async function createHeroSlide(slide: any) {
  return fetchJson<any>("/api/hero-slides", {
    method: "POST",
    body: JSON.stringify(slide),
  });
}

export async function updateHeroSlide(slideId: string, slide: any) {
  return fetchJson<any>(`/api/hero-slides/${slideId}`, {
    method: "PUT",
    body: JSON.stringify(slide),
  });
}

export async function deleteHeroSlide(slideId: string) {
  return fetchJson<any>(`/api/hero-slides/${slideId}`, {
    method: "DELETE",
  });
}

export async function reorderHeroSlides(slides: any[]) {
  return fetchJson<any>("/api/hero-slides/reorder", {
    method: "POST",
    body: JSON.stringify({ slides }),
  });
}

export async function exportOrdersCSV(startDate?: string, endDate?: string) {
  const token = getAuthToken();
  let url = "/api/reports/orders/csv";
  const params = new URLSearchParams();
  if (startDate) params.append("start", startDate);
  if (endDate) params.append("end", endDate);
  if (params.toString()) url += "?" + params.toString();

  const response = await fetch(`${API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Export failed");
  return response.blob();
}

export async function exportAnalyticsCSV(days: number = 30) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/reports/analytics/csv?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Export failed");
  return response.blob();
}

export async function exportProductsCSV() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/reports/products/csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Export failed");
  return response.blob();
}

export async function exportCustomersCSV() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/reports/customers/csv`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Export failed");
  return response.blob();
}

export async function getSettings() {
  return fetchJson<any>("/api/settings");
}

export async function updateSetting(key: string, value: any) {
  return fetchJson<any>(`/api/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}

export async function getInventoryHistory(productId?: string) {
  const url = productId ? `/api/inventory/product/${productId}` : "/api/inventory";
  return fetchJson<any>(url);
}

export async function adjustInventory(productId: string, quantityChange: number, reason: string, notes?: string) {
  return fetchJson<any>("/api/inventory/adjust", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity_change: quantityChange, reason, notes }),
  });
}

export async function importProducts(csv: string) {
  return fetchJson<any>("/api/import/products", {
    method: "POST",
    body: JSON.stringify({ csv }),
  });
}

export async function importCustomers(csv: string) {
  return fetchJson<any>("/api/import/customers", {
    method: "POST",
    body: JSON.stringify({ csv }),
  });
}

export function logout() {
  clearAuth();
}
