import React from "react";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number | null;
  currency?: string;
  showStrikethrough?: boolean;
  className?: string;
}

/**
 * PriceDisplay component - shows price with optional strike-through original price
 * Usage:
 * <PriceDisplay price={450000} originalPrice={500000} currency="₦" />
 * // Renders: ₦500,000 (struck out)  ₦450,000
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  currency = "₦",
  showStrikethrough = true,
  className = "",
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Original price (struck out) */}
      {hasDiscount && showStrikethrough && (
        <span className="text-xs md:text-sm text-muted-foreground line-through">
          {currency}
          {originalPrice.toLocaleString()}
        </span>
      )}

      {/* Current price */}
      <span className={`font-semibold ${hasDiscount ? "text-gold" : ""}`}>
        {currency}
        {price.toLocaleString()}
      </span>

      {/* Discount badge */}
      {hasDiscount && (
        <span className="text-[10px] font-bold bg-destructive text-white px-2 py-0.5 rounded">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
