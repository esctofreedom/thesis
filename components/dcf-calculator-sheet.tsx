"use client";

import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DCFCalculator } from "@/components/dcf-calculator";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface DCFCalculatorSheetProps {
  trigger?: ReactNode;
}

export function DCFCalculatorSheet({ trigger }: DCFCalculatorSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Calculator />
            DCF Calculator
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>DCF Calculator</SheetTitle>
          <SheetDescription>
            Calculate fair value using Discounted Cash Flow analysis. Choose
            your metric, input assumptions, and see real-time valuations.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <DCFCalculator />
        </div>
      </SheetContent>
    </Sheet>
  );
}

