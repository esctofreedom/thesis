"use client";

import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, BarChart3 } from "lucide-react";

interface ChartNodeData {
  chartType: "line" | "bar";
  data: Array<{ name: string; value: number }>;
  title: string;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

const defaultData = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

const ChartNode = ({ id, data }: NodeProps<ChartNodeData>) => {
  const chartData = data.data || defaultData;
  const chartType = data.chartType || "line";
  const title = data.title || "Sample Chart";

  const handleDelete = useCallback(() => {
    data.onDelete(id);
  }, [data, id]);

  const toggleChartType = useCallback(() => {
    const newType = chartType === "line" ? "bar" : "line";
    data.onUpdate(id, { ...data, chartType: newType });
  }, [data, id, chartType]);

  return (
    <div className="bg-card border-2 border-border rounded-lg shadow-lg w-[400px] relative">
      <div className="absolute -top-3 -right-3 z-10 flex gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-6 w-6 rounded-full"
          onClick={toggleChartType}
        >
          {chartType === "line" ? (
            <BarChart3 className="h-3 w-3" />
          ) : (
            <TrendingUp className="h-3 w-3" />
          )}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-6 w-6 rounded-full"
          onClick={handleDelete}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3">{title}</h3>
        <ResponsiveContainer width="100%" height={200}>
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(ChartNode);
