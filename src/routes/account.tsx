import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  getCurrentUser,
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
} from "@/lib/auth";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function loadGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("ssr"));
    }
    if (window.google) {
      return resolve();
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-google="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google script failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.google = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed"));
    document.body.appendChild(script);
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

  useEffect(() => {
    if (search.reset_token) {
      setMode("reset");
      setResetToken(search.reset_token as string);
    }

    const existingUser = getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      setFirstName(existingUser.first_name || "");
      setLastName(existingUser.last_name || "");
      setPhone(existingUser.phone || "");
      setEmail(existingUser.email);
      setProfileImage(existingUser.profile_image || "");
      return;
    }

    if (isAuthenticated()) {
      void loadUser()
        .then((fetched) => {
          setUser(fetched);
          setFirstName(fetched.first_name || "");
          setLastName(fetched.last_name || "");
          setPhone(fetched.phone || "");
          setEmail(fetched.email);
          setProfileImage(fetched.profile_image || "");
        })
        .catch(() => {
          logout();
        });
    }
  }, [search.reset_token]);

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
      setStatus("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setStatus("Signed out successfully.");
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setStatus(null);
    setBusy(true);
    try {
      await loadGoogleScript();
      if (!window.google) {
        throw new Error("Google sign-in is unavailable.");
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            const userData = await googleLogin(response.credential);
            setUser(userData);
            setStatus("Signed in with Google.");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Google sign in failed.");
          } finally {
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.prompt();
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Google sign in failed.");
    }
  };

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
            <div className="text-center">
              <p className="text-eyebrow">Welcome back</p>
              <h1 className="font-display text-4xl mt-3">Your Profile</h1>
            </div>

            {renderStatus()}
            {renderError()}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-eyebrow block mb-2">Email</label>
                  <input value={email} readOnly className="w-full border border-border bg-muted px-4 py-3 text-sm" />
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
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-eyebrow block mb-2">Profile image URL</label>
                  <input value={profileImage} onChange={(e) => setProfileImage(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
              </div>

              <button type="submit" className="w-full bg-onyx text-cream py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60">
                Save Profile
              </button>
            </form>

            <button onClick={handleLogout} className="w-full border border-border py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:border-gold transition-colors">
              Sign Out
            </button>
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

          {GOOGLE_CLIENT_ID && mode === "signin" && (
            <button onClick={handleGoogleSignIn} className="w-full mt-8 border border-border h-12 text-sm font-medium hover:border-gold transition-colors flex items-center justify-center gap-3">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
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
                      value={mode === "forgot" ? "" : password}
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
