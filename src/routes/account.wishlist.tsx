import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { getAuthToken } from "@/lib/auth";
import { ProductCard } from "@/components/ProductCard";
import { useCurrency } from "@/lib/currency";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const Route = createFileRoute("/account/wishlist")({
  component: WishlistPage,
});

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  price_usd?: number;
  display_price?: number;
  currency_symbol?: string;
  image: string;
  [key: string]: any;
}

function WishlistPage() {
  const { format } = useCurrency();
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/wishlists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWishlist(data.data || []);
    } catch (e) {
      console.error("Failed to fetch wishlist:", e);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE}/api/wishlists/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(wishlist.filter((p) => p.id !== productId));
    } catch (e) {
      console.error("Failed to remove from wishlist:", e);
    }
  };

  return (
    <div className="container-luxe py-10 md:py-16">
      <div className="text-center mb-10 md:mb-14">
        <p className="text-eyebrow flex items-center justify-center gap-2">
          <Heart className="h-4 w-4" /> Saved Items
        </p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">My Wishlist</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-muted animate-pulse" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="font-display text-2xl mb-4">Your wishlist is empty</p>
          <p className="text-muted-foreground mb-6">
            Start adding pieces you love to your wishlist!
          </p>
          <Link
            to="/shop"
            className="inline-flex bg-onyx text-cream px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
          >
            Explore the Boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
          {wishlist.map((product) => (
            <div key={product.id} className="group relative">
              <Link
                to="/product/$slug"
                params={{ slug: product.slug }}
                className="block aspect-[4/5] overflow-hidden bg-muted mb-3"
              >
                <img
                  src={product.image || product.main_image_url}
                  alt={product.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <Link
                to="/product/$slug"
                params={{ slug: product.slug }}
                className="block font-display text-sm leading-tight hover:text-gold-deep transition-colors"
              >
                {product.name}
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                {product.currency_symbol || "₦"}
                {product.display_price !== undefined
                  ? Math.round(product.display_price).toLocaleString()
                  : Math.round(product.price).toLocaleString()
                }
              </p>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="mt-3 w-full flex items-center justify-center gap-2 border border-border text-xs tracking-[0.2em] uppercase py-2 hover:border-destructive hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
