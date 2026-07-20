import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fetchOrders, updateOrderStatus, fetchOrderEdits, postOrderEdit, refundOrder, type AdminOrder } from "@/lib/admin";
import { StatusPill } from "./admin.index";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const [orders, setOrders]   = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [q, setQ]             = useState("");
  const [opened, setOpened]   = useState<AdminOrder | null>(null);
  const [refundAmount, setRefundAmount] = useState<number | null>(null);
  const [gatewayRefund, setGatewayRefund] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [editChanges, setEditChanges] = useState('');
  const [editsReloadKey, setEditsReloadKey] = useState(0);

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (opened) setRefundAmount(Number(opened.total));
  }, [opened]);

  async function load() {
    setLoading(true);
    try { setOrders(await fetchOrders()); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function loadEdits(orderId: string) {
    try {
      const edits = await fetchOrderEdits(orderId);
      // parse changes JSON if necessary
      return edits.map((e: any) => ({ ...e, changes: typeof e.changes === 'string' ? JSON.parse(e.changes) : e.changes }));
    } catch (e) { return []; }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) =>
      o.email.toLowerCase().includes(s) || o.order_number.toLowerCase().includes(s)
    );
  }, [q, orders]);

  async function changeStatus(id: string, order_status: string) {
    try {
      const updated = await updateOrderStatus(id, order_status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      if (opened?.id === id) setOpened(updated);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  const fmt = (n: number) => `₦${Number(n).toLocaleString("en-NG")}`;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-eyebrow">Manage</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Orders</h1>
        </div>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email or order #"
            className="pl-9 pr-3 py-2 border border-border bg-background text-sm w-72 outline-none focus:border-gold"
          />
        </div>
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              {["Order #", "Customer", "Total", "Order Status", "Payment", "Date", ""].map((h) => (
                <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && !filtered.length && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found.</td></tr>}
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3 font-mono text-xs">{o.order_number}</td>
                <td className="p-3">
                  <p className="text-xs">{o.first_name} {o.last_name}</p>
                  <p className="text-xs text-muted-foreground">{o.email}</p>
                </td>
                <td className="p-3 tabular-nums text-xs">{fmt(o.total)}</td>
                <td className="p-3"><StatusPill status={o.order_status} /></td>
                <td className="p-3"><StatusPill status={o.payment_status} /></td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setOpened(o)} className="text-xs text-gold-deep hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {opened && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpened(null)}>
          <div className="absolute inset-0 bg-onyx/60" />
          <aside className="ml-auto relative h-full w-full sm:w-[480px] bg-background overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <p className="text-eyebrow">Order Details</p>
              <h2 className="font-display text-2xl mt-1">{opened.order_number}</h2>
              <p className="text-xs text-muted-foreground mt-1">{new Date(opened.created_at).toLocaleString()}</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-eyebrow mb-1">Customer</p><p>{opened.first_name} {opened.last_name}</p><p className="text-xs text-muted-foreground">{opened.email}</p></div>
                <div><p className="text-eyebrow mb-1">Phone</p><p>{opened.phone}</p></div>
                <div><p className="text-eyebrow mb-1">Total</p><p className="font-display text-xl">{fmt(opened.total)}</p></div>
                <div><p className="text-eyebrow mb-1">Payment</p><StatusPill status={opened.payment_status} /></div>
              </div>
              <div>
                <p className="text-eyebrow mb-2">Update Order Status</p>
                <select
                  value={opened.order_status}
                  onChange={(e) => changeStatus(opened.id, e.target.value)}
                  className="border border-border px-3 py-2 text-sm bg-background w-full"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className="text-eyebrow mb-2">Edit History</p>
                <div className="text-xs text-muted-foreground max-h-40 overflow-y-auto border border-border p-2">
                  <OrderEditsList orderId={opened.id} reloadKey={editsReloadKey} />
                </div>
                <div className="mt-3">
                  <p className="text-eyebrow mb-2">Add manual edit</p>
                  <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Note to record" className="w-full p-2 border border-border text-sm mb-2" />
                  <textarea value={editChanges} onChange={(e) => setEditChanges(e.target.value)} placeholder='Optional JSON changes: {"order_status":"cancelled"}' className="w-full p-2 border border-border text-sm mb-2" />
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      try {
                        const parsed = editChanges ? JSON.parse(editChanges) : undefined;
                        await postOrderEdit(opened.id, { changes: parsed, note: editNote });
                        setEditNote(''); setEditChanges(''); setEditsReloadKey((k) => k + 1);
                        alert('Edit recorded');
                      } catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
                    }} className="px-3 py-2 bg-onyx text-cream text-xs">Save Edit</button>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-eyebrow mb-2">Actions</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Amount</label>
                    <input type="number" value={refundAmount ?? ''} onChange={(e) => setRefundAmount(Number(e.target.value))} className="inp w-36 text-sm" />
                    <label className="flex items-center gap-2 text-xs ml-2">
                      <input type="checkbox" checked={gatewayRefund} onChange={(e) => setGatewayRefund(e.target.checked)} />
                      <span>Gateway refund</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => {
                      if (!refundAmount || refundAmount <= 0) { alert('Enter a valid refund amount'); return; }
                      if (!confirm(`Process refund of ₦${Number(refundAmount).toLocaleString()}?`)) return;
                      try {
                        await refundOrder(opened.id, { amount: Number(refundAmount), reason: 'Admin partial refund', gateway_refund: gatewayRefund });
                        alert('Refund recorded');
                        void load();
                        setOpened(null);
                      } catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
                    }} className="px-3 py-2 bg-red-600 text-white text-xs">Refund</button>
                    <button onClick={() => { setRefundAmount(Number(opened.total)); setGatewayRefund(false); }} className="px-3 py-2 border border-border text-xs">Reset</button>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpened(null)} className="w-full border border-border py-3 text-xs tracking-[0.25em] uppercase hover:border-gold">Close</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function OrderEditsList({ orderId, reloadKey }: { orderId: string; reloadKey?: number }) {
  const [edits, setEdits] = useState<any[] | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const e = await fetchOrderEdits(orderId);
      if (!mounted) return;
      setEdits(e.map((it: any) => ({ ...it, changes: typeof it.changes === "string" ? JSON.parse(it.changes) : it.changes })));
    })();
    return () => { mounted = false; };
  }, [orderId, reloadKey]);
  if (!edits) return <div className="text-xs text-muted-foreground">Loading…</div>;
  if (!edits.length) return <div className="text-xs text-muted-foreground">No edits recorded.</div>;
  return (
    <ul className="space-y-2">
      {edits.map((e) => (
        <li key={e.id} className="border-b border-border pb-2">
          <div className="text-[11px]">{new Date(e.created_at).toLocaleString()} • <span className="text-xs text-muted-foreground">{e.actor_email || e.actor_role}</span></div>
          <div className="text-xs mt-1">{e.note}</div>
          <pre className="text-[11px] mt-1 bg-secondary/10 p-2 overflow-x-auto">{JSON.stringify(e.changes, null, 2)}</pre>
        </li>
      ))}
    </ul>
  );
}
