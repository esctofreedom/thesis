import { NextRequest, NextResponse } from "next/server";
import {
  getCanvasNodes,
  createCanvasNode,
  updateCanvasNode,
  deleteCanvasNode,
} from "@/lib/stocks";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const nodes = await getCanvasNodes(params.id);
    return NextResponse.json(nodes);
  } catch (error) {
    console.error("Error fetching canvas nodes:", error);
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
    const { type, position, data } = body;

    if (!type || !position || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique ID
    const nodeId = `node_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const node = await createCanvasNode({
      id: nodeId,
      stockId: params.id,
      type,
      position: JSON.stringify(position),
      data: JSON.stringify(data),
    });

    return NextResponse.json(node);
  } catch (error) {
    console.error("Error creating canvas node:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, position, data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Node ID is required" },
        { status: 400 }
      );
    }

    const updates: { position?: string; data?: string } = {};
    if (position !== undefined) {
      updates.position = JSON.stringify(position);
    }
    if (data !== undefined) {
      updates.data = JSON.stringify(data);
    }

    await updateCanvasNode(id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating canvas node:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get("id");

    if (!nodeId) {
      return NextResponse.json(
        { error: "Node ID is required" },
        { status: 400 }
      );
    }

    await deleteCanvasNode(nodeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting canvas node:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
