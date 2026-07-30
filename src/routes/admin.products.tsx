import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";
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
  const [editing, setEditing] = useState<Partial<AdminProduct> & { colors?: string[]; sizes?: string[]; gallery?: string[] } | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { categories }        = useCategories();

  // Pagination + filter state
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus]     = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState("");
  const [filterSearch, setFilterSearch]     = useState("");
  const [searchInput, setSearchInput]       = useState("");

  // Debounced search: fire load whenever searchInput changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterSearch(searchInput);
      setPage(1);
      void load(1, filterCategory, filterStatus, filterSubCategory, searchInput);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  async function load(p = page, cat = filterCategory, status = filterStatus, subCat = filterSubCategory, search = filterSearch) {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 10 };
      if (cat) params.category = cat;
      if (subCat) params.sub_category = subCat;
      if (status !== "") params.is_active = status === "active";
      if (search) params.search = search;
      const res = await fetchAdminProducts(params);
      setList(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
      setSelectedProducts(new Set()); // Clear selections on load
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    void load(newPage, filterCategory, filterStatus, filterSubCategory, filterSearch);
  }

  function handleCategoryFilter(val: string) {
    setFilterCategory(val);
    setFilterSubCategory(""); // Reset sub-category when changing category
    setPage(1);
    void load(1, val, filterStatus, "", filterSearch);
  }

  function handleStatusFilter(val: string) {
    setFilterStatus(val);
    setPage(1);
    void load(1, filterCategory, val, filterSubCategory, filterSearch);
  }

  function handleSubCategoryFilter(val: string) {
    setFilterSubCategory(val);
    setPage(1);
    void load(1, filterCategory, filterStatus, val, filterSearch);
  }

  function toggleSelectProduct(productId: string) {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  }

  function toggleSelectAll() {
    if (selectedProducts.size === list.length && list.length > 0) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(list.map(p => p.id)));
    }
  }

  async function deleteSelected() {
    try {
      for (const id of Array.from(selectedProducts)) {
        await deleteProduct(id);
      }
      setSelectedProducts(new Set());
      setShowDeleteConfirm(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function save(p: Partial<AdminProduct> & { colors?: string[]; sizes?: string[]; components?: any[] }) {
    setError(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    try {
      const payload = {
        ...p,
        price: Number(p.price) || 0,
        quantity_in_stock: Math.round(Number(p.quantity_in_stock) ?? 0),
      };
      let savedId: string;
      if (p.id) {
        await updateProduct(p.id, payload);
        savedId = p.id;
      } else {
        const created = await createProduct(payload);
        savedId = (created as any).id;
      }
      // Save components if has_components is set
      if ((p as any).has_components && savedId && Array.isArray(p.components)) {
        const { getAuthToken } = await import("@/lib/auth");
        await fetch(`${API_BASE}/api/products/${savedId}/components`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
          body: JSON.stringify({ components: p.components }),
        });
      }
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
      {/* Loading Spinner - Professional Full-page */}
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-gold animate-spin" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Loading products...</p>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
        <div>
          <p className="text-eyebrow">Catalogue</p>
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl mt-1">Products</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedProducts.size > 1 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 bg-destructive text-cream px-4 md:px-5 py-2 md:py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-destructive/80 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete ({selectedProducts.size})
            </button>
          )}
          <button
            onClick={() => setEditing({ name: "", slug: "", price: 0, price_usd: 0, currency: "₦", quantity_in_stock: 0, is_active: true, is_featured: false, colors: [], sizes: [], gallery: [] })}
            className="inline-flex items-center gap-2 bg-onyx text-cream px-4 md:px-5 py-2 md:py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
          >
            <Plus className="h-4 w-4" /> New Product
          </button>
        </div>
      </header>

      {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}

      {/* Filters - Mobile responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-secondary/20 border border-border p-3 md:p-4">
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Category</label>
          <select value={filterCategory} onChange={(e) => handleCategoryFilter(e.target.value)} className="w-full border border-border bg-background px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={(c as any).id || c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Sub-Category</label>
          <select value={filterSubCategory} onChange={(e) => handleSubCategoryFilter(e.target.value)} className="w-full border border-border bg-background px-3 py-2 text-sm">
            <option value="">All Sub-Categories</option>
            {/* Extract unique sub-categories from current list for now */}
            {Array.from(new Set(list.map(p => (p as any).sub_category).filter(Boolean))).map((sc) => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Status</label>
          <select value={filterStatus} onChange={(e) => handleStatusFilter(e.target.value)} className="w-full border border-border bg-background px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Search</label>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name..."
            className="w-full border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="text-xs text-muted-foreground self-end pb-2 sm:col-span-2 lg:col-span-1">
          {total} product{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Empty state */}
      {!loading && list.length === 0 && (
        <div className="border border-border bg-secondary/10 rounded p-8 md:p-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">No products available.</p>
          <button
            onClick={() => setEditing({ name: "", slug: "", price: 0, price_usd: 0, currency: "₦", quantity_in_stock: 0, is_active: true, is_featured: false, colors: [], sizes: [], gallery: [] })}
            className="inline-flex items-center gap-2 bg-onyx text-cream px-5 py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
          >
            <Plus className="h-4 w-4" /> Add New Product
          </button>
        </div>
      )}

      {/* Table - Mobile scroll enabled */}
      {!loading && list.length > 0 && (
        <>
          <div className="bg-background border border-border overflow-x-auto rounded -mx-0">
            <table className="min-w-[750px] w-full text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground w-10">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === list.length && list.length > 0}
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground w-16 md:w-24"></th>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground min-w-[160px]">Name</th>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Category</th>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Sub-Category</th>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Price NGN</th>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Price USD</th>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Stock</th>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Active</th>
                  <th className="p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-t border-border hover:bg-secondary/20">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(p.id)}
                        onChange={() => toggleSelectProduct(p.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      {p.main_image_url
                        ? <img src={p.main_image_url} alt="" className="h-12 w-10 md:h-16 md:w-14 object-cover bg-muted rounded" loading="lazy" />
                        : <div className="h-12 w-10 md:h-16 md:w-14 bg-muted rounded" />
                      }
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-xs md:text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.slug}</p>
                    </td>
                    <td className="p-3 text-xs capitalize">{p.category_slug || "—"}</td>
                    <td className="p-3 text-xs capitalize">{(p as any).sub_category || "—"}</td>
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
                      <button
                        onClick={async () => {
                          const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
                          let components: any[] = [];
                          if ((p as any).has_components) {
                            try {
                              const r = await fetch(`${API_BASE}/api/products/${p.id}/components`);
                              const d = await r.json();
                              components = d.data || [];
                            } catch {}
                          }
                          setEditing({
                            ...p,
                            colors: Array.isArray((p as any).colors) ? (p as any).colors : [],
                            sizes: [],
                            gallery: Array.isArray(p.gallery)
                              ? p.gallery.map((g: any) => typeof g === "string" ? g : g?.image_url ?? g)
                              : [],
                            components,
                          } as any);
                        }}
                        className="p-2 hover:text-gold transition-colors" aria-label="Edit"
                      ><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => { setSelectedProducts(new Set([p.id])); setShowDeleteConfirm(true); }} className="p-2 hover:text-destructive transition-colors" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border border-border bg-secondary/20 px-4 py-3 gap-3">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border text-xs hover:border-gold hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pg = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => handlePageChange(pg)}
                      className={`px-3 py-1.5 text-xs border transition-colors flex-shrink-0 ${
                        pg === page ? "bg-onyx text-cream border-onyx" : "border-border hover:border-gold hover:text-gold"
                      }`}
                    >{pg}</button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border text-xs hover:border-gold hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/60">
          <div className="bg-background border border-border rounded p-6 md:p-8 max-w-md w-full mx-4">
            <h3 className="font-display text-xl md:text-2xl mb-2">Confirm Delete</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedProducts.size === 1 
                ? `Are you sure you want to delete this product? This action cannot be undone.`
                : `Are you sure you want to delete ${selectedProducts.size} products? This action cannot be undone.`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-border py-2 md:py-3 text-xs tracking-[0.25em] uppercase hover:border-gold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                className="flex-1 bg-destructive text-white py-2 md:py-3 text-xs tracking-[0.25em] uppercase hover:bg-destructive/80 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
  const [p, setP] = useState<FormProduct & { _colors: string; _sizes: string; _galleryList: string[]; _components: any[] }>({
    ...initial,
    _colors:  Array.isArray(initial.colors) ? initial.colors.join(", ") : "",
    _sizes:   Array.isArray(initial.sizes)  ? initial.sizes.join(", ")  : "S, M, L, XL, XXL",
    _galleryList: Array.isArray(initial.gallery)
      ? initial.gallery.map((g: any) => typeof g === "string" ? g : g?.image_url ?? "").filter(Boolean)
      : [],
    _components: (initial as any).components ?? [],
  });
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (p.name && !initial.id) { // Only auto-generate for new products
      const slug = p.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setP((c) => ({ ...c, slug }));
    }
  }, [p.name, initial.id]);

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

    const isComp = !!(p as any).has_components;
    if (!isComp && (!p.price || p.price <= 0)) {
      setError("NGN price must be greater than 0");
      return;
    }
    if (!isComp && (!p.price_usd || p.price_usd <= 0)) {
      setError("USD price must be greater than 0");
      return;
    }

    setSaving(true);
    const result = onSave({
      ...p,
      colors:  p._colors.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: [],
      quantity_in_stock: Math.round(Number(p.quantity_in_stock) ?? 0),
      gallery: p._galleryList && p._galleryList.length > 0 ? p._galleryList : undefined,
      components: p._components,
    } as any);
    // If onSave returns a promise, clear saving when it resolves
    if (result && typeof (result as any).finally === "function") {
      (result as Promise<void>).finally(() => setSaving(false));
    } else {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onCancel}>
      <div className="absolute inset-0 bg-onyx/60" />
      <aside className="ml-auto relative h-full w-full sm:w-[600px] bg-background overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="font-display text-xl md:text-2xl">{p.id ? "Edit Product" : "New Product"}</h2>
          <button onClick={onCancel} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {error && <p className="text-sm text-destructive bg-destructive/10 p-3">{error}</p>}
          
          <Row label="Name">
            <input value={p.name ?? ""} onChange={(e) => set("name", e.target.value)} required className="inp" placeholder="e.g. The Power Set" />
          </Row>
          
          <Row label="Slug (auto-generated, editable)">
            <input value={p.slug ?? ""} onChange={(e) => set("slug", e.target.value)} required className="inp" placeholder="e.g. the-power-set" />
            <p className="text-xs text-muted-foreground mt-1">Auto-generated from name. Edit if needed.</p>
          </Row>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <option disabled>No sub-categories</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Row label={`Price NGN (₦)${(p as any).has_components ? " (optional)" : ""}`}><input type="number" step="0.01" value={p.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} required={!(p as any).has_components} className="inp" /></Row>
            <Row label={`Price USD ($)${(p as any).has_components ? " (optional)" : ""}`}><input type="number" step="0.01" value={p.price_usd ?? 0} onChange={(e) => set("price_usd", Number(e.target.value))} required={!(p as any).has_components} className="inp" /></Row>
            <Row label="Stock"><input type="number" value={p.quantity_in_stock ?? 0} onChange={(e) => set("quantity_in_stock", Number(e.target.value))} className="inp" /></Row>
          </div>

          <div className="bg-secondary/20 p-3 rounded border border-secondary/50 text-xs text-muted-foreground">
            <p className="font-semibold mb-2">💰 Price Slash Effect (Optional)</p>
            <p>Leave blank to show regular prices. Fill these to show original price struck-out with sale price.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Row label="Original Price NGN (struck-out)"><input type="number" step="0.01" value={(p as any).original_price ?? ""} onChange={(e) => set("original_price" as any, e.target.value ? Number(e.target.value) : null)} className="inp" placeholder="e.g. 500000" /></Row>
            <Row label="Original Price USD (struck-out)"><input type="number" step="0.01" value={(p as any).original_price_usd ?? ""} onChange={(e) => set("original_price_usd" as any, e.target.value ? Number(e.target.value) : null)} className="inp" placeholder="e.g. 500" /></Row>
          </div>

          <MediaSelector
            label="Main Image"
            onSelect={(url) => set("main_image_url", url)}
            value={p.main_image_url ?? undefined}
          />
          <Row label="Main Image URL"><input value={p.main_image_url ?? ""} onChange={(e) => set("main_image_url", e.target.value)} className="inp" placeholder="https://res.cloudinary.com/..." /></Row>
          <GallerySelector
            gallery={p._galleryList || []}
            onChange={(list) => setP((c) => ({ ...c, _galleryList: list }))}
          />

          <div className="grid grid-cols-1 gap-4">
            <Row label="Colors (comma-sep)"><input value={p._colors} onChange={(e) => set("_colors", e.target.value)} className="inp" placeholder="Onyx, Ivory, Gold" /></Row>
            {/* Sizes field commented out - all wears are bespoke
            <Row label="Sizes (comma-sep)"><input value={p._sizes} onChange={(e) => set("_sizes", e.target.value)} className="inp" placeholder="S, M, L, XL, XXL" /></Row>
            */}
          </div>

          {/* Fabric field commented out
          <Row label="Fabric"><input value={p.fabric ?? ""} onChange={(e) => set("fabric", e.target.value)} className="inp" /></Row>
          */}
          
          <Row label="Description"><textarea value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} className="inp" /></Row>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={p.is_active ?? true} onChange={(e) => set("is_active", e.target.checked)} />
              Active (visible on site)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={p.is_featured ?? false} onChange={(e) => set("is_featured", e.target.checked)} />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={(p as any).has_components ?? false} onChange={(e) => set("has_components" as any, e.target.checked)} />
              Component Pricing
            </label>
          </div>

          {(p as any).has_components && (
            <ComponentEditor
              productId={p.id}
              components={(p as any)._components ?? []}
              onChange={(list) => setP((c) => ({ ...c, _components: list }))}
            />
          )}

          <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
            <button type="button" onClick={onCancel} className="flex-1 border border-border py-2 md:py-3 text-xs tracking-[0.25em] uppercase hover:border-gold transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-onyx text-cream py-2 md:py-3 text-xs tracking-[0.25em] uppercase hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save"}
            </button>
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

function ComponentEditor({ productId, components, onChange }: {
  productId?: string;
  components: { name: string; price: number; price_usd?: number; is_required?: boolean }[];
  onChange: (list: { name: string; price: number; price_usd?: number; is_required?: boolean }[]) => void;
}) {
  function add() {
    onChange([...components, { name: "", price: 0, price_usd: 0, is_required: false }]);
  }
  function remove(i: number) {
    onChange(components.filter((_, idx) => idx !== i));
  }
  function update(i: number, field: string, value: any) {
    const next = components.map((c, idx) => idx === i ? { ...c, [field]: value } : c);
    onChange(next);
  }

  return (
    <div className="border border-gold/30 bg-gold/5 p-4 rounded space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Component Pricing</p>
          <p className="text-xs text-muted-foreground mt-0.5">Each component adds to the total price as the customer selects it.</p>
        </div>
        <button type="button" onClick={add} className="inline-flex items-center gap-1 text-xs border border-border px-3 py-1.5 hover:border-gold hover:text-gold transition-colors">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>
      {components.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No components yet. Add at least one.</p>
      )}
      {components.map((c, i) => (
        <div key={i} className="grid grid-cols-[1fr_100px_80px_auto_auto] gap-2 items-center">
          <input
            value={c.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="e.g. Suit & Pants"
            className="inp text-xs"
          />
          <input
            type="number"
            value={c.price}
            onChange={(e) => update(i, "price", Number(e.target.value))}
            placeholder="NGN"
            className="inp text-xs"
          />
          <input
            type="number"
            value={c.price_usd ?? ""}
            onChange={(e) => update(i, "price_usd", e.target.value ? Number(e.target.value) : 0)}
            placeholder="USD"
            className="inp text-xs"
          />
          <label className="flex items-center gap-1 text-xs whitespace-nowrap cursor-pointer">
            <input type="checkbox" checked={c.is_required ?? false} onChange={(e) => update(i, "is_required", e.target.checked)} />
            Req
          </label>
          <button type="button" onClick={() => remove(i)} className="p-1 hover:text-destructive transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {components.length > 0 && (
        <p className="text-[10px] text-muted-foreground">Columns: Name · Price NGN · Price USD · Required</p>
      )}
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
          {gallery.map((url, index) => (
            <div key={url || `gallery-${index}`} className="relative w-16 h-16 md:w-20 md:h-20 rounded border border-border overflow-hidden bg-muted flex-shrink-0">
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
        className="flex items-center justify-center gap-2 w-full bg-secondary/30 border border-border px-3 md:px-4 py-2 md:py-3 text-xs uppercase tracking-[0.25em] hover:border-gold hover:text-gold transition-colors"
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
