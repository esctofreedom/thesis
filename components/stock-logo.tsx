/* eslint-disable @next/next/no-img-element */
"use client";

interface StockLogoProps {
  ticker: string;
  name: string;
  size?: number;
  className?: string;
}

export function StockLogo({
  ticker,
  name,
  size = 48,
  className = "",
}: StockLogoProps) {
  // Using Elbstream's logo API
  // Documentation: https://elbstream.com/logos
  const logoUrl = `https://api.elbstream.com/logos/symbol/${ticker}`;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="rounded-sm object-contain"
        onError={(e) => {
          // Fallback to a placeholder if logo fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          if (target.parentElement) {
            target.parentElement.innerHTML = `<div class="w-full h-full bg-muted rounded-lg flex items-center justify-center text-lg font-semibold">${ticker.charAt(
              0
            )}</div>`;
          }
        }}
      />
    </div>
  );
}
