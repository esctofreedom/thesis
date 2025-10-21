"use client";

import Link from "next/link";
import { useState } from "react";
import { Stock } from "@/lib/stock-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { StockLogo } from "@/components/stock-logo";
import { StockDialog } from "@/components/stock-dialog";
import {
  MoreVertical,
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Coins,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StockCardProps {
  stock: Stock;
  viewMode?: "canvas" | "editor";
  onDelete?: () => void;
  portfolioTotal?: number;
}

export function StockCard({
  stock,
  viewMode = "canvas",
  onDelete,
  portfolioTotal = 0,
}: StockCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(stock.isFavorite || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const href =
    viewMode === "editor" ? `/stock/${stock.id}/editor` : `/stock/${stock.id}`;

  // Calculate total value
  const shares = stock.shares || 0;
  const price = parseFloat(stock.price || "0");
  const total = shares * price;
  const isWatchlist = stock.isWatchlist || false;
  const priceTarget = stock.priceTarget;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stocks?id=${stock.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete stock");
      }

      setShowDeleteDialog(false);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting stock:", error);
      alert("Failed to delete stock. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

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
      setIsFavorite(!newFavoriteState);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Calculate portfolio percentage for this stock
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
    <>
      <div className="relative group">
        <Link href={href} className="block">
          <Card
            className={cn(
              "hover:shadow-lg transition-shadow cursor-pointer h-ful rounded-md hover:border-primary",
              isWatchlist ? "border-dashed border-primary/20" : "border"
            )}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <StockLogo ticker={stock.ticker} name={stock.name} size={38} />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg leading-tight truncate relative">
                    {stock.name}
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    {stock.ticker}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isWatchlist && (
                    <div className="flex items-center gap-1 text-muted-foreground bg-amber-500/10 rounded-md p-1">
                      <Eye className="h-4 w-4 text-amber-500" />
                    </div>
                  )}

                  <div className="absolute right-0 top-0 p-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={handleFavoriteToggle}
                      disabled={isTogglingFavorite}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5 transition-colors",
                          isFavorite
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground hover:text-amber-500 hover:fill-amber-500"
                        )}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stock.strategies && stock.strategies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
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
                      iconMap[strategy.icon as keyof typeof iconMap] || Shield;
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
              <div className="text-sm space-y-1 min-h-[76px]">
                {isWatchlist ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-muted-foreground text-xs mb-1">
                        Target
                      </div>
                      <div className="font-semibold text-lg">
                        {priceTarget
                          ? formatCurrency(parseFloat(priceTarget))
                          : "—"}
                      </div>
                    </div>
                  </div>
                ) : shares > 0 || price > 0 ? (
                  <>
                    {portfolioPercentage > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Allocation:</span>
                        <div className="flex items-center gap-2">
                          <DoughnutChart percentage={portfolioPercentage} />
                          <span className="font-medium">
                            {portfolioPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shares:</span>
                      <span className="font-medium">
                        {shares.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Price:</span>
                      <span className="font-medium">
                        {formatCurrency(price)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground/50 text-xs">
                    No position data
                  </div>
                )}
              </div>
            </CardContent>

            {/* Footer with minimal icons */}
            <CardFooter className="p-0 px-4 pt-0 pb-0">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  {stock.entryCount !== undefined && stock.entryCount > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">
                        {stock.entryCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowEditDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardFooter>
          </Card>
        </Link>
      </div>

      <StockDialog
        stock={stock}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={onDelete || (() => {})}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {stock.ticker}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {stock.name} and all associated data
              including the investment thesis and canvas nodes. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
