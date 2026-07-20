import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchReviews, approveReview, deleteReview } from "@/lib/admin";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

export default function AdminReviews() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, []);
  async function load() { setLoading(true); try { setList(await fetchReviews({})); } catch (e) { console.error(e); } finally { setLoading(false); } }

  return (
    <div className="p-6 space-y-6">
      <header>
        <p className="text-eyebrow">Community</p>
        <h1 className="font-display text-3xl mt-1">Reviews Moderation</h1>
      </header>

      <div className="bg-background border border-border p-4">
        <div className="text-sm space-y-3">
          {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
          {!loading && !list.length && <div className="text-xs text-muted-foreground">No reviews</div>}
          {list.map(r => (
            <div key={r.id} className="border-b border-border py-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{r.title || '—'}</div>
                  <div className="text-xs text-muted-foreground">{r.product_name} • {r.user_email || 'Anonymous'}</div>
                  <div className="text-xs mt-2">{r.body}</div>
                </div>
                <div className="text-right">
                  {!r.is_approved && <button onClick={async () => { await approveReview(r.id, true); await load(); }} className="text-xs bg-emerald-600 text-cream px-3 py-1">Approve</button>}
                  {r.is_approved && <button onClick={async () => { await approveReview(r.id, false); await load(); }} className="text-xs bg-muted px-3 py-1">Unapprove</button>}
                  <button onClick={async () => { if (!confirm('Delete review?')) return; await deleteReview(r.id); await load(); }} className="ml-2 text-xs text-destructive">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
