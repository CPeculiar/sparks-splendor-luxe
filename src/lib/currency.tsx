import { createContext, useContext, useMemo, type ReactNode } from "react";

interface Ctx {
  code: "NGN" | "USD";
  symbol: string;
  rate: number;
  loading: boolean;
  format: (amountNGN: number) => string;
  toCharge: (amountNGN: number) => { amount: number; currency: "NGN" | "USD" };
}

const CurrencyCtx = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const value = useMemo<Ctx>(() => ({
    code: "NGN",
    symbol: "₦",
    rate: 1,
    loading: false,
    format: (ngn: number) => `₦${Math.round(ngn).toLocaleString("en-NG")}`,
    toCharge: (ngn: number) => ({ amount: Math.round(ngn * 100), currency: "NGN" }),
  }), []);

  return <CurrencyCtx.Provider value={value}>{children}</CurrencyCtx.Provider>;
}

export function useCurrency() {
  const c = useContext(CurrencyCtx);
  if (!c) throw new Error("useCurrency must be used within CurrencyProvider");
  return c;
}
