import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchSubscribers, unsubscribeSubscriber, deleteSubscriber } from "@/lib/admin";

export const Route = createFileRoute("/admin/newsletter")({ component: AdminNewsletter });

export default function AdminNewsletter() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, []);
  async function load() { setLoading(true); try { setList(await fetchSubscribers()); } catch (e) { console.error(e); } finally { setLoading(false); } }

  return (
    <div className="p-6 space-y-6">
      <header>
        <p className="text-eyebrow">Marketing</p>
        <h1 className="font-display text-3xl mt-1">Newsletter Subscribers</h1>
      </header>

      <div className="bg-background border border-border p-4">
        {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
        {!loading && !list.length && <div className="text-xs text-muted-foreground">No subscribers yet.</div>}
        <div className="space-y-3">
          {list.map((subscriber) => (
            <div key={subscriber.id} className="border-b border-border py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{subscriber.email}</p>
                  <p className="text-xs text-muted-foreground">{subscriber.name || 'No name'} • {subscriber.is_confirmed ? 'Confirmed' : 'Pending'}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  {!subscriber.unsubscribed && (
                    <button onClick={async () => { await unsubscribeSubscriber(subscriber.id); await load(); }} className="px-3 py-1 bg-muted">Unsubscribe</button>
                  )}
                  <button onClick={async () => { if (!confirm('Delete subscriber?')) return; await deleteSubscriber(subscriber.id); await load(); }} className="px-3 py-1 bg-destructive text-cream">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
