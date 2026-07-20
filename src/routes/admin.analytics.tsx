import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchCategoryAnalytics, fetchTopProducts, fetchSalesReport } from "@/lib/admin";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

export default function AdminAnalytics() {
  const [cats, setCats] = useState<any[]>([]);
  const [tops, setTops] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<{ start?: string; end?: string }>({});

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true);
    try {
      setCats(await fetchCategoryAnalytics());
      setTops(await fetchTopProducts());
      setSales(await fetchSalesReport(range.start, range.end));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <p className="text-eyebrow">Insights</p>
        <h1 className="font-display text-3xl mt-1">Analytics</h1>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <section className="bg-background border border-border p-4">
          <h3 className="text-sm mb-3">Top Categories</h3>
          {loading && <div className="text-xs text-muted-foreground">Loading…</div>}
          {!loading && cats.length === 0 && <div className="text-xs text-muted-foreground">No data</div>}
          <ul className="text-sm space-y-2">
            {cats.map(c => (
              <li key={c.id} className="flex justify-between"><span>{c.name}</span><span className="text-muted-foreground">Sold: {c.total_sold}</span></li>
            ))}
          </ul>
        </section>

        <section className="bg-background border border-border p-4">
          <h3 className="text-sm mb-3">Top Products</h3>
          <ul className="text-sm space-y-2">
            {tops.map(p => (
              <li key={p.id} className="flex justify-between"><span>{p.name}</span><span className="text-muted-foreground">Sold: {p.total_sold}</span></li>
            ))}
          </ul>
        </section>

        <section className="bg-background border border-border p-4">
          <h3 className="text-sm mb-3">Sales Report</h3>
          <div className="text-xs text-muted-foreground mb-2">Date range</div>
          <div className="flex gap-2 mb-3">
            <input type="date" value={range.start || ''} onChange={(e) => setRange(r => ({ ...r, start: e.target.value }))} className="inp" />
            <input type="date" value={range.end || ''} onChange={(e) => setRange(r => ({ ...r, end: e.target.value }))} className="inp" />
            <button onClick={() => void load()} className="px-3 py-2 bg-onyx text-cream text-xs">Run</button>
          </div>
          <div className="text-sm max-h-40 overflow-y-auto">
            {sales.map(s => (
              <div key={s.date} className="flex justify-between text-xs"><span>{s.date}</span><span>₦{Number(s.daily_revenue).toLocaleString()}</span></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
