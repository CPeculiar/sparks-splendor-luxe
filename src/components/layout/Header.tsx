import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Menu, X, User, ChevronDown } from "lucide-react";
import logo from "@/assets/logo-mark.png";
import { useCart } from "@/lib/cart";
import { getCurrentUser, isAuthenticated, type AuthUser } from "@/lib/auth";

const SUIT_SUBS = [
  { label: "Prom Suits",     search: { category: "suits", sub: "prom" } },
  { label: "Wedding Suits",  search: { category: "suits", sub: "wedding" } },
  { label: "Business Suits", search: { category: "suits", sub: "business" } },
  { label: "Dinner Suits",   search: { category: "suits", sub: "dinner" } },
  { label: "Safari Suits",   search: { category: "suits", sub: "safari" } },
];

// Left side of logo (6 items)
const NAV_LEFT = [
  { label: "Suits",   to: "/shop", search: { category: "suits" },   hasSub: true },
  { label: "Natives", to: "/shop", search: { category: "natives" },  hasSub: false },
  { label: "Kaftan",  to: "/shop", search: { category: "kaftan" },   hasSub: false },
  { label: "Agbada",  to: "/shop", search: { category: "agbada" },   hasSub: false },
  { label: "Shirts",  to: "/shop", search: { category: "shirts" },   hasSub: false },
  { label: "Pants",   to: "/shop", search: { category: "pants" },    hasSub: false },
];

// Right side of logo (2 items only)
const NAV_RIGHT = [
  { label: "Casuals", to: "/shop", search: { category: "casuals" }, hasSub: false },
  { label: "Ladies",  to: "/shop", search: { category: "ladies" },  hasSub: false },
];

const ALL_NAV = [...NAV_LEFT, ...NAV_RIGHT];

export function Header() {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled]       = useState(false);
  const [mobile, setMobile]           = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [suitsHovered, setSuitsHovered]   = useState(false);
  const [authUser, setAuthUser]       = useState<AuthUser | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobile(false); }, [pathname]);
  useEffect(() => {
    setAuthUser(isAuthenticated() ? getCurrentUser() : null);
  }, [pathname]);

  const transparent = isHome && !scrolled;
  const textCls = transparent ? "text-cream" : "text-foreground";

  const enterSuits = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setSuitsHovered(true);
  };
  const leaveSuits = () => {
    hoverTimeout.current = setTimeout(() => setSuitsHovered(false), 150);
  };

  function NavLink({ item }: { item: typeof NAV_LEFT[0] }) {
    if (item.hasSub) {
      return (
        <div className="relative" onMouseEnter={enterSuits} onMouseLeave={leaveSuits}>
          <Link
            to={item.to}
            search={item.search as never}
            className={`flex items-center gap-0.5 hover:text-gold transition-colors duration-200 relative group ${textCls}`}
          >
            {item.label}
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${suitsHovered ? "rotate-180" : ""}`} />
            <span className="absolute left-0 -bottom-1 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
          </Link>

          {suitsHovered && (
            <div
              className="absolute top-full left-0 mt-2 w-52 bg-onyx border border-gold/20 shadow-2xl py-1 z-50"
              onMouseEnter={enterSuits}
              onMouseLeave={leaveSuits}
            >
              {SUIT_SUBS.map((s) => (
                <Link
                  key={s.label}
                  to="/shop"
                  search={s.search as never}
                  className="block px-5 py-3 text-[11px] tracking-[0.2em] uppercase text-cream/80 hover:text-gold hover:bg-white/5 transition-colors"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <Link
        to={item.to}
        search={item.search as never}
        className={`hover:text-gold transition-colors duration-200 relative group ${textCls}`}
      >
        {item.label}
        <span className="absolute left-0 -bottom-1 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
      </Link>
    );
  }

  return (
    <>
      {/* announcement bar */}
      <div className="hidden md:block bg-onyx text-cream text-[11px] tracking-[0.3em] uppercase py-2 text-center font-medium">
        Complimentary worldwide shipping on orders above ₦500,000 · Bespoke fittings by appointment
      </div>

      <header
        className={[
          "sticky top-0 z-40 w-full transition-all duration-500",
          transparent
            ? "bg-onyx/80 backdrop-blur-sm"
            : "bg-background/95 backdrop-blur-xl border-b border-border/60",
        ].join(" ")}
      >
        <div className="container-luxe h-16 md:h-20 flex items-center justify-between relative">

          {/* ── Mobile hamburger (left) ── */}
          <button
            className={`lg:hidden -ml-2 p-2 ${textCls}`}
            onClick={() => setMobile(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* ── Desktop: left nav ── */}
          <nav className="hidden lg:flex items-center gap-4 text-[11px] tracking-[0.18em] uppercase font-medium" style={{ flex: '0 1 auto', marginRight: '2rem' }}>
            {NAV_LEFT.map((n) => <NavLink key={n.label} item={n} />)}
          </nav>

          {/* ── Logo (center) ── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 mx-auto lg:mx-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2 shrink-0"
          >
            <img src={logo} alt="Sparks & Splendour" className="h-10 md:h-12 w-auto rounded-sm" />
            <span className="hidden sm:flex flex-col leading-none">
              <span className={`font-display text-lg md:text-xl tracking-[0.2em] ${textCls}`}>SPARKS</span>
              <span className="text-[8px] md:text-[9px] tracking-[0.5em] text-gold">& SPLENDOUR</span>
            </span>
          </Link>

          {/* ── Desktop: right nav + icons ── */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] tracking-[0.18em] uppercase font-medium justify-end" style={{ flex: '0 1 auto', marginLeft: '2rem' }}>
            {NAV_RIGHT.map((n) => <NavLink key={n.label} item={n} />)}

            {/* divider */}
            <span className="h-4 w-px bg-border/60 mx-1" />

            <Link to="/about"   className={`hover:text-gold transition-colors ${textCls}`}>About</Link>
            <Link to="/contact" className={`hover:text-gold transition-colors ${textCls}`}>Contact</Link>

            <Link to="/account" className={`p-1 hover:text-gold transition-colors inline-flex items-center justify-center ${textCls}`} aria-label="Account">
              {authUser?.profile_image ? (
                <img src={authUser.profile_image} alt="Profile" className="h-7 w-7 rounded-full object-cover border border-border" />
              ) : authUser ? (
                <span className="h-7 w-7 rounded-full bg-gold text-onyx text-[11px] font-semibold flex items-center justify-center">
                  {(authUser.first_name?.[0] || authUser.email[0]).toUpperCase()}
                </span>
              ) : (
                <User className="h-[17px] w-[17px]" />
              )}
            </Link>
            <button
              className={`relative p-1.5 hover:text-gold transition-colors ${textCls}`}
              onClick={() => setOpen(true)}
              aria-label="Cart"
            >
              <ShoppingBag className="h-[17px] w-[17px]" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-onyx text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>

          {/* ── Mobile: cart icon (right) ── */}
          <button
            className={`lg:hidden relative p-2 ml-auto hover:text-gold transition-colors ${textCls}`}
            onClick={() => setOpen(true)}
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gold text-onyx text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-onyx/70" onClick={() => setMobile(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-display text-xl tracking-[0.2em]">MENU</span>
              <button onClick={() => setMobile(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>

            <nav className="flex flex-col overflow-y-auto flex-1">
              <Link to="/" className="px-5 py-3.5 text-sm tracking-[0.18em] uppercase border-b border-border hover:text-gold hover:bg-secondary/30 transition-colors">
                Home
              </Link>

              {/* Suits accordion */}
              <div className="border-b border-border">
                <button
                  onClick={() => setMobileSubOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-sm tracking-[0.18em] uppercase hover:text-gold hover:bg-secondary/30 transition-colors"
                >
                  Suits
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileSubOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileSubOpen && (
                  <div className="bg-secondary/20">
                    {SUIT_SUBS.map((s) => (
                      <Link
                        key={s.label}
                        to="/shop"
                        search={s.search as never}
                        className="block pl-8 pr-5 py-3 text-sm tracking-[0.15em] uppercase border-t border-border/50 hover:text-gold transition-colors"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {ALL_NAV.filter((n) => !n.hasSub).map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  search={n.search as never}
                  className="px-5 py-3.5 text-sm tracking-[0.18em] uppercase border-b border-border hover:text-gold hover:bg-secondary/30 transition-colors"
                >
                  {n.label}
                </Link>
              ))}

              <Link to="/about"   className="px-5 py-3.5 text-sm tracking-[0.18em] uppercase border-b border-border hover:text-gold hover:bg-secondary/30 transition-colors">About</Link>
              <Link to="/contact" className="px-5 py-3.5 text-sm tracking-[0.18em] uppercase border-b border-border hover:text-gold hover:bg-secondary/30 transition-colors">Contact</Link>
              <Link to="/account" className="px-5 py-3.5 text-sm tracking-[0.18em] uppercase border-b border-border hover:text-gold hover:bg-secondary/30 transition-colors">Account</Link>
            </nav>

            <div className="p-5 border-t border-border text-xs text-muted-foreground tracking-wider">
              Bespoke ateliers in Lagos
            </div>
          </div>
        </div>
      )}
    </>
  );
}
