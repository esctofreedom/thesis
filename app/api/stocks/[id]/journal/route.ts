import { NextRequest, NextResponse } from "next/server";
import { getJournalEntries, createJournalEntry } from "@/lib/stocks";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entries = await getJournalEntries(params.id);
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { date, content } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const entryId = `entry_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const entry = await createJournalEntry({
      id: entryId,
      stockId: params.id,
      date,
      content: content || "",
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
