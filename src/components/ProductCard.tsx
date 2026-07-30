import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/db-products";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { PriceDisplay } from "./PriceDisplay";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const { format } = useCurrency();
  const second = product.gallery[1] ?? product.image;

  // Determine which price to show based on currency
  const isComp = product.has_components && product.components && product.components.length > 0;
  const requiredNGN = isComp ? product.components!.filter(c => c.is_required).reduce((s, c) => s + c.price, 0) : 0;
  const requiredUSD = isComp ? product.components!.filter(c => c.is_required).reduce((s, c) => s + (c.price_usd ?? 0), 0) : 0;
  const currentPrice = isComp
    ? (product.display_currency === "USD" ? (requiredUSD || requiredNGN) : requiredNGN)
    : (product.display_currency === "USD" ? product.price_usd || product.price : product.price);
  const originalPrice = isComp ? undefined : (product.display_currency === "USD" ? product.original_price_usd : product.original_price);

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
          className="absolute bottom-3 right-3 w-10 h-10 md:w-11 md:h-11 rounded-full bg-cream/95 text-onyx flex items-center justify-center md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-500 hover:bg-gold shadow-md"
          aria-label="Add to bag"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </Link>
      <div className="pt-3 md:pt-4 flex flex-col items-start text-left">
        <p className="text-[10px] text-gold-deep tracking-[0.3em] uppercase">{product.category}</p>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="font-display text-base md:text-xl mt-1 leading-tight hover:text-gold-deep transition-colors line-clamp-2"
        >
          {product.name}
        </Link>
        <div className="text-sm mt-1">
          <PriceDisplay
            price={currentPrice}
            originalPrice={originalPrice}
            currency={product.currency_symbol}
          />
        </div>
      </div>
    </div>
  );
}
