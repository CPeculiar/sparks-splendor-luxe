import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getUserOrders, UserOrder } from "@/lib/auth";

export const Route = createFileRoute("/account/orders")({
  component: AccountOrdersPage,
});

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  refunded: "bg-zinc-200 text-zinc-700",
  failed: "bg-rose-100 text-rose-700",
};

function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusStyles[value] ?? "bg-zinc-100 text-zinc-700"}`}>
      {value}
    </span>
  );
}

function AccountOrdersPage() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fmt = (value: string | number) => `₦${Number(value).toLocaleString("en-NG")}`;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserOrders();
        if (mounted) setOrders(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Unable to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="min-h-[80vh] py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-eyebrow">My Account</p>
            <h1 className="font-display text-4xl sm:text-5xl">My Orders</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Review all your past orders, payment status, and order progress in one place.
            </p>
          </div>
          <Link to="/account" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-foreground transition-colors hover:border-gold">
            Back to profile
          </Link>
        </div>

        {error && <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

        <div className="overflow-x-auto rounded-3xl border border-border bg-secondary/5">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-background/90 text-muted-foreground">
              <tr>
                <th className="px-4 py-4 text-[10px] uppercase tracking-[0.24em]">Order #</th>
                <th className="px-4 py-4 text-[10px] uppercase tracking-[0.24em]">Date</th>
                <th className="px-4 py-4 text-[10px] uppercase tracking-[0.24em]">Total</th>
                <th className="px-4 py-4 text-[10px] uppercase tracking-[0.24em]">Payment</th>
                <th className="px-4 py-4 text-[10px] uppercase tracking-[0.24em]">Order</th>
                <th className="px-4 py-4 text-[10px] uppercase tracking-[0.24em]">Items</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading orders…
                  </td>
                </tr>
              )}

              {!loading && !orders.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    You have no orders yet.
                  </td>
                </tr>
              )}

              {!loading && orders.map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-background/60">
                  <td className="px-4 py-4 font-mono text-xs">{order.order_number}</td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-xs">{fmt(order.total)}</td>
                  <td className="px-4 py-4"><StatusBadge value={order.payment_status} /></td>
                  <td className="px-4 py-4"><StatusBadge value={order.order_status} /></td>
                  <td className="px-4 py-4 text-xs text-muted-foreground">{order.items?.length ?? 0} item{order.items?.length === 1 ? "" : "s"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
