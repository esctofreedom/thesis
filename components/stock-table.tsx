"use client";

import { useState, useEffect } from "react";
import { Stock } from "@/lib/stock-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrencyBlur } from "@/lib/stores/currency-blur-store";
import { formatCurrency as formatCurrencyUtil } from "@/lib/currency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Coins,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StockLogo } from "@/components/stock-logo";
import { StockDialog } from "@/components/stock-dialog";
import { Input } from "@/components/ui/input";

interface StockTableProps {
  stocks: Stock[];
  title?: string;
  portfolioTotal: number;
  onStockDeleted: () => void;
  isWatchlist?: boolean;
}

type SortColumn =
  | "name"
  | "shares"
  | "price"
  | "value"
  | "allocation"
  | "latestPrice"
  | "priceTarget"
  | "difference"
  | "starred";
type SortDirection = "asc" | "desc" | null;

export function StockTable({
  stocks,
  title,
  portfolioTotal,
  onStockDeleted,
  isWatchlist = false,
}: StockTableProps) {
  const { isBlurred } = useCurrencyBlur();
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [deletingStock, setDeletingStock] = useState<Stock | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>(
    {}
  );
  const [sortColumn, setSortColumn] = useState<SortColumn | null>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const initialStates: Record<string, boolean> = {};
    stocks.forEach((stock) => {
      initialStates[stock.id] = stock.isFavorite || false;
    });
    setFavoriteStates(initialStates);
  }, [stocks]);

  const formatCurrency = (value: number) => {
    return formatCurrencyUtil(value, isBlurred);
  };

  const handleDelete = async (stock: Stock) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stocks?id=${stock.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete stock");
      }

      setDeletingStock(null);
      onStockDeleted();
    } catch (error) {
      console.error("Error deleting stock:", error);
      alert("Failed to delete stock. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFavoriteToggle = async (stock: Stock) => {
    const newFavoriteState = !favoriteStates[stock.id];
    setFavoriteStates((prev) => ({
      ...prev,
      [stock.id]: newFavoriteState,
    }));

    try {
      const response = await fetch(`/api/stocks/${stock.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFavorite: newFavoriteState }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      setFavoriteStates((prev) => ({
        ...prev,
        [stock.id]: !newFavoriteState,
      }));
    }
  };

  const getPortfolioPercentage = (stock: Stock) => {
    if (stock.isWatchlist || portfolioTotal === 0) return 0;
    const shares = stock.shares || 0;
    const price = parseFloat(stock.price || "0");
    const total = shares * price;
    return (total / portfolioTotal) * 100;
  };

  const calculateDifference = (stock: Stock) => {
    const price = parseFloat(stock.price || "0");
    const priceTarget = parseFloat(stock.priceTarget || "0");

    if (price === 0 || priceTarget === 0) return null;

    const difference = ((priceTarget - price) / price) * 100;
    return difference;
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getFilteredStocks = () => {
    if (!searchQuery.trim()) {
      return stocks;
    }

    const query = searchQuery.toLowerCase();
    return stocks.filter((stock) => {
      // Search in name
      if (stock.name.toLowerCase().includes(query)) return true;

      // Search in ticker
      if (stock.ticker.toLowerCase().includes(query)) return true;

      // Search in strategies
      if (stock.strategies) {
        return stock.strategies.some((strategy) =>
          strategy.name.toLowerCase().includes(query)
        );
      }

      return false;
    });
  };

  const getSortedStocks = () => {
    const filteredStocks = getFilteredStocks();

    if (!sortColumn || !sortDirection) {
      return filteredStocks;
    }

    return [...filteredStocks].sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortColumn) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "shares":
          aValue = a.shares || 0;
          bValue = b.shares || 0;
          break;
        case "price":
        case "latestPrice":
          aValue = parseFloat(a.price || "0");
          bValue = parseFloat(b.price || "0");
          break;
        case "value":
          aValue = (a.shares || 0) * parseFloat(a.price || "0");
          bValue = (b.shares || 0) * parseFloat(b.price || "0");
          break;
        case "allocation":
          aValue = getPortfolioPercentage(a);
          bValue = getPortfolioPercentage(b);
          break;
        case "priceTarget":
          aValue = parseFloat(a.priceTarget || "0");
          bValue = parseFloat(b.priceTarget || "0");
          break;
        case "difference":
          aValue = calculateDifference(a) || 0;
          bValue = calculateDifference(b) || 0;
          break;
        case "starred":
          aValue = favoriteStates[a.id] ? 1 : 0;
          bValue = favoriteStates[b.id] ? 1 : 0;
          break;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Shield,
    Zap,
    TrendingUp,
    DollarSign,
    Coins,
  };

  const sortedStocks = getSortedStocks();

  const DoughnutChart = ({ percentage }: { percentage: number }) => {
    const radius = 12;
    const strokeWidth = 2;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-6 h-6">
        <svg
          className="w-6 h-6 transform -rotate-90"
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          {/* Background circle */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search stocks, tickers, or strategies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("starred")}
                  className="h-8 w-8 p-0 hover:bg-transparent"
                  title="Sort by starred"
                >
                  <SortIcon column="starred" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("name")}
                  className="h-8 p-0 hover:bg-transparent"
                >
                  Name
                  <SortIcon column="name" />
                </Button>
              </TableHead>
              {isWatchlist ? (
                <>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("latestPrice")}
                      className="h-8 p-0 hover:bg-transparent ml-auto flex items-center"
                    >
                      Latest Price
                      <SortIcon column="latestPrice" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("priceTarget")}
                      className="h-8 p-0 hover:bg-transparent ml-auto flex items-center"
                    >
                      Price Target
                      <SortIcon column="priceTarget" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("difference")}
                      className="h-8 p-0 hover:bg-transparent ml-auto flex items-center"
                    >
                      Difference
                      <SortIcon column="difference" />
                    </Button>
                  </TableHead>
                  <TableHead>Strategies</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("shares")}
                      className="h-8 p-0 hover:bg-transparent ml-auto flex items-center"
                    >
                      Shares
                      <SortIcon column="shares" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("price")}
                      className="h-8 p-0 hover:bg-transparent ml-auto flex items-center"
                    >
                      Price
                      <SortIcon column="price" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("value")}
                      className="h-8 p-0 hover:bg-transparent ml-auto flex items-center"
                    >
                      Value
                      <SortIcon column="value" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("allocation")}
                      className="h-8 p-0 hover:bg-transparent"
                    >
                      Allocation
                      <SortIcon column="allocation" />
                    </Button>
                  </TableHead>
                  <TableHead>Strategies</TableHead>
                </>
              )}
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStocks.map((stock) => {
              const shares = stock.shares || 0;
              const price = parseFloat(stock.price || "0");
              const total = shares * price;
              const percentage = getPortfolioPercentage(stock);
              const difference = calculateDifference(stock);

              return (
                <TableRow
                  key={stock.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    (window.location.href = `/stock/${stock.id}/editor`)
                  }
                >
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(stock);
                      }}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5 transition-colors",
                          favoriteStates[stock.id]
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground hover:text-amber-500"
                        )}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <StockLogo
                        ticker={stock.ticker}
                        name={stock.name}
                        size={32}
                      />
                      <div>
                        <div className="font-medium">{stock.name}</div>
                        <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                          {stock.ticker}
                          {stock.entryCount !== undefined &&
                            stock.entryCount > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {stock.entryCount} entries
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {isWatchlist ? (
                    <>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(price)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {stock.priceTarget
                          ? formatCurrency(parseFloat(stock.priceTarget))
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {difference !== null ? (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-mono font-medium",
                              difference > 0
                                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                            )}
                          >
                            {difference > 0 ? "+" : ""}
                            {difference.toFixed(2)}%
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-right font-medium">
                        {shares.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(price)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(total)}
                      </TableCell>
                      <TableCell>
                        {percentage > 0 && (
                          <div className="flex items-center gap-2">
                            <DoughnutChart percentage={percentage} />
                            <Badge
                              variant="secondary"
                              className="font-mono font-medium"
                            >
                              {percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    {stock.strategies && stock.strategies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {stock.strategies.map((strategy) => {
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
                              <IconComponent className="h-3 w-3 mr-1" />
                              {strategy.name}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingStock(stock);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingStock(stock);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <StockDialog
        stock={editingStock || undefined}
        open={!!editingStock}
        onOpenChange={(open) => !open && setEditingStock(null)}
        onSuccess={onStockDeleted}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deletingStock}
        onOpenChange={(open) => !open && setDeletingStock(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingStock?.ticker}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingStock?.name} and all
              associated data including the investment thesis and canvas nodes.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingStock && handleDelete(deletingStock)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
