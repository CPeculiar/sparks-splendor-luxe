// Sparks & Splendour bespoke catalogue.
// All images use local /public/gallery/ paths — no Cloudinary dependency.

export type Category = "suits" | "natives" | "casuals" | "ladies" | "shirts" | "agbada" | "kaftan" | "pants";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  currency: string;
  image: string;
  gallery: string[];
  colors: string[];
  sizes: string[];
  description: string;
  fabric: string;
  badge?: "New" | "Bestseller" | "Limited";
}

const g = (n: number) => `/gallery/img-${String(n).padStart(2, "0")}.jpg`;
const c = (n: number) => `/gallery/couple-${String(n).padStart(2, "0")}.jpg`;

const SIZES = ["S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  // ───── SUITS ─────
  {
    id: "p-001", slug: "the-monarch-fit-mint",
    name: "The Monarch Fit — Verde",
    category: "suits", price: 685000, currency: "₦",
    image: g(5), gallery: [g(5), g(15), g(20)],
    colors: ["Verde", "Onyx"], sizes: SIZES,
    description: "A regal silhouette tailored in hand-embellished mint linen. Sculpted shoulders, asymmetric closure, flared trouser break.",
    fabric: "Italian linen with crystal embellishment",
    badge: "Bestseller",
  },
  {
    id: "p-002", slug: "asymmetric-burgundy-suit",
    name: "Crimson Asymmetric Two-Piece",
    category: "suits", price: 540000, currency: "₦",
    image: g(15), gallery: [g(15), g(8), g(5)],
    colors: ["Burgundy", "Onyx", "Ivory"], sizes: SIZES,
    description: "House-signature crossover blazer in deep crimson wool crêpe with mandarin collar shirt and tapered trousers.",
    fabric: "Italian wool crêpe",
    badge: "New",
  },
  {
    id: "p-003", slug: "teal-double-breast-suit",
    name: "Cobalt Double-Breast Suit",
    category: "suits", price: 595000, currency: "₦",
    image: g(20), gallery: [g(20), g(5), g(15)],
    colors: ["Cobalt", "Charcoal"], sizes: SIZES,
    description: "A modern reinterpretation of the double-breasted blazer with bound buttons and a crossed lapel.",
    fabric: "Worsted wool",
  },
  {
    id: "p-004", slug: "rose-jewel-suit",
    name: "Rose Jewel Bespoke Suit",
    category: "suits", price: 720000, currency: "₦",
    image: g(40), gallery: [g(40), g(45), g(43)],
    colors: ["Rose", "Champagne"], sizes: SIZES,
    description: "Stand-collar pink suit with crimson floral beadwork along the placket — for the daring tastemaker.",
    fabric: "Hand-beaded silk wool",
    badge: "Limited",
  },
  {
    id: "p-005", slug: "olive-pinstripe-suit",
    name: "Olive Pinstripe Power Suit",
    category: "suits", price: 510000, currency: "₦",
    image: g(45), gallery: [g(45), g(40), g(5)],
    colors: ["Olive"], sizes: SIZES,
    description: "Lean pinstripe in muted olive — sculpted shoulder, flared trouser, signature asymmetric vest closure.",
    fabric: "Wool/Cashmere blend",
  },
  {
    id: "p-006", slug: "noir-tweed-blazer",
    name: "Noir Tweed Mandarin Blazer",
    category: "suits", price: 465000, currency: "₦",
    image: g(1), gallery: [g(1), g(15), g(20)],
    colors: ["Onyx"], sizes: SIZES,
    description: "Black tweed jacket with metallic flecks and stand collar. A timeless evening statement.",
    fabric: "Tweed with Lurex thread",
  },

  // ───── NATIVES ─────
  {
    id: "p-101", slug: "burgundy-royal-native",
    name: "Burgundy Royal Native",
    category: "natives", price: 425000, currency: "₦",
    image: g(10), gallery: [g(10), g(5), g(15)],
    colors: ["Burgundy"], sizes: SIZES,
    description: "Three-piece native in textured burgundy with hand-couched gold motifs.",
    fabric: "Textured cotton with metallic embroidery",
    badge: "Bestseller",
  },
  {
    id: "p-102", slug: "umber-heritage-native",
    name: "Umber Heritage Three-Piece",
    category: "natives", price: 395000, currency: "₦",
    image: c(1), gallery: [c(1), c(2), g(10)],
    colors: ["Umber"], sizes: SIZES,
    description: "Heritage-style aso-oke sleeveless native with embroidered SS monogram.",
    fabric: "Aso-oke with metallic thread",
    badge: "Limited",
  },
  {
    id: "p-103", slug: "onyx-native-set",
    name: "Onyx Embroidered Native",
    category: "natives", price: 360000, currency: "₦",
    image: g(19), gallery: [g(19), g(10), c(1)],
    colors: ["Onyx", "Gold"], sizes: SIZES,
    description: "Slim-cut onyx native with intricate gold embroidery across the placket.",
    fabric: "Silk-cotton blend",
  },
  {
    id: "p-104", slug: "ivory-native-set",
    name: "Ivory Ceremonial Native",
    category: "natives", price: 380000, currency: "₦",
    image: g(17), gallery: [g(17), g(18), g(10)],
    colors: ["Ivory"], sizes: SIZES,
    description: "Ivory ceremonial native with gold thread detailing and matching cap.",
    fabric: "Premium aso-oke",
  },

  // ───── AGBADA ─────
  {
    id: "p-151", slug: "royal-gold-agbada",
    name: "Royal Gold Agbada",
    category: "agbada", price: 520000, currency: "₦",
    image: g(10), gallery: [g(10), g(19), g(17)],
    colors: ["Gold", "Burgundy"], sizes: SIZES,
    description: "Flowing three-piece agbada in rich gold with hand-couched embroidery — fila cap included.",
    fabric: "Textured brocade with metallic embroidery",
    badge: "Bestseller",
  },
  {
    id: "p-152", slug: "onyx-agbada-set",
    name: "Onyx Grand Agbada",
    category: "agbada", price: 480000, currency: "₦",
    image: g(1), gallery: [g(1), g(10), g(19)],
    colors: ["Onyx"], sizes: SIZES,
    description: "Commanding black agbada with silver thread motifs and wide flowing sleeves.",
    fabric: "Silk-cotton blend",
  },
  {
    id: "p-153", slug: "ivory-agbada",
    name: "Ivory Ceremonial Agbada",
    category: "agbada", price: 445000, currency: "₦",
    image: g(17), gallery: [g(17), g(18), g(10)],
    colors: ["Ivory", "Champagne"], sizes: SIZES,
    description: "Pristine ivory agbada with delicate gold embroidery — perfect for ceremonies.",
    fabric: "Premium aso-oke",
    badge: "New",
  },
  {
    id: "p-154", slug: "burgundy-agbada",
    name: "Burgundy Heritage Agbada",
    category: "agbada", price: 460000, currency: "₦",
    image: g(15), gallery: [g(15), g(10), g(1)],
    colors: ["Burgundy"], sizes: SIZES,
    description: "Deep burgundy agbada with intricate hand-stitched patterns and matching sokoto.",
    fabric: "Textured cotton with metallic thread",
  },

  // ───── KAFTAN ─────
  {
    id: "p-161", slug: "obsidian-kaftan",
    name: "Obsidian Embroidered Kaftan",
    category: "kaftan", price: 285000, currency: "₦",
    image: g(6), gallery: [g(6), g(2), g(11)],
    colors: ["Onyx", "Burgundy"], sizes: SIZES,
    description: "Slim-cut black kaftan with intricate gold lion crest embroidery across the placket.",
    fabric: "Silk-cotton blend",
  },
  {
    id: "p-162", slug: "regal-burgundy-kaftan",
    name: "Regal Burgundy Kaftan",
    category: "kaftan", price: 310000, currency: "₦",
    image: g(8), gallery: [g(8), g(6), g(11)],
    colors: ["Burgundy"], sizes: SIZES,
    description: "Long-line burgundy kaftan with structured shoulders and oversized sleeves.",
    fabric: "Premium brocade",
  },
  {
    id: "p-163", slug: "ivory-kaftan",
    name: "Ivory Silk Kaftan",
    category: "kaftan", price: 295000, currency: "₦",
    image: g(11), gallery: [g(11), g(6), g(8)],
    colors: ["Ivory", "Champagne"], sizes: SIZES,
    description: "Flowing ivory kaftan in pure silk with subtle gold thread detailing.",
    fabric: "Pure silk",
    badge: "New",
  },
  {
    id: "p-164", slug: "navy-kaftan",
    name: "Navy Brocade Kaftan",
    category: "kaftan", price: 320000, currency: "₦",
    image: g(3), gallery: [g(3), g(6), g(8)],
    colors: ["Navy", "Onyx"], sizes: SIZES,
    description: "Rich navy brocade kaftan with mandarin collar and embroidered cuffs.",
    fabric: "Italian brocade",
  },

  // ───── PANTS ─────
  {
    id: "p-171", slug: "tailored-onyx-trousers",
    name: "Tailored Onyx Trousers",
    category: "pants", price: 145000, currency: "₦",
    image: g(7), gallery: [g(7), g(9), g(4)],
    colors: ["Onyx", "Charcoal"], sizes: SIZES,
    description: "Precision-cut onyx trousers with a tapered leg and side-seam pockets.",
    fabric: "Worsted wool",
    badge: "Bestseller",
  },
  {
    id: "p-172", slug: "ivory-wide-leg-trousers",
    name: "Ivory Wide-Leg Trousers",
    category: "pants", price: 135000, currency: "₦",
    image: g(9), gallery: [g(9), g(7), g(4)],
    colors: ["Ivory", "Champagne"], sizes: SIZES,
    description: "Flowing wide-leg trousers in ivory linen — effortlessly elegant.",
    fabric: "Belgian linen",
  },
  {
    id: "p-173", slug: "olive-cargo-trousers",
    name: "Olive Utility Trousers",
    category: "pants", price: 155000, currency: "₦",
    image: g(4), gallery: [g(4), g(7), g(9)],
    colors: ["Olive", "Sand"], sizes: SIZES,
    description: "Structured olive utility trousers with patch pockets and a relaxed fit.",
    fabric: "Cotton twill",
    badge: "New",
  },
  {
    id: "p-174", slug: "burgundy-dress-trousers",
    name: "Burgundy Dress Trousers",
    category: "pants", price: 160000, currency: "₦",
    image: g(14), gallery: [g(14), g(7), g(9)],
    colors: ["Burgundy"], sizes: SIZES,
    description: "Slim-cut burgundy dress trousers with a satin side stripe.",
    fabric: "Italian wool crêpe",
  },

  // ───── SHIRTS ─────
  {
    id: "p-201", slug: "ivory-resort-shirt",
    name: "Ivory Resort Shirt",
    category: "shirts", price: 95000, currency: "₦",
    image: g(2), gallery: [g(2), g(3), g(11)],
    colors: ["Ivory", "Onyx", "Champagne"], sizes: SIZES,
    description: "Relaxed-fit camp collar shirt in poured silk twill.",
    fabric: "Silk twill",
  },
  {
    id: "p-202", slug: "black-evening-shirt",
    name: "Black Evening Mandarin Shirt",
    category: "shirts", price: 110000, currency: "₦",
    image: g(6), gallery: [g(6), g(11), g(2)],
    colors: ["Onyx"], sizes: SIZES,
    description: "Tonal black mandarin-collar shirt with covered placket.",
    fabric: "Mercerised cotton",
  },
  {
    id: "p-203", slug: "champagne-formal-shirt",
    name: "Champagne Formal Shirt",
    category: "shirts", price: 105000, currency: "₦",
    image: g(11), gallery: [g(11), g(6), g(2)],
    colors: ["Champagne"], sizes: SIZES,
    description: "Crisp champagne dress shirt with French cuffs.",
    fabric: "Egyptian cotton poplin",
  },
  {
    id: "p-204", slug: "white-linen-shirt",
    name: "White Linen Dress Shirt",
    category: "shirts", price: 98000, currency: "₦",
    image: g(3), gallery: [g(3), g(2), g(6)],
    colors: ["White", "Ivory"], sizes: SIZES,
    description: "Crisp white linen shirt with a relaxed collar and mother-of-pearl buttons.",
    fabric: "Belgian linen",
    badge: "New",
  },

  // ───── CASUALS ─────
  {
    id: "p-205", slug: "casual-knit-polo",
    name: "Bespoke Knit Polo",
    category: "casuals", price: 145000, currency: "₦",
    image: g(13), gallery: [g(13), g(16), g(18)],
    colors: ["Sand", "Onyx", "Olive"], sizes: SIZES,
    description: "Italian-knit polo with ribbed collar and tonal buttons.",
    fabric: "Mulberry silk knit",
  },
  {
    id: "p-206", slug: "linen-resort-set",
    name: "Linen Resort Set",
    category: "casuals", price: 195000, currency: "₦",
    image: g(16), gallery: [g(16), g(13), g(18)],
    colors: ["Stone", "Ecru"], sizes: SIZES,
    description: "Two-piece breathable linen set — relaxed shirt with drawstring trouser.",
    fabric: "Belgian linen",
    badge: "New",
  },
  {
    id: "p-207", slug: "olive-double-breasted",
    name: "Olive Double-Breasted Casual",
    category: "casuals", price: 320000, currency: "₦",
    image: c(3), gallery: [c(3), g(16), g(13)],
    colors: ["Olive"], sizes: SIZES,
    description: "Soft-shouldered olive double-breasted blazer for daytime affairs.",
    fabric: "Italian wool",
  },
  {
    id: "p-208", slug: "sand-casual-set",
    name: "Sand Casual Co-ord Set",
    category: "casuals", price: 175000, currency: "₦",
    image: g(18), gallery: [g(18), g(16), g(13)],
    colors: ["Sand", "Stone"], sizes: SIZES,
    description: "Matching sand-toned casual set — relaxed fit, premium cotton.",
    fabric: "Premium cotton",
  },

  // ───── LADIES ─────
  {
    id: "p-301", slug: "gilded-asoebi-set",
    name: "Gilded Aso-Ebi Couture Set",
    category: "ladies", price: 510000, currency: "₦",
    image: c(2), gallery: [c(2), c(1), g(40)],
    colors: ["Gold"], sizes: ["XS","S","M","L","XL"],
    description: "Hand-woven gold corseted top with floor-skimming aso-oke wrap and matching gele.",
    fabric: "Hand-woven aso-oke",
    badge: "Bestseller",
  },
  {
    id: "p-302", slug: "ivory-bridal-coat",
    name: "Ivory Bridal Coat Dress",
    category: "ladies", price: 620000, currency: "₦",
    image: c(3), gallery: [c(3), c(1), c(2)],
    colors: ["Ivory"], sizes: ["XS","S","M","L"],
    description: "Sculpted ivory coat dress with bell sleeves and crystal hem.",
    fabric: "Silk faille",
    badge: "Limited",
  },
  {
    id: "p-303", slug: "rose-couture-suit-ladies",
    name: "Rose Couture Suit (Ladies)",
    category: "ladies", price: 480000, currency: "₦",
    image: g(50), gallery: [g(50), g(40), g(43)],
    colors: ["Rose"], sizes: ["XS","S","M","L"],
    description: "Architectural pink suit with sculpted bodice and flared trouser.",
    fabric: "Hand-finished wool blend",
  },
  {
    id: "p-304", slug: "emerald-evening-gown",
    name: "Emerald Evening Gown",
    category: "ladies", price: 580000, currency: "₦",
    image: g(43), gallery: [g(43), g(50), c(2)],
    colors: ["Emerald", "Onyx"], sizes: ["XS","S","M","L","XL"],
    description: "Floor-length emerald gown with structured bodice and flowing skirt.",
    fabric: "Duchess satin",
    badge: "New",
  },
];

export const categories: { key: Category; label: string; tagline: string; image: string }[] = [
  { key: "suits",   label: "Suits",   tagline: "Sculpted Tailoring",   image: g(5) },
  { key: "natives", label: "Natives", tagline: "Heritage Reimagined",  image: g(10) },
  { key: "agbada",  label: "Agbada",  tagline: "Royal Drape",          image: g(10) },
  { key: "kaftan",  label: "Kaftan",  tagline: "Refined Comfort",      image: g(6) },
  { key: "casuals", label: "Casuals", tagline: "Quiet Luxury",         image: g(16) },
  { key: "ladies",  label: "Ladies",  tagline: "Couture for Her",      image: c(2) },
  { key: "shirts",  label: "Shirts",  tagline: "Foundational Pieces",  image: g(11) },
  { key: "pants",   label: "Pants",   tagline: "Precision Tailored",   image: g(7) },
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
