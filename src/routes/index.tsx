import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Star, Award, Scissors, Truck } from "lucide-react";
import { categories as staticCategories } from "@/lib/products";
import { useProducts, useCategories } from "@/lib/db-products";
import { ProductCard } from "@/components/ProductCard";
import { useFeaturedLaunch } from "@/lib/featuredLaunch";

export const Route = createFileRoute("/")({
  component: HomePage,
});

interface Slide {
  type: "video" | "image";
  src: string;
  poster?: string;
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
      // Wait for video end OR fallback 12s
      const v = videoRef.current;
      const onEnd = () => advance();
      v?.addEventListener("ended", onEnd);
      timer.current = setTimeout(advance, 14000);
      return () => {
        v?.removeEventListener("ended", onEnd);
        if (timer.current) clearTimeout(timer.current);
      };
    }
    timer.current = setTimeout(advance, 6500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [i]);

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-onyx text-cream">
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
              Your browser does not support the video tag.
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
      <button
        onClick={back}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center border border-cream/30 text-cream hover:bg-gold hover:text-onyx hover:border-gold transition-colors rounded-full"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={advance}
        aria-label="Next slide"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center border border-cream/30 text-cream hover:bg-gold hover:text-onyx hover:border-gold transition-colors rounded-full"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={[
              "h-[3px] transition-all duration-500",
              idx === i ? "w-10 bg-gold" : "w-5 bg-cream/40 hover:bg-cream/70",
            ].join(" ")}
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

// Static fallback — always used when backend has no entry yet
const STATIC_SAFARI_IMAGES = [
  "/gallery/safari-code/safari-01.jpg",
  "/gallery/safari-code/safari-02.jpg",
  "/gallery/safari-code/safari-03.jpg",
  "/gallery/safari-code/safari-04.jpg",
  "/gallery/safari-code/safari-05.jpg",
  "/gallery/safari-code/safari-06.jpg",
];
const STATIC_SAFARI_VIDEO = "/gallery/safari-code/safari-look.mp4";
const STATIC_HERO_VIDEO = "/gallery/safari-code/safari-hero.mp4";

function SafariCode() {
  const { launch } = useFeaturedLaunch();
  // Never block render — always show static content immediately,
  // then swap to backend data once it arrives.

  const title      = launch?.title        || "The Safari Code";
  const subtitle   = launch?.subtitle     || "A new chapter from Sparks & Splendour — sun-drenched silhouettes, earthen palettes and expedition-grade tailoring engineered for the modern explorer.";
  const eyebrow    = launch?.eyebrow      || "Capsule · Limited Edition";
  const ctaLabel   = launch?.cta_label    || "Explore the Code";
  const lookbookLabel = launch?.lookbook_label || "View Lookbook";

  // Hero: backend video > backend image > static video
  const heroVideo  = launch?.hero_video_url || STATIC_HERO_VIDEO;
  const heroImage  = launch?.hero_image_url || null;

  // Grid images: backend array (if non-empty) > static fallback
  const images: string[] =
    launch?.images && Array.isArray(launch.images) && launch.images.length > 0
      ? launch.images
      : STATIC_SAFARI_IMAGES;

  // The "In Motion" slot: backend video url > static safari-look.mp4
  const gridVideo = launch?.hero_video_url || STATIC_SAFARI_VIDEO;

  return (
    <section className="relative bg-onyx text-cream overflow-hidden">
      {/* Cinematic hero */}
      <div className="relative h-[78svh] min-h-[520px] w-full overflow-hidden">
        {heroImage ? (
          <img src={heroImage} alt={title} className="absolute inset-0 w-full h-full object-cover object-top" />
        ) : (
          <video
            preload="metadata"
            autoPlay
            muted
            playsInline
            loop
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.85)_100%)]" />

        <div className="relative z-10 h-full container-luxe flex flex-col justify-end pb-14 md:pb-20">
          <p className="text-eyebrow text-gold animate-fade-up">{eyebrow}</p>
          <h2 className="font-serif-luxe leading-[0.95] tracking-tight mt-4 animate-fade-up text-[18vw] sm:text-[14vw] md:text-[10vw] lg:text-[8.5rem]">
            {title.includes("Safari") ? (
              <>{title.split("Safari")[0]}<span className="italic text-gold">Safari</span>{title.split("Safari")[1]}</>
            ) : title}
          </h2>
          <div className="mt-6 max-w-xl animate-fade-up">
            <span className="gold-divider" />
            <p className="mt-5 text-cream/85 text-base md:text-lg leading-relaxed">{subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/shop" className="group inline-flex items-center gap-3 bg-gold text-onyx px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-cream transition-colors">
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/safari-lookbook" className="inline-flex items-center gap-3 border border-cream/40 text-cream px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-cream hover:text-onyx transition-colors">
                {lookbookLabel}
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden md:flex absolute top-8 right-8 z-10 items-center gap-3 text-[10px] tracking-[0.4em] uppercase text-cream/70">
          <span className="h-px w-10 bg-gold" />
          SS · Capsule 01
        </div>
      </div>

      {/* Lookbook preview grid */}
      <div className="container-luxe py-16 md:py-24">
        <div className="grid grid-cols-12 gap-3 md:gap-5">
          {/* Large left image */}
          <div className="col-span-12 md:col-span-7 relative aspect-[4/5] md:aspect-[5/6] overflow-hidden bg-charcoal/40 group">
            <img src={images[0]} alt={`${title} look 1`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-105" />
            <div className="absolute bottom-0 inset-x-0 p-5 md:p-7 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Look 01</p>
              <h3 className="font-display text-2xl md:text-3xl mt-1 text-cream">The Voyager</h3>
            </div>
          </div>

          {/* Right column: image + video */}
          <div className="col-span-12 md:col-span-5 grid grid-rows-2 gap-3 md:gap-5">
            <div className="relative overflow-hidden bg-charcoal/40 group aspect-[4/3]">
              <img src={images[1] || images[0]} alt={`${title} look 2`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-105" />
            </div>
            {/* Always show the video in this slot */}
            <div className="relative overflow-hidden bg-charcoal/40 group aspect-[4/3]">
              <video
                preload="metadata"
                src={gridVideo}
                poster={images[2] || images[0]}
                autoPlay
                muted
                playsInline
                loop
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 text-[10px] tracking-[0.3em] uppercase text-cream/90 bg-onyx/60 px-2 py-1">In Motion</div>
            </div>
          </div>

          {/* Bottom row: two portrait images + wide editorial */}
          <div className="col-span-6 md:col-span-3 relative aspect-[3/4] overflow-hidden bg-charcoal/40 group">
            <img src={images[3] || images[0]} alt={`${title} detail`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-105" />
          </div>
          <div className="col-span-6 md:col-span-3 relative aspect-[3/4] overflow-hidden bg-charcoal/40 group">
            <img src={images[4] || images[0]} alt={`${title} detail`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-105" />
          </div>
          <div className="col-span-12 md:col-span-6 relative aspect-[16/10] overflow-hidden bg-charcoal/40 group">
            <img src={images[5] || images[0]} alt={`${title} editorial`} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-y-0 left-0 p-6 md:p-10 flex flex-col justify-center max-w-sm">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold">The Code</p>
              <h3 className="font-display text-2xl md:text-3xl mt-2 text-cream leading-tight">Tailored for the Wild, Refined for the City.</h3>
              <Link to="/shop" className="inline-flex items-center gap-2 mt-5 text-xs tracking-[0.3em] uppercase text-cream/90 hover:text-gold transition-colors">
                Shop the Capsule <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/safari-lookbook" className="inline-flex items-center gap-3 bg-cream text-onyx px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold transition-colors">
            View the full Lookbook
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SafariSubCollection({
  eyebrow, title, copy, images, reverse = false,
}: { eyebrow: string; title: string; copy: string; images: string[]; reverse?: boolean }) {
  return (
    <div className="container-luxe py-14 md:py-20 border-t border-cream/10">
      <div className={["grid lg:grid-cols-12 gap-6 md:gap-10 items-center", reverse ? "lg:[direction:rtl]" : ""].join(" ")}>
        <div className="lg:col-span-4 [direction:ltr]">
          <p className="text-eyebrow text-gold">{eyebrow}</p>
          <h3 className="font-serif-luxe text-4xl md:text-5xl mt-3 leading-tight">{title}</h3>
          <span className="gold-divider mt-5" />
          <p className="mt-5 text-cream/75 leading-relaxed">{copy}</p>
          <Link to="/shop" className="inline-flex items-center gap-2 mt-7 text-xs tracking-[0.3em] uppercase text-cream hover:text-gold transition-colors">
            Shop the Chapter <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="lg:col-span-8 grid grid-cols-3 gap-2 md:gap-3 [direction:ltr]">
          {images.map((src, i) => (
            <div key={src} className={["relative overflow-hidden bg-charcoal/40 group", i === 0 ? "col-span-2 row-span-2 aspect-[4/5]" : "aspect-[3/4]"].join(" ")}>
              <img src={src} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1400ms] group-hover:scale-105" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryGrid() {
  const { categories: backendCats } = useCategories();
  const cats = backendCats.length
    ? backendCats.map((c) => {
        const fallback = staticCategories.find((s) => s.key === c.slug);
        return {
          key: c.slug,
          label: c.name,
          tagline: c.description || fallback?.tagline || "",
          image: c.image_url || fallback?.image || "",
        };
      })
    : staticCategories;

  return (
    <section className="container-luxe py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-eyebrow">Maisons</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">The Collections</h2>
        <span className="gold-divider mt-5" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {cats.slice(0, 4).map((c, idx) => (
          <Link
            key={c.key}
            to="/shop"
            search={{ category: c.key }}
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
                Discover <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { products } = useProducts();
  const featured = products.filter((p) => p.badge).slice(0, 8);
  return (
    <section className="bg-secondary/30 py-20 md:py-28">
      <div className="container-luxe">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <p className="text-eyebrow">Editor's Selection</p>
            <h2 className="font-display text-4xl md:text-5xl mt-3">Signature Pieces</h2>
            <span className="gold-divider mt-4" />
          </div>
          <Link to="/shop" className="text-xs tracking-[0.3em] uppercase font-semibold border-b-2 border-gold pb-1 hover:text-gold-deep transition-colors">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      </div>
    </section>
  );
}

function VideoShowcase() {
  return (
    <section className="container-luxe py-20 md:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-eyebrow">Behind the Craft</p>
        <h2 className="font-display text-4xl md:text-5xl mt-3">The Atelier in Motion</h2>
        <span className="gold-divider mt-5" />
      </div>
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="relative aspect-[9/16] md:aspect-[4/5] overflow-hidden bg-onyx">
          <video
            src="/video/1015819499.mp4"
            autoPlay
            muted
            playsInline
            loop
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-5 text-cream">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Signature Suits</p>
            <h3 className="font-display text-2xl mt-1">Sculpted to Perfection</h3>
          </div>
        </div>
        <div className="relative aspect-[9/16] md:aspect-[4/5] overflow-hidden bg-onyx">
          <video
            src="/video/1068506149.mp4"
            autoPlay
            muted
            playsInline
            loop
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-5 text-cream">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold">Heritage Natives</p>
            <h3 className="font-display text-2xl mt-1">Woven in Tradition</h3>
          </div>
        </div>
      </div>
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
              { n: "9", l: "Master tailors" },
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

function NewArrivals() {
  const { products } = useProducts();
  const list = products.slice(8, 14);
  return (
    <section className="container-luxe pb-20 md:pb-28">
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-10 md:gap-x-5">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
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
    { I: Scissors, t: "Bespoke Atelier", d: "Hand-cut & finished by master tailors." },
    { I: Award, t: "Heritage Fabrics", d: "Italian, Belgian & hand-loomed aso-oke." },
    { I: Truck, t: "Worldwide Shipping", d: "Discreetly packaged & insured globally." },
    { I: Star, t: "Lifetime Service", d: "Complimentary alterations on every piece." },
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
      <SafariCode />
      <CategoryGrid />
      <FeaturedProducts />
      <VideoShowcase />
      <EditorialBanner />
      <NewArrivals />
      <PromoBanner />
      <Testimonials />
      <Promise />
    </>
  );
}
