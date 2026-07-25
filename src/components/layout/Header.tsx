import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Menu, X, User, ChevronDown } from "lucide-react";
import logo from "@/assets/logo-mark.png";
import { useCart } from "@/lib/cart";
import { getCurrentUser, isAuthenticated, type AuthUser } from "@/lib/auth";

interface NavCategory {
  id: string;
  label: string;
  slug: string;
  is_active: boolean;
  hasSub: boolean;
}

export function Header() {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled]       = useState(false);
  const [mobile, setMobile]           = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [authUser, setAuthUser]       = useState<AuthUser | null>(null);
  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, any[]>>({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch categories from backend
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${API_BASE}/api/categories`);
        
        if (!res.ok) {
          console.warn("Failed to fetch categories, using fallback");
          // Fallback categories if API fails
          setCategories([
            { id: "1", label: "Suits", slug: "suits", is_active: true, hasSub: true },
            { id: "2", label: "Natives", slug: "natives", is_active: true, hasSub: false },
            { id: "3", label: "Kaftan", slug: "kaftan", is_active: true, hasSub: false },
            { id: "4", label: "Agbada", slug: "agbada", is_active: true, hasSub: false },
            { id: "5", label: "Shirts", slug: "shirts", is_active: true, hasSub: false },
            { id: "6", label: "Pants", slug: "pants", is_active: true, hasSub: false },
            { id: "7", label: "Casuals", slug: "casuals", is_active: true, hasSub: false },
            { id: "8", label: "Ladies", slug: "ladies", is_active: true, hasSub: false },
          ]);
          return;
        }
        
        const data = await res.json();
        console.log("Fetched categories:", data);
        
        // Filter to only active categories and map to NavCategory format
        const activeCategories: NavCategory[] = (data.data || [])
          .filter((c: any) => c.is_active !== false)
          .map((c: any) => ({
            id: c.id,
            label: c.name,
            slug: c.slug,
            is_active: c.is_active !== false,
            hasSub: false // Will be determined after fetching sub-categories
          }));
        
        console.log("Active categories:", activeCategories);

        // Fetch all active sub-categories
        try {
          const subRes = await fetch(`${API_BASE}/api/sub-categories/list/all-active`);
          if (subRes.ok) {
            const subData = await subRes.json();
            console.log("Fetched sub-categories:", subData);
            const subs = subData.data || [];
            
            // Build a map of category IDs that have sub-categories
            const categoryIdsWithSubs = new Set(subs.map((s: any) => s.category_id));
            
            // Update categories to mark which ones have sub-categories
            const updatedCategories = activeCategories.map(cat => ({
              ...cat,
              hasSub: categoryIdsWithSubs.has(Number(cat.id) || cat.id)
            }));
            
            // Group sub-categories by category slug
            const subsByCategory: Record<string, any[]> = {};
            subs.forEach((sub: any) => {
              const catSlug = sub.category_slug;
              if (!subsByCategory[catSlug]) {
                subsByCategory[catSlug] = [];
              }
              subsByCategory[catSlug].push(sub);
            });
            
            setSubCategories(subsByCategory);
            setCategories(updatedCategories.length > 0 ? updatedCategories : [
              { id: "1", label: "Suits", slug: "suits", is_active: true, hasSub: true },
              { id: "2", label: "Natives", slug: "natives", is_active: true, hasSub: false },
              { id: "3", label: "Kaftan", slug: "kaftan", is_active: true, hasSub: false },
              { id: "4", label: "Agbada", slug: "agbada", is_active: true, hasSub: false },
              { id: "5", label: "Shirts", slug: "shirts", is_active: true, hasSub: false },
              { id: "6", label: "Pants", slug: "pants", is_active: true, hasSub: false },
              { id: "7", label: "Casuals", slug: "casuals", is_active: true, hasSub: false },
              { id: "8", label: "Ladies", slug: "ladies", is_active: true, hasSub: false },
            ]);
            return;
          }
        } catch (subErr) {
          console.error("Failed to load sub-categories:", subErr);
        }
        
        setCategories(activeCategories.length > 0 ? activeCategories : [
          { id: "1", label: "Suits", slug: "suits", is_active: true, hasSub: true },
          { id: "2", label: "Natives", slug: "natives", is_active: true, hasSub: false },
          { id: "3", label: "Kaftan", slug: "kaftan", is_active: true, hasSub: false },
          { id: "4", label: "Agbada", slug: "agbada", is_active: true, hasSub: false },
          { id: "5", label: "Shirts", slug: "shirts", is_active: true, hasSub: false },
          { id: "6", label: "Pants", slug: "pants", is_active: true, hasSub: false },
          { id: "7", label: "Casuals", slug: "casuals", is_active: true, hasSub: false },
          { id: "8", label: "Ladies", slug: "ladies", is_active: true, hasSub: false },
        ]);
      } catch (e) {
        console.error("Failed to load categories:", e);
        // Set fallback categories if everything fails
        setCategories([
          { id: "1", label: "Suits", slug: "suits", is_active: true, hasSub: true },
          { id: "2", label: "Natives", slug: "natives", is_active: true, hasSub: false },
          { id: "3", label: "Kaftan", slug: "kaftan", is_active: true, hasSub: false },
          { id: "4", label: "Agbada", slug: "agbada", is_active: true, hasSub: false },
          { id: "5", label: "Shirts", slug: "shirts", is_active: true, hasSub: false },
          { id: "6", label: "Pants", slug: "pants", is_active: true, hasSub: false },
          { id: "7", label: "Casuals", slug: "casuals", is_active: true, hasSub: false },
          { id: "8", label: "Ladies", slug: "ladies", is_active: true, hasSub: false },
        ]);
      } finally {
        setLoadingCategories(false);
      }
    }
    void loadCategories();
  }, []);

  useEffect(() => { setMobile(false); }, [pathname]);
  useEffect(() => {
    setAuthUser(isAuthenticated() ? getCurrentUser() : null);
  }, [pathname]);

  const transparent = isHome && !scrolled;
  const textCls = transparent ? "text-cream" : "text-foreground";

  // Split categories for layout (split roughly in half)
  const splitIndex = Math.ceil(categories.length / 2);
  const navLeft = categories.slice(0, splitIndex);
  const navRight = categories.slice(splitIndex);

  const enterCategory = (slug: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredCategory(slug);
  };

  const leaveCategory = () => {
    hoverTimeout.current = setTimeout(() => setHoveredCategory(null), 150);
  };

  function NavLink({ item }: { item: NavCategory }) {
    if (item.hasSub) {
      const subs = subCategories[item.slug] || [];
      return (
        <div className="relative" onMouseEnter={() => enterCategory(item.slug)} onMouseLeave={leaveCategory}>
          <Link
            to="/shop"
            search={{ category: item.slug } as never}
            className={`flex items-center gap-0.5 hover:text-gold transition-colors duration-200 relative group ${textCls}`}
          >
            {item.label}
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${hoveredCategory === item.slug ? "rotate-180" : ""}`} />
            <span className="absolute left-0 -bottom-1 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
          </Link>

          {hoveredCategory === item.slug && subs.length > 0 && (
            <div
              className="absolute top-full left-0 mt-2 w-52 bg-onyx border border-gold/20 shadow-2xl py-1 z-50"
              onMouseEnter={() => enterCategory(item.slug)}
              onMouseLeave={leaveCategory}
            >
              {subs.map((s) => (
                <Link
                  key={s.id}
                  to="/shop"
                  search={{ category: item.slug, sub: s.slug } as never}
                  className="block px-5 py-3 text-[11px] tracking-[0.2em] uppercase text-cream/80 hover:text-gold hover:bg-white/5 transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <Link
        to="/shop"
        search={{ category: item.slug } as never}
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
            {loadingCategories ? (
              <span className={`text-xs ${textCls}`}>Loading...</span>
            ) : navLeft.length > 0 ? (
              navLeft.map((n) => <NavLink key={n.id} item={n} />)
            ) : null}
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
            {!loadingCategories && navRight.length > 0 && navRight.map((n) => <NavLink key={n.id} item={n} />)}

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

              {/* Render all categories - those with hasSub get accordions, others are direct links */}
              {categories.map((cat) => {
                if (cat.hasSub) {
                  const subs = subCategories[cat.slug] || [];
                  const isOpen = mobileSubOpen === cat.id;
                  return (
                    <div key={cat.id} className="border-b border-border">
                      <button
                        onClick={() => setMobileSubOpen(isOpen ? null : cat.id)}
                        className="w-full flex items-center justify-between px-5 py-3.5 text-sm tracking-[0.18em] uppercase hover:text-gold hover:bg-secondary/30 transition-colors"
                      >
                        {cat.label}
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && subs.length > 0 && (
                        <div className="bg-secondary/20">
                          {subs.map((s) => (
                            <Link
                              key={s.id}
                              to="/shop"
                              search={{ category: cat.slug, sub: s.slug } as never}
                              className="block pl-8 pr-5 py-3 text-sm tracking-[0.15em] uppercase border-t border-border/50 hover:text-gold transition-colors"
                            >
                              {s.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={cat.id}
                    to="/shop"
                    search={{ category: cat.slug } as never}
                    className="px-5 py-3.5 text-sm tracking-[0.18em] uppercase border-b border-border hover:text-gold hover:bg-secondary/30 transition-colors"
                  >
                    {cat.label}
                  </Link>
                );
              })}

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
