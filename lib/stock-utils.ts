import { InvestmentType } from "@/types/stock";

export interface Strategy {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface Stock {
  id: string;
  name: string;
  ticker: string;
  investmentType: InvestmentType;
  shares?: number | null;
  price?: string | null;
  thesis: string | null;
  isWatchlist?: boolean | null;
  isFavorite?: boolean | null;
  priceTarget?: string | null;
  createdAt: Date;
  updatedAt: Date;
  entryCount?: number;
  strategies?: Strategy[];
}

export const getInvestmentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    "short-term": "Short Term",
    "long-term-appreciation": "Long Term Appreciation",
    "dividend-growth": "Dividend Growth",
    "high-dividend": "High Dividend",
    core: "Core",
    speculative: "Speculative",
  };
  return labels[type] || type;
};

export const getInvestmentTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    "short-term": "bg-orange-500/10 text-orange-500 border-orange-500/20",
    "long-term-appreciation": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "dividend-growth": "bg-green-500/10 text-green-500 border-green-500/20",
    "high-dividend": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    core: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    speculative: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return colors[type] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

export const getInvestmentTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    "short-term": "TrendingUp",
    "long-term-appreciation": "TrendingUp",
    "dividend-growth": "DollarSign",
    "high-dividend": "Coins",
    core: "Shield",
    speculative: "Zap",
  };
  return icons[type] || "Circle";
};
