"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Plus,
  Edit,
  Trash2,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Coins,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CurrencyBlurToggle } from "@/components/currency-blur-toggle";

interface InvestmentStrategy {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const iconMap = {
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Coins,
  Circle: Shield, // Default fallback
};

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<InvestmentStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingStrategy, setEditingStrategy] =
    useState<InvestmentStrategy | null>(null);
  const [deletingStrategy, setDeletingStrategy] =
    useState<InvestmentStrategy | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    icon: "Shield",
  });

  const fetchStrategies = useCallback(async () => {
    try {
      const response = await fetch("/api/strategies");
      if (response.ok) {
        const data = await response.json();
        setStrategies(data);
      }
    } catch (error) {
      console.error("Error fetching strategies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/strategies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create strategy");
      }

      setFormData({
        name: "",
        description: "",
        color: "#3b82f6",
        icon: "Shield",
      });
      setShowCreateDialog(false);
      fetchStrategies();
    } catch (error) {
      console.error("Error creating strategy:", error);
      alert("Failed to create strategy. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStrategy) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/strategies/${editingStrategy.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update strategy");
      }

      setShowEditDialog(false);
      setEditingStrategy(null);
      fetchStrategies();
    } catch (error) {
      console.error("Error updating strategy:", error);
      alert("Failed to update strategy. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStrategy) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/strategies/${deletingStrategy.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete strategy");
      }

      setShowDeleteDialog(false);
      setDeletingStrategy(null);
      fetchStrategies();
    } catch (error) {
      console.error("Error deleting strategy:", error);
      alert("Failed to delete strategy. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (strategy: InvestmentStrategy) => {
    setEditingStrategy(strategy);
    setFormData({
      name: strategy.name,
      description: strategy.description,
      color: strategy.color,
      icon: strategy.icon,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (strategy: InvestmentStrategy) => {
    setDeletingStrategy(strategy);
    setShowDeleteDialog(true);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Shield;
    return IconComponent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-extralight uppercase font-mono">
                Investment Strategies
              </h1>
              <div className="flex items-center gap-3">
                <CurrencyBlurToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
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
              <h1 className="text-3xl font-extralight uppercase font-mono mb-2">
                Investment Strategies
              </h1>
              <p className="text-muted-foreground">
                Manage your investment strategies and their visual
                representation.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CurrencyBlurToggle />
              <ThemeToggle />
              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Strategy
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreate}>
                    <DialogHeader>
                      <DialogTitle>Create New Strategy</DialogTitle>
                      <DialogDescription>
                        Add a new investment strategy with custom styling.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Strategy Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Growth Focus"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Brief description of the strategy"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="color">Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="color"
                            type="color"
                            value={formData.color}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                color: e.target.value,
                              })
                            }
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={formData.color}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                color: e.target.value,
                              })
                            }
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="icon">Icon</Label>
                        <select
                          id="icon"
                          value={formData.icon}
                          onChange={(e) =>
                            setFormData({ ...formData, icon: e.target.value })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="Shield">Shield</option>
                          <option value="Zap">Zap</option>
                          <option value="TrendingUp">TrendingUp</option>
                          <option value="DollarSign">DollarSign</option>
                          <option value="Coins">Coins</option>
                        </select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Strategy"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {strategies.map((strategy) => {
            const IconComponent = getIconComponent(strategy.icon);
            return (
              <Card key={strategy.id} className="relative group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${strategy.color}20` }}
                      >
                        <IconComponent
                          className="h-5 w-5"
                          style={{ color: strategy.color }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {strategy.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: `${strategy.color}20`,
                            color: strategy.color,
                            borderColor: `${strategy.color}40`,
                          }}
                        >
                          {strategy.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(strategy)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openDeleteDialog(strategy)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {strategy.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {strategies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-semibold mb-2">No strategies yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first investment strategy to get started.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Strategy
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Strategy</DialogTitle>
              <DialogDescription>
                Update the strategy information and styling.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Strategy Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Growth Focus"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  placeholder="Brief description of the strategy"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">Icon</Label>
                <select
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Shield">Shield</option>
                  <option value="Zap">Zap</option>
                  <option value="TrendingUp">TrendingUp</option>
                  <option value="DollarSign">DollarSign</option>
                  <option value="Coins">Coins</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Strategy?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the "{deletingStrategy?.name}"
              strategy and remove it from all associated stocks. This action
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
    </div>
  );
}
