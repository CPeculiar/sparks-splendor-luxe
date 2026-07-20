import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon, type AdminCoupon } from "@/lib/admin";

export const Route = createFileRoute("/admin/coupons")({ component: AdminCoupons });

function AdminCoupons() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AdminCoupon & { code: string }>>({ discount_type: 'percentage', discount_value: 0, is_active: true });

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try { setCoupons(await fetchCoupons()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoading(false); }
  }

  async function save() {
    try {
      if (!form.code) return alert('Code required');
      await createCoupon(form as any);
      setForm({ discount_type: 'percentage', discount_value: 0, is_active: true });
      void load();
    } catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <p className="text-eyebrow">Discounts</p>
        <h1 className="font-display text-3xl mt-1">Coupons</h1>
      </header>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-3 gap-4 max-w-3xl">
        <input placeholder="Code" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} className="inp" />
        <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })} className="inp">
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed</option>
        </select>
        <input type="number" value={form.discount_value as any} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} className="inp" />
        <input placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="inp col-span-2" />
        <button onClick={() => void save()} className="bg-onyx text-cream px-4 py-2">Create</button>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              {['Code','Type','Value','Uses','Expires','Active',''].map(h => <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && !coupons.length && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No coupons yet.</td></tr>}
            {coupons.map(c => (
              <tr key={c.id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3 font-mono text-xs">{c.code}</td>
                <td className="p-3 text-xs">{c.discount_type}</td>
                <td className="p-3 text-xs">{c.discount_value}</td>
                <td className="p-3 text-xs">{c.uses}/{c.max_uses || '∞'}</td>
                <td className="p-3 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}</td>
                <td className="p-3 text-xs">{c.is_active ? 'Yes' : 'No'}</td>
                <td className="p-3 text-right"><button onClick={async () => { if (!confirm('Delete coupon?')) return; await deleteCoupon(c.id); void load(); }} className="text-xs text-destructive">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
