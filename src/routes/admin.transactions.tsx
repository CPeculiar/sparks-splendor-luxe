import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchTransactions, type AdminTransaction } from "@/lib/admin";
import { StatusPill } from "./admin.index";

export const Route = createFileRoute("/admin/transactions")({
  component: AdminTransactions,
});

function AdminTransactions() {
  const [txns, setTxns]       = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions()
      .then(setTxns)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `₦${Number(n).toLocaleString("en-NG")}`;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-eyebrow">Finance</p>
        <h1 className="font-display text-3xl md:text-4xl mt-1">Transactions</h1>
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              {["Reference", "User", "Amount", "Type", "Status", "Date"].map((h) => (
                <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && !txns.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions yet.</td></tr>}
            {txns.map((t) => (
              <tr key={t.id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3 font-mono text-xs">{t.reference || "—"}</td>
                <td className="p-3 text-xs">{t.user_email || "Guest"}</td>
                <td className="p-3 tabular-nums text-xs">{fmt(t.amount)}</td>
                <td className="p-3 text-xs capitalize">{t.transaction_type}</td>
                <td className="p-3"><StatusPill status={t.status} /></td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(t.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
