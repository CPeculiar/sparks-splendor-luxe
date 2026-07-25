# Frontend Readiness Assessment - Dual Currency System

## Current State

Your frontend has a modern React setup with:
- ✅ TanStack React Router + React Query
- ✅ Tailwind CSS + Radix UI components
- ✅ Admin dashboard with product management
- ✅ Currency context hook (but needs updating)
- ✅ Already fetches products from API (`/api/products`)
- ✅ Already fetches admin products from API (`/api/products`)

However, it's **NOT ready** for the dual-currency system yet.

---

## What's Missing

### 1. ❌ Currency Context Hook
**File:** `FRONTEND/src/lib/currency.tsx`

**Current State:** Hard-coded to NGN only
```typescript
const value = useMemo<Ctx>(() => ({
  code: "NGN",
  symbol: "₦",
  rate: 1,
  loading: false,
  format: (ngn: number) => `₦${Math.round(ngn).toLocaleString("en-NG")}`,
  toCharge: (ngn: number) => ({ amount: Math.round(ngn * 100), currency: "NGN" }),
}), []);
```

**Needs to be:** Dynamic detection from API response

---

### 2. ❌ Product Types Updated
**File:** `FRONTEND/src/lib/products.ts`

**Current State:**
```typescript
export interface Product {
  id: string;
  price: number;           // Only one price
  currency: string;        // Only one currency
  // ... other fields
}
```

**Needs to be:**
```typescript
export interface Product {
  id: string;
  price: number;           // NGN price (raw from API)
  price_usd?: number;      // USD price (raw from API)
  display_price: number;   // ← NEW: Shows appropriate price
  display_currency: string; // ← NEW: "NGN" or "USD"
  currency_symbol: string;  // ← NEW: "₦" or "$"
  // ... other fields
}
```

---

### 3. ❌ Admin Product Form
**File:** `FRONTEND/src/routes/admin.products.tsx`

**Current State:** Only has one price field
```typescript
<Row label="Price (₦)">
  <input type="number" value={p.price ?? 0} ... />
</Row>
```

**Needs to be:** Two price fields
```typescript
<div className="grid grid-cols-2 gap-4">
  <Row label="Price NGN (₦)">
    <input type="number" value={p.price ?? 0} ... />
  </Row>
  <Row label="Price USD ($)">
    <input type="number" value={p.price_usd ?? 0} ... />
  </Row>
</div>
```

---

### 4. ❌ Admin Product Type
**File:** `FRONTEND/src/lib/admin.ts`

**Current State:**
```typescript
export interface AdminProduct {
  // Only has price, not price_usd
  price: number;
  currency: string;
}
```

**Needs to include:**
```typescript
export interface AdminProduct {
  price: number;           // NGN
  price_usd?: number;      // USD ← NEW
  // ... rest
}
```

---

### 5. ❌ Payment Initialization
**File:** Where checkout calls `/api/payments/initialize`

**Current State:** Doesn't pass/handle currency

**Needs to handle:** Currency from payment response
```typescript
const response = await fetch('/api/payments/initialize', {
  method: 'POST',
  body: JSON.stringify({ order_id })
});

const { data } = await response.json();
// data.currency = "NGN" or "USD" ← AUTO-DETECTED
// data.amount = correct value in kobo or cents
```

---

### 6. ❌ Product List Page
**File:** Product display components

**Current State:** Uses static/old product data

**Needs to:** Use API data with display_price, display_currency

---

## Quick Implementation Checklist

### Phase 1: Update Types (15 min)

- [ ] Update `AdminProduct` interface to include `price_usd`
- [ ] Update `Product` interface to include `display_price`, `display_currency`, `currency_symbol`
- [ ] Update product fetch functions to handle new fields

### Phase 2: Update Currency Context (20 min)

- [ ] Fetch currency info from geolocation
- [ ] Update `useCurrency()` hook to return correct currency
- [ ] Format prices with correct symbol

### Phase 3: Update Admin Form (30 min)

- [ ] Add USD price input field
- [ ] Validate both prices are required
- [ ] Send both prices to API

### Phase 4: Update Product Display (30 min)

- [ ] Show `display_price` instead of `price`
- [ ] Show `currency_symbol` next to price
- [ ] Ensure cart uses correct prices

### Phase 5: Update Checkout (20 min)

- [ ] Handle currency in payment initialization
- [ ] Pass currency to Paystack
- [ ] Show order total with currency symbol

---

## Implementation Steps

### Step 1: Update Types

**FRONTEND/src/lib/products.ts:**
```typescript
export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;              // NGN
  price_usd?: number;         // NEW: USD
  display_price: number;      // NEW
  display_currency: string;   // NEW: "NGN" or "USD"
  currency_symbol: string;    // NEW: "₦" or "$"
  image: string;
  gallery: string[];
  colors: string[];
  sizes: string[];
  description: string;
  fabric: string;
  badge?: "New" | "Bestseller" | "Limited";
}
```

**FRONTEND/src/lib/admin.ts:**
```typescript
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category_id?: string;
  price: number;              // NGN (required)
  price_usd?: number;         // NEW: USD (required)
  // ... rest of fields
}
```

### Step 2: Update Currency Context

**FRONTEND/src/lib/currency.tsx:**
```typescript
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
    // Detect currency from API based on user location
    detectCurrency();
  }, []);

  async function detectCurrency() {
    try {
      const res = await fetch("/api/products?limit=1");
      const data = await res.json();
      const detected = data.currency || "NGN";
      setCurrency(detected);
    } catch (e) {
      console.error("Currency detection failed:", e);
      setCurrency("NGN"); // Fallback
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
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    },
    toCharge: (amount: number) => ({
      amount: Math.round(amount * 100),
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
```

### Step 3: Update Admin Product Form

**FRONTEND/src/routes/admin.products.tsx - In ProductForm component:**

Replace this:
```typescript
<div className="grid grid-cols-3 gap-4">
  <Row label="Price (₦)"><input type="number" value={p.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} className="inp" /></Row>
  <Row label="Currency"><input value={p.currency ?? "₦"} onChange={(e) => set("currency", e.target.value)} className="inp" /></Row>
  <Row label="Stock"><input type="number" value={p.quantity_in_stock ?? 0} onChange={(e) => set("quantity_in_stock", Number(e.target.value))} className="inp" /></Row>
</div>
```

With this:
```typescript
<div className="grid grid-cols-3 gap-4">
  <Row label="Price NGN (₦)">
    <input type="number" value={p.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} required className="inp" />
  </Row>
  <Row label="Price USD ($)">
    <input type="number" value={p.price_usd ?? 0} onChange={(e) => set("price_usd", Number(e.target.value))} required className="inp" />
  </Row>
  <Row label="Stock">
    <input type="number" value={p.quantity_in_stock ?? 0} onChange={(e) => set("quantity_in_stock", Number(e.target.value))} className="inp" />
  </Row>
</div>
```

Also update the validation:
```typescript
function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  
  // Validate both prices
  if (!p.price || !p.price_usd) {
    alert("Both NGN and USD prices are required");
    return;
  }
  
  onSave({
    ...p,
    colors: p._colors.split(",").map((s) => s.trim()).filter(Boolean),
    sizes: p._sizes.split(",").map((s) => s.trim()).filter(Boolean),
    gallery: p._gallery ? p._gallery.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
  });
}
```

### Step 4: Update Admin Inventory Page

**FRONTEND/src/routes/admin.inventory.tsx**

Update the table to show both prices:
```typescript
<table>
  <th>Product</th>
  <th>Price NGN</th>
  <th>Price USD</th>
  <th>Stock</th>
  
  {products.map(p => (
    <tr>
      <td>{p.name}</td>
      <td>₦{Number(p.price).toLocaleString()}</td>
      <td>${Number(p.price_usd).toLocaleString()}</td>
      <td>{p.quantity_in_stock}</td>
    </tr>
  ))}
</table>
```

### Step 5: Update Product Card Display

**FRONTEND/src/components/ProductCard.tsx**

Change from:
```typescript
<p className="text-sm mt-1 tabular-nums">{format(product.price)}</p>
```

To:
```typescript
<p className="text-sm mt-1 tabular-nums">
  {product.currency_symbol}
  {product.display_price.toLocaleString()}
</p>
```

### Step 6: Update Product Detail Page

**FRONTEND/src/routes/product.$slug.tsx**

Wherever prices are shown, use `display_price` and `currency_symbol`.

---

## Files That Need Changes

| File | Change | Priority |
|------|--------|----------|
| `src/lib/currency.tsx` | Make dynamic, detect from API | High |
| `src/lib/products.ts` | Update Product interface | High |
| `src/lib/admin.ts` | Add price_usd to AdminProduct | High |
| `src/routes/admin.products.tsx` | Add USD price field | High |
| `src/routes/admin.inventory.tsx` | Show both prices | Medium |
| `src/components/ProductCard.tsx` | Use display_price | High |
| `src/routes/product.$slug.tsx` | Use display_price | High |
| `src/routes/checkout.tsx` (if exists) | Handle currency in payment | High |

---

## Testing After Implementation

- [ ] Load frontend from Nigeria IP → See NGN prices
- [ ] Load frontend from international IP → See USD prices
- [ ] Admin create product → Requires both prices
- [ ] Admin edit product → Can update both prices
- [ ] Product card → Shows correct price & symbol
- [ ] Checkout → Shows correct currency
- [ ] Payment → Paystack initialized with correct currency

---

## Timeline

- **Currency context:** 20 min
- **Update types:** 15 min
- **Admin form updates:** 30 min
- **Product display:** 30 min
- **Testing:** 20 min

**Total: ~2 hours**

---

## Next Steps

1. **Run the frontend in dev mode** to ensure it's working
2. **Start with currency context** update (most critical)
3. **Update admin form** so you can set USD prices
4. **Update product display** to show appropriate prices
5. **Test the checkout flow** end-to-end

Want me to implement any of these changes for you?
