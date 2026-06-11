import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/safari-lookbook")({
  component: SafariLookbookPage,
});

const LOOKBOOK_IMAGES = [
  "safari-01.jpg",
  "safari-02.jpg",
  "safari-03.jpg",
  "safari-04.jpg",
  "safari-05.jpg",
  "safari-06.jpg",
  "safari-07.jpg",
  "safari-08.jpg",
  "safari-09.jpg",
  ...[
    "1413","1433","1506","1520","1532","1554","1558","1576",
    "1614","1618","1650","1674","1694","1714","1755","1770",
    "1774","1790","1832","1859","1865","1871","1927","1932",
    "1962","1982","1992","1997","2006","2012","2040","2068",
    "2089","2094","2127","2166","2186","2207","2214","2236",
    "2293","2297","2348","2362","2395","2415","2460","2473",
  ].map((n) => `TJD_${n}.jpg`),
];

const INITIAL_VISIBLE = 16;

function SafariLookbookPage() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const visibleImages = LOOKBOOK_IMAGES.slice(0, visibleCount);

  return (
    <>
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <img
          src="/gallery/safari-code/safari-01.jpg"
          alt="Safari Code lookbook hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-onyx/70" />
        <div className="relative z-10 container-luxe h-full flex flex-col justify-center text-cream">
          <p className="text-eyebrow text-gold">Safari Code</p>
          <h1 className="font-serif-luxe text-5xl md:text-7xl max-w-3xl leading-tight">Safari Code · Lookbook</h1>
          <p className="mt-6 max-w-2xl text-cream/80 leading-relaxed">
            The full Safari Code gallery is available here. Images are lazy-loaded and revealed progressively for smoother scrolling.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-cream text-onyx px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold transition-colors"
            >
              Back to Home
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 border border-cream/40 text-cream px-8 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-cream hover:text-onyx transition-colors"
            >
              Shop the Capsule
            </Link>
          </div>
        </div>
      </section>

      <section className="container-luxe py-20 md:py-28">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-eyebrow text-gold">Lookbook Gallery</p>
          <h2 className="font-display text-4xl md:text-5xl mt-3">The full Safari Code archive</h2>
          <span className="gold-divider mt-5" />
          <p className="mt-5 text-cream/80 leading-relaxed">
            This page loads the Safari Code collection separately so the homepage stays fast. Scroll down for the full gallery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {visibleImages.map((image) => (
            <img
              key={image}
              src={`/gallery/safari-code/${image}`}
              alt="Safari Code lookbook"
              loading="lazy"
              decoding="async"
              className="w-full aspect-[4/5] object-cover object-top rounded-sm bg-charcoal/20"
            />
          ))}
        </div>

        {visibleCount < LOOKBOOK_IMAGES.length && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setVisibleCount(LOOKBOOK_IMAGES.length)}
              className="inline-flex items-center gap-2 bg-cream text-onyx px-10 py-4 text-xs tracking-[0.3em] uppercase font-semibold hover:bg-gold transition-colors"
            >
              Load full Safari lookbook
            </button>
          </div>
        )}
      </section>
    </>
  );
}
