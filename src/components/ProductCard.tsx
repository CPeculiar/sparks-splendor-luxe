import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const { format } = useCurrency();
  const second = product.gallery[1] ?? product.image;

  return (
    <div className="group relative">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block overflow-hidden bg-muted aspect-[4/5] relative"
      >
        <img
          src={product.image}
          alt={product.name}
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-0"
        />
        <img
          src={second}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-all duration-700 group-hover:opacity-100"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-onyx text-cream text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 font-medium">
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); add(product); }}
          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-cream/95 text-onyx flex items-center justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-gold"
          aria-label="Add to bag"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </Link>
      <div className="pt-4 flex flex-col items-start text-left">
        <p className="text-[10px] text-gold-deep tracking-[0.3em] uppercase">{product.category}</p>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="font-display text-lg md:text-xl mt-1 leading-tight hover:text-gold-deep transition-colors"
        >
          {product.name}
        </Link>
        <p className="text-sm mt-1 tabular-nums">
          {product.currency_symbol}
          {Math.round(product.display_price).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
