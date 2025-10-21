"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Stock } from "@/lib/stock-utils";
import { CanvasToolbar } from "@/components/canvas-toolbar";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TextNode from "@/components/canvas-nodes/text-node";
import ChartNode from "@/components/canvas-nodes/chart-node";
import ImageNode from "@/components/canvas-nodes/image-node";
import CentralThesisNode from "@/components/canvas-nodes/central-thesis-node";
import { StockDialog } from "@/components/stock-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CanvasNode {
  id: string;
  stockId: string;
  type: string;
  position: string;
  data: string;
}

export default function StockCanvasPage() {
  const params = useParams();
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      "central-thesis": CentralThesisNode,
      text: TextNode,
      chart: ChartNode,
      image: ImageNode,
    }),
    []
  );

  // Load stock and canvas nodes
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stock
        const stockResponse = await fetch(`/api/stocks/${params.id}`);
        if (!stockResponse.ok) {
          setStock(null);
          setLoading(false);
          return;
        }
        const stockData = await stockResponse.json();
        setStock(stockData);

        // Fetch journal entries to get the latest content
        const journalResponse = await fetch(`/api/stocks/${params.id}/journal`);
        let latestContent = "";
        if (journalResponse.ok) {
          const journalEntries = await journalResponse.json();
          if (journalEntries.length > 0) {
            // Get the latest entry (last in array since they're sorted ASC)
            latestContent = journalEntries[journalEntries.length - 1].content;
          }
        }

        // Fetch canvas nodes
        const nodesResponse = await fetch(`/api/stocks/${params.id}/nodes`);
        let canvasNodes: CanvasNode[] = [];
        if (nodesResponse.ok) {
          canvasNodes = await nodesResponse.json();
        }

        // Check if central thesis node exists
        const hasCentralNode = canvasNodes.some(
          (node) => node.type === "central-thesis"
        );

        // Create central thesis node if it doesn't exist
        if (!hasCentralNode) {
          const centralNodeData = {
            content: latestContent,
          };

          const createResponse = await fetch(`/api/stocks/${params.id}/nodes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "central-thesis",
              position: { x: 0, y: 0 },
              data: centralNodeData,
            }),
          });

          if (createResponse.ok) {
            const newNode = await createResponse.json();
            canvasNodes.unshift(newNode);
          }
        } else {
          // Update existing central thesis node with latest content
          const centralNode = canvasNodes.find(
            (node) => node.type === "central-thesis"
          );
          if (centralNode && latestContent) {
            const nodeData = JSON.parse(centralNode.data);
            if (nodeData.content !== latestContent) {
              await fetch(`/api/stocks/${params.id}/nodes`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: centralNode.id,
                  data: { content: latestContent },
                }),
              });
              // Update local data
              centralNode.data = JSON.stringify({ content: latestContent });
            }
          }
        }

        // Convert canvas nodes to flow nodes
        const flowNodes = canvasNodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: JSON.parse(node.position),
          data: {
            ...JSON.parse(node.data),
            onUpdate: handleNodeDataUpdate,
            onDelete:
              node.type === "central-thesis" ? undefined : handleNodeDelete,
          },
          draggable: node.type !== "central-thesis",
        }));
        setNodes(flowNodes);
      } catch (error) {
        console.error("Error fetching data:", error);
        setStock(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  // Save node position when it changes
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);

      // Save position updates to database
      changes.forEach((change: any) => {
        if (change.type === "position" && change.dragging === false) {
          const node = nodes.find((n) => n.id === change.id);
          if (node && change.position) {
            saveNodePosition(change.id, change.position);
          }
        }
      });
    },
    [onNodesChange, nodes]
  );

  const saveNodePosition = async (
    id: string,
    position: { x: number; y: number }
  ) => {
    try {
      await fetch(`/api/stocks/${params.id}/nodes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, position }),
      });
    } catch (error) {
      console.error("Error saving node position:", error);
    }
  };

  const handleNodeDataUpdate = useCallback(
    async (nodeId: string, newData: any) => {
      // Update local state immediately
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...newData },
            };
          }
          return node;
        })
      );

      // Check if this is the central thesis node
      const node = nodes.find((n) => n.id === nodeId);
      const isCentralThesis = node?.type === "central-thesis";

      // Save to database (debouncing happens in the Tiptap editor's onBlur)
      try {
        await fetch(`/api/stocks/${params.id}/nodes`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: nodeId, data: newData }),
        });

        // If central thesis, also update/create today's journal entry
        if (isCentralThesis && newData.content !== undefined) {
          const today = new Date().toISOString().split("T")[0];

          // Fetch existing entries to check if today's entry exists
          const journalResponse = await fetch(
            `/api/stocks/${params.id}/journal`
          );
          if (journalResponse.ok) {
            const entries = await journalResponse.json();
            const todayEntry = entries.find((e: any) => e.date === today);

            if (todayEntry) {
              // Update today's entry
              await fetch(`/api/stocks/${params.id}/journal/${todayEntry.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newData.content }),
              });
            } else {
              // Create new entry for today
              await fetch(`/api/stocks/${params.id}/journal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: today, content: newData.content }),
              });
            }
          }
        }
      } catch (error) {
        console.error("Error updating node data:", error);
      }
    },
    [params.id, setNodes, nodes]
  );

  const handleNodeDelete = useCallback(
    async (nodeId: string) => {
      // Remove from local state
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));

      // Delete from database
      try {
        await fetch(`/api/stocks/${params.id}/nodes?id=${nodeId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting node:", error);
      }
    },
    [params.id, setNodes]
  );

  const addNode = useCallback(
    async (type: "text" | "chart" | "image") => {
      const newNodeId = `node_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const position = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      };

      let nodeData: any = {
        onUpdate: handleNodeDataUpdate,
        onDelete: handleNodeDelete,
      };

      if (type === "text") {
        nodeData.content = "";
      } else if (type === "chart") {
        nodeData.chartType = "line";
        nodeData.title = "Sample Chart";
        nodeData.data = [
          { name: "Jan", value: 400 },
          { name: "Feb", value: 300 },
          { name: "Mar", value: 600 },
          { name: "Apr", value: 800 },
          { name: "May", value: 500 },
          { name: "Jun", value: 700 },
        ];
      } else if (type === "image") {
        nodeData.imageUrl = "";
        nodeData.alt = "";
      }

      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => [...nds, newNode]);

      // Save to database
      try {
        await fetch(`/api/stocks/${params.id}/nodes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            position,
            data: nodeData,
          }),
        });
      } catch (error) {
        console.error("Error creating node:", error);
      }
    },
    [params.id, setNodes, handleNodeDataUpdate, handleNodeDelete]
  );

  const handleStockUpdated = useCallback(async () => {
    // Refresh stock data
    try {
      const stockResponse = await fetch(`/api/stocks/${params.id}`);
      if (stockResponse.ok) {
        const stockData = await stockResponse.json();
        setStock(stockData);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!stock) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/stocks?id=${stock.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete stock");
      }

      setShowDeleteDialog(false);
      router.push("/");
    } catch (error) {
      console.error("Error deleting stock:", error);
      alert("Failed to delete stock. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Stock not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background">
      <CanvasToolbar
        stock={stock}
        onBack={() => router.push("/")}
        onAddTextNode={() => addNode("text")}
        onAddChartNode={() => addNode("chart")}
        onAddImageNode={() => addNode("image")}
        onEdit={() => setShowEditDialog(true)}
        onDelete={() => setShowDeleteDialog(true)}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        panOnScroll={true}
        panOnDrag={[1, 2]}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
      >
        <Background color="hsl(var(--muted-foreground))" gap={16} />
        <Controls />
        <MiniMap
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>

      {/* Edit Dialog */}
      <StockDialog
        stock={stock}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleStockUpdated}
      />

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {stock.ticker}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {stock.name} and all associated data
              including the investment thesis and canvas nodes. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
