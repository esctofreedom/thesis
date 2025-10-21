export type InvestmentType =
  | "short-term"
  | "long-term-appreciation"
  | "dividend-growth"
  | "high-dividend"
  | "core"
  | "speculative";

export interface Stock {
  id: string;
  name: string;
  ticker: string;
  logo: string;
  investmentType: InvestmentType;
  shares?: number;
  price?: string;
  thesis?: string;
  isWatchlist?: boolean;
  priceTarget?: string | null;
}
