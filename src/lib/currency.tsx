import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface Ctx {
  code: "NGN" | "USD";
  symbol: string;
  loading: boolean;
  format: (amount: number) => string;
  toCharge: (amount: number) => { amount: number; currency: "NGN" | "USD" };
}

const CurrencyCtx = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectCurrencyFromAPI();
  }, []);

  async function detectCurrencyFromAPI() {
    try {
      setLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const response = await fetch(`${API_BASE}/api/currency`);
      if (!response.ok) throw new Error("Failed to detect currency");

      const data = await response.json();
      const detectedCurrency: "NGN" | "USD" = data.currency === "USD" ? "USD" : "NGN";
      setCurrency(detectedCurrency);
      localStorage.setItem("sparks_currency", detectedCurrency);
    } catch (error) {
      console.warn("Currency auto-detection failed:", error);
      const cached = localStorage.getItem("sparks_currency");
      if (cached === "NGN" || cached === "USD") {
        setCurrency(cached);
      } else {
        setCurrency("NGN");
      }
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo<Ctx>(() => ({
    code: currency,
    symbol: currency === "NGN" ? "₦" : "$",
    loading,
    format: (amount: number) => {
      const symbol = currency === "NGN" ? "₦" : "$";
      const locale = currency === "NGN" ? "en-NG" : "en-US";
      return `${symbol}${Math.round(amount).toLocaleString(locale)}`;
    },
    toCharge: (amount: number) => ({
      amount: Math.round(amount * 100), // Convert to kobo (NGN) or cents (USD)
      currency,
    }),
  }), [currency, loading]);

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
}

export function useCurrency() {
  const c = useContext(CurrencyCtx);
  if (!c) throw new Error("useCurrency must be used within CurrencyProvider");
  return c;
}
