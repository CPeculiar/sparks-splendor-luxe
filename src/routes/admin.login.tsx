import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { login } from "@/lib/auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email.trim(), password.trim());
      if (user.role !== "admin" && user.role !== "super_admin") {
        setError("Admin access required.");
        return;
      }
      localStorage.setItem('ss-last-activity', String(Date.now()));
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4 bg-secondary/30">
      <form onSubmit={submit} className="w-full max-w-md bg-background border border-border p-8 md:p-10 space-y-6 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-onyx text-gold flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <p className="text-eyebrow mt-4">Restricted</p>
          <h1 className="font-display text-3xl mt-2">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mt-2">Use your backend admin credentials to manage the boutique.</p>
        </div>

        <div>
          <label htmlFor="adminEmail" className="text-eyebrow block mb-2">Email</label>
          <input
            id="adminEmail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            className="w-full border border-border px-4 py-3 text-base bg-background outline-none focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="adminpwd" className="text-eyebrow block mb-2">Password</label>
          <input
            id="adminpwd"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            className="w-full border border-border px-4 py-3 text-base bg-background outline-none focus:border-gold"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={busy || !email || !password}
          className="w-full bg-onyx text-cream py-3.5 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60"
        >
          {busy ? "Verifying…" : "Enter Admin"}
        </button>
      </form>
    </section>
  );
}
