import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Eye, EyeOff, Camera, Mail } from "lucide-react";
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
  resendVerificationEmail,
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  AuthUser,
  UserOrder,
  UserAddress,
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
  const [mode, setMode] = useState<"signin" | "signup" | "verify-email" | "forgot" | "reset">("signin");
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
  const [verificationEmail, setVerificationEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    type: "shipping",
    first_name: "",
    last_name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Nigeria",
    is_default: false,
  });
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  const fmt = (value: string | number) => `?${Number(value).toLocaleString("en-NG")}`;

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

  const loadAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const data = await getUserAddresses();
      setAddresses(data.data || []);
    } catch (err) {
      setAddressesError(err instanceof Error ? err.message : "Unable to load addresses");
    } finally {
      setAddressesLoading(false);
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
      void loadAddresses();
      void loadUser().then((fresh) => { setUser(fresh); hydrateForm(fresh); }).catch(() => {});
      return;
    }

    if (isAuthenticated()) {
      void loadUser()
        .then((fetched) => {
          setUser(fetched);
          hydrateForm(fetched);
          void loadOrders();
          void loadAddresses();
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
      const result = await register(email, password, firstName, lastName, phone);
      if ('requiresVerification' in result && result.requiresVerification) {
        setVerificationEmail(result.email || email);
        setMode("verify-email");
        setStatus(null);
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setPhone("");
      } else {
        setUser(result as AuthUser);
        setMode("signin");
        setStatus("Account created successfully.");
      }
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
    setProfileToast(null);
    setProfileSaving(true);
    try {
      const updated = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        profile_image: profileImage,
      });
      setUser(updated);
      hydrateForm(updated);
      showToast("success", "Profile updated successfully.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Update failed.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) return;
    setProfileSaving(true);
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
      const updated = await updateProfile({ first_name: firstName, last_name: lastName, phone, profile_image: url });
      setUser(updated);
      hydrateForm(updated);
      showToast("success", "Profile photo updated.");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProfileSaving(false);
    }
  };

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders">("profile");

  function showToast(type: "success" | "error", msg: string) {
    setProfileToast({ type, msg });
    setTimeout(() => setProfileToast(null), 4000);
  }

  const clearFormMessages = useCallback(() => {
    setError(null);
    setStatus(null);
  }, []);

  const handleLogout = () => {
    if (window.google?.accounts?.id) {
      try { window.google.accounts.id.cancel(); } catch {}
    }
    logout();
    setUser(null);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setProfileImage("");
    setNewPassword("");
    setStatus(null);
    setError(null);
    setProfileToast(null);
    setShowAddressForm(false);
    setEditingAddressId(null);
    setGsiReady(false);
    // Replace history so back navigation can't return to the authenticated view
    window.history.replaceState(null, "", "/account");
  };

  const handleResendVerification = async () => {
    setResendError(null);
    setResendSuccess(false);
    setResendLoading(true);
    try {
      await resendVerificationEmail(verificationEmail);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setResendError(err instanceof Error ? err.message : "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSubmitting(true);
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressForm);
      } else {
        await createAddress(addressForm);
      }
      await loadAddresses();
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm({
        type: "shipping",
        first_name: "",
        last_name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Nigeria",
        is_default: false,
      });
    } catch (err) {
      setAddressesError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddressId(address.id);
    setAddressForm({
      type: address.type,
      first_name: address.first_name || "",
      last_name: address.last_name || "",
      phone: address.phone || "",
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(addressId);
      await loadAddresses();
    } catch (err) {
      setAddressesError(err instanceof Error ? err.message : "Failed to delete address.");
    }
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

  // Re-render Google button when switching to signin/signup mode or after logout
  useEffect(() => {
    if (user) return;
    if (mode === "signin" || mode === "signup") {
      // Use a short delay to ensure the ref div is mounted after user state clears
      const id = setTimeout(() => renderGoogleButton(), 80);
      return () => clearTimeout(id);
    }
  }, [mode, user, renderGoogleButton]);

  const renderStatus = () => {
    return status ? <p className="text-sm text-success">{status}</p> : null;
  };

  const renderError = () => {
    return error ? <p className="text-sm text-destructive">{error}</p> : null;
  };

  if (user) {
    return (
      <section className="min-h-[80vh] bg-background px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif-luxe text-4xl sm:text-5xl mb-2">My Account</h1>
            <p className="text-muted-foreground">Manage your profile, addresses, and orders</p>
          </div>

          {/* Profile Card Header */}
          <div className="rounded-2xl border border-border bg-onyx/95 text-cream p-6 sm:p-8 mb-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gold bg-muted flex items-center justify-center shadow-md">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-display text-cream/60">
                      {firstName ? firstName[0].toUpperCase() : (email ? email[0].toUpperCase() : "?")}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 rounded-full flex items-center justify-center bg-onyx/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-gold" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }}
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <p className="text-eyebrow text-gold uppercase tracking-[0.3em] mb-1">Welcome back</p>
                <h2 className="text-3xl font-display mb-2">{firstName && lastName ? `${firstName} ${lastName}` : email}</h2>
                <p className="text-cream/70 text-sm mb-3">{email}</p>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">Account Type</p>
                    <p className="text-sm font-semibold">{user.role === "customer" ? "Customer" : user.role === "admin" ? "Admin" : "Super Admin"}</p>
                  </div>
                  {phone && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">Phone</p>
                      <p className="text-sm font-semibold">{phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sign Out */}
              <button onClick={handleLogout} className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gold text-gold hover:bg-gold hover:text-onyx transition-all font-semibold text-sm uppercase tracking-[0.2em]">
                Sign Out
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 border-b border-border pb-0 overflow-x-auto">
            {(['profile', 'addresses', 'orders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-gold text-gold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'profile' ? 'Profile' : tab === 'addresses' ? 'Addresses' : 'Orders'}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="w-full">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {profileToast && (
                  <div className={`rounded-lg border px-4 py-3 text-sm ${profileToast.type === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-rose-300 bg-rose-50 text-rose-900"}`}>
                    {profileToast.msg}
                  </div>
                )}
                
                {renderStatus()}
                {renderError()}

                <div className="rounded-xl border border-border bg-background p-6 sm:p-8">
                  <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-eyebrow block mb-2">Email</label>
                        <input value={email} readOnly className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-muted-foreground cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="text-eyebrow block mb-2">First Name</label>
                        <input value={firstName} onChange={(e) => { setFirstName(e.target.value); clearFormMessages(); }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                      </div>
                      <div>
                        <label className="text-eyebrow block mb-2">Last Name</label>
                        <input value={lastName} onChange={(e) => { setLastName(e.target.value); clearFormMessages(); }} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                      </div>
                      <div>
                        <label className="text-eyebrow block mb-2">Phone</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); clearFormMessages(); }}
                          placeholder="+234 800 000 0000"
                          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={profileSaving} className="w-full sm:w-auto px-6 py-2 bg-onyx text-cream rounded-lg text-sm font-semibold uppercase tracking-[0.2em] hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                      {profileSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                {addressesError && <p className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg">{addressesError}</p>}

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Saved Addresses</h3>
                  <button
                    onClick={() => { setEditingAddressId(null); setAddressForm({ type: "shipping", first_name: "", last_name: "", phone: "", street: "", city: "", state: "", postal_code: "", country: "Nigeria", is_default: false }); setShowAddressForm(!showAddressForm); }}
                    className="px-4 py-2 rounded-lg border border-gold text-gold hover:bg-gold hover:text-onyx transition-colors text-sm font-semibold uppercase tracking-[0.2em]"
                  >
                    {showAddressForm ? "Cancel" : "Add Address"}
                  </button>
                </div>

                {showAddressForm && (
                  <div className="rounded-xl border border-border bg-background p-6 sm:p-8">
                    <h4 className="font-semibold mb-4">{editingAddressId ? "Edit Address" : "Add New Address"}</h4>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="grid gap-4">
                        <div>
                          <label className="text-eyebrow block mb-2">Type</label>
                          <select
                            value={addressForm.type}
                            onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold"
                          >
                            <option value="shipping">Shipping</option>
                            <option value="billing">Billing</option>
                          </select>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-eyebrow block mb-2">First Name</label>
                            <input value={addressForm.first_name} onChange={(e) => setAddressForm({ ...addressForm, first_name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                          </div>
                          <div>
                            <label className="text-eyebrow block mb-2">Last Name</label>
                            <input value={addressForm.last_name} onChange={(e) => setAddressForm({ ...addressForm, last_name: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                          </div>
                        </div>
                        <div>
                          <label className="text-eyebrow block mb-2">Phone</label>
                          <input type="tel" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                        </div>
                        <div>
                          <label className="text-eyebrow block mb-2">Street Address *</label>
                          <input required value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-eyebrow block mb-2">City *</label>
                            <input required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                          </div>
                          <div>
                            <label className="text-eyebrow block mb-2">State *</label>
                            <input required value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-eyebrow block mb-2">Postal Code *</label>
                            <input required value={addressForm.postal_code} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                          </div>
                          <div>
                            <label className="text-eyebrow block mb-2">Country *</label>
                            <input required value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-gold" />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={addressForm.is_default} onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })} className="w-4 h-4 rounded border-border" />
                          <span>Set as default address</span>
                        </label>
                      </div>
                      <button type="submit" disabled={addressSubmitting} className="w-full sm:w-auto px-6 py-2 bg-onyx text-cream rounded-lg text-sm font-semibold uppercase tracking-[0.2em] hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        {addressSubmitting ? "Saving..." : editingAddressId ? "Update Address" : "Add Address"}
                      </button>
                    </form>
                  </div>
                )}

                {!addressesLoading && addresses.length === 0 && !showAddressForm && (
                  <p className="text-center text-muted-foreground py-8">No saved addresses yet</p>
                )}

                {addresses.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="rounded-xl border border-border bg-background p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm font-semibold capitalize mb-1">{addr.type === "billing" ? "Billing" : "Shipping"} Address</p>
                            {addr.is_default && <span className="text-[10px] bg-gold/20 text-gold px-2 py-1 rounded">DEFAULT</span>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="text-xs text-gold hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-xs text-destructive hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {addr.first_name && <p className="text-xs text-muted-foreground mb-2">{addr.first_name} {addr.last_name}</p>}
                        <p className="text-xs text-muted-foreground">{addr.street}</p>
                        <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} {addr.postal_code}</p>
                        <p className="text-xs text-muted-foreground">{addr.country}</p>
                        {addr.phone && <p className="text-xs text-muted-foreground mt-2">{addr.phone}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {ordersError && <p className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg">{ordersError}</p>}

                {!ordersLoading && !orders.length && !ordersError && (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                )}

                {!ordersLoading && orders.length > 0 && (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-border bg-background p-5">
                        <div className="grid gap-4 sm:grid-cols-4 mb-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Order</p>
                            <p className="font-mono text-sm font-semibold">{order.order_number}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Payment</p>
                            <StatusBadge status={order.payment_status} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Status</p>
                            <StatusBadge status={order.order_status} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Total</p>
                            <p className="font-semibold">{fmt(order.total)}</p>
                          </div>
                        </div>
                        <div className="border-t border-border pt-4">
                          <p className="text-xs text-muted-foreground mb-2">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                          {order.items?.length ? (
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Items</p>
                              <ul className="text-xs space-y-1">
                                {order.items.slice(0, 3).map((item, index) => (
                                  <li key={index}>{item.product_name} × {item.quantity}</li>
                                ))}
                                {order.items.length > 3 && (
                                  <li className="text-muted-foreground">+ {order.items.length - 3} more items</li>
                                )}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {ordersLoading && (
                  <p className="text-center text-muted-foreground py-8">Loading orders...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <img src="/gallery-compressed/prom_suits/Prom_classic_Ric_Hassani_black_velvet_4.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-onyx/40" />
        <div className="absolute bottom-12 left-12 right-12 text-cream">
          <p className="text-eyebrow text-gold">{mode === "verify-email" ? "Email Verification" : "Members Only"}</p>
          <h2 className="font-serif-luxe text-5xl mt-4 leading-tight">{mode === "verify-email" ? "Verify Your Email" : "The Sparks Society"}</h2>
          <p className="mt-4 max-w-md text-cream/80">
            {mode === "verify-email"
              ? "Check your email for a verification link to activate your account."
              : "Create an account or sign in to continue shopping and checkout with your local backend credentials."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {mode === "verify-email" ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-gold" />
                </div>
              </div>
              <p className="text-eyebrow text-center">Check Your Email</p>
              <h1 className="font-display text-4xl md:text-5xl text-center mt-3">Verify Your Account</h1>

              {resendSuccess && (
                <p className="mt-6 text-sm text-success bg-success/10 p-3 rounded text-center">
                  Verification email sent successfully!
                </p>
              )}
              {resendError && (
                <p className="mt-6 text-sm text-destructive bg-destructive/10 p-3 rounded text-center">
                  {resendError}
                </p>
              )}

              <div className="mt-8 space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  We sent a verification link to <strong>{verificationEmail}</strong>
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  Click the link in your email to verify your account. The link expires in 24 hours.
                </p>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="w-full bg-onyx text-cream py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60"
                  >
                    {resendLoading ? "Sending..." : "Resend Verification Email"}
                  </button>

                  <button
                    onClick={() => setMode("signin")}
                    className="w-full border border-border py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:border-gold transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
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
                    <input value={firstName} onChange={(e) => { setFirstName(e.target.value); clearFormMessages(); }} className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-eyebrow block mb-2">Last name</label>
                    <input value={lastName} onChange={(e) => { setLastName(e.target.value); clearFormMessages(); }} className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-gold" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-eyebrow block mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFormMessages(); }}
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
                      onChange={(e) => { setPassword(e.target.value); clearFormMessages(); }}
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
                {mode === "signin" ? (busy ? "Signing in..." : "Sign In") : mode === "signup" ? (busy ? "Creating account..." : "Create Account") : (busy ? "Requesting..." : "Request Reset")}
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}

