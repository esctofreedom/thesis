"use client";

import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Metric = "fcf" | "operating-income" | "dividend" | "ebitda";

interface MetricConfig {
  label: string;
  shortLabel: string;
}

const METRICS: Record<Metric, MetricConfig> = {
  fcf: { label: "Free Cash Flow", shortLabel: "FCF" },
  "operating-income": { label: "Operating Income", shortLabel: "Op. Income" },
  dividend: { label: "Dividend", shortLabel: "Dividend" },
  ebitda: { label: "EBITDA", shortLabel: "EBITDA" },
};

export function DCFCalculator() {
  const [metric, setMetric] = useState<Metric>("fcf");
  const [years, setYears] = useState("5");
  const [currentValue, setCurrentValue] = useState("1000");
  const [shareGrowthRate, setShareGrowthRate] = useState("0");
  const [metricGrowthRate, setMetricGrowthRate] = useState("10");
  const [terminalMultiple, setTerminalMultiple] = useState("15");
  const [discountRate, setDiscountRate] = useState("10");
  const [currentPrice, setCurrentPrice] = useState("230");
  const [currentMultiple, setCurrentMultiple] = useState("25");

  const metricConfig = METRICS[metric];

  const results = useMemo(() => {
    const numYears = parseInt(years) || 0;
    const curVal = parseFloat(currentValue) || 0;
    const shareGrowth = parseFloat(shareGrowthRate) / 100 || 0;
    const metricGrowth = parseFloat(metricGrowthRate) / 100 || 0;
    const termMult = parseFloat(terminalMultiple) || 0;
    const discount = parseFloat(discountRate) / 100 || 0;
    const price = parseFloat(currentPrice) || 0;
    const currMult = parseFloat(currentMultiple) || 0;

    if (
      numYears <= 0 ||
      curVal === 0 ||
      termMult === 0 ||
      discount === 0 ||
      price === 0 ||
      currMult === 0
    ) {
      return null;
    }

    // Calculate projected values
    const projections = [];
    let metricValue = curVal;
    let shareCount = 100; // Base share count (relative)

    for (let year = 1; year <= numYears; year++) {
      metricValue = metricValue * (1 + metricGrowth);
      shareCount = shareCount * (1 + shareGrowth);
      const perShare = metricValue / shareCount;
      const presentValue = metricValue / Math.pow(1 + discount, year);

      projections.push({
        year,
        metricValue,
        shareCount,
        perShare,
        presentValue,
      });
    }

    // Terminal value
    const finalMetricValue = projections[projections.length - 1].metricValue;
    const terminalValue = finalMetricValue * termMult;
    const terminalPV = terminalValue / Math.pow(1 + discount, numYears);

    // Sum of present values
    const sumPV = projections.reduce((sum, p) => sum + p.presentValue, 0);
    const totalPV = sumPV + terminalPV;

    // Fair value per share
    const finalShareCount = projections[projections.length - 1].shareCount;
    const fairValuePerShare = totalPV / finalShareCount;

    // Current implied value
    const currentImpliedValue = curVal / (100 * (currMult / termMult));

    // CAGR calculation
    const years_to_target = numYears;
    const cagr =
      years_to_target > 0
        ? (Math.pow(fairValuePerShare / price, 1 / years_to_target) - 1) * 100
        : 0;

    // Upside/downside
    const upside = ((fairValuePerShare - price) / price) * 100;

    return {
      projections,
      terminalValue,
      terminalPV,
      totalPV,
      fairValuePerShare,
      cagr,
      upside,
      finalShareCount,
    };
  }, [
    years,
    currentValue,
    shareGrowthRate,
    metricGrowthRate,
    terminalMultiple,
    discountRate,
    currentPrice,
    currentMultiple,
  ]);

  return (
    <div className="space-y-6">
      {/* Inputs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metric Selector */}
          <div className="space-y-2">
            <Label>Metric</Label>
            <Select
              value={metric}
              onValueChange={(value) => setMetric(value as Metric)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fcf">Free Cash Flow</SelectItem>
                <SelectItem value="operating-income">
                  Operating Income
                </SelectItem>
                <SelectItem value="dividend">Dividend</SelectItem>
                <SelectItem value="ebitda">EBITDA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            {/* Number of Years */}
            <div className="space-y-2">
              <Label htmlFor="years">Projection Years</Label>
              <Input
                id="years"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                min="1"
                max="20"
              />
            </div>

            {/* Current Value */}
            <div className="space-y-2">
              <Label htmlFor="currentValue">
                Current {metricConfig.label} ($M)
              </Label>
              <Input
                id="currentValue"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                step="0.01"
              />
            </div>

            {/* Share Growth Rate */}
            <div className="space-y-2">
              <Label htmlFor="shareGrowth">
                Share Growth Rate (%)
                <span className="text-xs text-muted-foreground block">
                  Dilution (positive) or Buybacks (negative)
                </span>
              </Label>
              <Input
                id="shareGrowth"
                type="number"
                value={shareGrowthRate}
                onChange={(e) => setShareGrowthRate(e.target.value)}
                step="0.1"
              />
            </div>

            {/* Metric Growth Rate */}
            <div className="space-y-2">
              <Label htmlFor="metricGrowth">
                {metricConfig.label} Growth Rate (%)
              </Label>
              <Input
                id="metricGrowth"
                type="number"
                value={metricGrowthRate}
                onChange={(e) => setMetricGrowthRate(e.target.value)}
                step="0.1"
              />
            </div>

            {/* Terminal Multiple */}
            <div className="space-y-2">
              <Label htmlFor="terminalMultiple">
                Terminal {metricConfig.shortLabel} Multiple
              </Label>
              <Input
                id="terminalMultiple"
                type="number"
                value={terminalMultiple}
                onChange={(e) => setTerminalMultiple(e.target.value)}
                step="0.1"
              />
            </div>

            {/* Discount Rate */}
            <div className="space-y-2">
              <Label htmlFor="discountRate">Discount Rate (WACC %)</Label>
              <Input
                id="discountRate"
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                step="0.1"
              />
            </div>

            {/* Current Stock Price */}
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Stock Price ($)</Label>
              <Input
                id="currentPrice"
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                step="0.01"
              />
            </div>

            {/* Current Multiple */}
            <div className="space-y-2">
              <Label htmlFor="currentMultiple">
                Current {metricConfig.shortLabel} Multiple
              </Label>
              <Input
                id="currentMultiple"
                type="number"
                value={currentMultiple}
                onChange={(e) => setCurrentMultiple(e.target.value)}
                step="0.1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Fair Value Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fair Value</p>
                  <p className="text-2xl font-bold">
                    ${results.fairValuePerShare.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Current Price
                  </p>
                  <p className="text-2xl font-bold">${currentPrice}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Expected CAGR</p>
                  <p className="text-2xl font-bold">
                    {results.cagr.toFixed(2)}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Upside/Downside
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      results.upside >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {results.upside >= 0 ? "+" : ""}
                    {results.upside.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
                  <div>Year</div>
                  <div className="text-right">
                    {metricConfig.shortLabel} ($M)
                  </div>
                  <div className="text-right">Shares (Rel.)</div>
                  <div className="text-right">Per Share ($)</div>
                  <div className="text-right">PV ($M)</div>
                </div>
                {results.projections.map((proj) => (
                  <div
                    key={proj.year}
                    className="grid grid-cols-5 gap-2 text-sm"
                  >
                    <div>{proj.year}</div>
                    <div className="text-right">
                      {proj.metricValue.toFixed(2)}
                    </div>
                    <div className="text-right">{proj.shareCount.toFixed(2)}</div>
                    <div className="text-right">{proj.perShare.toFixed(2)}</div>
                    <div className="text-right">
                      {proj.presentValue.toFixed(2)}
                    </div>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="grid grid-cols-5 gap-2 text-sm font-medium">
                  <div className="col-span-3">Terminal Value</div>
                  <div className="text-right">
                    {results.terminalValue.toFixed(2)}
                  </div>
                  <div className="text-right">{results.terminalPV.toFixed(2)}</div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-sm font-bold">
                  <div className="col-span-4">Total Present Value ($M)</div>
                  <div className="text-right">{results.totalPV.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!results && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Enter valid inputs to see calculations
          </CardContent>
        </Card>
      )}
    </div>
  );
}

