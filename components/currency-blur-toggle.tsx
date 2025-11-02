"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useCurrencyBlur } from "@/lib/stores/currency-blur-store";

import { Button } from "@/components/ui/button";

export function CurrencyBlurToggle() {
  const { isBlurred, toggleBlur } = useCurrencyBlur();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Eye className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleBlur}
      className="h-9 w-9"
      title={isBlurred ? "Show currency values" : "Hide currency values"}
    >
      <Eye className="h-4 w-4 rotate-0 scale-100 transition-all data-[blurred=true]:rotate-90 data-[blurred=true]:scale-0" data-blurred={isBlurred} />
      <EyeOff className="absolute h-4 w-4 rotate-90 scale-0 transition-all data-[blurred=true]:rotate-0 data-[blurred=true]:scale-100" data-blurred={isBlurred} />
      <span className="sr-only">Toggle currency visibility</span>
    </Button>
  );
}

