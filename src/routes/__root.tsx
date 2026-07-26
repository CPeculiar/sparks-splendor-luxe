import { Outlet, Link, createRootRoute, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { CartProvider } from "@/lib/cart";
import { CurrencyProvider } from "@/lib/currency";
import { IdleWarningModal } from "@/components/IdleWarningModal";
import { useAuthRefresh } from "@/hooks/useAuthRefresh";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-eyebrow">Error 404</p>
        <h1 className="font-display text-7xl mt-4">Lost in style</h1>
        <p className="mt-4 text-muted-foreground">The page you sought is no longer in our collections.</p>
        <Link to="/" className="inline-flex mt-8 bg-onyx text-cream px-7 py-3 text-xs tracking-[0.25em] uppercase font-semibold hover:bg-gold hover:text-onyx transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminRoute = pathname.startsWith("/admin");
  const [idleWarningOpen, setIdleWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  // Only enable idle timer for admin routes
  if (isAdminRoute) {
    useAuthRefresh(
      (secs) => {
        setSecondsLeft(secs);
        if (secs === 60) setIdleWarningOpen(true);
        if (secs === 0) setIdleWarningOpen(false);
      },
      () => {
        setIdleWarningOpen(false);
      }
    );
  }

  return (
    <CurrencyProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          {!isAdminRoute && <Header />}
          <main className="flex-1">
            <Outlet />
          </main>
          {!isAdminRoute && <Footer />}
        </div>
        {!isAdminRoute && <CartDrawer />}
        {!isAdminRoute && <WhatsAppFab />}
        
        {/* Idle warning modal - only on admin routes */}
        {isAdminRoute && (
          <IdleWarningModal
            open={idleWarningOpen}
            secondsLeft={secondsLeft}
            onStayLoggedIn={() => setIdleWarningOpen(false)}
            onLogout={() => setIdleWarningOpen(false)}
          />
        )}
      </CartProvider>
    </CurrencyProvider>
  );
}
