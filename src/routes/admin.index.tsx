import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, Package, Banknote, Users, ArrowUpRight, AlertTriangle } from "lucide-react";
import { fetchStats, type AdminStats, type AdminOrder } from "@/lib/admin";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-eyebrow">Overview</p>
        <h1 className="font-display text-3xl md:text-4xl mt-1">Dashboard</h1>
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"  value={loading ? "…" : fmt(stats?.total_revenue ?? 0)}   icon={Banknote}     accent />
        <StatCard label="Orders"         value={loading ? "…" : String(stats?.total_orders ?? 0)}  icon={ShoppingBag} />
        <StatCard label="Products"       value={loading ? "…" : String(stats?.total_products ?? 0)} icon={Package} />
        <StatCard label="Customers"      value={loading ? "…" : String(stats?.total_users ?? 0)}   icon={Users} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <section className="lg:col-span-2 bg-background border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-display text-xl">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs tracking-[0.2em] uppercase text-gold-deep hover:underline inline-flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  {["Order #", "Email", "Total", "Payment Status", "Date"].map((h) => (
                    <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading && !stats?.recent_orders?.length && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>
                )}
                {stats?.recent_orders?.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-secondary/20">
                    <td className="p-3 font-mono text-xs">{o.order_number}</td>
                    <td className="p-3 text-xs truncate max-w-[140px]">{o.email}</td>
                    <td className="p-3 tabular-nums text-xs">{fmt(Number(o.total))}</td>
                    <td className="p-3"><StatusPill status={o.payment_status} /></td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Low stock */}
        <section className="bg-background border border-border">
          <div className="flex items-center gap-2 p-5 border-b border-border">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="font-display text-xl">Low Stock</h2>
          </div>
          <div className="divide-y divide-border">
            {!loading && !stats?.low_stock_products?.length && (
              <p className="p-5 text-sm text-muted-foreground">All products well stocked.</p>
            )}
            {stats?.low_stock_products?.map((p) => (
              <div key={p.id} className="p-4 flex justify-between items-center">
                <p className="text-sm font-medium truncate max-w-[160px]">{p.name}</p>
                <span className={["text-xs font-semibold px-2 py-0.5 rounded", p.quantity_in_stock === 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"].join(" ")}>
                  {p.quantity_in_stock} left
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ElementType; accent?: boolean }) {
  return (
    <div className={["p-6 border", accent ? "bg-onyx text-cream border-onyx" : "bg-background border-border"].join(" ")}>
      <div className="flex items-center justify-between">
        <p className={["text-[10px] tracking-[0.25em] uppercase", accent ? "text-gold" : "text-muted-foreground"].join(" ")}>{label}</p>
        <Icon className={["h-4 w-4", accent ? "text-gold" : "text-muted-foreground"].join(" ")} />
      </div>
      <p className="font-display text-3xl mt-3">{value}</p>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
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
    active: "bg-emerald-100 text-emerald-700",
    suspended: "bg-amber-100 text-amber-700",
    blocked: "bg-rose-100 text-rose-700",
    inactive: "bg-zinc-100 text-zinc-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium ${map[status] ?? "bg-zinc-100 text-zinc-700"}`}>
      {status}
    </span>
  );
}
