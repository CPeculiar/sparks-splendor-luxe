import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchAdminInventory, updateInventory } from "@/lib/admin";

export const Route = createFileRoute("/admin/inventory")({ component: AdminInventory });

function AdminInventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try { setItems(await fetchAdminInventory()); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function save(p: any, qty: number) {
    try {
      await updateInventory(p.id, Number(qty));
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-eyebrow">Inventory</p>
        <h1 className="font-display text-3xl mt-1">Stock Levels</h1>
      </header>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              { ["Product", "SKU", "Stock", "Price", "Active", "Actions"].map(h => <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>) }
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && !items.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found.</td></tr>}
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-xs">{p.slug || "—"}</td>
                <td className="p-3">
                  <input defaultValue={p.quantity_in_stock} type="number" className="w-20 border border-border px-2 py-1" id={`qty-${p.id}`} />
                </td>
                <td className="p-3 tabular-nums">₦{Number(p.price).toLocaleString()}</td>
                <td className="p-3">{p.is_active ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <button onClick={() => save(p, Number((document.getElementById(`qty-${p.id}`) as HTMLInputElement).value))} className="px-3 py-2 bg-onyx text-cream text-xs">Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
