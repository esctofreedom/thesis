"use client";

import { Button } from "@/components/ui/button";
import { StockLogo } from "@/components/stock-logo";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  BarChart3,
  Image,
  Plus,
  Shield,
  Zap,
  TrendingUp,
  DollarSign,
  Coins,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Stock } from "@/lib/stock-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CanvasToolbarProps {
  stock: Stock;
  onBack: () => void;
  onAddTextNode: () => void;
  onAddChartNode: () => void;
  onAddImageNode: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CanvasToolbar({
  stock,
  onBack,
  onAddTextNode,
  onAddChartNode,
  onAddImageNode,
  onEdit,
  onDelete,
}: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-card/95 backdrop-blur-sm border rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2">
          <StockLogo ticker={stock.ticker} name={stock.name} size={32} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{stock.name}</span>
              <span className="text-xs text-muted-foreground font-mono">
                {stock.ticker}
              </span>
            </div>
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
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAddTextNode}>
              <FileText className="h-4 w-4 mr-2" />
              Sticky Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddChartNode}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Chart
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAddImageNode}>
              <Image className="h-4 w-4 mr-2" />
              Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
  );
}
