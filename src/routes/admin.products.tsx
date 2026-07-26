import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { fetchAdminProducts, createProduct, updateProduct, deleteProduct, type AdminProduct } from "@/lib/admin";
import { useCategories } from "@/lib/db-products";
import { MediaSelector } from "@/components/MediaSelector";
import { MultiMediaSelector } from "@/components/MultiMediaSelector";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const [list, setList]       = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<AdminProduct> & { colors?: string[]; sizes?: string[] } | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const { categories }        = useCategories();

  async function load() {
    setLoading(true);
    try { setList(await fetchAdminProducts()); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function save(p: Partial<AdminProduct> & { colors?: string[]; sizes?: string[] }) {
    setError(null);
    try {
      const payload = {
        ...p,
        price: Number(p.price) || 0,
        quantity_in_stock: Number(p.quantity_in_stock) || 0,
      };
      if (p.id) await updateProduct(p.id, payload);
      else await createProduct(payload);
      setEditing(null);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
  }

  async function remove(p: AdminProduct) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await deleteProduct(p.id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Delete failed"); }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-eyebrow">Catalogue</p>
          <h1 className="font-display text-3xl md:text-4xl mt-1">Products</h1>
        </div>
        <button
          onClick={() => setEditing({ name: "", slug: "", price: 0, price_usd: 0, currency: "₦", quantity_in_stock: 0, is_active: true, is_featured: false, colors: [], sizes: ["S","M","L","XL","XXL"] })}
          className="inline-flex items-center gap-2 bg-onyx text-cream px-5 py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
        >
          <Plus className="h-4 w-4" /> New Product
        </button>
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              {["", "Name", "Category", "Price NGN", "Price USD", "Stock", "Active", ""].map((h) => (
                <th key={h} className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading…</td></tr>}
            {list.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-secondary/20">
                <td className="p-3">
                  {p.main_image_url
                    ? <img src={p.main_image_url} alt="" className="h-12 w-10 object-cover bg-muted" loading="lazy" />
                    : <div className="h-12 w-10 bg-muted" />
                  }
                </td>
                <td className="p-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.slug}</p>
                </td>
                <td className="p-3 text-xs capitalize">{p.category_slug || "—"}</td>
                <td className="p-3 tabular-nums text-xs">₦{Number(p.price).toLocaleString()}</td>
                <td className="p-3 tabular-nums text-xs">${Number(p.price_usd || 0).toLocaleString()}</td>
                <td className="p-3 tabular-nums text-xs">{p.quantity_in_stock}</td>
                <td className="p-3">
                  {p.is_active
                    ? <span className="text-emerald-600 text-xs font-medium">Yes</span>
                    : <span className="text-muted-foreground text-xs">No</span>
                  }
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing({ ...p, colors: [], sizes: [] })} className="p-2 hover:text-gold-deep" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(p)} className="p-2 hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm
          initial={editing}
          categories={categories}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

type FormProduct = Partial<AdminProduct> & { colors?: string[]; sizes?: string[]; gallery?: string[] };

function ProductForm({
  initial, categories, onCancel, onSave,
}: {
  initial: FormProduct;
  categories: { slug: string; name: string; id?: string }[];
  onCancel: () => void;
  onSave: (p: FormProduct) => void | Promise<void>;
}) {
  const [p, setP] = useState<FormProduct & { _colors: string; _sizes: string; _galleryList: string[] }>({
    ...initial,
    _colors:  Array.isArray(initial.colors) ? initial.colors.join(", ") : "",
    _sizes:   Array.isArray(initial.sizes)  ? initial.sizes.join(", ")  : "S, M, L, XL, XXL",
    _galleryList: Array.isArray(initial.gallery) ? initial.gallery : [],
  });
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (p.category_id) {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      fetch(`${API_BASE}/api/sub-categories/category/${p.category_id}`)
        .then((r) => r.ok ? r.json() : Promise.reject())
        .then((d) => setSubCategories(d.data || []))
        .catch(() => setSubCategories([]));
    } else {
      setSubCategories([]);
    }
  }, [p.category_id]);

  function set<K extends keyof typeof p>(k: K, v: any) {
    setP((c) => ({ ...c, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate both prices are provided
    if (!p.price || p.price <= 0) {
      setError("NGN price must be greater than 0");
      return;
    }
    if (!p.price_usd || p.price_usd <= 0) {
      setError("USD price must be greater than 0");
      return;
    }

    onSave({
      ...p,
      colors:  p._colors.split(",").map((s) => s.trim()).filter(Boolean),
      sizes:   p._sizes.split(",").map((s) => s.trim()).filter(Boolean),
      gallery: p._galleryList && p._galleryList.length > 0 ? p._galleryList : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onCancel}>
      <div className="absolute inset-0 bg-onyx/60" />
      <aside className="ml-auto relative h-full w-full sm:w-[600px] bg-background overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl">{p.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onCancel} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}
          <Row label="Name"><input value={p.name ?? ""} onChange={(e) => set("name", e.target.value)} required className="inp" /></Row>
          <Row label="Slug"><input value={p.slug ?? ""} onChange={(e) => set("slug", e.target.value)} required className="inp" placeholder="e.g. the-monarch-fit" /></Row>

          <div className="grid grid-cols-2 gap-4">
            <Row label="Category">
              <select value={p.category_id ?? ""} onChange={(e) => set("category_id", e.target.value)} className="inp">
                <option value="">— none —</option>
                {categories.map((c) => <option key={c.slug} value={(c as any).id || c.slug}>{c.name}</option>)}
              </select>
            </Row>
            <Row label="Sub-Category">
              <select value={(p as any).sub_category ?? ""} onChange={(e) => set("sub_category" as any, e.target.value || null)} className="inp">
                <option value="">— none —</option>
                {subCategories.length > 0 ? (
                  subCategories.map((sc) => (
                    <option key={sc.id} value={sc.slug}>{sc.name}</option>
                  ))
                ) : (
                  <option disabled>No sub-categories for this category</option>
                )}
              </select>
            </Row>
          </div>

          <Row label="Badge">
            <select value={p.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)} className="inp">
              <option value="">— none —</option>
              <option value="New">New</option>
              <option value="Bestseller">Bestseller</option>
              <option value="Limited">Limited</option>
            </select>
          </Row>

          <div className="grid grid-cols-3 gap-4">
            <Row label="Price NGN (₦)"><input type="number" step="0.01" value={p.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} required className="inp" /></Row>
            <Row label="Price USD ($)"><input type="number" step="0.01" value={p.price_usd ?? 0} onChange={(e) => set("price_usd", Number(e.target.value))} required className="inp" /></Row>
            <Row label="Stock"><input type="number" value={p.quantity_in_stock ?? 0} onChange={(e) => set("quantity_in_stock", Number(e.target.value))} className="inp" /></Row>
          </div>

          <div className="bg-secondary/20 p-3 rounded border border-secondary/50 text-xs text-muted-foreground">
            <p className="font-semibold mb-2">💰 Price Slash Effect (Optional)</p>
            <p>Leave blank to show regular prices. Fill these to show original price struck-out with sale price.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Row label="Original Price NGN (struck-out)"><input type="number" step="0.01" value={(p as any).original_price ?? ""} onChange={(e) => set("original_price" as any, e.target.value ? Number(e.target.value) : null)} className="inp" placeholder="e.g. 500000" /></Row>
            <Row label="Original Price USD (struck-out)"><input type="number" step="0.01" value={(p as any).original_price_usd ?? ""} onChange={(e) => set("original_price_usd" as any, e.target.value ? Number(e.target.value) : null)} className="inp" placeholder="e.g. 500" /></Row>
          </div>

          <MediaSelector
            label="Main Image"
            onSelect={(url) => set("main_image_url", url)}
            value={p.main_image_url}
          />
          <Row label="Main Image URL"><input value={p.main_image_url ?? ""} onChange={(e) => set("main_image_url", e.target.value)} className="inp" placeholder="https://res.cloudinary.com/..." /></Row>
          <GallerySelector
            gallery={p._galleryList || []}
            onChange={(list) => setP((c) => ({ ...c, _galleryList: list }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Row label="Colors (comma-sep)"><input value={p._colors} onChange={(e) => set("_colors", e.target.value)} className="inp" placeholder="Onyx, Ivory, Gold" /></Row>
            <Row label="Sizes (comma-sep)"><input value={p._sizes} onChange={(e) => set("_sizes", e.target.value)} className="inp" placeholder="S, M, L, XL, XXL" /></Row>
          </div>

          <Row label="Fabric"><input value={p.fabric ?? ""} onChange={(e) => set("fabric", e.target.value)} className="inp" /></Row>
          <Row label="Description"><textarea value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={4} className="inp" /></Row>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={p.is_active ?? true} onChange={(e) => set("is_active", e.target.checked)} />
              Active (visible on site)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={p.is_featured ?? false} onChange={(e) => set("is_featured", e.target.checked)} />
              Featured
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 border border-border py-3 text-xs tracking-[0.25em] uppercase hover:border-gold">Cancel</button>
            <button type="submit" className="flex-1 bg-onyx text-cream py-3 text-xs tracking-[0.25em] uppercase hover:bg-gold hover:text-onyx transition-colors">Save</button>
          </div>
        </form>
        <style>{`.inp{width:100%;padding:.6rem .75rem;border:1px solid var(--border);background:#fff;color:#111;font-size:.875rem;outline:none;border-radius:0}.inp:focus{border-color:var(--gold)}.inp option{background:#fff;color:#111}`}</style>
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function GallerySelector({ gallery, onChange }: { gallery: string[]; onChange: (urls: string[]) => void }) {
  const [showMulti, setShowMulti] = useState(false);

  function removeImage(url: string) {
    onChange(gallery.filter((u) => u !== url));
  }

  function handleMultiSelect(urls: string[]) {
    const merged = Array.from(new Set([...gallery, ...urls]));
    onChange(merged);
  }

  return (
    <div className="space-y-2">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Gallery Images</label>

      {gallery.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {gallery.map((url) => (
            <div key={url} className="relative w-20 h-20 rounded border border-border overflow-hidden bg-muted">
              <img src={url} alt="Gallery" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-destructive text-white p-0.5 rounded hover:bg-destructive/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowMulti(true)}
        className="flex items-center justify-center gap-2 w-full bg-secondary/30 border border-border px-4 py-3 text-xs uppercase tracking-[0.25em] hover:border-gold hover:text-gold transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Gallery Images ({gallery.length} selected)
      </button>

      {showMulti && (
        <MultiMediaSelector
          label="Select Gallery Images"
          selectedValues={gallery}
          onSelect={handleMultiSelect}
          onClose={() => setShowMulti(false)}
        />
      )}
    </div>
  );
}
