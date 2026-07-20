import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useEffect } from "react";

export function CartDrawer() {
  const { open, setOpen, items, update, remove, subtotal, count } = useCart();
  const { format } = useCurrency();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-onyx/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[440px] bg-background flex flex-col shadow-2xl">
        <header className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="text-eyebrow">Your Selection</p>
            <h3 className="font-display text-2xl mt-1">Shopping Bag <span className="text-muted-foreground text-base">({count})</span></h3>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 hover:text-gold transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
              <span className="text-2xl text-gold">✦</span>
            </div>
            <p className="font-display text-xl">Your bag awaits</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">Discover our newest pieces of bespoke craftsmanship.</p>
            <Link
              to="/shop"
              onClick={() => setOpen(false)}
              className="mt-6 bg-onyx text-cream px-7 py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border">
              {items.map((it) => (
                <div key={`${it.product.id}-${it.size}-${it.color}`} className="flex gap-4 py-5">
                  <Link
                    to="/product/$slug"
                    params={{ slug: it.product.slug }}
                    onClick={() => setOpen(false)}
                    className="block w-20 h-24 bg-muted overflow-hidden shrink-0"
                  >
                    <img src={it.product.image} alt={it.product.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <Link
                        to="/product/$slug"
                        params={{ slug: it.product.slug }}
                        onClick={() => setOpen(false)}
                        className="font-display text-base leading-tight hover:text-gold-deep"
                      >
                        {it.product.name}
                      </Link>
                      <button
                        onClick={() => remove(it.product.id, it.size || "", it.color || "")}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Size {it.size} · {it.color}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => update(it.product.id, it.size || "", it.color || "", it.quantity - 1)}
                          className="px-2 py-1 hover:bg-muted"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm tabular-nums">{it.quantity}</span>
                        <button
                          onClick={() => update(it.product.id, it.size || "", it.color || "", it.quantity + 1)}
                          className="px-2 py-1 hover:bg-muted"
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {format(it.product.price * it.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-border px-6 py-5 space-y-3 bg-secondary/40">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-gold-deep">Calculated at checkout</span>
              </div>
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="block w-full bg-onyx text-cream text-center px-6 py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
              >
                Proceed to Checkout
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="block w-full text-center py-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
              >
                Continue Shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
