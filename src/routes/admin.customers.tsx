import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, User, UserX, Trash2, Plus, UserCog } from "lucide-react";
import {
  fetchUsers, updateUserStatus, updateUserRole, deleteUser, createAdminUser,
  type AdminUser,
} from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { StatusPill } from "./admin.index";

export const Route = createFileRoute("/admin/customers")({
  component: AdminUsers,
});

const STATUS_OPTIONS = ["active", "inactive", "suspended", "blocked"] as const;
const ROLE_OPTIONS   = ["customer", "admin", "super_admin"] as const;

function AdminUsers() {
  const me = getCurrentUser();
  const isSuperAdmin = me?.role === "super_admin";

  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [query, setQuery]     = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try { setUsers((await fetchUsers()).data); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }

  async function changeStatus(id: string, status: string) {
    try {
      const updated = await updateUserStatus(id, status);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  async function changeRole(id: string, role: string) {
    try {
      const updated = await updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u)));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Permanently delete user "${email}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      [u.email, u.first_name ?? "", u.last_name ?? "", u.role, u.status].join(" ").toLowerCase().includes(s)
    );
  }, [query, users]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-eyebrow">Management</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Users</h1>
          {isSuperAdmin && <p className="text-xs text-gold mt-1">Super Admin — full control enabled</p>}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users…"
              className="pl-9 pr-3 py-2 border border-border bg-background text-sm w-64 outline-none focus:border-gold"
            />
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-onyx text-cream px-4 py-2 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
            >
              <Plus className="h-4 w-4" /> New Admin
            </button>
          )}
        </div>
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Users",  value: users.length,                                          icon: User },
          { label: "Active",       value: users.filter((u) => u.status === "active").length,     icon: ShieldCheck },
          { label: "Suspended/Blocked", value: users.filter((u) => ["suspended","blocked"].includes(u.status)).length, icon: UserX },
        ].map((c) => (
          <div key={c.label} className="border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">{c.label}</p>
              <c.icon className="h-4 w-4 text-gold" />
            </div>
            <p className="font-display text-3xl mt-3">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              {["User", "Email", "Role", "Status", "Joined", ...(isSuperAdmin ? ["Actions"] : [])].map((h) => (
                <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && !filtered.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td></tr>}
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {u.profile_image
                      ? <img src={u.profile_image} alt="" className="h-8 w-8 rounded-full object-cover" />
                      : <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">{(u.first_name?.[0] || u.email[0]).toUpperCase()}</div>
                    }
                    <div>
                      <p className="font-medium">{u.first_name || "—"} {u.last_name || ""}</p>
                      <p className="text-xs text-muted-foreground">{u.phone || ""}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-xs">{u.email}</td>
                <td className="p-3">
                  {isSuperAdmin ? (
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="border border-border bg-background text-xs px-2 py-1"
                    >
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                  ) : (
                    <span className="text-xs capitalize">{u.role.replace("_", " ")}</span>
                  )}
                </td>
                <td className="p-3">
                  {isSuperAdmin ? (
                    <select
                      value={u.status}
                      onChange={(e) => changeStatus(u.id, e.target.value)}
                      className="border border-border bg-background text-xs px-2 py-1"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <StatusPill status={u.status} />
                  )}
                </td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                {isSuperAdmin && (
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      className="p-1.5 hover:text-destructive transition-colors"
                      aria-label="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && isSuperAdmin && (
        <CreateAdminModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); void load(); }} />
      )}
    </div>
  );
}

function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [busy, setBusy]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await createAdminUser({ email, password, first_name: firstName, last_name: lastName });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-onyx/60" />
      <div className="relative bg-background w-full max-w-md p-8 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-2">
          <UserCog className="h-5 w-5 text-gold" />
          <h2 className="font-display text-2xl">Create Admin User</h2>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-gold" />
          <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-gold" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-gold" />
            <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-gold" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-border py-3 text-xs tracking-[0.25em] uppercase hover:border-gold">Cancel</button>
            <button type="submit" disabled={busy} className="flex-1 bg-onyx text-cream py-3 text-xs tracking-[0.25em] uppercase hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60">
              {busy ? "Creating…" : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
