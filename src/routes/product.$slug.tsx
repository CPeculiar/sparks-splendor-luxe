import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Heart, Minus, Plus, Scissors, Shield, Star, Truck, ChevronRight, X } from "lucide-react";
import { useProduct, useProducts } from "@/lib/db-products";
import type { Product } from "@/lib/db-products";
import { ProductCard } from "@/components/ProductCard";
import { PriceDisplay } from "@/components/PriceDisplay";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { getAuthToken, isAuthenticated, getCurrentUser } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const Route = createFileRoute("/product/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { product, loading } = useProduct(slug) as { product: Product | undefined; loading: boolean };
  const { products: relatedProducts } = useProducts({ category: product?.category });
  const { add } = useCart();
  const { format } = useCurrency();
  // const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  // Component pricing state — initialise with required component ids once product loads
  const [selectedComponentIds, setSelectedComponentIds] = useState<Set<string>>(new Set());
  const [componentProductId, setComponentProductId] = useState<string | undefined>(undefined);

  // Sync required components whenever the product changes
  useEffect(() => {
    if (!product?.has_components || !product.components.length) return;
    if (componentProductId === product.id) return; // already initialised for this product
    const required = new Set(product.components.filter(c => c.is_required).map(c => String(c.id)));
    setSelectedComponentIds(required);
    setComponentProductId(product.id);
  }, [product?.id, product?.components]);

  useEffect(() => {
    if (!product) return;

    // Fetch reviews
    setReviewsLoading(true);
    fetch(`${API_BASE}/api/reviews/product/${product.id}`)
      .then(r => r.json())
      .then(d => setReviews((d.data || []).map((r: any) => ({
          id: r.id,
          rating: Number(r.rating) || 0,
          title: String(r.title ?? ""),
          body: String(r.body ?? ""),
          created_at: String(r.created_at ?? ""),
        }))))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));

    // Check if product is in wishlist (authenticated only)
    if (isAuthenticated()) {
      const token = getAuthToken();
      fetch(`${API_BASE}/api/wishlists/check/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => setInWishlist(d.inWishlist))
        .catch(() => setInWishlist(false));
    }
  }, [product?.id]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated()) {
      setReviewError("Please sign in to add to wishlist");
      return;
    }

    const token = getAuthToken();
    try {
      if (inWishlist) {
        await fetch(`${API_BASE}/api/wishlists/${product.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        setInWishlist(false);
      } else {
        await fetch(`${API_BASE}/api/wishlists`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: product.id })
        });
        setInWishlist(true);
      }
    } catch (e) {
      console.error("Wishlist error:", e);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.title.trim() || !reviewForm.body.trim()) {
      setReviewError("Please fill in all fields");
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          body: reviewForm.body
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setReviewSuccess(true);
      setReviewForm({ rating: 5, title: "", body: "" });
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const [transitioning, setTransitioning] = useState(false);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  // When slug changes, immediately show overlay and record which slug we're waiting for
  useEffect(() => {
    setTransitioning(true);
    setPendingSlug(slug);
  }, [slug]);

  // Only clear overlay once the loaded product actually matches the current slug
  useEffect(() => {
    if (!loading && product && product.slug === pendingSlug) {
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [loading, product, pendingSlug]);

  if (transitioning || loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Loading piece&hellip;</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-eyebrow">Not Found</p>
          <h1 className="font-display text-5xl mt-3">Piece unavailable</h1>
          <Link to="/shop" className="inline-block mt-6 underline text-gold-deep">Return to boutique</Link>
        </div>
      </div>
    );
  }

  // const currentSize = size || product.sizes[1] || product.sizes[0] || "";
  const currentColor = color || product.colors[0] || "";
  const related = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);

  // Component pricing
  const isComponentProduct = Boolean(product.has_components && product.components.length > 0);
  const selectedComponents = isComponentProduct
    ? product.components.filter(c => selectedComponentIds.has(String(c.id)))
    : [];
  const requiredComponents = isComponentProduct
    ? product.components.filter(c => c.is_required)
    : [];
  const componentTotalNGN = selectedComponents.reduce((s, c) => s + c.price, 0);
  const componentTotalUSD = selectedComponents.reduce((s, c) => s + (c.price_usd ?? 0), 0);
  // Base price = sum of required components; shown even before user picks optional ones
  const requiredTotalNGN = requiredComponents.reduce((s, c) => s + c.price, 0);
  const requiredTotalUSD = requiredComponents.reduce((s, c) => s + (c.price_usd ?? 0), 0);
  const displayedPrice = isComponentProduct
    ? (product.display_currency === "USD"
        ? (componentTotalUSD || requiredTotalUSD)
        : (componentTotalNGN || requiredTotalNGN))
    : (product.display_currency === "USD" ? product.price_usd || product.price : product.price);

  function toggleComponent(id: string, isRequired: boolean) {
    if (isRequired) return; // required components can't be deselected
    setSelectedComponentIds(prev => {
      const next = new Set(prev);
      if (next.has(String(id))) next.delete(String(id)); else next.add(String(id));
      return next;
    });
  }

  return (
    <>
      <div className="container-luxe pt-4 md:pt-6 text-xs tracking-[0.18em] uppercase text-muted-foreground flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
        <Link to="/" className="hover:text-foreground">Home</Link> <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-foreground">Shop</Link> <ChevronRight className="h-3 w-3" />
        <Link to="/shop" search={{ category: product.category }} className="hover:text-foreground capitalize">{product.category}</Link>
      </div>

      <div className="container-luxe py-6 md:py-14 grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* gallery */}
        <div className="flex flex-col gap-3">
          {/* Main image */}
          <button onClick={() => setZoom(true)} className="block w-full aspect-[4/5] overflow-hidden bg-muted relative group cursor-zoom-in">
            <img src={product.gallery[activeImg] || product.image} alt={product.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-onyx text-cream text-[10px] tracking-[0.25em] uppercase px-3 py-1.5">
                {product.badge}
              </span>
            )}
          </button>
          {/* Thumbnails — horizontal scroll on mobile, vertical on desktop */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
            {product.gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={["flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-all", activeImg === i ? "border-gold" : "border-transparent"].join(" ")}
              >
                <img src={g} alt="" className="w-full h-full object-cover object-top" />
              </button>
            ))}
          </div>
          {/* Desktop: side thumbnails */}
          <div className="hidden md:flex gap-3">
            {product.gallery.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={["w-20 aspect-[4/5] overflow-hidden border-2 transition-all flex-shrink-0", activeImg === i ? "border-gold" : "border-transparent hover:border-border"].join(" ")}
              >
                <img src={g} alt="" className="w-full h-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        {/* details */}
        <div className="lg:py-4 lg:sticky lg:top-28 self-start">
          <p className="text-eyebrow">{product.category}</p>
          <h1 className="font-display text-3xl md:text-5xl mt-3 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
            </div>
            <span className="text-xs text-muted-foreground">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
          </div>

          <p className="text-2xl font-display mt-5">
            <PriceDisplay
              price={displayedPrice}
              originalPrice={isComponentProduct ? undefined : (product.display_currency === "USD" ? product.original_price_usd : product.original_price)}
              currency={product.currency_symbol}
            />
          </p>
          {isComponentProduct && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedComponents.length > requiredComponents.length
                ? `Base + ${selectedComponents.length - requiredComponents.length} add-on${selectedComponents.length - requiredComponents.length !== 1 ? "s" : ""} selected`
                : "Add optional pieces below to customise"}
            </p>
          )}
          {!isComponentProduct && (
            <p className="text-xs text-muted-foreground mt-1">Tax included. Bespoke fittings complimentary.</p>
          )}

          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Component pricing selector */}
          {isComponentProduct && (
            <div className="mt-7 border border-border p-4 space-y-3">
              <p className="text-eyebrow">Build Your Look</p>
              <p className="text-xs text-muted-foreground">Included pieces are always part of your order. Add optional pieces to customise.</p>
              <div className="space-y-2">
                {product.components.map((c) => {
                  const isSelected = selectedComponentIds.has(String(c.id));
                  const isReq = c.is_required;
                  const itemPrice = product.display_currency === "USD" ? (c.price_usd ?? 0) : c.price;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleComponent(c.id, isReq)}
                      disabled={isReq}
                      className={[
                        "w-full flex items-center justify-between px-4 py-3 border text-sm transition-colors text-left",
                        isSelected ? "border-onyx bg-onyx text-cream" : "border-border hover:border-gold",
                        isReq ? "cursor-not-allowed opacity-80" : "cursor-pointer",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "bg-gold border-gold" : "border-current"
                        }`}>
                          {isSelected && <span className="block w-2 h-2 bg-onyx rounded-sm" />}
                        </span>
                        <span>{c.name}</span>
                        {isReq
                          ? <span className="text-[10px] tracking-[0.15em] uppercase opacity-60">(included)</span>
                          : <span className="text-[10px] tracking-[0.15em] uppercase opacity-50">(optional)</span>
                        }
                      </span>
                      <span className="font-display tabular-nums">
                        +{product.currency_symbol}{itemPrice.toLocaleString("en-NG")}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">Total</span>
                <span className="font-display text-lg">
                  {product.currency_symbol}{displayedPrice.toLocaleString("en-NG")}
                </span>
              </div>
            </div>
          )}

          {product.colors.length > 0 && (
            <div className="mt-7">
              <p className="text-eyebrow mb-3">Colour: <span className="text-foreground normal-case tracking-normal font-normal">{currentColor}</span></p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={[
                      "px-4 h-10 border text-sm transition-colors",
                      currentColor === c ? "border-onyx bg-onyx text-cream" : "border-border hover:border-gold",
                    ].join(" ")}
                  >{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes hidden — all pieces are bespoke
          {product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-eyebrow">Size: <span className="text-foreground normal-case tracking-normal font-normal">{currentSize}</span></p>
                <button onClick={() => setGuide(true)} className="text-xs underline text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5" /> Size guide
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={[
                      "h-12 border text-sm transition-colors",
                      currentSize === s ? "bg-onyx text-cream border-onyx" : "border-border hover:border-gold",
                    ].join(" ")}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}
          */}

          <div className="mt-6 flex items-stretch gap-2 md:gap-3">
            <div className="flex items-center border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-2.5 md:px-3 h-12 hover:bg-muted" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
              <span className="px-3 md:px-4 text-sm tabular-nums w-8 md:w-10 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-2.5 md:px-3 h-12 hover:bg-muted" aria-label="Increase"><Plus className="h-4 w-4" /></button>
            </div>
            <button
              onClick={() => add(product, {
                size: "",
                color: currentColor,
                quantity: qty,
                ...(isComponentProduct ? {
                  overridePrice: product.display_currency === "USD" ? componentTotalUSD : componentTotalNGN,
                  selectedComponents,
                } : {}),
              })}
              disabled={isComponentProduct && selectedComponents.length === 0 && requiredComponents.length === 0}
              className="flex-1 bg-onyx text-cream h-12 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to Bag
            </button>
            <button
              onClick={handleWishlistToggle}
              disabled={!isAuthenticated()}
              className={`h-12 w-12 border flex items-center justify-center transition-colors ${
                inWishlist
                  ? "bg-gold text-onyx border-gold"
                  : "border-border hover:border-gold hover:text-gold"
              } ${!isAuthenticated() ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Wishlist"
              title={!isAuthenticated() ? "Sign in to save" : ""}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* <Link to="/contact" className="block w-full text-center border border-onyx h-12 leading-[3rem] mt-3 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-onyx hover:text-cream transition-colors">
            Book Bespoke Consultation
          </Link> */}

          <div className="mt-8 grid grid-cols-3 gap-4 text-center border-t border-border pt-6">
            {[
              { I: Truck, t: "Free Shipping", s: "On orders over ₦500k" },
              { I: Shield, t: "Lifetime Care", s: "Free alterations" },
              { I: Scissors, t: "Bespoke Fit", s: "By appointment" },
            ].map((it) => (
              <div key={it.t}>
                <it.I className="h-5 w-5 text-gold mx-auto" />
                <p className="text-[11px] tracking-[0.18em] uppercase mt-2 font-medium">{it.t}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{it.s}</p>
              </div>
            ))}
          </div>

          {product.fabric && (
            <details className="border-b border-border py-5 mt-8 group">
              <summary className="cursor-pointer flex justify-between text-sm font-medium tracking-[0.15em] uppercase">
                Materials & Composition <Plus className="h-4 w-4 group-open:rotate-45 transition-transform" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{product.fabric}. Each piece is hand-finished by our master tailors in Lagos. Dry clean only.</p>
            </details>
          )}
          <details className="border-b border-border py-5 group">
            <summary className="cursor-pointer flex justify-between text-sm font-medium tracking-[0.15em] uppercase">
              Shipping & Returns <Plus className="h-4 w-4 group-open:rotate-45 transition-transform" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">Complimentary worldwide shipping on orders above ₦500,000. Returns accepted within 14 days for unworn pieces.</p>
          </details>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="container-luxe pb-20">
          <div className="text-center mb-10">
            <p className="text-eyebrow">You May Also Love</p>
            <h2 className="font-display text-3xl md:text-4xl mt-3">Coordinated Selections</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
            {related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="container-luxe pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl mb-10">Customer Reviews</h2>

          {/* Review Form */}
          {isAuthenticated() && (
            <div className="border border-border p-6 md:p-8 mb-10">
              <h3 className="font-display text-xl mb-4">Share Your Thoughts</h3>
              {reviewSuccess && (
                <p className="text-sm text-gold-deep bg-gold/10 p-3 mb-4 rounded">✓ Thank you! Your review is pending approval.</p>
              )}
              {reviewError && (
                <p className="text-sm text-destructive bg-destructive/10 p-3 mb-4 rounded">{reviewError}</p>
              )}
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-eyebrow block mb-2">Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-gold"
                  >
                    <option value={5}>★★★★★ (Excellent)</option>
                    <option value={4}>★★★★ (Very Good)</option>
                    <option value={3}>★★★ (Good)</option>
                    <option value={2}>★★ (Fair)</option>
                    <option value={1}>★ (Poor)</option>
                  </select>
                </div>
                <div>
                  <label className="text-eyebrow block mb-2">Title</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="e.g., Perfect fit and quality"
                    className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-eyebrow block mb-2">Review</label>
                  <textarea
                    value={reviewForm.body}
                    onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                    placeholder="Share your experience..."
                    className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold min-h-24 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-onyx text-cream py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx disabled:bg-muted transition-colors"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {!isAuthenticated() && (
            <div className="border border-border p-6 text-center mb-10">
              <p className="text-sm text-muted-foreground">
                <Link to="/account" className="text-gold-deep hover:underline">Sign in</Link> to leave a review
              </p>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <p className="text-muted-foreground">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No approved reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-border p-5 rounded">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-1 text-gold">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <h4 className="font-medium">{review.title}</h4>
                  <p className="text-sm text-muted-foreground mt-2">{review.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* zoom modal */}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-onyx/95 flex items-center justify-center p-4 animate-fade-in">
          <button onClick={() => setZoom(false)} className="absolute top-6 right-6 text-cream hover:text-gold" aria-label="Close zoom">
            <X className="h-8 w-8" />
          </button>
          <img src={product.gallery[activeImg] || product.image} alt={product.name} className="max-h-[90vh] max-w-full object-contain" />
        </div>
      )}

      {/* Size guide modal hidden — all pieces are bespoke
      {guide && (
        <div className="fixed inset-0 z-50 bg-onyx/70 flex items-center justify-center p-4 animate-fade-in" onClick={() => setGuide(false)}>
          <div className="bg-background max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-2xl">Size Guide</h3>
              <button onClick={() => setGuide(false)}><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Measurements in inches. For bespoke commissions, we measure in person.</p>
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left text-xs tracking-[0.2em] uppercase text-muted-foreground">
                  <th className="py-2">Size</th><th>Chest</th><th>Waist</th><th>Hip</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["S", "36", "30", "37"],
                  ["M", "39", "33", "40"],
                  ["L", "42", "36", "43"],
                  ["XL", "45", "39", "46"],
                  ["XXL", "48", "42", "49"],
                ].map((r) => (
                  <tr key={r[0]} className="border-b border-border/60">
                    {r.map((c, i) => <td key={i} className="py-3 tabular-nums">{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      */}
    </>
  );
}
