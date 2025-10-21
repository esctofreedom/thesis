"use client";

import { useState, useEffect, useCallback } from "react";
import { Stock } from "@/lib/stock-utils";
import { StockCard } from "@/components/stock-card";
import { StockDialog } from "@/components/stock-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = useCallback(async () => {
    try {
      const response = await fetch("/api/stocks");
      if (response.ok) {
        const data = await response.json();
        setStocks(data);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleStockDeleted = useCallback(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Separate portfolio stocks from watchlist stocks and sort by favorite
  const portfolioStocks = stocks
    .filter((stock) => !stock.isWatchlist)
    .sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  const watchlistStocks = stocks
    .filter((stock) => stock.isWatchlist)
    .sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });

  // Calculate total portfolio value (only non-watchlist stocks with shares > 0)
  const portfolioTotal = portfolioStocks
    .filter((stock) => (stock.shares || 0) > 0)
    .reduce((sum, stock) => {
      const shares = stock.shares || 0;
      const price = parseFloat(stock.price || "0");
      return sum + shares * price;
    }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extralight uppercase font-mono mb-3">
                Logfolio
              </h1>
              <div className="flex items-center gap-2">
                {stocks.length > 0 && (
                  <span className="text-sm font-medium text-muted-foreground">
                    Portfolio . {portfolioStocks.length}{" "}
                    {portfolioStocks.length === 1 ? "stock" : "stocks"}
                    {portfolioTotal > 0 && (
                      <span className="ml-2">
                        . {formatCurrency(portfolioTotal)}
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/strategies">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 " />
                </Button>
              </Link>
              <StockDialog onSuccess={fetchStocks} />
            </div>
          </div>
        </div>

        {stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-semibold mb-2">No stocks yet</h2>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first stock to track.
              </p>
              <StockDialog onSuccess={fetchStocks} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Portfolio Stocks */}
            {portfolioStocks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {portfolioStocks.map((stock) => (
                    <StockCard
                      key={stock.id}
                      stock={stock}
                      viewMode="editor"
                      onDelete={handleStockDeleted}
                      portfolioTotal={portfolioTotal}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Watchlist Stocks */}
            {watchlistStocks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Watchlist</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {watchlistStocks.map((stock) => (
                    <StockCard
                      key={stock.id}
                      stock={stock}
                      viewMode="editor"
                      onDelete={handleStockDeleted}
                      portfolioTotal={portfolioTotal}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Stock logos provided by{" "}
            <a
              href="https://elbstream.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Elbstream
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
