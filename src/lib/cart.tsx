import {
  createContext, useCallback, useContext, useEffect,
  useMemo, useRef, useState, type ReactNode
} from "react";
import type { Product, ProductComponent } from "./products";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string | null;
  color?: string | null;
  overridePrice?: number;          // used for component-based pricing
  selectedComponents?: ProductComponent[]; // which components were selected
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, opts?: { size?: string; color?: string; quantity?: number; overridePrice?: number; selectedComponents?: ProductComponent[] }) => void;
  remove: (id: string, size: string, color: string) => void;
  update: (id: string, size: string, color: string, q: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ss-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((p: Product, opts: { size?: string; color?: string; quantity?: number; overridePrice?: number; selectedComponents?: ProductComponent[] } = {}) => {
    const size = opts.size ?? p.sizes[1] ?? p.sizes[0];
    const color = opts.color ?? p.colors[0];
    const qty = opts.quantity ?? 1;
    setItems((curr) => {
      const idx = curr.findIndex((i) => i.product.id === p.id && i.size === size && i.color === color);
      if (idx >= 0) {
        const next = [...curr];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...curr, { product: p, quantity: qty, size, color, overridePrice: opts.overridePrice, selectedComponents: opts.selectedComponents }];
    });
    setOpen(true);
  }, []);

  const remove = useCallback((id: string, size: string, color: string) =>
    setItems((curr) => curr.filter((i) => !(i.product.id === id && i.size === size && i.color === color))),
  []);

  const update = useCallback((id: string, size: string, color: string, q: number) =>
    setItems((curr) =>
      curr
        .map((i) => i.product.id === id && i.size === size && i.color === color ? { ...i, quantity: Math.max(1, q) } : i)
        .filter((i) => i.quantity > 0)
    ),
  []);

  const clear = useCallback(() => setItems([]), []);

  // ✅ Memoize derived values
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.quantity * (i.overridePrice ?? i.product.price), 0), [items]);

  // ✅ Memoize the entire context value so consumers don't re-render unless something actually changed
  const value = useMemo<CartCtx>(
    () => ({ items, open, setOpen, count, subtotal, add, remove, update, clear }),
    [items, open, count, subtotal, add, remove, update, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}