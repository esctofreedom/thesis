"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import { Stock, Strategy } from "@/lib/stock-utils";
import { Badge } from "@/components/ui/badge";

interface StockDialogProps {
  stock?: Stock; // If provided, dialog is in edit mode
  open?: boolean; // Optional external control of open state
  onOpenChange?: (open: boolean) => void; // Optional external control
  onSuccess: () => void; // Called after successful add/update
  trigger?: React.ReactNode; // Optional custom trigger
}

const initialFormData = {
  ticker: "",
  name: "",
  shares: "0",
  price: "0",
  isWatchlist: false,
  priceTarget: "",
  strategyIds: [] as string[],
};

export function StockDialog({
  stock,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  onSuccess,
  trigger,
}: StockDialogProps) {
  const isEditMode = !!stock;
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(true);

  // Use external open state if provided, otherwise use internal
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  // Fetch available strategies
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const response = await fetch("/api/strategies");
        if (response.ok) {
          const data = await response.json();
          setStrategies(data.filter((s: Strategy) => s.isActive));
        }
      } catch (error) {
        console.error("Error fetching strategies:", error);
      } finally {
        setLoadingStrategies(false);
      }
    };
    fetchStrategies();
  }, []);

  // Initialize form data when stock changes (edit mode) or reset for add mode
  useEffect(() => {
    if (stock) {
      setFormData({
        ticker: stock.ticker,
        name: stock.name,
        shares: stock.shares?.toString() || "0",
        price: stock.price || "0",
        isWatchlist: stock.isWatchlist || false,
        priceTarget: stock.priceTarget || "",
        strategyIds: stock.strategies?.map((s) => s.id) || [],
      });
    } else {
      setFormData(initialFormData);
    }
  }, [stock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditMode ? `/api/stocks/${stock.id}` : "/api/stocks";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: formData.ticker,
          name: formData.name,
          shares: parseInt(formData.shares) || 0,
          price: formData.price,
          isWatchlist: formData.isWatchlist,
          priceTarget: formData.priceTarget,
          strategyIds: formData.strategyIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? "update" : "create"} stock`);
      }

      // Reset form in add mode
      if (!isEditMode) {
        setFormData(initialFormData);
      }

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} stock:`,
        error
      );
      alert(
        `Failed to ${isEditMode ? "update" : "create"} stock. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Stock" : "Add New Stock"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update stock information and position details."
              : "Add a new stock to track your investment thesis."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ticker">Ticker Symbol *</Label>
            <Input
              id="ticker"
              placeholder="AAPL"
              value={formData.ticker}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ticker: e.target.value.toUpperCase(),
                })
              }
              required
              className="uppercase"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              placeholder="Apple Inc."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Investment Strategies</Label>
            {loadingStrategies ? (
              <div className="text-sm text-muted-foreground">
                Loading strategies...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {strategies.map((strategy) => {
                  const isSelected = formData.strategyIds.includes(strategy.id);
                  return (
                    <Badge
                      key={strategy.id}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: isSelected
                          ? strategy.color
                          : "transparent",
                        borderColor: strategy.color,
                        color: isSelected ? "white" : strategy.color,
                      }}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          strategyIds: isSelected
                            ? prev.strategyIds.filter(
                                (id) => id !== strategy.id
                              )
                            : [...prev.strategyIds, strategy.id],
                        }));
                      }}
                    >
                      {strategy.name}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            )}
            {formData.strategyIds.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Select one or more investment strategies for this stock
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="isWatchlist"
                checked={formData.isWatchlist}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isWatchlist: checked })
                }
              />
              <Label htmlFor="isWatchlist">Watchlist Stock</Label>
            </div>
          </div>
          {!formData.isWatchlist && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="shares">Number of Shares</Label>
                <Input
                  id="shares"
                  type="number"
                  placeholder="0"
                  value={formData.shares}
                  onChange={(e) =>
                    setFormData({ ...formData, shares: e.target.value })
                  }
                  min="0"
                  step="1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price per Share ($)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </>
          )}
          {formData.isWatchlist && (
            <div className="grid gap-2">
              <Label htmlFor="priceTarget">Price Target ($)</Label>
              <Input
                id="priceTarget"
                type="number"
                placeholder="0.00"
                value={formData.priceTarget}
                onChange={(e) =>
                  setFormData({ ...formData, priceTarget: e.target.value })
                }
                min="0"
                step="0.01"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? isEditMode
                ? "Saving..."
                : "Adding..."
              : isEditMode
              ? "Save Changes"
              : "Add Stock"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  // If no trigger provided and no external control, use default "Add Stock" button
  // This maintains backward compatibility with the add dialog
  if (!trigger && externalOpen === undefined) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Stock
          </Button>
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    );
  }

  // If external control is provided (edit mode), don't render a trigger
  if (externalOpen !== undefined) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  // If custom trigger is provided
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
