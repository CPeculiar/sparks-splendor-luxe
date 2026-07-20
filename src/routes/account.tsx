import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Eye, EyeOff, Camera } from "lucide-react";
import {
  getCurrentUser,
  getUserOrders,
  isAuthenticated,
  login,
  logout,
  register,
  loadUser,
  updateProfile,
  googleLogin,
  forgotPassword,
  resetPassword,
  AuthUser,
  UserOrder,
} from "@/lib/auth";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@/lib/cloudinary";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function loadGoogleScript(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("ssr"));
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[data-google="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google script failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.dataset.google = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed to load"));
    document.head.appendChild(script);
  });
}

function AccountPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "reset">("signin");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const [gsiError, setGsiError] = useState<string | null>(null);
  const googleCallbackRef = useRef<((response: any) => Promise<void>) | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const fmt = (value: string | number) => `₦${Number(value).toLocaleString("en-NG")}`;

  const loadOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await getUserOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : "Unable to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (search.reset_token) {
      setMode("reset");
      setResetToken(search.reset_token as string);
    }

    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      hydrateForm(existingUser);
      void loadOrders();
      // Always re-fetch to get latest data from server (including Google profile_image)
      void loadUser().then((fresh) => { setUser(fresh); hydrateForm(fresh); }).catch(() => {});
      return;
    }

    if (isAuthenticated()) {
      void loadUser()
        .then((fetched) => {
          setUser(fetched);
          hydrateForm(fetched);
          void loadOrders();
        })
        .catch(() => {
          logout();
        });
    }
  }, [search.reset_token]);

  const renderGoogleButton = useCallback(() => {
    if (!googleBtnRef.current || !window.google?.accounts?.id || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        if (googleCallbackRef.current) void googleCallbackRef.current(response);
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      width: googleBtnRef.current.offsetWidth || 400,
    });
    setGsiReady(true);
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setGsiError("Google client ID is not configured.");
      return;
    }
    let mounted = true;
    loadGoogleScript()
      .then(() => {
        if (!mounted) return;
        setGsiError(null);
        renderGoogleButton();
      })
      .catch((err) => {
        if (!mounted) return;
        setGsiError(err instanceof Error ? err.message : "Google script failed to load.");
      });
    return () => { mounted = false; };
  }, [renderGoogleButton]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const loggedIn = await login(email, password);
      setUser(loggedIn);
      setMode("signin");
      setStatus("Signed in successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const registered = await register(email, password, firstName, lastName, phone);
      setUser(registered);
      setMode("signin");
      setStatus("Account created successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const result = await forgotPassword(email);
      setStatus(result.message || "Password reset link requested.");
      setMode("signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const result = await resetPassword(resetToken, newPassword);
      setStatus(result.message || "Password reset successfully.");
      setMode("signin");
      setPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      const updated = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        profile_image: profileImage,
      });
      setUser(updated);
      hydrateForm(updated);
      setStatus("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      form.append("folder", "sparks-splendor/avatars");
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");
      const url: string = data.secure_url;
      setProfileImage(url);
      // Save immediately
      const updated = await updateProfile({ first_name: firstName, last_name: lastName, phone, profile_image: url });
      setUser(updated);
      hydrateForm(updated);
      setStatus("Profile photo updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setStatus("Signed out successfully.");
  };

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
      completed: "bg-emerald-100 text-emerald-700",
      paid: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      processing: "bg-blue-100 text-blue-700",
      shipped: "bg-indigo-100 text-indigo-700",
      delivered: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-rose-100 text-rose-700",
      refunded: "bg-zinc-200 text-zinc-700",
      failed: "bg-rose-100 text-rose-700",
    };

    return (
      <span className={`inline-block px-2 py-1 rounded text-[10px] uppercase tracking-[0.2em] font-semibold ${map[status] ?? "bg-zinc-100 text-zinc-700"}`}>
        {status}
      </span>
    );
  }

  function hydrateForm(u: AuthUser) {
    setFirstName(u.first_name || "");
    setLastName(u.last_name || "");
    setPhone(u.phone || "");
    setEmail(u.email);
    setProfileImage(u.profile_image || "");
  }

  // Keep callback ref always up-to-date so the rendered button uses latest state
  useEffect(() => {
    googleCallbackRef.current = async (response: any) => {
      setBusy(true);
      setError(null);
      setStatus(null);
      try {
        const userData = await googleLogin(response.credential);
        setUser(userData);
        hydrateForm(userData);
        setStatus("Signed in with Google.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign in failed.");
      } finally {
        setBusy(false);
      }
    };
  });

  // Re-render Google button when switching to signin/signup mode
  useEffect(() => {
    if (mode === "signin" || mode === "signup") {
      setTimeout(() => renderGoogleButton(), 50);
    }
  }, [mode, renderGoogleButton]);

  const renderStatus = () => {
    return status ? <p className="text-sm text-success">{status}</p> : null;
  };

  const renderError = () => {
    return error ? <p className="text-sm text-destructive">{error}</p> : null;
  };

  if (user) {
    return (
      <section className="min-h-[80vh] grid lg:grid-cols-2">
        <div className="hidden lg:block relative">
          <img src="/gallery/img-40.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-onyx/40" />
          <div className="absolute bottom-12 left-12 right-12 text-cream">
            <p className="text-eyebrow text-gold">Member Profile</p>
            <h2 className="font-serif-luxe text-5xl mt-4 leading-tight">Your Sparks & Splendour Account</h2>
            <p className="mt-4 max-w-md text-cream/80">Manage your profile, password, and checkout details securely.</p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-display text-muted-foreground">
                      {firstName ? firstName[0].toUpperCase() : (email ? email[0].toUpperCase() : "?")}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 rounded-full flex items-center justify-center bg-onyx/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-5 w-5 text-cream" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }}
                  />
                </label>
              </div>
              <div className="text-center">
                <p className="text-eyebrow">Welcome back</p>
                <h1 className="font-display text-4xl mt-1">Your Profile</h1>
                <p className="text-xs text-muted-foreground mt-1">Hover photo to change</p>
              </div>
            </div>

            {renderStatus()}
            {renderError()}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-eyebrow block mb-2">Email</label>
                  <input value={email} readOnly className="w-full border border-border bg-muted px-4 py-3 text-sm text-muted-foreground" />
                </div>
                <div>
                  <label className="text-eyebrow block mb-2">First name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-eyebrow block mb-2">Last name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-eyebrow block mb-2">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <button type="submit" disabled={busy} className="w-full bg-onyx text-cream py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60">
                Save Profile
              </button>
            </form>

            <button onClick={handleLogout} className="w-full border border-border py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:border-gold transition-colors">
              Sign Out
            </button>

            <div className="mt-12">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
                <div>
                  <p className="text-eyebrow">Recent orders</p>
                  <p className="text-sm text-muted-foreground">Your confirmed payments and order status history.</p>
                </div>
                <div className="flex items-center gap-2">
                  {ordersLoading && <p className="text-xs uppercase text-muted-foreground">Loading orders…</p>}
                  <Link to="/account/orders" className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground hover:border-gold transition-colors">
                    View all orders
                  </Link>
                </div>
              </div>

              {ordersError && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{ordersError}</p>}
              {!ordersLoading && !orders.length && !ordersError && (
                <p className="text-sm text-muted-foreground">No orders yet. Your completed purchases will appear here.</p>
              )}

              {!ordersLoading && orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-border bg-secondary/10 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Order</p>
                          <p className="font-mono text-sm">{order.order_number}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Payment</p>
                            <StatusBadge status={order.payment_status} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Order</p>
                            <StatusBadge status={order.order_status} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Total</p>
                          <p className="font-medium">{fmt(order.total)}</p>
                        </div>
                      </div>
                      <div className="mt-4 border-t border-border pt-3 text-sm text-muted-foreground">
                        <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        {order.items?.length ? (
                          <div className="mt-3">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Items</p>
                            <ul className="space-y-1 text-sm">
                              {order.items.slice(0, 3).map((item, index) => (
                                <li key={index}>
                                  {item.product_name} × {item.quantity}
                                </li>
                              ))}
                              {order.items.length > 3 && (
                                <li className="text-xs text-muted-foreground">+ {order.items.length - 3} more items</li>
                              )}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <img src="/gallery/img-40.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-onyx/40" />
        <div className="absolute bottom-12 left-12 right-12 text-cream">
          <p className="text-eyebrow text-gold">Members Only</p>
          <h2 className="font-serif-luxe text-5xl mt-4 leading-tight">The Sparks Society</h2>
          <p className="mt-4 max-w-md text-cream/80">Create an account or sign in to continue shopping and checkout with your local backend credentials.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-eyebrow text-center">{mode === "signin" ? "Welcome Back" : mode === "signup" ? "Join the House" : mode === "forgot" ? "Forgot Password" : "Reset Password"}</p>
          <h1 className="font-display text-4xl md:text-5xl text-center mt-3">
            {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : mode === "forgot" ? "Reset Your Password" : "Enter New Password"}
          </h1>

          {(mode === "signin" || mode === "signup") && (
            <div className="mt-8">
              {/* Google renders its own branded button into this div */}
              <div
                ref={googleBtnRef}
                className="w-full flex justify-center"
                style={{ minHeight: 44 }}
              />
              {!gsiReady && !gsiError && (
                <div className="w-full h-11 border border-border flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeDashoffset="15" /></svg>
                  Loading Google…
                </div>
              )}
              {gsiError && <p className="mt-2 text-sm text-destructive text-center">{gsiError}</p>}
            </div>
          )}

          <div className="flex items-center gap-3 my-6">
            <span className="flex-1 h-px bg-border" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">or</span>
            <span className="flex-1 h-px bg-border" />
          </div>

          {renderStatus()}
          {renderError()}

          {mode === "reset" ? (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label className="text-eyebrow block mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={busy} className="w-full bg-onyx text-cream py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60">
                Reset Password
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={mode === "signup" ? handleRegister : mode === "forgot" ? handleForgotPassword : handleLogin}>
              {mode === "signup" && (
                <div className="grid gap-4">
                  <div>
                    <label className="text-eyebrow block mb-2">First name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-eyebrow block mb-2">Last name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-eyebrow block mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold"
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <label className="text-eyebrow block mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "signin" && (
                <div className="text-right">
                  <button type="button" onClick={() => setMode("forgot")} className="text-xs text-muted-foreground underline hover:text-foreground">
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" disabled={busy} className="w-full bg-onyx text-cream py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60">
                {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Request Reset"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signin" ? "New to Sparks & Splendour?" : mode === "signup" ? "Already a member?" : mode === "forgot" ? "Remember your password?" : "Back to sign in?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : mode === "signup" ? "signin" : mode === "forgot" ? "signin" : "signin")}
              className="text-foreground underline hover:text-gold-deep"
            >
              {mode === "signin" ? "Create an account" : mode === "signup" ? "Sign in" : mode === "forgot" ? "Sign in" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
