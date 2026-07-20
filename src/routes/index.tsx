import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Star, Award, Scissors, Truck } from "lucide-react";
import { useProducts } from "@/lib/db-products";
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

const SLIDES: Slide[] = [
  {
    type: "video",
    src: "/video/heroVideo.mp4",
    eyebrow: "Autumn / Winter Collection",
    title: "The Art of Bespoke",
    subtitle: "A house dedicated to the quiet authority of craftsmanship.",
    cta: "Discover the Collection",
    href: { to: "/shop" },
  },
  {
    type: "image",
    src: "/gallery/img-05.jpg",
    eyebrow: "Signature Suits",
    title: "Sculpted Tailoring",
    subtitle: "Architectural silhouettes hand-finished in our Lagos office.",
    cta: "Shop Suits",
    href: { to: "/shop", search: { category: "suits" } },
  },
  {
    type: "image",
    src: "/gallery/img-10.jpg",
    eyebrow: "Heritage Reimagined",
    title: "Royal Natives",
    subtitle: "Hand-embroidered agbada and kaftans for the modern monarch.",
    cta: "Shop Natives",
    href: { to: "/shop", search: { category: "natives" } },
  },
  {
    type: "image",
    src: "/gallery/couple-02.jpg",
    eyebrow: "Couture for Her",
    title: "Ladies Atelier",
    subtitle: "Aso-ebi & couture pieces sculpted in golden silk.",
    cta: "Shop Ladies",
    href: { to: "/shop", search: { category: "ladies" } },
  },
  {
    type: "image",
    src: "/gallery/img-40.jpg",
    eyebrow: "Limited Edition",
    title: "The Rose Jewel",
    subtitle: "Hand-beaded silk wool — only nine pieces released worldwide.",
    cta: "Shop Limited",
    href: { to: "/shop" },
  },
];

function HeroCarousel() {
  const [i, setI] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = () => setI((p) => (p + 1) % SLIDES.length);
  const back = () => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const cur = SLIDES[i];
    if (cur.type === "video") {
      const v = videoRef.current;
      const onEnd = () => advance();
      v?.addEventListener("ended", onEnd);
      // fallback: if video doesn't end naturally within 14s, advance anyway
      timer.current = setTimeout(advance, 14000);
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
  const nextIdx = (i + 1) % SLIDES.length;
  const nextSlide = SLIDES[nextIdx];

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-onyx text-cream">
      {/* hidden preload for next image */}
      {nextSlide.type === "image" && (
        <link rel="preload" as="image" href={nextSlide.src} />
      )}

      {SLIDES.map((s, idx) => (
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
          <p className="text-eyebrow text-gold mb-5">{SLIDES[i].eyebrow}</p>
          <h1 className="font-serif-luxe text-5xl sm:text-6xl md:text-7xl lg:text-[88px] leading-[1.02] tracking-tight">
            {SLIDES[i].title}
          </h1>
          <p className="mt-5 text-base md:text-lg text-cream/80 max-w-lg leading-relaxed">{SLIDES[i].subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={SLIDES[i].href.to}
              search={SLIDES[i].href.search as never}
              className="group inline-flex items-center gap-3 bg-gold text-onyx px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-cream transition-colors"
            >
              {SLIDES[i].cta}
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
        {SLIDES.map((_, idx) => (
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
        {String(i + 1).padStart(2, "0")} <span className="mx-2 text-gold">/</span> {String(SLIDES.length).padStart(2, "0")}
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
const COLLECTION_CATS = [
  { key: "safari",  label: "Safari Suits",  tagline: "Expedition Tailoring",  image: "/gallery/safari-code/safari-01.jpg" },
  { key: "wedding", label: "Wedding Suits", tagline: "Sculpted for the Aisle", image: "/gallery/img-05.jpg" },
  { key: "natives", label: "Natives",       tagline: "Heritage Reimagined",   image: "/gallery/img-10.jpg" },
  { key: "ladies",  label: "Ladies",        tagline: "Couture for Her",       image: "/gallery/couple-02.jpg" },
];

function CategoryGrid() {
  return (
    <section className="container-luxe py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-eyebrow">Maisons</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">Our Collections</h2>
        <span className="gold-divider mt-5" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {COLLECTION_CATS.map((c, idx) => (
          <Link
            key={c.key}
            to="/shop"
            search={{ category: c.key } as never}
            className={[
              "group relative overflow-hidden bg-muted aspect-[3/4]",
              idx === 0 ? "lg:row-span-2 lg:aspect-[3/4.2]" : "",
            ].join(" ")}
          >
            <img
              src={c.image}
              alt={c.label}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-cream">
              <p className="text-[10px] text-gold tracking-[0.3em] uppercase">{c.tagline}</p>
              <h3 className="font-display text-2xl md:text-3xl mt-1.5">{c.label}</h3>
              <span className="inline-flex items-center gap-2 mt-3 text-xs tracking-[0.25em] uppercase text-cream/90 group-hover:text-gold transition-colors">
                Shop Now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
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
  const list = products.slice(0, NEW_IN_ROW * 2); // max 2 rows worth
  const [showExtra, setShowExtra] = useState(false);

  // Reset to one row on mount (handles refresh / navigation back)
  useEffect(() => { setShowExtra(false); }, []);

  const visible = showExtra ? list : list.slice(0, NEW_IN_ROW);

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
        {!showExtra && list.length > NEW_IN_ROW && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowExtra(true)}
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
const SUIT_TABS = [
  { key: "safari",   label: "Safari" },
  { key: "wedding",  label: "Wedding" },
  { key: "business", label: "Business" },
  { key: "dinner",   label: "Dinner" },
  { key: "prom",     label: "Prom" },
];

const SUITS_PER_ROW = 4;
const SUITS_INITIAL_ROWS = 3;

function SuitsSection() {
  const { products } = useProducts({ category: "suits" });
  const [activeTab, setActiveTab] = useState("safari");
  const [visibleRows, setVisibleRows] = useState(SUITS_INITIAL_ROWS);

  // Reset rows when tab changes or on mount
  useEffect(() => { setVisibleRows(SUITS_INITIAL_ROWS); }, [activeTab]);

  // Filter by sub-category tag; since static products don't have sub-tags,
  // we cycle through all suits and assign them to tabs by index for demo purposes.
  // In production the product.sub_category field would be used.
  const allSuits = products;
  const tabFiltered = allSuits.filter((_, idx) => {
    // Use modulo to distribute static products across tabs for visual demo
    const tabIdx = SUIT_TABS.findIndex((t) => t.key === activeTab);
    return idx % SUIT_TABS.length === tabIdx || allSuits.length <= SUIT_TABS.length;
  });
  // If filtering yields nothing (e.g. backend has sub_category field), fall back to all suits
  const displayed = tabFiltered.length > 0 ? tabFiltered : allSuits;

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
        {SUIT_TABS.map((t) => (
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
  const [showMore, setShowMore] = useState(false);

  // Reset on mount (refresh / navigate back)
  useEffect(() => { setShowMore(false); }, []);

  // Cycle images if fewer than needed — reuse existing ones
  const pool = products.length > 0 ? products : [];
  if (!pool.length) return null;

  // Pad to at least 8 by cycling
  const padded = Array.from({ length: CAT_ROW_INITIAL + CAT_ROW_MORE }, (_, i) => pool[i % pool.length]);
  const visible = showMore ? padded : padded.slice(0, CAT_ROW_INITIAL);
  const hasMore = !showMore && padded.length > CAT_ROW_INITIAL;

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
            onClick={() => setShowMore(true)}
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
          <img src="/gallery/couple-01.jpg" alt="Heritage editorial" className="w-full h-full object-cover object-top" />
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
      <img src="/gallery/img-15.jpg" alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
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
