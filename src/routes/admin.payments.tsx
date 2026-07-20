import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchPaymentConfig, updatePaymentConfig } from "@/lib/admin";

export const Route = createFileRoute("/admin/payments")({ component: AdminPayments });

function AdminPayments() {
  const [cfg, setCfg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try { setCfg(await fetchPaymentConfig()); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function save() {
    try { await updatePaymentConfig(cfg); alert('Saved'); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-eyebrow">Payments</p>
        <h1 className="font-display text-3xl mt-1">Payment Configuration</h1>
      </header>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={cfg?.isPayOnDelivery} onChange={(e) => setCfg({ ...cfg, isPayOnDelivery: e.target.checked })} />
          <span className="text-sm">Enable Pay-on-Delivery (POD)</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={cfg?.isOnlinePaymentEnabled} onChange={(e) => setCfg({ ...cfg, isOnlinePaymentEnabled: e.target.checked })} />
          <span className="text-sm">Enable Online Payments</span>
        </label>

        <div>
          <p className="text-xs text-muted-foreground">Min order for POD</p>
          <input type="number" value={cfg?.minOrderForPOD ?? 0} onChange={(e) => setCfg({ ...cfg, minOrderForPOD: Number(e.target.value) })} className="inp" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Max order for POD</p>
          <input type="number" value={cfg?.maxOrderForPOD ?? 10000000} onChange={(e) => setCfg({ ...cfg, maxOrderForPOD: Number(e.target.value) })} className="inp" />
        </div>

        <div className="col-span-2">
          <p className="text-xs text-muted-foreground">Payment Gateway</p>
          <select value={cfg?.paymentGatewayType || 'paystack'} onChange={(e) => setCfg({ ...cfg, paymentGatewayType: e.target.value })} className="inp">
            <option value="paystack">Paystack</option>
            <option value="transactpay">TransactPay</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex gap-3 max-w-2xl">
        <button onClick={() => void save()} className="bg-onyx text-cream px-4 py-2">Save</button>
      </div>
    </div>
  );
}
