import { useEffect, useState } from "react";
import { products as staticProducts, categories as staticCategories, type Product, type Category } from "./products";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function rowToProduct(r: any): Product {
  // Backend returns colors as [{color_name}], sizes as [{size_name}], gallery as [{image_url}]
  const colors = Array.isArray(r.colors)
    ? r.colors.map((c: any) => (typeof c === "string" ? c : c.color_name)).filter(Boolean)
    : [];
  const sizes = Array.isArray(r.sizes)
    ? r.sizes.map((s: any) => (typeof s === "string" ? s : s.size_name)).filter(Boolean)
    : [];
  const gallery = Array.isArray(r.gallery)
    ? r.gallery.map((g: any) => (typeof g === "string" ? g : g.image_url)).filter(Boolean)
    : [];

  const image = r.main_image_url || (gallery[0] ?? "");

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: (r.category_slug || r.category || null) as Category,
    price: Number(r.price),
    currency: r.currency || "₦",
    image,
    gallery: gallery.length ? gallery : [image].filter(Boolean),
    colors: colors.length ? colors : [],
    sizes: sizes.length ? sizes : ["S", "M", "L", "XL", "XXL"],
    description: r.description ?? "",
    fabric: r.fabric ?? "",
    badge: r.badge ?? undefined,
  };
}

export interface BackendCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  tagline?: string;
}

export function useCategories() {
  const [data, setData] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (!alive || !res.ok) return;
        const json = await res.json();
        if (!alive) return;
        const rows: BackendCategory[] = json?.data || [];
        if (rows.length) setData(rows);
      } catch {
        // silently fall through — caller can use staticCategories as fallback
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { categories: data, loading };
}

export function useProducts(filters?: { category?: string; search?: string }) {
  const [data, setData] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.category) params.append("category", filters.category);
        if (filters?.search) params.append("search", filters.search);
        const qs = params.toString();
        const res = await fetch(`${API_BASE}/api/products${qs ? `?${qs}` : ""}`);
        if (!alive) return;
        if (!res.ok) throw new Error("Failed to load products");
        const json = await res.json();
        if (!alive) return;
        const rows = json?.data || [];
        if (rows.length) setData(rows.map(rowToProduct));
      } catch (error) {
        console.error("Product fetch failed", error);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.category, filters?.search]);

  return { products: data, loading };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | undefined>(
    slug ? staticProducts.find((p) => p.slug === slug) : undefined,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(slug)}`);
        if (!alive) return;
        if (!res.ok) throw new Error("Failed to load product");
        const json = await res.json();
        if (!alive) return;
        setProduct(rowToProduct(json.data));
      } catch (error) {
        console.error("Product fetch failed", error);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  return { product, loading };
}
