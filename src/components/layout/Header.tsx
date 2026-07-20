import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, User } from "lucide-react";
import logo from "@/assets/logo-mark.png";
import { useCart } from "@/lib/cart";
import { getCurrentUser, isAuthenticated, type AuthUser } from "@/lib/auth";

const NAV = [
  { label: "Home", to: "/" },
  { label: "Suits", to: "/shop", search: { category: "suits" as const } },
  { label: "Natives", to: "/shop", search: { category: "natives" as const } },
  { label: "Casuals", to: "/shop", search: { category: "casuals" as const } },
  { label: "Ladies", to: "/shop", search: { category: "ladies" as const } },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function Header() {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobile(false); }, [pathname]);

  // Refresh auth user on every route change so avatar stays in sync
  useEffect(() => {
    setAuthUser(isAuthenticated() ? getCurrentUser() : null);
  }, [pathname]);

  const transparent = isHome && !scrolled; // transparent over hero (dark bg), solid elsewhere

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
            ? "bg-onyx/80 text-cream backdrop-blur-sm [&_button]:text-cream [&_a]:text-cream"
            : "bg-background/95 text-foreground backdrop-blur-xl border-b border-border/60 [&_button]:text-foreground [&_a]:text-foreground",
        ].join(" ")}
      >
        <div className="container-luxe flex items-center justify-between h-16 md:h-20">
          {/* mobile menu */}
          <button
            className={["lg:hidden -ml-2 p-2", transparent ? "text-cream" : "text-foreground"].join(" ")}
            onClick={() => setMobile(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* left nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-[12px] tracking-[0.22em] uppercase font-medium flex-1">
            {NAV.slice(1, 5).map((n) => (
              <Link
                key={n.label}
                to={n.to}
                search={n.search as never}
                className={["hover:text-gold transition-colors duration-300 relative group", transparent ? "text-cream" : "text-foreground"].join(" ")}
              >
                {n.label}
                <span className="absolute left-0 -bottom-1 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* logo center */}
          <Link to="/" className="flex items-center gap-3 mx-auto lg:mx-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <img src={logo} alt="Sparks & Splendour" className="h-11 md:h-13 w-auto rounded-sm" />
            <span className="hidden sm:flex flex-col leading-none">
              <span className={["font-display text-lg md:text-xl tracking-[0.2em]", transparent ? "text-cream" : "text-foreground"].join(" ")}>SPARKS</span>
              <span className="text-[8px] md:text-[9px] tracking-[0.5em] text-gold">& SPLENDOUR</span>
            </span>
          </Link>

          {/* right actions */}
          <div className="flex items-center gap-1 md:gap-3 flex-1 justify-end">
            <Link to="/about" className={["hidden lg:inline text-[12px] tracking-[0.22em] uppercase hover:text-gold transition-colors", transparent ? "text-cream" : "text-foreground"].join(" ")}>About</Link>
            <Link to="/contact" className={["hidden lg:inline text-[12px] tracking-[0.22em] uppercase hover:text-gold transition-colors mr-3", transparent ? "text-cream" : "text-foreground"].join(" ")}>Contact</Link>

            <button className={["p-2 hover:text-gold transition-colors", transparent ? "text-cream" : "text-foreground"].join(" ")} aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link to="/account" className={["p-1 hover:text-gold transition-colors hidden sm:inline-flex items-center justify-center", transparent ? "text-cream" : "text-foreground"].join(" ")} aria-label="Account">
              {authUser?.profile_image ? (
                <img src={authUser.profile_image} alt="Profile" className="h-7 w-7 rounded-full object-cover border border-border" />
              ) : authUser ? (
                <span className="h-7 w-7 rounded-full bg-gold text-onyx text-[11px] font-semibold flex items-center justify-center">
                  {(authUser.first_name?.[0] || authUser.email[0]).toUpperCase()}
                </span>
              ) : (
                <User className="h-[18px] w-[18px]" />
              )}
            </Link>
            <button
              className={["relative p-2 hover:text-gold transition-colors", transparent ? "text-cream" : "text-foreground"].join(" ")}
              onClick={() => setOpen(true)}
              aria-label="Cart"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-onyx text-[10px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-onyx/70" onClick={() => setMobile(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <span className="font-display text-xl tracking-[0.2em]">MENU</span>
              <button onClick={() => setMobile(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col p-6 gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  to={n.to}
                  search={n.search as never}
                  className="py-3 text-base tracking-[0.18em] uppercase border-b border-border hover:text-gold transition-colors"
                >
                  {n.label}
                </Link>
              ))}
              <Link to="/account" className="py-3 text-base tracking-[0.18em] uppercase border-b border-border">Account</Link>
            </nav>
            <div className="mt-auto p-6 text-xs text-muted-foreground tracking-wider">
              Bespoke ateliers in Lagos 
            </div>
          </div>
        </div>
      )}
    </>
  );
}
