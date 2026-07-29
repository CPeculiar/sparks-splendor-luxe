import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  BarChart2, ShoppingBag, Users, Package, CreditCard,
  Download, TrendingUp, AlertTriangle, RefreshCw,
} from "lucide-react";
import { getAuthToken } from "@/lib/auth";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function fmt(n: number) { return `₦${Math.round(Number(n) || 0).toLocaleString("en-NG")}`; }
function fmtNum(n: number) { return Number(n || 0).toLocaleString(); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }); }

async function apiFetch(path: string) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function downloadCSV(path: string, filename: string) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

type Tab = "overview" | "orders" | "transactions" | "products" | "customers";

export default function AdminReports() {
  const [tab, setTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Date range
  const [start, setStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [end, setEnd] = useState(() => new Date().toISOString().split("T")[0]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const qs = `?start=${start}&end=${end}`;
      const [s, o, t, p, c] = await Promise.all([
        apiFetch("/api/reports/summary"),
        apiFetch(`/api/reports/orders${qs}`),
        apiFetch(`/api/reports/transactions${qs}`),
        apiFetch("/api/reports/products"),
        apiFetch("/api/reports/customers"),
      ]);
      setSummary(s.data);
      setOrders(o.data || []);
      setTransactions(t.data || []);
      setProducts(p.data || []);
      setCustomers(c.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => { void load(); }, [load]);

  async function handleExport(type: string) {
    setExporting(true);
    try {
      const qs = `?start=${start}&end=${end}`;
      const map: Record<string, [string, string]> = {
        orders: [`/api/reports/orders/csv${qs}`, `orders-${start}-${end}.csv`],
        transactions: [`/api/reports/transactions/csv${qs}`, `transactions-${start}-${end}.csv`],
        products: [`/api/reports/products/csv`, `products-${new Date().toISOString().split("T")[0]}.csv`],
        customers: [`/api/reports/customers/csv`, `customers-${new Date().toISOString().split("T")[0]}.csv`],
        analytics: [`/api/reports/analytics/csv`, `analytics-${new Date().toISOString().split("T")[0]}.csv`],
      };
      if (map[type]) await downloadCSV(...map[type]);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "transactions", label: "Transactions", icon: CreditCard },
    { key: "products", label: "Products", icon: Package },
    { key: "customers", label: "Customers", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-eyebrow">Analytics</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Full monitoring oversight of your store</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
          <span className="text-muted-foreground text-sm">to</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
            className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
          <button onClick={() => void load()} disabled={loading}
            className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] hover:border-gold disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Revenue", value: fmt(summary.totals.revenue), icon: TrendingUp, accent: true },
            { label: "Total Orders", value: fmtNum(summary.totals.orders), icon: ShoppingBag },
            { label: "Products", value: fmtNum(summary.totals.products), icon: Package },
            { label: "Customers", value: fmtNum(summary.totals.customers), icon: Users },
            { label: "Transactions", value: fmtNum(summary.totals.transactions), icon: CreditCard },
          ].map((c) => (
            <div key={c.label} className={`border p-5 ${c.accent ? "bg-onyx text-cream border-onyx" : "bg-background border-border"}`}>
              <div className="flex items-center justify-between">
                <p className={`text-[10px] tracking-[0.25em] uppercase ${c.accent ? "text-gold" : "text-muted-foreground"}`}>{c.label}</p>
                <c.icon className={`h-4 w-4 ${c.accent ? "text-gold" : "text-muted-foreground"}`} />
              </div>
              <p className="font-display text-2xl mt-3">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={[
              "inline-flex items-center gap-2 px-5 py-3 text-xs tracking-[0.2em] uppercase font-medium border-b-2 -mb-px whitespace-nowrap transition-colors",
              tab === t.key ? "border-gold text-gold-deep" : "border-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && summary && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Payment breakdown */}
          <section className="bg-background border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Payment Status Breakdown</h2>
              <button onClick={() => void handleExport("analytics")} disabled={exporting}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
            <div className="space-y-2">
              {(summary.paymentBreakdown || []).map((r: any) => {
                const total = (summary.paymentBreakdown || []).reduce((s: number, x: any) => s + Number(x.count), 0);
                const pct = total ? Math.round((Number(r.count) / total) * 100) : 0;
                return (
                  <div key={r.payment_status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{r.payment_status}</span>
                      <span className="tabular-nums text-muted-foreground">{fmtNum(r.count)} orders · {fmt(r.total)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Order status breakdown */}
          <section className="bg-background border border-border p-5 space-y-4">
            <h2 className="font-display text-lg">Order Status Breakdown</h2>
            <div className="space-y-2">
              {(summary.orderStatusBreakdown || []).map((r: any) => {
                const total = (summary.orderStatusBreakdown || []).reduce((s: number, x: any) => s + Number(x.count), 0);
                const pct = total ? Math.round((Number(r.count) / total) * 100) : 0;
                return (
                  <div key={r.order_status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{r.order_status}</span>
                      <span className="tabular-nums text-muted-foreground">{fmtNum(r.count)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-onyx rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Sales by day */}
          <section className="bg-background border border-border p-5 space-y-4 lg:col-span-2">
            <h2 className="font-display text-lg">Daily Revenue (Last 30 Days)</h2>
            {(summary.salesByDay || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed orders in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="flex items-end gap-1 h-32 min-w-[600px]">
                  {(summary.salesByDay || []).map((d: any) => {
                    const max = Math.max(...(summary.salesByDay || []).map((x: any) => Number(x.revenue)));
                    const h = max ? Math.max(4, Math.round((Number(d.revenue) / max) * 100)) : 4;
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-onyx text-cream text-[10px] px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          {fmtDate(d.date)}: {fmt(d.revenue)}
                        </div>
                        <div className="w-full bg-gold/80 hover:bg-gold transition-colors rounded-sm" style={{ height: `${h}%` }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1 min-w-[600px]">
                  <span>{fmtDate((summary.salesByDay[0] || {}).date || "")}</span>
                  <span>{fmtDate((summary.salesByDay[summary.salesByDay.length - 1] || {}).date || "")}</span>
                </div>
              </div>
            )}
          </section>

          {/* Top products */}
          <section className="bg-background border border-border p-5 space-y-3">
            <h2 className="font-display text-lg">Top Products by Units Sold</h2>
            <div className="space-y-2">
              {(summary.topProducts || []).slice(0, 8).map((p: any, i: number) => (
                <div key={p.slug} className="flex items-center justify-between text-sm gap-3">
                  <span className="text-muted-foreground tabular-nums w-5 shrink-0">{i + 1}.</span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="tabular-nums text-muted-foreground shrink-0">{fmtNum(p.units_sold)} sold</span>
                  <span className="tabular-nums shrink-0">{fmt(p.revenue)}</span>
                </div>
              ))}
              {!(summary.topProducts || []).length && <p className="text-sm text-muted-foreground">No sales data yet.</p>}
            </div>
          </section>

          {/* Low stock */}
          <section className="bg-background border border-border p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="font-display text-lg">Low Stock Alert</h2>
            </div>
            <div className="space-y-2">
              {(summary.lowStock || []).map((p: any) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className={`tabular-nums font-semibold px-2 py-0.5 text-xs rounded ${p.quantity_in_stock === 0 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.quantity_in_stock} left
                  </span>
                </div>
              ))}
              {!(summary.lowStock || []).length && <p className="text-sm text-muted-foreground">All products well stocked.</p>}
            </div>
          </section>
        </div>
      )}

      {/* ── Orders ── */}
      {tab === "orders" && (
        <ReportTable
          title="Orders Report"
          data={orders}
          loading={loading}
          onExport={() => void handleExport("orders")}
          exporting={exporting}
          columns={[
            { key: "order_number", label: "Order #", render: (v) => <span className="font-mono text-xs">{v}</span> },
            { key: "email", label: "Email", render: (v) => <span className="text-xs truncate max-w-[140px] block">{v}</span> },
            { key: "first_name", label: "Name", render: (_, r) => `${r.first_name} ${r.last_name}` },
            { key: "total", label: "Total", render: (v) => <span className="tabular-nums">{fmt(v)}</span> },
            { key: "payment_status", label: "Payment", render: (v) => <StatusBadge status={v} /> },
            { key: "order_status", label: "Order", render: (v) => <StatusBadge status={v} /> },
            { key: "item_count", label: "Items", render: (v) => <span className="tabular-nums">{v}</span> },
            { key: "created_at", label: "Date", render: (v) => <span className="text-xs text-muted-foreground">{fmtDate(v)}</span> },
          ]}
        />
      )}

      {/* ── Transactions ── */}
      {tab === "transactions" && (
        <ReportTable
          title="Transactions Report"
          data={transactions}
          loading={loading}
          onExport={() => void handleExport("transactions")}
          exporting={exporting}
          columns={[
            { key: "reference", label: "Reference", render: (v) => <span className="font-mono text-xs">{v || "—"}</span> },
            { key: "user_email", label: "Customer", render: (v) => <span className="text-xs">{v || "—"}</span> },
            { key: "order_number", label: "Order #", render: (v) => <span className="font-mono text-xs">{v || "—"}</span> },
            { key: "amount", label: "Amount", render: (v) => <span className="tabular-nums">{fmt(v)}</span> },
            { key: "transaction_type", label: "Type", render: (v) => <span className="capitalize text-xs">{v}</span> },
            { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
            { key: "description", label: "Note", render: (v) => <span className="text-xs text-muted-foreground truncate max-w-[120px] block">{v || "—"}</span> },
            { key: "created_at", label: "Date", render: (v) => <span className="text-xs text-muted-foreground">{fmtDate(v)}</span> },
          ]}
        />
      )}

      {/* ── Products ── */}
      {tab === "products" && (
        <ReportTable
          title="Products Report"
          data={products}
          loading={loading}
          onExport={() => void handleExport("products")}
          exporting={exporting}
          columns={[
            { key: "name", label: "Product", render: (v) => <span className="font-medium">{v}</span> },
            { key: "category", label: "Category", render: (v) => <span className="text-xs capitalize">{v || "—"}</span> },
            { key: "price", label: "Price NGN", render: (v) => <span className="tabular-nums">{fmt(v)}</span> },
            { key: "price_usd", label: "Price USD", render: (v) => <span className="tabular-nums">${Number(v || 0).toFixed(2)}</span> },
            { key: "quantity_in_stock", label: "In Stock", render: (v) => (
              <span className={`tabular-nums font-semibold ${Number(v) === 0 ? "text-destructive" : Number(v) < 5 ? "text-amber-600" : ""}`}>{v}</span>
            )},
            { key: "units_sold", label: "Units Sold", render: (v) => <span className="tabular-nums font-semibold">{fmtNum(v)}</span> },
            { key: "revenue", label: "Revenue", render: (v) => <span className="tabular-nums">{fmt(v)}</span> },
            { key: "is_active", label: "Active", render: (v) => <span className={`text-xs ${v ? "text-emerald-600" : "text-muted-foreground"}`}>{v ? "Yes" : "No"}</span> },
          ]}
        />
      )}

      {/* ── Customers ── */}
      {tab === "customers" && (
        <ReportTable
          title="Customers Report"
          data={customers}
          loading={loading}
          onExport={() => void handleExport("customers")}
          exporting={exporting}
          columns={[
            { key: "email", label: "Email", render: (v) => <span className="text-xs">{v}</span> },
            { key: "first_name", label: "Name", render: (_, r) => `${r.first_name || ""} ${r.last_name || ""}`.trim() || "—" },
            { key: "phone", label: "Phone", render: (v) => <span className="text-xs">{v || "—"}</span> },
            { key: "total_orders", label: "Orders", render: (v) => <span className="tabular-nums font-semibold">{fmtNum(v)}</span> },
            { key: "total_spent", label: "Total Spent", render: (v) => <span className="tabular-nums">{fmt(v)}</span> },
            { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
            { key: "created_at", label: "Joined", render: (v) => <span className="text-xs text-muted-foreground">{fmtDate(v)}</span> },
          ]}
        />
      )}
    </div>
  );
}

// ── Reusable table ────────────────────────────────────────────────────────────
interface Col { key: string; label: string; render?: (v: any, row: any) => React.ReactNode; }

function ReportTable({ title, data, loading, onExport, exporting, columns }: {
  title: string; data: any[]; loading: boolean;
  onExport: () => void; exporting: boolean; columns: Col[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{data.length} records</p>
        </div>
        <button onClick={onExport} disabled={exporting || loading}
          className="inline-flex items-center gap-2 bg-onyx text-cream px-5 py-2.5 text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-onyx transition-colors disabled:opacity-50">
          <Download className="h-3.5 w-3.5" /> {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>
      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={columns.length} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && !data.length && <tr><td colSpan={columns.length} className="p-8 text-center text-muted-foreground">No data for this period.</td></tr>}
            {data.map((row, i) => (
              <tr key={i} className="border-t border-border hover:bg-secondary/20">
                {columns.map((c) => (
                  <td key={c.key} className="p-3">
                    {c.render ? c.render(row[c.key], row) : row[c.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    paid: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    failed: "bg-rose-100 text-rose-700",
    cancelled: "bg-rose-100 text-rose-700",
    refunded: "bg-zinc-200 text-zinc-700",
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-zinc-100 text-zinc-600",
    suspended: "bg-amber-100 text-amber-700",
    blocked: "bg-rose-100 text-rose-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium ${map[status] ?? "bg-zinc-100 text-zinc-700"}`}>
      {status}
    </span>
  );
}
