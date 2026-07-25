// Sparks & Splendour bespoke catalogue.
// Static fallback images — replaced by Cloudinary URLs when uploaded.

export type Category = "suits" | "natives" | "casuals" | "ladies" | "shirts" | "agbada" | "kaftan" | "pants";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  sub_category?: string | null;
  price: number;
  price_usd?: number;
  display_price: number;
  display_currency: "NGN" | "USD";
  currency_symbol: string;
  currency: string;
  image: string;
  gallery: string[];
  colors: string[];
  sizes: string[];
  description: string;
  fabric: string;
  badge?: "New" | "Bestseller" | "Limited";
}

// ── path helpers ──────────────────────────────────────────────────────────────
const GC = (folder: string, file: string) => `/gallery-compressed/${folder}/${file}`;
const safari   = (f: string) => GC("safari_suits", f);
const natives  = (f: string) => GC("natives", f);
const agbada   = (f: string) => GC("agbada", f);
const kaftan   = (f: string) => GC("kaftan", f);
const casuals  = (f: string) => GC("casuals", f);
const ladies   = (f: string) => GC("Ladies", f);
const pants    = (f: string) => GC("pants", f);

const SIZES = ["S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  // ───── SUITS ─────
  {
    id: "p-001", slug: "the-monarch-fit-mint",
    name: "The Monarch Fit — Mint Green",
    category: "suits", price: 685000, currency: "₦",
    image: safari("Safari_The_Monarch_Fit_MintGreen_1.jpg"),
    gallery: [
      safari("Safari_The_Monarch_Fit_MintGreen_1.jpg"),
      safari("Safari_The_Monarch_Fit_MintGreen_2.jpg"),
      safari("Safari_The_Monarch_Fit_MintGreen_3.jpg"),
      safari("Safari_The_Monarch_Fit_MintGreen_4.jpg"),
      safari("Safari_The_Monarch_Fit_MintGreen_5.jpg"),
    ],
    colors: ["Mint Green", "Onyx"], sizes: SIZES,
    description: "A regal silhouette tailored in hand-embellished mint linen. Sculpted shoulders, asymmetric closure, flared trouser break.",
    fabric: "Italian linen with crystal embellishment",
    badge: "Bestseller",
  },
  {
    id: "p-002", slug: "the-monarch-fit-pink",
    name: "The Monarch Fit — Light Pink",
    category: "suits", price: 685000, currency: "₦",
    image: safari("Safari_The_Monarch_Fit_LightPink_1.jpg"),
    gallery: [
      safari("Safari_The_Monarch_Fit_LightPink_1.jpg"),
      safari("Safari_The_Monarch_Fit_LightPink_2.jpg"),
      safari("Safari_The_Monarch_Fit_LightPink_3.jpg"),
      safari("Safari_The_Monarch_Fit_LightPink_4.jpg"),
      safari("Safari_The_Monarch_Fit_LightPink_5.jpg"),
      safari("Safari_The_Monarch_Fit_LightPink_6.jpg"),
    ],
    colors: ["Light Pink", "Onyx"], sizes: SIZES,
    description: "House-signature Monarch Fit in soft light pink — sculpted shoulders and tapered trousers.",
    fabric: "Italian linen",
    badge: "New",
  },
  {
    id: "p-003", slug: "the-sovereign-fit-teal",
    name: "The Sovereign Fit — Bold Teal",
    category: "suits", price: 595000, currency: "₦",
    image: safari("Safari_The_Soverign_Fit_boldTeal_1.jpg"),
    gallery: [
      safari("Safari_The_Soverign_Fit_boldTeal_1.jpg"),
      safari("Safari_The_Soverign_Fit_boldTeal_2.jpg"),
      safari("Safari_The_Soverign_Fit_boldTeal_3.jpg"),
      safari("Safari_The_Soverign_Fit_boldTeal_4.jpg"),
      safari("Safari_The_Soverign_Fit_boldTeal_5.jpg"),
    ],
    colors: ["Bold Teal", "Charcoal"], sizes: SIZES,
    description: "A commanding teal safari suit with bound buttons and a crossed lapel.",
    fabric: "Worsted wool",
  },
  {
    id: "p-004", slug: "the-alpha-code-burgundy",
    name: "The AlphaCode — Burgundy",
    category: "suits", price: 720000, currency: "₦",
    image: safari("Safari_The_AlphaCode_Burgundy_1.jpg"),
    gallery: [
      safari("Safari_The_AlphaCode_Burgundy_1.jpg"),
      safari("Safari_The_AlphaCode_Burgundy_2.jpg"),
      safari("Safari_The_AlphaCode_Burgundy_3.jpg"),
      safari("Safari_The_AlphaCode_Burgundy_4.jpg"),
      safari("Safari_The_AlphaCode_Burgundy_5.jpg"),
    ],
    colors: ["Burgundy", "Champagne"], sizes: SIZES,
    description: "The AlphaCode — a statement safari suit in deep burgundy for the daring tastemaker.",
    fabric: "Hand-finished wool blend",
    badge: "Limited",
  },
  {
    id: "p-005", slug: "the-power-set-green",
    name: "The Power Set — Green",
    category: "suits", price: 510000, currency: "₦",
    image: safari("Safari_The_Power_Set_Green_1.jpg"),
    gallery: [
      safari("Safari_The_Power_Set_Green_1.jpg"),
      safari("Safari_The_Power_Set_Green_2.jpg"),
      safari("Safari_The_Power_Set_Green_3.jpg"),
      safari("Safari_The_Power_Set_Green_4.jpg"),
      safari("Safari_The_Power_Set_Green_5.jpg"),
      safari("Safari_The_Power_Set_Green_6.jpg"),
    ],
    colors: ["Green"], sizes: SIZES,
    description: "The Power Set in bold green — sculpted shoulder, flared trouser, signature asymmetric vest closure.",
    fabric: "Wool/Cashmere blend",
  },
  {
    id: "p-006", slug: "the-hunter-set-chocolate",
    name: "The Hunter Set — Chocolate Brown",
    category: "suits", price: 465000, currency: "₦",
    image: safari("Safari_The_Hunter_Set_ChocolateBrown_1.jpg"),
    gallery: [
      safari("Safari_The_Hunter_Set_ChocolateBrown_1.jpg"),
      safari("Safari_The_Hunter_Set_ChocolateBrown_2.jpg"),
      safari("Safari_The_Hunter_Set_ChocolateBrown_3.jpg"),
      safari("Safari_The_Hunter_Set_ChocolateBrown_4.jpg"),
      safari("Safari_The_Hunter_Set_ChocolateBrown_5.jpg"),
    ],
    colors: ["Chocolate Brown"], sizes: SIZES,
    description: "The Hunter Set in rich chocolate brown — a timeless safari statement.",
    fabric: "Tweed with Lurex thread",
  },

  // ───── NATIVES ─────
  {
    id: "p-101", slug: "native-naa-001",
    name: "Heritage Native — NAA",
    category: "natives", price: 425000, currency: "₦",
    image: natives("Native_NAA-001.jpg"),
    gallery: [
      natives("Native_NAA-001.jpg"),
      natives("Native_NAA-002.jpg"),
      natives("Native_NAA-003.jpg"),
      natives("Native_NAA-004.jpg"),
      natives("Native_NAA-005.jpg"),
    ],
    colors: ["Burgundy"], sizes: SIZES,
    description: "Three-piece native in textured fabric with hand-couched gold motifs.",
    fabric: "Textured cotton with metallic embroidery",
    badge: "Bestseller",
  },
  {
    id: "p-102", slug: "native-nab-002",
    name: "Heritage Native — NAB",
    category: "natives", price: 395000, currency: "₦",
    image: natives("Native_NAB-002.jpg"),
    gallery: [
      natives("Native_NAB-002.jpg"),
      natives("Native_NAB-005.jpg"),
      natives("Native_NAA-001.jpg"),
    ],
    colors: ["Umber"], sizes: SIZES,
    description: "Heritage-style aso-oke sleeveless native with embroidered SS monogram.",
    fabric: "Aso-oke with metallic thread",
    badge: "Limited",
  },

  // ───── AGBADA ─────
  {
    id: "p-151", slug: "agbada-aaa-001",
    name: "Royal Agbada — AAA",
    category: "agbada", price: 520000, currency: "₦",
    image: agbada("Agbada_AAA-001.jpg"),
    gallery: [
      agbada("Agbada_AAA-001.jpg"),
      agbada("Agbada_AAA-002.jpg"),
      agbada("Agbada_AAA-003.jpg"),
      agbada("Agbada_AAA-004.jpg"),
      agbada("Agbada_AAA-005.jpg"),
    ],
    colors: ["Gold", "Burgundy"], sizes: SIZES,
    description: "Flowing three-piece agbada with hand-couched embroidery — fila cap included.",
    fabric: "Textured brocade with metallic embroidery",
    badge: "Bestseller",
  },
  {
    id: "p-152", slug: "agbada-aaa-002",
    name: "Grand Agbada — AAA",
    category: "agbada", price: 480000, currency: "₦",
    image: agbada("Agbada_AAA-002.jpg"),
    gallery: [
      agbada("Agbada_AAA-002.jpg"),
      agbada("Agbada_AAA-003.jpg"),
      agbada("Agbada_AAA-004.jpg"),
    ],
    colors: ["Onyx"], sizes: SIZES,
    description: "Commanding agbada with silver thread motifs and wide flowing sleeves.",
    fabric: "Silk-cotton blend",
  },

  // ───── KAFTAN ─────
  {
    id: "p-161", slug: "kaftan-kaf-001",
    name: "Embroidered Kaftan — KAF",
    category: "kaftan", price: 285000, currency: "₦",
    image: kaftan("Kaftan_KAF-001.jpg"),
    gallery: [
      kaftan("Kaftan_KAF-001.jpg"),
      kaftan("Kaftan_KAF-002.jpg"),
      kaftan("Kaftan_KAF-003.jpg"),
      kaftan("Kaftan_KAF-004.jpg"),
      kaftan("Kaftan_KAF-005.jpg"),
    ],
    colors: ["Onyx", "Burgundy"], sizes: SIZES,
    description: "Slim-cut kaftan with intricate gold embroidery across the placket.",
    fabric: "Silk-cotton blend",
  },
  {
    id: "p-162", slug: "kaftan-kaf-002",
    name: "Regal Kaftan — KAF",
    category: "kaftan", price: 310000, currency: "₦",
    image: kaftan("Kaftan_KAF-002.jpg"),
    gallery: [
      kaftan("Kaftan_KAF-002.jpg"),
      kaftan("Kaftan_KAF-003.jpg"),
      kaftan("Kaftan_KAF-004.jpg"),
    ],
    colors: ["Burgundy"], sizes: SIZES,
    description: "Long-line kaftan with structured shoulders and oversized sleeves.",
    fabric: "Premium brocade",
  },

  // ───── PANTS ─────
  {
    id: "p-171", slug: "pant-paa-001",
    name: "Tailored Trousers — PAA",
    category: "pants", price: 145000, currency: "₦",
    image: pants("Pant_PAA-001.jpg"),
    gallery: [
      pants("Pant_PAA-001.jpg"),
      pants("Pant_PAB-002.jpg"),
    ],
    colors: ["Onyx", "Charcoal"], sizes: SIZES,
    description: "Precision-cut trousers with a tapered leg and side-seam pockets.",
    fabric: "Worsted wool",
    badge: "Bestseller",
  },
  {
    id: "p-172", slug: "pant-pab-002",
    name: "Tailored Trousers — PAB",
    category: "pants", price: 135000, currency: "₦",
    image: pants("Pant_PAB-002.jpg"),
    gallery: [
      pants("Pant_PAB-002.jpg"),
      pants("Pant_PAA-001.jpg"),
    ],
    colors: ["Ivory", "Champagne"], sizes: SIZES,
    description: "Flowing wide-leg trousers in premium fabric — effortlessly elegant.",
    fabric: "Belgian linen",
  },

  // ───── CASUALS ─────
  {
    id: "p-205", slug: "casuals-caa-001",
    name: "Bespoke Casual — CAA",
    category: "casuals", price: 145000, currency: "₦",
    image: casuals("Casuals_CAA_001.jpg"),
    gallery: [
      casuals("Casuals_CAA_001.jpg"),
    ],
    colors: ["Sand", "Onyx", "Olive"], sizes: SIZES,
    description: "Relaxed bespoke casual piece crafted for quiet luxury.",
    fabric: "Mulberry silk knit",
    badge: "New",
  },

  // ───── LADIES ─────
  {
    id: "p-301", slug: "ladies-suit-brown",
    name: "Ladies Suit — Brown",
    category: "ladies", price: 510000, currency: "₦",
    image: ladies("Ladies_suit_Brown_1.jpg"),
    gallery: [
      ladies("Ladies_suit_Brown_1.jpg"),
      ladies("Ladies_suit_Brown_2.jpg"),
    ],
    colors: ["Brown"], sizes: ["XS","S","M","L","XL"],
    description: "Sculpted brown ladies suit with tailored silhouette and premium finish.",
    fabric: "Hand-woven blend",
    badge: "Bestseller",
  },
  {
    id: "p-302", slug: "ladies-suit-pink",
    name: "Ladies Suit — Pink",
    category: "ladies", price: 480000, currency: "₦",
    image: ladies("ladies_suit_pink_1.jpg"),
    gallery: [
      ladies("ladies_suit_pink_1.jpg"),
      ladies("ladies_suit_pink_2.jpg"),
      ladies("ladies_suit_pink_3.jpg"),
      ladies("ladies_suit_pink_4.jpg"),
    ],
    colors: ["Pink"], sizes: ["XS","S","M","L"],
    description: "Architectural pink ladies suit with sculpted bodice and flared trouser.",
    fabric: "Hand-finished wool blend",
    badge: "New",
  },
  {
    id: "p-303", slug: "ladies-royal-purple-tweed",
    name: "Royal Purple Tweed Ladies Suit",
    category: "ladies", price: 620000, currency: "₦",
    image: ladies("Ladies_Royal_purple_tweed_two-piece_Ladies_Suit_1.jpg"),
    gallery: [
      ladies("Ladies_Royal_purple_tweed_two-piece_Ladies_Suit_1.jpg"),
      ladies("Ladies_Royal_purple_tweed_two-piece_Ladies_Suit_2.jpg"),
      ladies("Ladies_Royal_purple_tweed_two-piece_Ladies_Suit_3.jpg"),
      ladies("Ladies_Royal_purple_tweed_two-piece_Ladies_Suit_4.jpg"),
      ladies("Ladies_Royal_purple_tweed_two-piece_Ladies_Suit_5.jpg"),
    ],
    colors: ["Royal Purple"], sizes: ["XS","S","M","L"],
    description: "Two-piece royal purple tweed ladies suit — regal, structured, and timeless.",
    fabric: "Tweed",
    badge: "Limited",
  },
];

export const categories: { key: Category; label: string; tagline: string; image: string }[] = [
  { key: "suits",   label: "Suits",   tagline: "Sculpted Tailoring",  image: safari("safari-cover-image-main.jpg") },
  { key: "natives", label: "Natives", tagline: "Heritage Reimagined", image: natives("Native_NAA-001.jpg") },
  { key: "agbada",  label: "Agbada",  tagline: "Royal Drape",         image: agbada("Agbada_AAA-001.jpg") },
  { key: "kaftan",  label: "Kaftan",  tagline: "Refined Comfort",     image: kaftan("Kaftan_KAF-001.jpg") },
  { key: "casuals", label: "Casuals", tagline: "Quiet Luxury",        image: casuals("Casuals_CAA_001.jpg") },
  { key: "ladies",  label: "Ladies",  tagline: "Couture for Her",     image: ladies("Ladies_suit_Brown_1.jpg") },
  { key: "pants",   label: "Pants",   tagline: "Precision Tailored",  image: pants("Pant_PAA-001.jpg") },
];

export function formatPrice(p: number, currency = "₦") {
  return `${currency}${p.toLocaleString("en-NG")}`;
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelated(p: Product, n = 4) {
  return products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, n);
}
