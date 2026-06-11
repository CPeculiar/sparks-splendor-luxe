import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Minus, Plus, Trash2, CheckCircle2, ShieldCheck, Lock, Truck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { getAuthToken, getCurrentUser, isAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

const PAYSTACK_KEY =
  (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined) ||
  "pk_test_3e9dfebb9d05ad47e9588e382ba8a090ba5176df";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        metadata?: unknown;
        callback: (res: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

function loadPaystack(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("ssr"));
    if (window.PaystackPop) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[data-paystack="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script-error")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.dataset.paystack = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script-error"));
    document.head.appendChild(s);
  });
}

const WHATSAPP_PHONE = "2348137037919";

function CartPage() {
  const { items, subtotal, update, remove, count, clear } = useCart();
  const { format, code, rate } = useCurrency();
  const navigate = Route.useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    ref: string;
    total: number;
    orderNumber?: string;
    items?: { product_name: string; quantity: number; unit_price: number; size?: string; color?: string }[];
    customerName?: string;
  } | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setEmail(user.email);
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
    } else if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      navigate({ to: "/account" });
      return;
    }
    loadPaystack().catch(() => {});
  }, []);

  const shippingFree = subtotal >= 500_000;
  const shipping = items.length === 0 ? 0 : shippingFree ? 0 : 15_000;
  const total = subtotal + shipping;

  const handleOrderSuccess = async (reference: string) => {
    const token = getAuthToken();
    const orderItems = items.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      color: item.color || null,
      size: item.size || null,
    }));
    const payload = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      street_address: streetAddress || "Not provided",
      city: city || "Not provided",
      state: state || null,
      postal_code: postalCode || null,
      country: country || "Not provided",
      notes: notes || null,
      paystack_reference: reference,
      currency: code,
      items: orderItems,
    };

    let orderNumber: string | undefined;
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      orderNumber = data?.data?.order_number;
    } catch (err) {
      console.error("Failed to save order to backend", err);
    }

    setSuccess({
      ref: reference,
      total,
      orderNumber,
      items: orderItems,
      customerName: `${firstName} ${lastName}`.trim() || email,
    });
    clear();
  };

  const handlePay = async () => {
    setError(null);
    if (!isAuthenticated()) {
      setError("You must be signed in to checkout. Please sign in from your account page.");
      return;
    }

    const value = (emailRef.current?.value || email).trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    if (items.length === 0) {
      setError("Your bag is empty.");
      return;
    }

    setPaying(true);
    try {
      await loadPaystack();
      if (!window.PaystackPop) throw new Error("Paystack failed to load.");
      const isUSD = code === "USD";
      const chargeAmount = isUSD
        ? Math.round((total / rate) * 100)
        : Math.round(total * 100);
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: value,
        amount: chargeAmount,
        currency: isUSD ? "USD" : "NGN",
        ref: `SS-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Items",
              variable_name: "items",
              value: items
                .map((i) => `${i.product.name} x${i.quantity} (${i.size || "-"}/${i.color || "-"})`)
                .join(" | "),
            },
          ],
        },
        callback: (res) => {
          setPaying(false);
          void handleOrderSuccess(res.reference);
        },
        onClose: () => {
          setPaying(false);
        },
      });
      handler.openIframe();
    } catch (e) {
      setPaying(false);
      setError(e instanceof Error ? e.message : "Payment could not be initiated.");
    }
  };

  if (success) {
    const waMsg = encodeURIComponent(
      `Hello Sparks & Splendour! I just placed order ${success.orderNumber || success.ref}. I'd like to follow up on my order.`
    );
    return (
      <section className="container-luxe py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gold/15 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-gold-deep" />
            </div>
            <p className="text-eyebrow mt-6 text-gold">Order Confirmed</p>
            <h1 className="font-serif-luxe text-4xl md:text-5xl mt-3">Thank You{success.customerName ? `, ${success.customerName.split(" ")[0]}` : ""}!</h1>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your payment was successful and your order has been received. We appreciate your trust in Sparks &amp; Splendour — our team will reach out to you shortly to confirm your bespoke order details.
            </p>
          </div>

          {/* Order summary card */}
          <div className="mt-10 border border-border bg-secondary/20">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Order Number</p>
                <p className="font-mono font-bold text-lg mt-0.5">{success.orderNumber || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Payment Reference</p>
                <p className="font-mono text-xs mt-0.5 text-muted-foreground">{success.ref}</p>
              </div>
            </div>

            {/* Items */}
            {success.items && success.items.length > 0 && (
              <div className="divide-y divide-border">
                {success.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}
                      </p>
                    </div>
                    <span className="tabular-nums text-sm font-medium">{format(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-5 border-t border-border flex justify-between items-center">
              <span className="font-medium">Total Paid</span>
              <span className="font-display text-xl tabular-nums text-gold-deep">{format(success.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#1ebe5d] transition-colors"
            >
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-current" aria-hidden="true">
                <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.094c-.4-.18-.8-.36-1.2-.55-1.6-.751-3.05-1.92-4.18-3.36a16.7 16.7 0 0 1-1.16-1.65c-.25-.4-.43-.85-.43-1.31 0-.45.21-.78.39-1.1.18-.32.69-.78.92-1.06.16-.2.21-.4.21-.6 0-.4-.94-2.36-1.06-2.61-.31-.65-.52-.7-.84-.71h-.79c-.27 0-.7.1-1.05.5-.36.4-1.36 1.32-1.36 3.21 0 1.89 1.39 3.72 1.59 3.97.2.25 2.74 4.18 6.6 5.8 3.86 1.62 4.55 1.42 5.36 1.34.81-.08 2.79-1.14 3.18-2.24.39-1.1.39-2.04.27-2.24-.12-.2-.42-.32-.88-.49-.46-.17-2.74-1.36-3.16-1.51l-.31-.07ZM16.05 6.5c-5.27 0-9.55 4.28-9.55 9.55 0 1.85.55 3.66 1.59 5.21l-1.04 3.79 3.88-1.02a9.45 9.45 0 0 0 5.12 1.51c5.27 0 9.55-4.28 9.55-9.55s-4.28-9.49-9.55-9.49Z"/>
              </svg>
              Chat Us on WhatsApp
            </a>
            <Link
              to="/shop"
              className="flex-1 inline-flex items-center justify-center bg-onyx text-cream py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="container-luxe py-16 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <p className="text-eyebrow">Empty</p>
          <h1 className="font-display text-4xl md:text-5xl mt-3">Your bag is empty</h1>
          <p className="mt-4 text-muted-foreground">Begin curating your wardrobe of bespoke pieces.</p>
          <Link to="/shop" className="inline-flex mt-8 bg-onyx text-cream px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors">
            Discover the Boutique
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-luxe py-10 md:py-16">
      <div className="text-center mb-10 md:mb-14">
        <p className="text-eyebrow">Checkout</p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">Your Order</h1>
        <p className="text-sm text-muted-foreground mt-2">{count} item{count > 1 ? "s" : ""} · Secure payment via Paystack</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">
        <div className="border border-border divide-y divide-border">
          {items.map((item) => (
            <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 p-4 md:p-5">
              <Link to="/product/$slug" params={{ slug: item.product.slug }} className="block w-20 h-24 md:w-24 md:h-28 bg-muted overflow-hidden shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" loading="lazy" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-3">
                  <Link to="/product/$slug" params={{ slug: item.product.slug }} className="font-display text-base md:text-lg leading-tight hover:text-gold-deep">
                    {item.product.name}
                  </Link>
                  <button onClick={() => remove(item.product.id, item.size, item.color)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Size {item.size || "-"} · {item.color || "-"}</p>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center border border-border">
                    <button onClick={() => update(item.product.id, item.size, item.color, item.quantity - 1)} className="px-2 py-1.5 hover:bg-muted" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                    <span className="px-3 text-sm tabular-nums">{item.quantity}</span>
                    <button onClick={() => update(item.product.id, item.size, item.color, item.quantity + 1)} className="px-2 py-1.5 hover:bg-muted" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{format(item.product.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-28 space-y-6">
          <div className="border border-border bg-secondary/30 p-6 space-y-4">
            <h2 className="font-display text-2xl">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{format(subtotal)}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">{shipping === 0 ? <span className="text-gold-deep">Free</span> : format(shipping)}</span>
              </div>
              {!shippingFree && (
                <p className="text-[11px] text-muted-foreground">Free shipping on orders above ₦500,000.</p>
              )}
            </div>
            <div className="flex justify-between border-t border-border pt-4 text-base">
              <span className="font-medium">Total</span>
              <span className="font-display text-xl tabular-nums">{format(total)}</span>
            </div>
            {code === "USD" && (
              <p className="text-[11px] text-muted-foreground">
                Prices and charge are in USD at today's exchange rate.
              </p>
            )}
          </div>

          <div className="border border-border p-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-eyebrow block mb-2">Email</label>
              <input
                id="email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
              />
              <p className="text-[11px] text-muted-foreground mt-2">We'll send your receipt and order updates here.</p>
            </div>

            <div className="grid gap-4">
              <div>
                <label htmlFor="firstName" className="text-eyebrow block mb-2">First name</label>
                <input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label htmlFor="lastName" className="text-eyebrow block mb-2">Last name</label>
                <input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label htmlFor="phone" className="text-eyebrow block mb-2">Phone</label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label htmlFor="streetAddress" className="text-eyebrow block mb-2">Street address</label>
                <input id="streetAddress" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="text-eyebrow block mb-2">City</label>
                  <input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
                <div>
                  <label htmlFor="country" className="text-eyebrow block mb-2">Country</label>
                  <input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="text-eyebrow block mb-2">State</label>
                  <input id="state" value={state} onChange={(e) => setState(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
                <div>
                  <label htmlFor="postalCode" className="text-eyebrow block mb-2">Postal code</label>
                  <input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
              </div>
              <div>
                <label htmlFor="notes" className="text-eyebrow block mb-2">Notes</label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold min-h-[100px]" />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-onyx text-cream py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <Lock className="h-3.5 w-3.5" />
              {paying ? "Opening Paystack…" : `Pay ${format(total)}`}
            </button>

            <div className="grid grid-cols-3 gap-3 pt-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              <div className="flex flex-col items-center gap-1"><ShieldCheck className="h-4 w-4 text-gold" />Secure</div>
              <div className="flex flex-col items-center gap-1"><Truck className="h-4 w-4 text-gold" />Insured</div>
              <div className="flex flex-col items-center gap-1"><Lock className="h-4 w-4 text-gold" />Encrypted</div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
