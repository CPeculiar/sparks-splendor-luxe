import { createFileRoute, Outlet, Link, useRouterState, useNavigate, redirect } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingBag, Receipt, Users, LogOut, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser, isAuthenticated, logout } from "@/lib/auth";

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
  { to: "/admin",              label: "Dashboard",    icon: LayoutDashboard, exact: true },
  { to: "/admin/products",     label: "Products",     icon: Package,         exact: false },
  { to: "/admin/launch",       label: "Featured Launch", icon: Sparkles,     exact: false },
  { to: "/admin/orders",       label: "Orders",       icon: ShoppingBag,     exact: false },
  { to: "/admin/transactions", label: "Transactions", icon: Receipt,         exact: false },
  { to: "/admin/customers",    label: "Users",        icon: Users,           exact: false },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (pathname === "/admin/login") return <Outlet />;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/20 flex flex-col lg:flex-row">
      <aside className="lg:w-64 lg:min-h-[calc(100vh-4rem)] bg-onyx text-cream flex lg:flex-col">
        <div className="p-5 border-b border-cream/10 hidden lg:block">
          <div className="flex items-center gap-2">
            {user?.role === "super_admin" && <ShieldCheck className="h-4 w-4 text-gold" />}
            <p className="text-eyebrow text-gold capitalize">{user?.role?.replace("_", " ") || "Admin"}</p>
          </div>
          <h2 className="font-display text-xl mt-1">Sparks &amp; Splendour</h2>
          <p className="text-xs text-cream/50 mt-1 truncate">{user?.email}</p>
        </div>
        <nav className="flex lg:flex-col flex-1 overflow-x-auto lg:overflow-visible">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={[
                  "flex items-center gap-3 px-5 py-4 text-sm tracking-wide whitespace-nowrap border-l-2 transition-colors",
                  active ? "border-gold bg-cream/5 text-gold" : "border-transparent text-cream/70 hover:text-cream hover:bg-cream/5",
                ].join(" ")}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden lg:block p-4 border-t border-cream/10">
          <button
            onClick={() => { logout(); navigate({ to: "/admin/login" }); }}
            className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-cream/70 hover:text-gold"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
}
