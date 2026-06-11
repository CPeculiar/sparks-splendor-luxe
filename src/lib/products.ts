// Sparks & Splendour bespoke catalogue.
// Images map to /public/gallery/img-XX.jpg
// Categories chosen by visual inspection of the brand archive.

export type Category = "suits" | "natives" | "casuals" | "ladies" | "shirts";

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

const img = (n: number) => `/gallery/img-${String(n).padStart(2, "0")}.jpg`;
const couple = (n: number) => `/gallery/couple-${String(n).padStart(2, "0")}.jpg`;

const SIZES = ["S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  // ───── SIGNATURE SUITS (avant-garde tailoring) ─────
  {
    id: "p-001", slug: "the-monarch-fit-mint",
    name: "The Monarch Fit — Verde",
    category: "suits", price: 685000, currency: "₦",
    image: img(5), gallery: [img(5), img(53), img(55)],
    colors: ["Verde", "Onyx"], sizes: SIZES,
    description: "A regal silhouette tailored in hand-embellished mint linen. Sculpted shoulders, asymmetric closure, flared trouser break.",
    fabric: "Italian linen with crystal embellishment",
    badge: "Bestseller",
  },
  {
    id: "p-002", slug: "asymmetric-burgundy-suit",
    name: "Crimson Asymmetric Two-Piece",
    category: "suits", price: 540000, currency: "₦",
    image: img(15), gallery: [img(15), img(8), img(46)],
    colors: ["Burgundy", "Onyx", "Ivory"], sizes: SIZES,
    description: "House-signature crossover blazer in deep crimson wool crêpe with mandarin collar shirt and tapered trousers.",
    fabric: "Italian wool crêpe",
    badge: "New",
  },
  {
    id: "p-003", slug: "teal-double-breast-suit",
    name: "Cobalt Double-Breast Suit",
    category: "suits", price: 595000, currency: "₦",
    image: img(20), gallery: [img(20), img(7), img(49)],
    colors: ["Cobalt", "Charcoal"], sizes: SIZES,
    description: "A modern reinterpretation of the double-breasted blazer with bound buttons and a crossed lapel.",
    fabric: "Worsted wool",
  },
  {
    id: "p-004", slug: "rose-jewel-suit",
    name: "Rose Jewel Bespoke Suit",
    category: "suits", price: 720000, currency: "₦",
    image: img(40), gallery: [img(40), img(45), img(43)],
    colors: ["Rose", "Champagne"], sizes: SIZES,
    description: "Stand-collar pink suit with crimson floral beadwork along the placket — for the daring tastemaker.",
    fabric: "Hand-beaded silk wool",
    badge: "Limited",
  },
  {
    id: "p-005", slug: "olive-pinstripe-suit",
    name: "Olive Pinstripe Power Suit",
    category: "suits", price: 510000, currency: "₦",
    image: img(45), gallery: [img(45), img(55), img(40)],
    colors: ["Olive"], sizes: SIZES,
    description: "Lean pinstripe in muted olive — sculpted shoulder, flared trouser, signature asymmetric vest closure.",
    fabric: "Wool/Cashmere blend",
  },
  {
    id: "p-006", slug: "noir-tweed-blazer",
    name: "Noir Tweed Mandarin Blazer",
    category: "suits", price: 465000, currency: "₦",
    image: img(1), gallery: [img(1), img(15), img(20)],
    colors: ["Onyx"], sizes: SIZES,
    description: "Black tweed jacket with metallic flecks and stand collar. A timeless evening statement.",
    fabric: "Tweed with Lurex thread",
  },

  // ───── NATIVES (Agbada / Kaftan) ─────
  {
    id: "p-101", slug: "burgundy-royal-agbada",
    name: "Burgundy Royal Agbada",
    category: "natives", price: 425000, currency: "₦",
    image: img(10), gallery: [img(10), img(30), img(35)],
    colors: ["Burgundy"], sizes: SIZES,
    description: "Three-piece agbada in textured burgundy with hand-couched gold motifs — fila cap included.",
    fabric: "Textured cotton with metallic embroidery",
    badge: "Bestseller",
  },
  {
    id: "p-102", slug: "obsidian-kaftan",
    name: "Obsidian Embroidered Kaftan",
    category: "natives", price: 285000, currency: "₦",
    image: img(35), gallery: [img(35), img(10), img(30)],
    colors: ["Onyx", "Burgundy"], sizes: SIZES,
    description: "Slim-cut black kaftan with intricate gold lion crest embroidery across the placket.",
    fabric: "Silk-cotton blend",
  },
  {
    id: "p-103", slug: "umber-heritage-set",
    name: "Umber Heritage Three-Piece",
    category: "natives", price: 395000, currency: "₦",
    image: couple(1), gallery: [couple(1), couple(2), img(45)],
    colors: ["Umber"], sizes: SIZES,
    description: "Heritage-style aso-oke sleeveless agbada with embroidered SS monogram.",
    fabric: "Aso-oke with metallic thread",
    badge: "Limited",
  },
  {
    id: "p-104", slug: "regal-burgundy-kaftan",
    name: "Regal Burgundy Kaftan",
    category: "natives", price: 310000, currency: "₦",
    image: img(30), gallery: [img(30), img(10), img(35)],
    colors: ["Burgundy"], sizes: SIZES,
    description: "Long-line burgundy kaftan with structured shoulders and oversized sleeves.",
    fabric: "Premium brocade",
  },

  // ───── CASUALS / SHIRTS ─────
  {
    id: "p-201", slug: "ivory-resort-shirt",
    name: "Ivory Resort Shirt",
    category: "shirts", price: 95000, currency: "₦",
    image: img(2), gallery: [img(2), img(3), img(4)],
    colors: ["Ivory", "Onyx", "Champagne"], sizes: SIZES,
    description: "Relaxed-fit camp collar shirt in poured silk twill.",
    fabric: "Silk twill",
  },
  {
    id: "p-202", slug: "black-evening-shirt",
    name: "Black Evening Mandarin Shirt",
    category: "shirts", price: 110000, currency: "₦",
    image: img(6), gallery: [img(6), img(11), img(2)],
    colors: ["Onyx"], sizes: SIZES,
    description: "Tonal black mandarin-collar shirt with covered placket.",
    fabric: "Mercerised cotton",
  },
  {
    id: "p-203", slug: "champagne-formal-shirt",
    name: "Champagne Formal Shirt",
    category: "shirts", price: 105000, currency: "₦",
    image: img(11), gallery: [img(11), img(6), img(12)],
    colors: ["Champagne"], sizes: SIZES,
    description: "Crisp champagne dress shirt with French cuffs.",
    fabric: "Egyptian cotton poplin",
  },
  {
    id: "p-204", slug: "casual-knit-polo",
    name: "Bespoke Knit Polo",
    category: "casuals", price: 145000, currency: "₦",
    image: img(13), gallery: [img(13), img(14), img(16)],
    colors: ["Sand", "Onyx", "Olive"], sizes: SIZES,
    description: "Italian-knit polo with ribbed collar and tonal buttons.",
    fabric: "Mulberry silk knit",
  },
  {
    id: "p-205", slug: "linen-resort-set",
    name: "Linen Resort Set",
    category: "casuals", price: 195000, currency: "₦",
    image: img(16), gallery: [img(16), img(17), img(18)],
    colors: ["Stone", "Ecru"], sizes: SIZES,
    description: "Two-piece breathable linen set — relaxed shirt with drawstring trouser.",
    fabric: "Belgian linen",
    badge: "New",
  },
  {
    id: "p-206", slug: "olive-double-breasted",
    name: "Olive Double-Breasted Casual",
    category: "casuals", price: 320000, currency: "₦",
    image: couple(3), gallery: [couple(3), img(22), img(24)],
    colors: ["Olive"], sizes: SIZES,
    description: "Soft-shouldered olive double-breasted blazer for daytime affairs.",
    fabric: "Italian wool",
  },

  // ───── LADIES / COUPLES ─────
  {
    id: "p-301", slug: "gilded-asoebi-set",
    name: "Gilded Aso-Ebi Couture Set",
    category: "ladies", price: 510000, currency: "₦",
    image: couple(2), gallery: [couple(2), couple(1), img(35)],
    colors: ["Gold"], sizes: ["XS","S","M","L","XL"],
    description: "Hand-woven gold corseted top with floor-skimming aso-oke wrap and matching gele.",
    fabric: "Hand-woven aso-oke",
    badge: "Bestseller",
  },
  {
    id: "p-302", slug: "ivory-bridal-coat",
    name: "Ivory Bridal Coat Dress",
    category: "ladies", price: 620000, currency: "₦",
    image: couple(3), gallery: [couple(3), couple(1), couple(2)],
    colors: ["Ivory"], sizes: ["XS","S","M","L"],
    description: "Sculpted ivory coat dress with bell sleeves and crystal hem.",
    fabric: "Silk faille",
    badge: "Limited",
  },
  {
    id: "p-303", slug: "rose-couture-suit-ladies",
    name: "Rose Couture Suit (Ladies)",
    category: "ladies", price: 480000, currency: "₦",
    image: img(50), gallery: [img(50), img(40), img(43)],
    colors: ["Rose"], sizes: ["XS","S","M","L"],
    description: "Architectural pink suit with sculpted bodice and flared trouser.",
    fabric: "Hand-finished wool blend",
  },
];

export const categories: { key: Category; label: string; tagline: string; image: string }[] = [
  { key: "suits", label: "Suits", tagline: "Sculpted Tailoring", image: img(5) },
  { key: "natives", label: "Natives", tagline: "Heritage Reimagined", image: img(10) },
  { key: "casuals", label: "Casuals", tagline: "Quiet Luxury", image: img(16) },
  { key: "ladies", label: "Ladies", tagline: "Couture for Her", image: couple(2) },
  { key: "shirts", label: "Shirts", tagline: "Foundational Pieces", image: img(11) },
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
