import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAdminInventory, updateInventory } from "@/lib/admin";

export const Route = createFileRoute("/admin/inventory")({ component: AdminInventory });

const PAGE_SIZE = 10;

function getDisplayPrice(p: any): { ngn: string; usd: string } {
  return {
    ngn: `₦${Number(p.price).toLocaleString()}`,
    usd: `$${Number(p.price_usd || 0).toFixed(2)}`,
  };
}

function AdminInventory() {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [saving, setSaving]     = useState<string | null>(null);
  const [page, setPage]         = useState(1);

  useEffect(() => { void load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try { setAllItems(await fetchAdminInventory()); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  async function save(p: any, qty: number) {
    setSaving(p.id);
    try { await updateInventory(p.id, Number(qty)); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(null); }
  }

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const items = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stockBadge = (qty: number) => {
    if (qty === 0) return "bg-red-100 text-red-700";
    if (qty < 5)  return "bg-amber-100 text-amber-700";
    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-eyebrow">Inventory</p>
        <h1 className="font-display text-3xl mt-1">Stock Levels</h1>
      </header>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Desktop table */}
      <div className="hidden md:block bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              {["Product", "Stock Remaining", "Qty Sold", "Price NGN", "Price USD", "Active", "Actions"].map(h => (
                <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && !allItems.length && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No products found.</td></tr>}
            {items.map((p) => {
              const prices = getDisplayPrice(p);
              return <DesktopRow key={p.id} p={p} prices={prices} saving={saving} onSave={save} stockBadge={stockBadge} />;
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading && <p className="text-center text-muted-foreground py-8">Loading…</p>}
        {!loading && !allItems.length && <p className="text-center text-muted-foreground py-8">No products found.</p>}
        {items.map((p) => {
          const prices = getDisplayPrice(p);
          return <MobileCard key={p.id} p={p} prices={prices} saving={saving} onSave={save} stockBadge={stockBadge} />;
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} total={allItems.length} onPage={setPage} />
    </div>
  );
}

function DesktopRow({ p, prices, saving, onSave, stockBadge }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <tr className="border-t border-border hover:bg-secondary/20">
      <td className="p-3 font-medium max-w-[200px] truncate">{p.name}</td>
      <td className="p-3">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${stockBadge(p.quantity_in_stock)}`}>
          {p.quantity_in_stock}
        </span>
      </td>
      <td className="p-3 tabular-nums font-medium">{p.qty_sold ?? 0}</td>
      <td className="p-3 tabular-nums">{prices.ngn}</td>
      <td className="p-3 tabular-nums">{prices.usd}</td>
      <td className="p-3">
        <span className={`text-xs font-medium ${p.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
          {p.is_active ? "Yes" : "No"}
        </span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <input ref={inputRef} defaultValue={p.quantity_in_stock} type="number" min={0} className="w-20 border border-border px-2 py-1 text-sm" />
          <button onClick={() => onSave(p, Number(inputRef.current?.value ?? p.quantity_in_stock))} disabled={saving === p.id} className="px-3 py-1.5 bg-onyx text-cream text-xs disabled:opacity-50 whitespace-nowrap">
            {saving === p.id ? "…" : "Save"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function MobileCard({ p, prices, saving, onSave, stockBadge }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="bg-background border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-sm leading-snug">{p.name}</p>
        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-secondary text-muted-foreground"}`}>
          {p.is_active ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-secondary/40 rounded p-2">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Remaining</p>
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${stockBadge(p.quantity_in_stock)}`}>{p.quantity_in_stock}</span>
        </div>
        <div className="bg-secondary/40 rounded p-2">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Qty Sold</p>
          <p className="text-sm font-bold tabular-nums">{p.qty_sold ?? 0}</p>
        </div>
        <div className="bg-secondary/40 rounded p-2">
          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Price</p>
          <p className="text-xs font-semibold tabular-nums">{prices.ngn}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <label className="text-xs text-muted-foreground whitespace-nowrap">Update stock:</label>
        <input ref={inputRef} defaultValue={p.quantity_in_stock} type="number" min={0} className="flex-1 border border-border px-2 py-1.5 text-sm" />
        <button onClick={() => onSave(p, Number(inputRef.current?.value ?? p.quantity_in_stock))} disabled={saving === p.id} className="px-4 py-1.5 bg-onyx text-cream text-xs disabled:opacity-50 whitespace-nowrap">
          {saving === p.id ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border border-border bg-secondary/20 px-4 py-3 gap-3">
      <p className="text-xs text-muted-foreground">{total} items · Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <button onClick={() => onPage(page - 1)} disabled={page <= 1} className="flex items-center gap-1 px-3 py-1.5 border border-border text-xs hover:border-gold hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const pg = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
          return (
            <button key={pg} onClick={() => onPage(pg)} className={`px-3 py-1.5 text-xs border transition-colors ${pg === page ? "bg-onyx text-cream border-onyx" : "border-border hover:border-gold hover:text-gold"}`}>{pg}</button>
          );
        })}
        <button onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="flex items-center gap-1 px-3 py-1.5 border border-border text-xs hover:border-gold hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
