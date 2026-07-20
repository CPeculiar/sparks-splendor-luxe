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
const USER_KEY = "ss-auth-user";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
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
  localStorage.removeItem(USER_KEY);
}

async function fetchJson<T>(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Request failed");
  }
  return data as T;
}

export async function login(email: string, password: string) {
  const data = await fetchJson<{ token: string; user: AuthUser; message: string }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
  saveToken(data.token);
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
  const data = await fetchJson<{ token: string; user: AuthUser }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password, first_name, last_name, phone }),
    },
  );
  saveToken(data.token);
  saveUser(data.user);
  return data.user;
}

export async function googleLogin(id_token: string) {
  const data = await fetchJson<{ token: string; user: AuthUser }>(
    "/api/auth/google",
    {
      method: "POST",
      body: JSON.stringify({ id_token }),
    },
  );
  saveToken(data.token);
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

export function logout() {
  clearAuth();
}
