import { createFileRoute, Outlet, Link, useRouterState, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { LayoutDashboard, Package, ShoppingBag, Receipt, Users, LogOut, ShieldCheck, Sparkles, Tags, Image, Sliders, BarChart3, FileText, Bell, BookOpen, Database, Settings, Mail, MessageSquare, Star, Loader2, X } from "lucide-react";
import { getCurrentUser, isAuthenticated, logout } from "@/lib/auth";
import { useAuthRefresh } from "@/hooks/useAuthRefresh";
import { IdleWarningModal } from "@/components/IdleWarningModal";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin/login") return;
    if (typeof window !== "undefined") {
      const user = getCurrentUser();
      if (!isAuthenticated() || (user?.role !== "admin" && user?.role !== "super_admin")) {
        throw redirect({ to: "/admin/login" });
      }
    }
  },
  component: AdminLayout,
});

const NAV = [
  // Core
  { to: "/admin",              label: "Dashboard",    icon: LayoutDashboard, exact: true },
  
  // Content & Catalog
  { label: "Catalog & Content", type: "section" as const },
  { to: "/admin/products",     label: "Products",     icon: Package,         exact: false },
  { to: "/admin/categories",   label: "Categories",   icon: Tags,            exact: false },
  { to: "/admin/sub-categories", label: "Sub-Categories", icon: Tags,        exact: false },
  { to: "/admin/launch",       label: "Featured Launch", icon: Sparkles,     exact: false },
  { to: "/admin/homepage",     label: "Homepage Manager",icon: LayoutDashboard, exact: false },
  { to: "/admin/banners",      label: "Banners",      icon: Image,           exact: false },
  { to: "/admin/hero-slides",  label: "Hero Slides",  icon: Sliders,         exact: false },
  { to: "/admin/media",        label: "Media Library",icon: Database,        exact: false },
  
  // Commerce
  { label: "Commerce", type: "section" as const },
  { to: "/admin/orders",       label: "Orders",       icon: ShoppingBag,     exact: false },
  { to: "/admin/inventory",    label: "Inventory",    icon: Package,         exact: false },
  { to: "/admin/coupons",      label: "Coupons",      icon: Tags,            exact: false },
  { to: "/admin/transactions", label: "Transactions", icon: Receipt,         exact: false },
  
  // Management
  { label: "Management", type: "section" as const },
  { to: "/admin/customers",    label: "Customers",    icon: Users,           exact: false },
  { to: "/admin/permissions",  label: "Roles & Permissions", icon: ShieldCheck, exact: false },
  { to: "/admin/reviews",      label: "Reviews",      icon: Star,            exact: false },
  { to: "/admin/newsletter",   label: "Newsletter",   icon: Mail,            exact: false },
  
  // CMS & Engagement
  { label: "CMS & Engagement", type: "section" as const },
  { to: "/admin/faq",          label: "FAQ",          icon: BookOpen,        exact: false },
  { to: "/admin/notifications", label: "Notifications", icon: Bell,          exact: false },
  { to: "/admin/contacts",     label: "Contacts",     icon: MessageSquare,   exact: false },
  
  // Analytics & Settings
  { label: "Analytics & Settings", type: "section" as const },
  { to: "/admin/analytics",    label: "Analytics",    icon: BarChart3,       exact: false },
  { to: "/admin/reports",      label: "Reports",      icon: FileText,        exact: false },
  { to: "/admin/settings",     label: "Settings",     icon: Settings,        exact: false },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [idleOpen, setIdleOpen] = useState(false);
  const [idleSeconds, setIdleSeconds] = useState(60);

  const handleIdleWarning = useCallback((secondsLeft: number) => {
    setIdleSeconds(secondsLeft);
    setIdleOpen(true);
  }, []);

  const handleIdleLogout = useCallback(() => {
    setIdleOpen(false);
    logout();
    navigate({ to: "/admin/login" });
  }, [navigate]);

  const handleStayLoggedIn = useCallback(() => {
    setIdleOpen(false);
  }, []);

  useAuthRefresh(
    pathname !== "/admin/login" ? handleIdleWarning : undefined,
    pathname !== "/admin/login" ? handleIdleLogout : undefined,
  );

  // Close idle modal whenever we land on a non-login admin page (e.g. after fresh login)
  const prevPathRef = useState("/admin/login");
  if (prevPathRef[0] === "/admin/login" && pathname !== "/admin/login") {
    prevPathRef[1](pathname);
    setIdleOpen(false);
  } else if (prevPathRef[0] !== pathname) {
    prevPathRef[1](pathname);
  }

  if (pathname === "/admin/login") return <Outlet />;

  return (
    <div className="bg-secondary/20 flex flex-row" style={{ minHeight: "100dvh" }}>
      <IdleWarningModal
        open={idleOpen}
        secondsLeft={idleSeconds}
        onStayLoggedIn={handleStayLoggedIn}
        onLogout={handleIdleLogout}
      />
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-onyx text-cream p-2.5 rounded shadow-lg hover:bg-onyx/80" aria-label="Open sidebar">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <aside className="md:hidden fixed top-0 left-0 w-[280px] bg-onyx text-cream flex flex-col z-30" style={{ height: "100dvh" }}>
          <div className="p-5 border-b border-cream/10 bg-onyx flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {user?.role === "super_admin" && <ShieldCheck className="h-4 w-4 text-gold" />}
                <p className="text-eyebrow text-gold capitalize">{user?.role?.replace("_", " ") || "Admin"}</p>
              </div>
              <h2 className="font-display text-xl mt-1">Sparks &amp; Splendour</h2>
              <p className="text-xs text-cream/50 mt-1 truncate">{user?.email}</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-cream/60 hover:text-gold mt-1" aria-label="Close sidebar">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col flex-1 overflow-y-auto">
            {NAV.map((n, i) => {
              if ("type" in n && n.type === "section") {
                return (
                  <div key={i} className="px-5 pt-4 pb-2 text-[10px] tracking-[0.2em] uppercase text-cream/40 font-semibold mt-2 border-t border-cream/10">
                    {n.label}
                  </div>
                );
              }
              const isNavItem = "to" in n;
              if (!isNavItem) return null;
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} onClick={() => setSidebarOpen(false)}
                  className={["flex items-center gap-3 px-5 py-3 text-sm tracking-wide border-l-2 transition-colors",
                    active ? "border-gold bg-cream/5 text-gold" : "border-transparent text-cream/70 hover:text-cream hover:bg-cream/5"].join(" ")}
                >
                  <n.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-cream/10 bg-onyx">
            <button onClick={() => { logout(); navigate({ to: "/admin/login" }); }}
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-cream/70 hover:text-gold w-full">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </aside>
      )}

      {/* Desktop sidebar — column stretches full page height, inner aside sticks to viewport */}
      <div className="hidden md:block w-64 lg:w-72 bg-onyx flex-shrink-0">
        <aside className="sticky top-0 h-screen flex flex-col text-cream" style={{ overflowY: "auto" }}>
          <div className="p-5 border-b border-cream/10">
            <div className="flex items-center gap-2">
              {user?.role === "super_admin" && <ShieldCheck className="h-4 w-4 text-gold" />}
              <p className="text-eyebrow text-gold capitalize">{user?.role?.replace("_", " ") || "Admin"}</p>
            </div>
            <h2 className="font-display text-xl mt-1">Sparks &amp; Splendour</h2>
            <p className="text-xs text-cream/50 mt-1 truncate">{user?.email}</p>
          </div>

          <nav className="flex flex-col flex-1 overflow-y-auto">
            {NAV.map((n, i) => {
              if ("type" in n && n.type === "section") {
                return (
                  <div key={i} className="px-5 pt-4 pb-2 text-[10px] tracking-[0.2em] uppercase text-cream/40 font-semibold mt-2 border-t border-cream/10">
                    {n.label}
                  </div>
                );
              }
              const isNavItem = "to" in n;
              if (!isNavItem) return null;
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setSidebarOpen(false)}
                  className={[
                    "flex items-center gap-3 px-5 py-3 text-sm tracking-wide border-l-2 transition-colors",
                    active ? "border-gold bg-cream/5 text-gold" : "border-transparent text-cream/70 hover:text-cream hover:bg-cream/5",
                  ].join(" ")}
                >
                  <n.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-cream/10">
            <button
              onClick={() => { logout(); navigate({ to: "/admin/login" }); }}
              className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-cream/70 hover:text-gold w-full"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </aside>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-onyx/60 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
