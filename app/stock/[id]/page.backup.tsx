"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Stock,
  getInvestmentTypeLabel,
  getInvestmentTypeColor,
} from "@/lib/stock-utils";
import { TiptapEditor } from "@/components/tiptap/editor";
import { StockLogo } from "@/components/stock-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default function StockPage() {
  const params = useParams();
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchStock() {
      try {
        const response = await fetch(`/api/stocks/${params.id}`);
        if (!response.ok) {
          setStock(null);
          return;
        }
        const data = await response.json();
        setStock(data);
        setContent(data.thesis || "");
      } catch (error) {
        console.error("Error fetching stock:", error);
        setStock(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStock();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Stock not found</h1>
          <Button onClick={() => router.push("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/stocks/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ thesis: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      alert("Investment thesis saved successfully!");
    } catch (error) {
      console.error("Error saving thesis:", error);
      alert("Failed to save investment thesis. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-5xl flex-1">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to stocks
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <StockLogo ticker={stock.ticker} name={stock.name} size={64} />
            <div>
              <h1 className="text-3xl font-bold">{stock.name}</h1>
              <p className="text-muted-foreground font-mono">{stock.ticker}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={getInvestmentTypeColor(stock.investmentType)}
          >
            {getInvestmentTypeLabel(stock.investmentType)}
          </Badge>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Investment Thesis</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Document your investment thesis, key metrics, and reasoning for this
            position.
          </p>
        </div>

        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Write your investment thesis here..."
        />

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
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
