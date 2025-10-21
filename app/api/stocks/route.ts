import { NextRequest, NextResponse } from "next/server";
import {
  getAllStocksWithEntryCounts,
  createStock,
  deleteStock,
} from "@/lib/stocks";

export async function GET() {
  try {
    const stocks = await getAllStocksWithEntryCounts();
    return NextResponse.json(stocks);
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ticker,
      name,
      investmentType,
      shares,
      price,
      isWatchlist,
      priceTarget,
      strategyIds,
    } = body;

    if (!ticker || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const stock = await createStock({
      ticker: ticker.toUpperCase(),
      name,
      investmentType: investmentType || "core", // Default to 'core' if not provided
      shares: shares || 0,
      price: price || "0",
      isWatchlist: isWatchlist || false,
      priceTarget: priceTarget || null,
      strategyIds: strategyIds || [],
    });

    return NextResponse.json(stock, { status: 201 });
  } catch (error) {
    console.error("Error creating stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Stock ID is required" },
        { status: 400 }
      );
    }

    await deleteStock(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
