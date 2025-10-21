"use client";

import { Button } from "@/components/ui/button";
import { StockLogo } from "@/components/stock-logo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Coins,
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  BookOpen,
  Eye,
  Wallet,
  Hash,
} from "lucide-react";
import { Stock } from "@/lib/stock-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  stock: Stock;
  onBack: () => void;
  saveStatus: "saved" | "saving" | "unsaved";
  entryCount?: number;
  onNewEntry?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
  portfolioTotal?: number;
}

export function EditorToolbar({
  stock,
  onBack,
  saveStatus,
  entryCount = 0,
  onNewEntry,
  onEdit,
  onDelete,
  onFavoriteToggle,
  isFavorite = false,
  portfolioTotal = 0,
}: EditorToolbarProps) {
  // Calculate financial data
  const shares = stock.shares || 0;
  const price = parseFloat(stock.price || "0");
  const total = shares * price;
  const isWatchlist = stock.isWatchlist || false;
  const priceTarget = stock.priceTarget;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate portfolio percentage
  const getPortfolioPercentage = () => {
    if (isWatchlist || portfolioTotal === 0) return 0;
    return (total / portfolioTotal) * 100;
  };

  const portfolioPercentage = getPortfolioPercentage();

  const DoughnutChart = ({ percentage }: { percentage: number }) => {
    const radius = 12;
    const strokeWidth = 2;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-4 h-4">
        <svg
          className="w-4 h-4 transform -rotate-90"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted-foreground/20"
          />
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-300"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-10 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <StockLogo ticker={stock.ticker} name={stock.name} size={40} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{stock.name}</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {stock.ticker}
                  </span>
                  {isWatchlist && (
                    <div className="flex items-center gap-1 text-muted-foreground bg-amber-500/10 rounded-md px-2 py-1">
                      <Eye className="h-3 w-3 text-amber-500" />
                      <span className="text-xs">Watchlist</span>
                    </div>
                  )}
                </div>
                {stock.strategies && stock.strategies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {stock.strategies.map((strategy) => {
                      const iconMap: Record<
                        string,
                        React.ComponentType<{ className?: string }>
                      > = {
                        Shield,
                        Zap,
                        TrendingUp,
                        DollarSign,
                        Coins,
                      };
                      const IconComponent =
                        iconMap[strategy.icon as keyof typeof iconMap] ||
                        Shield;
                      return (
                        <Badge
                          key={strategy.id}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: strategy.color,
                            color: strategy.color,
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <IconComponent className="h-3 w-3" />
                            {strategy.name}
                          </div>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>
                {entryCount} {entryCount === 1 ? "entry" : "entries"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {saveStatus === "saving" && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {saveStatus === "saved" && (
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="h-4 w-4" />
                  <span>Saved</span>
                </div>
              )}
              {saveStatus === "unsaved" && (
                <span className="text-orange-500">Unsaved changes</span>
              )}
            </div>

            {onFavoriteToggle && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onFavoriteToggle}
                className="h-8 px-2"
              >
                <Star
                  className={cn(
                    "h-4 w-4 mr-1 transition-colors",
                    isFavorite
                      ? "fill-amber-500 text-amber-500"
                      : "text-muted-foreground hover:text-amber-500 hover:fill-amber-500"
                  )}
                />
                {isFavorite ? "Favorited" : "Favorite"}
              </Button>
            )}

            {onNewEntry && (
              <Button size="sm" onClick={onNewEntry}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Stock
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Stock
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Financial Data Section */}
        <Card className="bg-muted/30 border-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              {isWatchlist ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">
                      Target
                    </span>
                    <span className="font-semibold">
                      {priceTarget
                        ? formatCurrency(parseFloat(priceTarget))
                        : "—"}
                    </span>
                  </div>
                </div>
              ) : shares > 0 || price > 0 ? (
                <>
                  {portfolioPercentage > 0 && (
                    <div className="flex items-center gap-2">
                      <DoughnutChart percentage={portfolioPercentage} />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Allocation
                        </span>
                        <span className="font-semibold">
                          {portfolioPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Shares
                      </span>
                      <span className="font-semibold">
                        {shares.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Price
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Total
                      </span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground/50 text-sm py-2 w-full">
                  No position data
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
