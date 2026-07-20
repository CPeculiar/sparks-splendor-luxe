import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useProducts, useCategories } from "@/lib/db-products";
import type { Category } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

const SUIT_SUBS = [
  { key: "all",      label: "All Suits" },
  { key: "safari",   label: "Safari" },
  { key: "wedding",  label: "Wedding" },
  { key: "business", label: "Business" },
  { key: "dinner",   label: "Dinner" },
  { key: "prom",     label: "Prom" },
];

const SHOP_CATS = [
  { key: "suits",   label: "Suits" },
  { key: "natives", label: "Natives" },
  { key: "kaftan",  label: "Kaftan" },
  { key: "agbada",  label: "Agbada" },
  { key: "shirts",  label: "Shirts" },
  { key: "pants",   label: "Pants" },
  { key: "casuals", label: "Casuals" },
  { key: "ladies",  label: "Ladies" },
];

const ROWS_PER_LOAD = 3;
const COLS = 4;

interface ShopSearch {
  category?: string;
  sub?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
  size?: string;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    category: (s.category as string) ?? "all",
    sub: typeof s.sub === "string" ? s.sub : undefined,
    sort: (s.sort as ShopSearch["sort"]) ?? "featured",
    size: typeof s.size === "string" ? s.size : undefined,
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(800000);
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_LOAD);

  const isSuits = search.category === "suits";
  const activeSub = search.sub ?? "all";

  const categoryFilter = search.category && search.category !== "all" ? search.category : undefined;
  const { products, loading } = useProducts({ category: categoryFilter });
  const { categories: backendCats } = useCategories();

  // Reset rows on category or sub change
  useEffect(() => { setVisibleRows(ROWS_PER_LOAD); }, [search.category, search.sub]);

  const allShopCats = backendCats.length
    ? backendCats.map((c) => ({ key: c.slug as Category, label: c.name, tagline: c.description || "", image: c.image_url || "" }))
    : SHOP_CATS.map((c) => ({ ...c, tagline: "", image: "/gallery/img-46.jpg" }));

  const cat = SHOP_CATS.find((c) => c.key === search.category) || allShopCats.find((c) => c.key === search.category);
  const heroImage = allShopCats.find((c) => c.key === search.category)?.image || "/gallery/img-46.jpg";
  const heading = cat ? cat.label : "The Boutique";
  const tagline = allShopCats.find((c) => c.key === search.category)?.tagline || "Bespoke pieces, hand-finished in our atelier.";

  const filtered = useMemo(() => {
    let list = [...products];
    // Sub-category filter for suits
    if (isSuits && activeSub !== "all") {
      // Filter by sub_category field if present, otherwise distribute by index
      const hasSubField = list.some((p: any) => p.sub_category);
      if (hasSubField) {
        list = list.filter((p: any) => p.sub_category === activeSub);
      } else {
        const subIdx = SUIT_SUBS.findIndex((s) => s.key === activeSub) - 1; // -1 because index 0 is "all"
        list = list.filter((_, i) => i % (SUIT_SUBS.length - 1) === subIdx);
      }
    }
    if (search.size) list = list.filter((p) => p.sizes.includes(search.size!));
    list = list.filter((p) => p.price <= maxPrice);
    switch (search.sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "newest": list.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0)); break;
    }
    return list;
  }, [products, search.sort, search.size, maxPrice, isSuits, activeSub]);

  const maxVisible = visibleRows * COLS;
  const visible = isSuits ? filtered.slice(0, maxVisible) : filtered;
  const hasMore = isSuits && filtered.length > maxVisible;

  return (
    <>
      {/* hero */}
      <section className="relative h-[44vh] min-h-[320px] md:min-h-[420px] overflow-hidden">
        <img src={heroImage} alt={heading} className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-onyx/55" />
        <div className="relative z-10 h-full container-luxe flex flex-col items-center justify-center text-center text-cream">
          <p className="text-eyebrow text-gold">{cat ? "Maison" : "Shop All"}</p>
          <h1 className="font-serif-luxe text-4xl sm:text-5xl md:text-7xl mt-4">{heading}</h1>
          <p className="mt-3 text-cream/80 max-w-xl">{tagline}</p>
        </div>
      </section>

      {/* main category strip */}
      <div className="border-b border-border bg-background sticky top-16 md:top-20 z-30">
        <div className="container-luxe overflow-x-auto">
          <div className="flex items-center justify-center gap-1 md:gap-2 py-3 min-w-max">
            <CatPill label="All" active={!search.category || search.category === "all"} onClick={() => navigate({ search: { ...search, category: "all", sub: undefined } })} />
            {SHOP_CATS.map((c) => (
              <CatPill key={c.key} label={c.label} active={search.category === c.key} onClick={() => navigate({ search: { ...search, category: c.key, sub: undefined } })} />
            ))}
          </div>
        </div>
      </div>

      {/* suits sub-category strip */}
      {isSuits && (
        <div className="border-b border-border/60 bg-secondary/20">
          <div className="container-luxe overflow-x-auto">
            <div className="flex items-center justify-center gap-1 md:gap-2 py-2.5 min-w-max">
              {SUIT_SUBS.map((s) => (
                <CatPill
                  key={s.key}
                  label={s.label}
                  active={activeSub === s.key}
                  onClick={() => navigate({ search: { ...search, sub: s.key === "all" ? undefined : s.key } })}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="container-luxe py-10 md:py-14">
        {/* toolbar */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-medium border border-border px-4 py-2.5 hover:border-gold hover:text-gold-deep transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <p className="text-xs text-muted-foreground tracking-wider hidden sm:block">
            {loading ? "Loading…" : `${filtered.length} pieces`}
          </p>
          <select
            value={search.sort}
            onChange={(e) => navigate({ search: { ...search, sort: e.target.value as ShopSearch["sort"] } })}
            className="text-xs tracking-[0.2em] uppercase font-medium bg-transparent border border-border px-4 py-2.5 cursor-pointer hover:border-gold focus:outline-none focus:border-gold"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
            {visible.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl">No pieces match these filters.</p>
            <button onClick={() => { navigate({ search: { category: "all", sort: "featured" } }); setMaxPrice(800000); }} className="mt-4 text-gold-deep underline text-sm">Clear filters</button>
          </div>
        )}

        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleRows((r) => r + ROWS_PER_LOAD)}
              className="inline-flex items-center gap-3 border border-onyx text-onyx px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-onyx hover:text-cream transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </section>

      {/* filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-onyx/60" onClick={() => setFiltersOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-full sm:w-[400px] bg-background flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-display text-2xl">Refine</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-8 overflow-y-auto">
              <div>
                <h4 className="text-eyebrow mb-4">Category</h4>
                <div className="space-y-2">
                  {[{ key: "all", label: "All" }, ...SHOP_CATS].map((c) => (
                    <button
                      key={c.key}
                      onClick={() => navigate({ search: { ...search, category: c.key } })}
                      className={[
                        "block w-full text-left text-sm py-1.5 transition-colors",
                        search.category === c.key ? "text-gold-deep font-medium" : "hover:text-gold-deep",
                      ].join(" ")}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-eyebrow mb-4">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {["S","M","L","XL","XXL"].map((s) => (
                    <button
                      key={s}
                      onClick={() => navigate({ search: { ...search, size: search.size === s ? undefined : s } })}
                      className={[
                        "h-10 w-12 border text-sm transition-colors",
                        search.size === s ? "bg-onyx text-cream border-onyx" : "border-border hover:border-gold",
                      ].join(" ")}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-eyebrow mb-4">Max Price</h4>
                <input
                  type="range"
                  min={50000}
                  max={800000}
                  step={10000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[var(--gold)]"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2 tabular-nums">
                  <span>₦50,000</span>
                  <span className="text-foreground font-medium">Up to ₦{maxPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <footer className="mt-auto p-6 border-t border-border flex gap-3">
              <button
                onClick={() => { navigate({ search: { category: "all", sort: "featured" } }); setMaxPrice(800000); }}
                className="flex-1 border border-border py-3 text-xs tracking-[0.25em] uppercase hover:border-gold"
              >Reset</button>
              <button onClick={() => setFiltersOpen(false)} className="flex-1 bg-onyx text-cream py-3 text-xs tracking-[0.25em] uppercase hover:bg-gold hover:text-onyx transition-colors">Apply</button>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}

function CatPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-5 py-2 text-xs tracking-[0.25em] uppercase font-medium whitespace-nowrap transition-all duration-300 border-b-2",
        active ? "text-gold-deep border-gold" : "text-muted-foreground border-transparent hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
