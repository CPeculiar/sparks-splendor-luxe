import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Star, Award, Scissors, Truck } from "lucide-react";
import { useCategories, useProducts } from "@/lib/db-products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  component: HomePage,
});

interface Slide {
  type: "video" | "image";
  src: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: { to: "/shop"; search?: { category?: string } };
}

const SLIDES_FALLBACK: Slide[] = [
  {
    type: "video",
    src: "/gallery-compressed/Hero-assets/heroVideo.mp4",
    eyebrow: "Autumn / Winter Collection",
    title: "The Art of Bespoke",
    subtitle: "A house dedicated to the quiet authority of craftsmanship.",
    cta: "Discover the Collection",
    href: { to: "/shop" },
  },
  {
    type: "image",
    src: "/gallery-compressed/Hero-assets/heroImg-01.jpg",
    eyebrow: "Signature Suits",
    title: "Sculpted Tailoring",
    subtitle: "Architectural silhouettes hand-finished in our Lagos office.",
    cta: "Shop Suits",
    href: { to: "/shop", search: { category: "suits" } },
  },
  {
    type: "image",
    src: "/gallery-compressed/Hero-assets/heroImg-02.jpg",
    eyebrow: "Heritage Reimagined",
    title: "Royal Natives",
    subtitle: "Hand-embroidered agbada and kaftans for the modern monarch.",
    cta: "Shop Natives",
    href: { to: "/shop", search: { category: "natives" } },
  },
  {
    type: "image",
    src: "/gallery-compressed/Hero-assets/heroImg-03.jpg",
    eyebrow: "Couture for Her",
    title: "Ladies Atelier",
    subtitle: "Aso-ebi & couture pieces sculpted in golden silk.",
    cta: "Shop Ladies",
    href: { to: "/shop", search: { category: "ladies" } },
  },
  {
    type: "image",
    src: "/gallery-compressed/Hero-assets/heroImg-04.jpg",
    eyebrow: "Limited Edition",
    title: "The Rose Jewel",
    subtitle: "Hand-beaded silk wool — only nine pieces released worldwide.",
    cta: "Shop Limited",
    href: { to: "/shop" },
  },
  {
    type: "image",
    src: "/gallery-compressed/Hero-assets/heroImg-05.jpg",
    eyebrow: "Bespoke Craft",
    title: "Made for Monarchs",
    subtitle: "Every thread placed with intention. Every silhouette sculpted for you.",
    cta: "Explore All",
    href: { to: "/shop" },
  },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>(SLIDES_FALLBACK);
  const [i, setI] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/hero-slides`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        const rows = d?.data;
        if (!Array.isArray(rows) || !rows.length) return;
        setSlides(
          rows.map((s: any) => ({
            type: (s.type || (s.image_url?.match(/\.(mp4|webm|mov)/i) ? "video" : "image")) as "video" | "image",
            src: s.src || s.image_url || "",
            eyebrow: s.eyebrow || "",
            title: s.title || "",
            subtitle: s.subtitle || "",
            cta: s.cta || s.cta_text || "Shop Now",
            href: { to: "/shop", search: s.href_category ? { category: s.href_category } : undefined },
          }))
        );
        setI(0);
      })
      .catch(() => { /* silently keep fallback slides */ });
  }, []);

  const advance = () => setI((p) => (p + 1) % slides.length);
  const back = () => setI((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const cur = slides[i];
    if (cur.type === "video") {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
      const onEnd = () => advance();
      v?.addEventListener("ended", onEnd);
      // fallback: if video doesn't end naturally within 20s, advance anyway
      timer.current = setTimeout(advance, 23000);
      return () => {
        v?.removeEventListener("ended", onEnd);
        if (timer.current) clearTimeout(timer.current);
      };
    }
    // images: auto-advance every 6.5s, then loop back to start
    timer.current = setTimeout(advance, 6500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [i]);

  // Pre-load next image to avoid black flash
  const nextIdx = (i + 1) % slides.length;
  const nextSlide = slides[nextIdx];

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-onyx text-cream">
      {/* hidden preload for next image */}
      {nextSlide.type === "image" && (
        <link rel="preload" as="image" href={nextSlide.src} />
      )}

      {slides.map((s, idx) => (
        <div
          key={idx}
          className={[
            "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
            idx === i ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
        >
          {s.type === "video" ? (
            <video
              ref={idx === i ? videoRef : undefined}
              autoPlay
              muted
              playsInline
              preload="metadata"
              loop={false}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={s.src} type="video/mp4" />
            </video>
          ) : (
            <img
              src={s.src}
              alt={s.title}
              className={["absolute inset-0 w-full h-full object-cover object-top", idx === i ? "animate-slow-zoom" : ""].join(" ")}
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.15)_40%,rgba(0,0,0,0.75)_100%)]" />
        </div>
      ))}

      {/* content */}
      <div className="relative z-10 h-full container-luxe flex flex-col justify-end pb-20 md:pb-28">
        <div key={i} className="max-w-2xl animate-fade-up">
          <p className="text-eyebrow text-gold mb-5">{slides[i].eyebrow}</p>
          <h1 className="font-serif-luxe text-5xl sm:text-6xl md:text-7xl lg:text-[88px] leading-[1.02] tracking-tight">
            {slides[i].title}
          </h1>
          <p className="mt-5 text-base md:text-lg text-cream/80 max-w-lg leading-relaxed">{slides[i].subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={slides[i].href.to}
              search={slides[i].href.search as never}
              className="group inline-flex items-center gap-3 bg-gold text-onyx px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-cream transition-colors"
            >
              {slides[i].cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-3 border border-cream/40 text-cream px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-cream hover:text-onyx transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>

      {/* arrows */}
      <button onClick={back} aria-label="Previous slide" className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center border border-cream/30 text-cream hover:bg-gold hover:text-onyx hover:border-gold transition-colors rounded-full">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={advance} aria-label="Next slide" className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center border border-cream/30 text-cream hover:bg-gold hover:text-onyx hover:border-gold transition-colors rounded-full">
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={["h-[3px] transition-all duration-500", idx === i ? "w-10 bg-gold" : "w-5 bg-cream/40 hover:bg-cream/70"].join(" ")}
          />
        ))}
      </div>

      {/* counter */}
      <div className="absolute bottom-6 right-6 z-20 hidden md:block text-xs tracking-[0.3em] text-cream/70 tabular-nums">
        {String(i + 1).padStart(2, "0")} <span className="mx-2 text-gold">/</span> {String(slides.length).padStart(2, "0")}
      </div>
    </section>
  );
}

function MarqueeStrip() {
  const items = ["Bespoke Tailoring", "✦", "Hand Embroidery", "✦", "Italian Fabrics", "✦", "Worldwide Shipping", "✦", "Atelier Lagos", "✦"];
  const all = [...items, ...items, ...items];
  return (
    <div className="bg-onyx text-cream py-5 overflow-hidden border-y border-gold/20 w-full">
      <div className="flex gap-10 animate-marquee whitespace-nowrap text-xs tracking-[0.4em] uppercase">
        {all.map((t, i) => (
          <span key={i} className={t === "✦" ? "text-gold" : ""}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── THE COLLECTIONS ────────────────────────────────────────────────────────
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  suits:   "/gallery-compressed/safari_suits/safari-cover-image-main.jpg",
  natives: "/gallery-compressed/natives/Native_NAA-001.jpg",
  casuals: "/gallery-compressed/casuals/Casuals_CAA_001.jpg",
  ladies:  "/gallery-compressed/Ladies/Ladies_suit_Brown_1.jpg",
  agbada:  "/gallery-compressed/agbada/Agbada_AAA-001.jpg",
  kaftan:  "/gallery-compressed/kaftan/Kaftan_KAF-001.jpg",
  pants:   "/gallery-compressed/pants/Pant_PAA-001.jpg",
};

const COLLECTION_CATS_FALLBACK = [
  { key: "suits",   label: "Suits",   tagline: "Sculpted Tailoring",    subtitle: "Bespoke suits & blazers",      image: CATEGORY_FALLBACK_IMAGES.suits },
  { key: "natives", label: "Natives", tagline: "Heritage Reimagined",   subtitle: "Agbada, kaftans & more",       image: CATEGORY_FALLBACK_IMAGES.natives },
  { key: "casuals", label: "Casuals", tagline: "Quiet Luxury",          subtitle: "Everyday elevated essentials", image: CATEGORY_FALLBACK_IMAGES.casuals },
  { key: "ladies",  label: "Ladies",  tagline: "Couture for Her",       subtitle: "Aso-ebi & couture pieces",     image: CATEGORY_FALLBACK_IMAGES.ladies },
];

function CategoryGrid() {
  const { categories } = useCategories();
  const cards = categories.length
    ? categories
        .filter((c) => Boolean(c.slug))
        .slice(0, 4)
        .map((c) => {
          const fallback = COLLECTION_CATS_FALLBACK.find((f) => f.key === c.slug);
          return {
            key: c.slug,
            label: c.name,
            tagline: c.tagline || fallback?.tagline || "Bespoke craft.",
            subtitle: c.description || fallback?.subtitle || "",
            image: c.image_url || CATEGORY_FALLBACK_IMAGES[c.slug] || "/gallery-compressed/safari_suits/safari-cover-image-main.jpg",
          };
        })
    : COLLECTION_CATS_FALLBACK;

  return (
    <section className="container-luxe py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-eyebrow">Maisons</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Our Collections</h2>
        <span className="gold-divider mt-5" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {cards.map((c, idx) => (
          <Link
            key={c.key}
            to="/shop"
            search={{ category: c.key } as never}
            className={["group block bg-muted", idx === 0 ? "lg:row-span-2" : ""].join(" ")}
          >
            {/* Image */}
            <div className={["relative overflow-hidden", idx === 0 ? "aspect-[3/4] lg:aspect-[3/4.2]" : "aspect-[3/4]"].join(" ")}>
              <img
                src={c.image}
                alt={c.label}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              {/* Category name + Shop CTA on image — all screen sizes */}
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-5 text-cream">
                <h3 className="font-display text-lg md:text-2xl lg:text-3xl leading-tight drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">{c.label}</h3>
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] md:text-xs tracking-[0.2em] uppercase font-semibold text-cream drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] group-hover:text-gold transition-colors">
                  Shop <ArrowRight className="h-3 w-3 md:h-3.5 md:w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
            {/* Subtitle below image */}
            <div className="px-1 pt-2 pb-3 bg-background">
              {c.subtitle && (
                <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground leading-snug mt-0.5">{c.subtitle}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── NEW IN ──────────────────────────────────────────────────────────────────
const COLS = 4; // products per row on lg
const NEW_IN_ROW = COLS; // one row = 4 items

function NewIn() {
  const { products } = useProducts();
  const list = products;
  const [visibleCount, setVisibleCount] = useState(NEW_IN_ROW);

  // Reset to one row on mount (handles refresh / navigation back)
  useEffect(() => { setVisibleCount(NEW_IN_ROW); }, []);

  const visible = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  return (
    <section className="bg-secondary/30 py-20 md:py-28">
      <div className="container-luxe">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <p className="text-eyebrow">New In</p>
            <h2 className="font-display text-4xl md:text-5xl mt-3">Just Arrived</h2>
            <span className="gold-divider mt-4" />
          </div>
          <Link to="/shop" className="text-xs tracking-[0.3em] uppercase font-semibold border-b-2 border-gold pb-1 hover:text-gold-deep transition-colors">
            Shop New In
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
          {visible.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount((count) => count + NEW_IN_ROW)}
              className="inline-flex items-center gap-3 border border-onyx text-onyx px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-onyx hover:text-cream transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── SUITS SECTION ───────────────────────────────────────────────────────────
const SUIT_TABS_FALLBACK = [
  { key: "all", label: "All" },
];

const SUITS_PER_ROW = 4;
const SUITS_INITIAL_ROWS = 3;

function SuitsSection() {
  const { products } = useProducts({ category: "suits" });
  const { categories } = useCategories();
  const [tabs, setTabs] = useState<{ key: string; label: string }[]>(SUIT_TABS_FALLBACK);
  const [activeTab, setActiveTab] = useState("all");
  const [visibleRows, setVisibleRows] = useState(SUITS_INITIAL_ROWS);

  // Reset rows when tab changes or on mount
  useEffect(() => { setVisibleRows(SUITS_INITIAL_ROWS); }, [activeTab]);

  useEffect(() => {
    async function loadSuitTabs() {
      try {
        const suitsCategory = categories.find((c) => c.slug === "suits");
        if (!suitsCategory?.id) {
          setTabs(SUIT_TABS_FALLBACK);
          return;
        }

        const res = await fetch(`/api/sub-categories/category/${suitsCategory.id}`);
        if (!res.ok) {
          setTabs(SUIT_TABS_FALLBACK);
          return;
        }

        const json = await res.json();
        const next = Array.isArray(json?.data)
          ? json.data.map((sc: any) => ({ key: sc.slug, label: sc.name }))
          : [];

        setTabs(next.length ? [{ key: "all", label: "All" }, ...next] : SUIT_TABS_FALLBACK);
      } catch {
        setTabs(SUIT_TABS_FALLBACK);
      }
    }

    void loadSuitTabs();
  }, [categories]);

  useEffect(() => {
    if (!tabs.some((t) => t.key === activeTab)) {
      setActiveTab("all");
    }
  }, [tabs, activeTab]);

  const allSuits = products;
  const displayed = activeTab === "all"
    ? allSuits
    : allSuits.filter((p) => p.sub_category === activeTab);

  const maxVisible = visibleRows * SUITS_PER_ROW;
  const visible = displayed.slice(0, maxVisible);
  const hasMore = displayed.length > maxVisible;

  return (
    <section className="container-luxe py-20 md:py-28">
      {/* header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-eyebrow">Tailored Mastery</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Suits</h2>
        <span className="gold-divider mt-5" />
      </div>

      {/* sub-category tabs */}
      <div className="flex items-center justify-center gap-1 md:gap-2 mb-12 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={[
              "px-5 py-3 text-xs tracking-[0.25em] uppercase font-medium whitespace-nowrap transition-all duration-300 border-b-2 -mb-px",
              activeTab === t.key ? "text-gold-deep border-gold" : "text-muted-foreground border-transparent hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
        {visible.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* load more */}
      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={() => setVisibleRows((r) => r + SUITS_INITIAL_ROWS)}
            className="inline-flex items-center gap-3 border border-onyx text-onyx px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-onyx hover:text-cream transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}

// ─── SINGLE CATEGORY ROW ─────────────────────────────────────────────────────
const CAT_ROW_INITIAL = 4; // one row of 4
const CAT_ROW_MORE   = 4; // one more row on load-more

function CategoryRow({ title, eyebrow, category, shopSearch }: {
  title: string;
  eyebrow: string;
  category: string;
  shopSearch: Record<string, string>;
}) {
  const { products } = useProducts({ category });
  const [visibleCount, setVisibleCount] = useState(CAT_ROW_INITIAL);

  // Reset on mount (refresh / navigate back)
  useEffect(() => { setVisibleCount(CAT_ROW_INITIAL); }, [category]);

  if (!products.length) return null;

  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <section className="container-luxe py-16 md:py-20 border-t border-border/40">
      <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
        <div>
          <p className="text-eyebrow">{eyebrow}</p>
          <h2 className="font-display text-3xl md:text-4xl mt-2">{title}</h2>
          <span className="gold-divider mt-4" />
        </div>
        <Link to="/shop" search={shopSearch as never} className="text-xs tracking-[0.3em] uppercase font-semibold border-b-2 border-gold pb-1 hover:text-gold-deep transition-colors">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
        {visible.map((p, i) => <ProductCard key={`${p.id}-${i}`} product={p} />)}
      </div>
      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={() => setVisibleCount((count) => count + CAT_ROW_MORE)}
            className="inline-flex items-center gap-3 border border-onyx text-onyx px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-onyx hover:text-cream transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}

function EditorialBanner() {
  return (
    <section className="container-luxe py-20 md:py-28">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img src="/gallery-compressed/dinner_suits/Dinner_Suits_Military_look_1.jpg" alt="Heritage editorial" className="w-full h-full object-cover object-top" />
          <div className="absolute top-4 left-4 bg-cream/95 px-3 py-1 text-[10px] tracking-[0.3em] uppercase">Editorial</div>
        </div>
        <div className="lg:pl-10">
          <p className="text-eyebrow">Heritage</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-3 leading-[1.05]">
            A Legacy Hand-Stitched Into Every Thread.
          </h2>
          <span className="gold-divider mt-6" />
          <p className="mt-6 text-muted-foreground leading-relaxed">
            From the historic markets of Lagos to the world's most discerning wardrobes —
            every Sparks & Splendour piece is sculpted by master tailors trained across
            three continents. We honour heritage textiles while reinterpreting them for the
            contemporary aristocrat.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-10">
            {[
              { n: "12+", l: "Years of craft" },
              { n: "240", l: "Bespoke clients" },
              { n: "9",   l: "Master tailors" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl md:text-4xl text-gold-deep">{s.n}</div>
                <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <Link to="/about" className="inline-flex mt-10 bg-onyx text-cream px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors">
            Read Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}

function PromoBanner() {
  return (
    <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
      <img src="/gallery-compressed/Hero-assets/heroImg-05.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
      <div className="absolute inset-0 bg-onyx/60" />
      <div className="relative z-10 h-full container-luxe flex flex-col items-center justify-center text-center text-cream">
        <p className="text-eyebrow text-gold">Exclusive Offer</p>
        <h2 className="font-serif-luxe text-4xl sm:text-5xl md:text-7xl mt-4 leading-tight">Bespoke. Beyond Compare.</h2>
        <p className="mt-5 max-w-xl text-cream/80">
          Reserve a private consultation with our master tailors and receive 15% on your first commissioned piece.
        </p>
        <Link to="/contact" className="inline-flex mt-8 bg-gold text-onyx px-9 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-cream transition-colors">
          Book an Appointment
        </Link>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Adaeze O.", role: "Lagos", q: "Every commission feels like a love letter to craftsmanship. The fit is otherworldly." },
    { name: "Tunde A.", role: "London", q: "I have suits from Savile Row and Milan. Sparks & Splendour holds its own among them." },
    { name: "Chiamaka E.", role: "Atlanta", q: "My aso-ebi was the most spoken-about look at the wedding. Pure poetry in cloth." },
  ];
  return (
    <section className="bg-secondary/40 py-20 md:py-28">
      <div className="container-luxe">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-eyebrow">Patrons</p>
          <h2 className="font-display text-4xl md:text-5xl mt-3">Words from the Wardrobe</h2>
          <span className="gold-divider mt-5" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <figure key={i} className="bg-background border border-border p-8 hover-lift">
              <div className="flex gap-0.5 text-gold mb-5">
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="font-display text-xl leading-snug">"{t.q}"</blockquote>
              <figcaption className="mt-6 text-xs tracking-[0.25em] uppercase">
                <span className="font-semibold">{t.name}</span>
                <span className="text-muted-foreground"> · {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Promise() {
  const items = [
    { I: Scissors, t: "Bespoke Atelier",   d: "Hand-cut & finished by master tailors." },
    { I: Award,    t: "Heritage Fabrics",  d: "Italian, Belgian & hand-loomed aso-oke." },
    { I: Truck,    t: "Worldwide Shipping", d: "Discreetly packaged & insured globally." },
    { I: Star,     t: "Lifetime Service",  d: "Complimentary alterations on every piece." },
  ];
  return (
    <section className="container-luxe py-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center">
        {items.map((it) => (
          <div key={it.t}>
            <it.I className="h-7 w-7 text-gold mx-auto" />
            <h4 className="font-display text-xl mt-4">{it.t}</h4>
            <p className="text-sm text-muted-foreground mt-2">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <HeroCarousel />
      <MarqueeStrip />
      <CategoryGrid />
      <NewIn />
      <SuitsSection />
      <CategoryRow title="Natives"  eyebrow="Heritage Reimagined"  category="natives"  shopSearch={{ category: "natives" }} />
      <CategoryRow title="Agbada"   eyebrow="Royal Drape"          category="agbada"   shopSearch={{ category: "agbada" }} />
      <CategoryRow title="Kaftan"   eyebrow="Refined Comfort"      category="kaftan"   shopSearch={{ category: "kaftan" }} />
      <CategoryRow title="Ladies"   eyebrow="Couture for Her"      category="ladies"   shopSearch={{ category: "ladies" }} />
      <CategoryRow title="Casuals"  eyebrow="Quiet Luxury"         category="casuals"  shopSearch={{ category: "casuals" }} />
      <EditorialBanner />
      <PromoBanner />
      <Testimonials />
      <Promise />
    </>
  );
}
