import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pencil, Check, X, ShieldOff } from "lucide-react";
import {
  fetchSubscribers, unsubscribeSubscriber, deleteSubscriber, updateSubscriber,
  fetchBlockedLogins, unblockLogin,
} from "@/lib/admin";

export const Route = createFileRoute("/admin/newsletter")({ component: AdminNewsletter });

export default function AdminNewsletter() {
  const [list, setList] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<{ key: string; ip: string; blockedUntil: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [subs, bls] = await Promise.all([fetchSubscribers(), fetchBlockedLogins()]);
      setList(subs);
      setBlocked(bls);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function startEdit(s: any) {
    setEditId(s.id);
    setEditName(s.name || "");
    setEditEmail(s.email || "");
  }

  async function saveEdit(id: string) {
    await updateSubscriber(id, { name: editName, email: editEmail });
    setEditId(null);
    await load();
  }

  return (
    <div className="p-6 space-y-8">
      <header>
        <p className="text-eyebrow">Marketing</p>
        <h1 className="font-display text-3xl mt-1">Newsletter Subscribers</h1>
      </header>

      {/* Blocked logins section */}
      {blocked.length > 0 && (
        <div className="bg-background border border-destructive/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldOff className="h-4 w-4 text-destructive" />
            <p className="text-sm font-semibold">Rate-Limited Login IPs ({blocked.length})</p>
          </div>
          <p className="text-xs text-muted-foreground">These IPs exceeded login attempts and are temporarily blocked. Click Unblock to restore access immediately.</p>
          <div className="space-y-2">
            {blocked.map((b) => (
              <div key={b.key} className="flex items-center justify-between gap-3 border border-border px-4 py-2 text-sm">
                <div>
                  <span className="font-mono">{b.ip}</span>
                  <span className="text-xs text-muted-foreground ml-3">
                    Blocked until {new Date(b.blockedUntil).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  onClick={async () => { await unblockLogin(b.key); await load(); }}
                  className="px-3 py-1 text-xs bg-onyx text-cream hover:bg-gold hover:text-onyx transition-colors"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-background border border-border p-4">
        {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
        {!loading && !list.length && <div className="text-xs text-muted-foreground">No subscribers yet.</div>}
        <div className="space-y-3">
          {list.map((s) => (
            <div key={s.id} className="border-b border-border py-3">
              {editId === s.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    className="border border-border px-3 py-1.5 text-sm outline-none focus:border-gold w-40"
                  />
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email"
                    className="border border-border px-3 py-1.5 text-sm outline-none focus:border-gold w-56"
                  />
                  <button onClick={() => void saveEdit(s.id)} className="p-1.5 hover:text-gold"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditId(null)} className="p-1.5 hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{s.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.name || "No name"} · {s.is_confirmed ? "Confirmed" : "Pending"}
                      {s.unsubscribed ? " · Unsubscribed" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button onClick={() => startEdit(s)} className="p-1.5 hover:text-gold" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                    {!s.unsubscribed && (
                      <button onClick={async () => { await unsubscribeSubscriber(s.id); await load(); }} className="px-3 py-1 bg-muted">Unsubscribe</button>
                    )}
                    <button onClick={async () => { if (!confirm("Delete subscriber?")) return; await deleteSubscriber(s.id); await load(); }} className="px-3 py-1 bg-destructive text-cream">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
