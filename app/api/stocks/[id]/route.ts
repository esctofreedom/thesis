import { NextRequest, NextResponse } from "next/server";
import { getStockById, updateStock } from "@/lib/stocks";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stock = await getStockById(params.id);

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json(stock);
  } catch (error) {
    console.error("Error fetching stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Build update object with only provided fields
    const updates: Record<string, any> = {};
    if (body.thesis !== undefined) updates.thesis = body.thesis;
    if (body.ticker !== undefined) updates.ticker = body.ticker.toUpperCase();
    if (body.name !== undefined) updates.name = body.name;
    if (body.investmentType !== undefined)
      updates.investmentType = body.investmentType;
    if (body.shares !== undefined) updates.shares = body.shares;
    if (body.price !== undefined) updates.price = body.price;
    if (body.isWatchlist !== undefined) updates.isWatchlist = body.isWatchlist;
    if (body.isFavorite !== undefined) updates.isFavorite = body.isFavorite;
    if (body.priceTarget !== undefined) updates.priceTarget = body.priceTarget;
    if (body.strategyIds !== undefined) updates.strategyIds = body.strategyIds;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    await updateStock(params.id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
