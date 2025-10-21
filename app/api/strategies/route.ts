import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { investmentStrategies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const strategies = await db
      .select()
      .from(investmentStrategies)
      .orderBy(investmentStrategies.name);

    return NextResponse.json(strategies);
  } catch (error) {
    console.error("Error fetching strategies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Strategy name is required" },
        { status: 400 }
      );
    }

    const strategyId = `strategy_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const strategy = await db
      .insert(investmentStrategies)
      .values({
        id: strategyId,
        name,
        description: description || "",
        color: color || "#3b82f6",
        icon: icon || "Shield",
        isActive: true,
      })
      .returning();

    return NextResponse.json(strategy[0], { status: 201 });
  } catch (error) {
    console.error("Error creating strategy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
