import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, Package, Users, Clock, Download } from "lucide-react";
import {
  getAnalyticsMetrics,
  getAnalyticsSales,
  getAnalyticsTopProducts,
  getAnalyticsOrderStatus,
  exportAnalyticsCSV,
} from "@/lib/auth";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [days]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, salesData, productsData, statusData] = await Promise.all([
        getAnalyticsMetrics(),
        getAnalyticsSales(days),
        getAnalyticsTopProducts(days),
        getAnalyticsOrderStatus(days),
      ]);

      setMetrics(metricsData.metrics);
      setSales(salesData.data || []);
      setTopProducts(productsData.data || []);
      setOrderStatus(statusData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  const fmt = (value: number) => `₦${Number(value || 0).toLocaleString("en-NG")}`;

  const handleExport = async () => {
    try {
      const blob = await exportAnalyticsCSV(days);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${days}d-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <header>
          <p className="text-eyebrow">Insights</p>
          <h1 className="font-display text-3xl mt-1">Analytics</h1>
        </header>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border transition-colors ${
                days === d
                  ? "bg-gold text-onyx border-gold"
                  : "border-border text-muted-foreground hover:border-gold"
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={handleExport}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-gold text-gold hover:bg-gold/10 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {error && <p className="text-destructive bg-destructive/10 p-4 rounded">{error}</p>}

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-border p-6 rounded bg-secondary/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-eyebrow">Total Orders</p>
                <Package className="h-5 w-5 text-gold" />
              </div>
              <p className="text-3xl font-display">{metrics?.totalOrders || 0}</p>
              <p className="text-xs text-muted-foreground mt-2">Last {days} days</p>
            </div>

            <div className="border border-border p-6 rounded bg-secondary/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-eyebrow">Revenue</p>
                <TrendingUp className="h-5 w-5 text-gold" />
              </div>
              <p className="text-3xl font-display">{fmt(metrics?.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-2">Last {days} days</p>
            </div>

            <div className="border border-border p-6 rounded bg-secondary/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-eyebrow">Customers</p>
                <Users className="h-5 w-5 text-gold" />
              </div>
              <p className="text-3xl font-display">{metrics?.totalCustomers || 0}</p>
              <p className="text-xs text-muted-foreground mt-2">Last {days} days</p>
            </div>

            <div className="border border-border p-6 rounded bg-secondary/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-eyebrow">Pending Orders</p>
                <Clock className="h-5 w-5 text-gold" />
              </div>
              <p className="text-3xl font-display">{metrics?.pendingOrders || 0}</p>
              <p className="text-xs text-muted-foreground mt-2">Action needed</p>
            </div>
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Data */}
            <section className="border border-border p-4 bg-background">
              <h3 className="text-sm mb-3 font-semibold">Daily Sales</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sales.length > 0 ? (
                  sales.map((s) => (
                    <div key={s.date} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{new Date(s.date).toLocaleDateString()}</span>
                      <div className="flex gap-4">
                        <span>{s.order_count} orders</span>
                        <span className="font-semibold">{fmt(s.revenue)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">No data available</p>
                )}
              </div>
            </section>

            {/* Order Status */}
            <section className="border border-border p-4 bg-background">
              <h3 className="text-sm mb-3 font-semibold">Order Status</h3>
              <div className="space-y-2">
                {orderStatus.length > 0 ? (
                  orderStatus.map((s) => (
                    <div key={s.order_status} className="flex items-center justify-between text-xs">
                      <span className="capitalize">{s.order_status}</span>
                      <span className="font-semibold">{s.count} orders</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">No data available</p>
                )}
              </div>
            </section>
          </div>

          {/* Top Products */}
          <section className="border border-border p-4 bg-background">
            <h3 className="text-sm mb-3 font-semibold">Top Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2">Product</th>
                    <th className="text-right py-2 px-2">Units</th>
                    <th className="text-right py-2 px-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length > 0 ? (
                    topProducts.map((p) => (
                      <tr key={p.id} className="border-b border-border hover:bg-secondary/5">
                        <td className="py-2 px-2">{p.name}</td>
                        <td className="text-right py-2 px-2">{p.total_quantity}</td>
                        <td className="text-right py-2 px-2 font-semibold">{fmt(p.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-muted-foreground">
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
