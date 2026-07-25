import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/safari-lookbook")({
  component: SafariLookbookPage,
});

const LOOKBOOK_IMAGES = [
  "Safari_Classic_purple_safari_suit_1.jpg",
  "Safari_Classic_purple_safari_suit_2.jpg",
  "Safari_Classic_purple_safari_suit_3.jpg",
  "Safari_Tailored_burgundy_safari_suit_1.jpg",
  "Safari_Tailored_burgundy_safari_suit_2.jpg",
  "Safari_Tailored_burgundy_safari_suit_3.jpg",
  "Safari_The_AlphaCode_Burgundy_1.jpg",
  "Safari_The_AlphaCode_Burgundy_2.jpg",
  "Safari_The_AlphaCode_Burgundy_3.jpg",
  "Safari_The_AlphaCode_Burgundy_4.jpg",
  "Safari_The_AlphaCode_Burgundy_5.jpg",
  "Safari_The_Hunter_Set_ChocolateBrown_1.jpg",
  "Safari_The_Hunter_Set_ChocolateBrown_2.jpg",
  "Safari_The_Hunter_Set_ChocolateBrown_3.jpg",
  "Safari_The_Hunter_Set_ChocolateBrown_4.jpg",
  "Safari_The_Hunter_Set_ChocolateBrown_5.jpg",
  "Safari_The_Monarch_Fit_MintGreen_1.jpg",
  "Safari_The_Monarch_Fit_MintGreen_2.jpg",
  "Safari_The_Monarch_Fit_MintGreen_3.jpg",
  "Safari_The_Monarch_Fit_MintGreen_4.jpg",
  "Safari_The_Monarch_Fit_MintGreen_5.jpg",
  "Safari_The_Monarch_Fit_LightPink_1.jpg",
  "Safari_The_Monarch_Fit_LightPink_2.jpg",
  "Safari_The_Monarch_Fit_LightPink_3.jpg",
  "Safari_The_Monarch_Fit_LightPink_4.jpg",
  "Safari_The_Monarch_Fit_LightPink_5.jpg",
  "Safari_The_Monarch_Fit_LightPink_6.jpg",
  "Safari_The_Monarch_Fit_Pink&Green_1.jpg",
  "Safari_The_Monarch_Fit_Pink&Green_2.jpg",
  "Safari_The_Monarch_Fit_Pink&Green_3.jpg",
  "Safari_The_Power_Set_Green_1.jpg",
  "Safari_The_Power_Set_Green_2.jpg",
  "Safari_The_Power_Set_Green_3.jpg",
  "Safari_The_Power_Set_Green_4.jpg",
  "Safari_The_Power_Set_Green_5.jpg",
  "Safari_The_Power_Set_Green_6.jpg",
  "Safari_The_Power_Set_Orange_1.jpg",
  "Safari_The_Power_Set_Orange_2.jpg",
  "Safari_The_Power_Set_Orange_3.jpg",
  "Safari_The_Power_Set_Orange_4.jpg",
  "Safari_The_Power_Set_Orange_5.jpg",
  "Safari_The_Power_Set_Green&Orange_1.jpg",
  "Safari_The_Power_Set_Green&Orange_2.jpg",
  "Safari_The_Power_Set_Green&Orange_3.jpg",
  "Safari_The_Power_Set_Green&Orange_4.jpg",
  "Safari_The_Power_Set_Green&Orange_5.jpg",
  "Safari_The_Soverign_Fit_boldTeal_1.jpg",
  "Safari_The_Soverign_Fit_boldTeal_2.jpg",
  "Safari_The_Soverign_Fit_boldTeal_3.jpg",
  "Safari_The_Soverign_Fit_boldTeal_4.jpg",
  "Safari_The_Soverign_Fit_boldTeal_5.jpg",
  "Safari_The_Soverign_Fit_Orchid_Pink_1.jpg",
  "Safari_The_Soverign_Fit_Orchid_Pink_2.jpg",
  "Safari_The_Soverign_Fit_Orchid_Pink_3.jpg",
  "Safari_The_Soverign_Fit_Orchid_Pink_4.jpg",
  "Safari_The_Soverign_Fit_Orchid_Pink_5.jpg",
  "Safari_The_Soverign_Fit_Teal&Pink_1.jpg",
  "Safari_The_Soverign_Fit_Teal&Pink_2.jpg",
  "Safari_The_Soverign_Fit_Teal&Pink_3.jpg",
  "Safari_The_Soverign_Fit_Teal&Pink_4.jpg",
  "Safari_The_Soverign_Fit_Teal&Pink_5.jpg",
];

const INITIAL_VISIBLE = 16;

function SafariLookbookPage() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const visibleImages = LOOKBOOK_IMAGES.slice(0, visibleCount);

  return (
    <>
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <img
          src="/gallery-compressed/safari_suits/safari-cover-image-main.jpg"
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
              src={`/gallery-compressed/safari_suits/${image}`}
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
