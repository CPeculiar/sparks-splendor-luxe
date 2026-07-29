import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Minus, Plus, Trash2, CheckCircle2, ShieldCheck, Lock, Truck, MessageCircle } from "lucide-react";
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
    PaystackPop?: new () => {
      newTransaction: (opts: {
        key?: string;
        email?: string;
        amount?: number;
        currency?: string;
        ref?: string;
        accessCode?: string;
        channels?: string[];
        metadata?: unknown;
        onSuccess: (res: { reference: string }) => void;
        onCancel: () => void;
      }) => void;
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
    s.src = "https://js.paystack.co/v2/inline.js";
    s.async = true;
    s.dataset.paystack = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script-error"));
    document.head.appendChild(s);
  });
}

const WHATSAPP_PHONE = "2349053572403";

type SuccessData = {
  ref: string;
  total: number;
  orderNumber?: string;
  items?: { product_name: string; quantity: number; unit_price: number; size?: string; color?: string }[];
  customerName?: string;
};

function SuccessModal({ success, format, navigate }: { success: SuccessData; format: (n: number) => string; navigate: ReturnType<typeof Route.useNavigate> }) {
  const [countdown, setCountdown] = useState(10);
  const [cancelled, setCancelled] = useState(false);
  const waMsg = encodeURIComponent(
    `Hello Sparks & Splendour! I just placed order ${success.orderNumber || success.ref}. I'm ready to share my measurements for my bespoke piece.`
  );
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${waMsg}`;

  useEffect(() => {
    if (cancelled) return;
    if (countdown <= 0) {
      window.open(waUrl, "_blank", "noopener,noreferrer");
      navigate({ to: "/" });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, cancelled]);

  const handleClose = () => {
    setCancelled(true);
    navigate({ to: "/" });
  };

  const handleWhatsApp = () => {
    setCancelled(true);
    window.open(waUrl, "_blank", "noopener,noreferrer");
    navigate({ to: "/" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-background border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gold/15 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-gold-deep" />
          </div>
          <p className="text-eyebrow mt-5 text-gold">Order Confirmed</p>
          <h2 className="font-display text-2xl md:text-3xl mt-2">Thank You{success.customerName ? `, ${success.customerName.split(" ")[0]}` : ""}!</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Your payment was successful and your order has been received.
          </p>
          <p className="mt-2 text-sm text-gold-deep leading-relaxed font-medium">
            Since all our wears are bespoke, you will be automatically redirected to WhatsApp in {countdown}s so we can capture your measurements.
          </p>
        </div>

        <div className="border-t border-border mx-6">
          <div className="py-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Order Number</p>
              <p className="font-mono font-bold mt-0.5">{success.orderNumber || "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Reference</p>
              <p className="font-mono text-xs mt-0.5 text-muted-foreground">{success.ref}</p>
            </div>
          </div>
        </div>

        {success.items && success.items.length > 0 && (
          <div className="mx-6 border border-border divide-y divide-border mb-4">
            {success.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ""}{item.color ? ` · ${item.color}` : ""}
                  </p>
                </div>
                <span className="tabular-nums text-sm font-medium">{format(item.unit_price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center px-4 py-3">
              <span className="font-medium text-sm">Total Paid</span>
              <span className="font-display text-lg tabular-nums text-gold-deep">{format(success.total)}</span>
            </div>
          </div>
        )}

        <div className="p-6 pt-2 flex flex-col gap-3">
          <button
            onClick={handleWhatsApp}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-4 w-4" /> Continue to WhatsApp ({countdown}s)
          </button>
          <button
            onClick={handleClose}
            className="w-full border border-border py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-secondary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPage() {
  const { items, subtotal, update, remove, count, clear } = useCart();
  const { format, code } = useCurrency();
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
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_value: number; discount_type: string; discount_amount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    ref: string;
    total: number;
    orderNumber?: string;
    items?: { product_name: string; quantity: number; unit_price: number; size?: string; color?: string }[];
    customerName?: string;
  } | null>(null);
  const [abandonedOrderId, setAbandonedOrderId] = useState<string | null>(null);
  const [abandonedPaymentInfo, setAbandonedPaymentInfo] = useState<{ orderId: string; orderNumber?: string; items: any[]; amount: number; currency: string; reference: string; email: string } | null>(null);
  const [failedModal, setFailedModal] = useState<{ message: string } | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setEmail(user.email);
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhone(user.phone || "");
    }
    loadPaystack().catch(() => {});
  }, []);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch(`${API_BASE}/api/coupons/validate/${couponCode.toUpperCase()}?subtotal=${subtotal}`, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
        return;
      }

      const data = await res.json();
      setAppliedCoupon(data);
      setCouponError(null);
    } catch (e) {
      setCouponError("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const isFormValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    phone.trim() !== "" &&
    streetAddress.trim() !== "" &&
    city.trim() !== "" &&
    state.trim() !== "" &&
    country.trim() !== "";

  const shippingFree = subtotal >= 500_000;
  //const shipping = items.length === 0 ? 0 : shippingFree ? 0 : 15_000;
  const shipping = items.length === 0 ? 0 : shippingFree ? 0 : 5;
  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? (subtotal * appliedCoupon.discount_value) / 100
      : appliedCoupon.discount_value
    : 0;
  const total = subtotal - discountAmount + shipping;

  const createOrder = async () => {
    const token = getAuthToken();
    const orderItems = items.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      color: item.color ?? undefined,
      size: item.size ?? undefined,
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
      currency: code,
      coupon_code: appliedCoupon?.code || null,
      discount_amount: discountAmount,
      items: orderItems,
    };

    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || "Failed to create order");
    }

    const data = await res.json();
    if (!data.data?.id) {
      throw new Error("Order creation failed - no order ID returned");
    }

    return {
      orderId: data.data.id,
      orderNumber: data.data.order_number,
      items: orderItems,
    };
  };

  const getPaymentInfo = async (orderId: string) => {
    const res = await fetch(`${API_BASE}/api/payments/initialize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });

    if (!res.ok) {
      throw new Error("Payment initialization failed");
    }

    const data = await res.json();
    if (!data.data?.amount || !data.data?.currency) {
      throw new Error("Invalid payment data from backend");
    }

    return {
      amount: data.data.amount,
      currency: data.data.currency,
      reference: data.data.reference,
      accessCode: data.data.access_code as string | undefined,
    };
  };

  // Called by Paystack callback — verify with backend which calls Paystack API
  const verifyAndConfirm = async (
    reference: string,
    orderInfo: { orderId: string; orderNumber?: string; items: any[] }
  ) => {
    setVerifying(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/payments/verify/${reference}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFailedModal({ message: "Payment could not be verified. If you were charged, please contact support with ref: " + reference });
        return;
      }
      setSuccess({
        ref: reference,
        total,
        orderNumber: orderInfo.orderNumber,
        items: orderInfo.items,
        customerName: `${firstName} ${lastName}`.trim() || email,
      });
      clear();
    } catch (err) {
      setFailedModal({ message: "Payment verification failed. Please contact support with reference: " + reference });
    } finally {
      setVerifying(false);
    }
  };

  // Called when customer closes Paystack modal without completing payment
  const abandonOrder = async (orderId: string) => {
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE}/api/orders/${orderId}/abandon`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (e) {
      // Non-critical — silent fail
    }
  };

  const handlePay = async () => {
    setError(null);

    const value = (emailRef.current?.value || email).trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    if (!streetAddress.trim()) { setError("Please enter your street address."); return; }
    if (!city.trim()) { setError("Please enter your city."); return; }
    if (!country.trim()) { setError("Please enter your country."); return; }
    if (!state.trim()) { setError("Please enter your state."); return; }

    if (items.length === 0) {
      setError("Your bag is empty.");
      return;
    }

    setPaying(true);
    let orderInfo: { orderId: string; orderNumber?: string; items: any[] } | null = null;

    try {
      // 1. Create order first
      orderInfo = await createOrder();

      // 2. Get payment info from backend
      const paymentInfo = await getPaymentInfo(orderInfo.orderId);

      // 3. Load Paystack
      await loadPaystack();
      if (!window.PaystackPop) {
        throw new Error("Paystack failed to load.");
      }

      // 4. Setup Paystack v2 — use access_code from server-side init for full channel support
      const popup = new window.PaystackPop();
      popup.newTransaction({
        ...(paymentInfo.accessCode
          ? { accessCode: paymentInfo.accessCode }
          : {
              key: PAYSTACK_KEY,
              email: value,
              amount: paymentInfo.amount,
              currency: paymentInfo.currency,
              ref: paymentInfo.reference,
              channels: ["card", "bank", "ussd", "bank_transfer", "qr", "mobile_money", "eft"],
            }),
        key: PAYSTACK_KEY,
        email: value,
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        ref: paymentInfo.reference,
        channels: ["card", "bank", "ussd", "bank_transfer", "qr", "mobile_money", "eft"],
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
        onSuccess: (res) => {
          setPaying(false);
          if (orderInfo) {
            void verifyAndConfirm(res.reference, orderInfo);
          }
        },
        onCancel: () => {
          setPaying(false);
          if (orderInfo) {
            void abandonOrder(orderInfo.orderId);
            setAbandonedOrderId(orderInfo.orderId);
            setAbandonedPaymentInfo({ ...orderInfo, amount: paymentInfo.amount, currency: paymentInfo.currency, reference: paymentInfo.reference, email: value });
          }
        },
      });
    } catch (e) {
      setPaying(false);
      const errorMsg = e instanceof Error ? e.message : "Payment could not be initiated.";
      setFailedModal({ message: errorMsg });
      console.error("Payment flow error:", e);
    }
  };

  const retryPayment = async () => {
    setFailedModal(null);
    setError(null);
    await handlePay();
  };

  const retryAbandonedPayment = () => {
    if (!abandonedPaymentInfo || !window.PaystackPop) return;
    const info = abandonedPaymentInfo;
    setAbandonedOrderId(null);
    const popup = new window.PaystackPop();
    popup.newTransaction({
      key: PAYSTACK_KEY,
      email: info.email,
      amount: info.amount,
      currency: info.currency,
      ref: info.reference,
      channels: ["card", "bank", "ussd", "bank_transfer", "qr", "mobile_money", "eft"],
      onSuccess: (res) => {
        void verifyAndConfirm(res.reference, { orderId: info.orderId, orderNumber: info.orderNumber, items: info.items });
      },
      onCancel: () => {
        void abandonOrder(info.orderId);
        setAbandonedOrderId(info.orderId);
      },
    });
  };

  if (success) {
    return <SuccessModal success={success} format={format} navigate={navigate} />;
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
    <>
      {/* Abandoned modal */}
      {abandonedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-background border border-border w-full max-w-md p-8 space-y-5">
            <div className="text-center">
              <p className="text-eyebrow text-amber-500">Payment Incomplete</p>
              <h2 className="font-display text-2xl mt-2">Order Not Completed</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                You closed the payment window before completing your payment. Your order has been saved.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={retryAbandonedPayment}
                className="w-full bg-onyx text-cream py-3.5 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
              >
                Pay Now
              </button>
              <button
                onClick={() => setAbandonedOrderId(null)}
                className="w-full border border-border py-3.5 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-secondary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Failed modal */}
      {failedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-background border border-border w-full max-w-md p-8 space-y-5">
            <div className="text-center">
              <p className="text-eyebrow text-destructive">Payment Failed</p>
              <h2 className="font-display text-2xl mt-2">Something Went Wrong</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{failedModal.message}</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={retryPayment}
                className="w-full bg-onyx text-cream py-3.5 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors"
              >
                Retry Payment
              </button>
              <button
                onClick={() => setFailedModal(null)}
                className="w-full border border-border py-3.5 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-secondary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="container-luxe py-8 md:py-16">
      <div className="text-center mb-8 md:mb-14">
        <p className="text-eyebrow">Checkout</p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">Your Order</h1>
        <p className="text-sm text-muted-foreground mt-2">{count} item{count > 1 ? "s" : ""} · Secure payment via Paystack</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-14 items-start">
        {/* Order summary first on mobile */}
        <aside className="lg:hidden border border-border bg-secondary/30 p-4 space-y-3">
          <h2 className="font-display text-xl">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{format(subtotal)}</span></div>
            {appliedCoupon && (
              <div className="flex justify-between text-gold-deep">
                <span>{appliedCoupon.discount_type === "percentage" ? appliedCoupon.discount_value + "%" : "Fixed"} Discount</span>
                <span className="tabular-nums">-{format(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums">{shipping === 0 ? <span className="text-gold-deep">Free</span> : format(shipping)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base">
            <span className="font-medium">Total</span>
            <span className="font-display text-xl tabular-nums">{format(total)}</span>
          </div>
        </aside>

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
                  <button onClick={() => remove(item.product.id, item.size || "", item.color || "")} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.color || "-"}</p>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center border border-border">
                    <button onClick={() => update(item.product.id, item.size || "", item.color || "", item.quantity - 1)} className="px-2 py-1.5 hover:bg-muted" aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                    <span className="px-3 text-sm tabular-nums">{item.quantity}</span>
                    <button onClick={() => update(item.product.id, item.size || "", item.color || "", item.quantity + 1)} className="px-2 py-1.5 hover:bg-muted" aria-label="Increase"><Plus className="h-3 w-3" /></button>
                  </div>
                  <span className="text-sm font-medium tabular-nums">{format(item.product.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="hidden lg:block lg:sticky lg:top-28 space-y-6">
          <div className="border border-border bg-secondary/30 p-6 space-y-4">
            <h2 className="font-display text-2xl">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{format(subtotal)}</span></div>
              {appliedCoupon && (
                <div className="flex justify-between text-gold-deep">
                  <span>{appliedCoupon.discount_type === "percentage" ? appliedCoupon.discount_value + "%" : "Fixed"} Discount</span>
                  <span className="tabular-nums">-{format(discountAmount)}</span>
                </div>
              )}
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
              <label htmlFor="coupon" className="text-eyebrow block mb-2">Coupon Code (Optional)</label>
              <div className="flex gap-2">
                <input
                  id="coupon"
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  placeholder="Enter code"
                  disabled={appliedCoupon !== null}
                  className="flex-1 border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold disabled:bg-muted"
                />
                <button
                  onClick={handleValidateCoupon}
                  disabled={validatingCoupon || appliedCoupon !== null || !couponCode.trim()}
                  className="px-4 py-3 bg-gold text-onyx text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold/90 disabled:bg-muted disabled:text-muted-foreground transition-colors"
                >
                  {validatingCoupon ? "..." : "Apply"}
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-[11px] text-gold-deep mt-2">✓ {appliedCoupon.message}</p>
              )}
              {couponError && (
                <p className="text-[11px] text-destructive mt-2">{couponError}</p>
              )}
              {appliedCoupon && (
                <button
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode("");
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground mt-2 underline"
                >
                  Remove coupon
                </button>
              )}
            </div>

            <div>
              <label htmlFor="email" className="text-eyebrow block mb-2">Email <span className="text-destructive">*</span></label>
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
                <label htmlFor="firstName" className="text-eyebrow block mb-2">First name <span className="text-destructive">*</span></label>
                <input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label htmlFor="lastName" className="text-eyebrow block mb-2">Last name <span className="text-destructive">*</span></label>
                <input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label htmlFor="phone" className="text-eyebrow block mb-2">Phone <span className="text-destructive">*</span></label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label htmlFor="streetAddress" className="text-eyebrow block mb-2">Street address <span className="text-destructive">*</span></label>
                <input id="streetAddress" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="text-eyebrow block mb-2">City <span className="text-destructive">*</span></label>
                  <input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
                <div>
                  <label htmlFor="country" className="text-eyebrow block mb-2">Country <span className="text-destructive">*</span></label>
                  <input id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className="text-eyebrow block mb-2">State <span className="text-destructive">*</span></label>
                  <input id="state" value={state} onChange={(e) => setState(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
                <div>
                  <label htmlFor="postalCode" className="text-eyebrow block mb-2">Postal code <span className="text-muted-foreground">(optional)</span></label>
                  <input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                </div>
              </div>
              <div>
                <label htmlFor="notes" className="text-eyebrow block mb-2">Notes <span className="text-muted-foreground">(optional)</span></label>
                <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold min-h-[100px]" />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              onClick={handlePay}
              disabled={paying || verifying || !isFormValid}
              className="w-full bg-onyx text-cream py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <Lock className="h-3.5 w-3.5" />
              {verifying ? "Verifying payment…" : paying ? "Opening Paystack…" : `Pay ${format(total)}`}
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
    </>
  );
}
