"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Stock } from "@/lib/stock-utils";
import { TiptapEditor } from "@/components/tiptap/editor";
import { EditorToolbar } from "@/components/editor-toolbar";
import { StockLogo } from "@/components/stock-logo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
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

interface JournalEntry {
  id: string;
  stockId: string;
  date: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function StockEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const saveTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

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

        // Fetch journal entries
        const entriesResponse = await fetch(`/api/stocks/${params.id}/journal`);
        if (entriesResponse.ok) {
          const entriesData = await entriesResponse.json();
          setEntries(entriesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setStock(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const handleContentChange = useCallback(
    (entryId: string, newContent: string) => {
      // Update local state immediately
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, content: newContent } : entry
        )
      );

      // Clear existing timeout for this entry
      const timeouts = saveTimeoutsRef.current;
      const existingTimeout = timeouts.get(entryId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set unsaved status
      setSaveStatus("unsaved");

      // Set new timeout to auto-save after 2 seconds
      const newTimeout = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          const response = await fetch(
            `/api/stocks/${params.id}/journal/${entryId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ content: newContent }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to save");
          }

          setSaveStatus("saved");
        } catch (error) {
          console.error("Error auto-saving entry:", error);
          setSaveStatus("unsaved");
        }
      }, 2000);

      timeouts.set(entryId, newTimeout);
    },
    [params.id]
  );

  const handleNewEntry = useCallback(async () => {
    if (!stock) return;

    const today = new Date().toISOString().split("T")[0];

    // Check if entry for today already exists
    const existingEntry = entries.find((entry) => entry.date === today);
    if (existingEntry) {
      // Expand and scroll to existing entry
      setExpandedEntryId(existingEntry.id);
      const element = document.getElementById(`entry-${existingEntry.id}`);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    try {
      const response = await fetch(`/api/stocks/${params.id}/journal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: today, content: "" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create entry");
      }

      const newEntry = await response.json();
      setEntries((prev) => [...prev, newEntry]);

      // Expand and scroll to new entry after a brief delay
      setTimeout(() => {
        setExpandedEntryId(newEntry.id);
        const element = document.getElementById(`entry-${newEntry.id}`);
        element?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error) {
      console.error("Error creating entry:", error);
    }
  }, [stock, entries, params.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleEntryClick = (entryId: string) => {
    if (expandedEntryId === entryId) {
      setExpandedEntryId(null);
    } else {
      setExpandedEntryId(entryId);
      // Scroll to entry
      setTimeout(() => {
        const element = document.getElementById(`entry-${entryId}`);
        element?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

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
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Skeleton header */}
        <div className="sticky top-0 left-0 right-0 z-10 bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-20" />
                <div className="h-6 w-px bg-border" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Main skeleton content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Date navigation skeleton */}
            <div className="w-48 flex-shrink-0">
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>

            {/* Content skeleton */}
            <div className="flex-1 space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-6 w-64 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Stock not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Blurred logo background */}
      <div
        className="fixed bottom-0 right-0 -translate-x-1/12 -translate-y-1/12 pointer-events-none  z-0"
        style={{
          filter: "blur(200px)",
          opacity: 0.2,
        }}
      >
        <StockLogo ticker={stock.ticker} name={stock.name} size={600} />
      </div>

      <div className="relative z-10">
        <EditorToolbar
          stock={stock}
          onBack={() => router.push("/")}
          saveStatus={saveStatus}
          entryCount={entries.length}
          onNewEntry={handleNewEntry}
          onEdit={() => setShowEditDialog(true)}
          onDelete={() => setShowDeleteDialog(true)}
          onFavoriteToggle={async () => {
            if (!stock) return;
            const newFavoriteState = !stock.isFavorite;
            try {
              const response = await fetch(`/api/stocks/${stock.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isFavorite: newFavoriteState }),
              });
              if (response.ok) {
                handleStockUpdated();
              }
            } catch (error) {
              console.error("Error toggling favorite:", error);
            }
          }}
          isFavorite={stock.isFavorite || false}
          portfolioTotal={0} // You might want to calculate this from all stocks
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="rounded-full bg-muted/50 p-6 mb-6">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                No journal entries yet
              </h3>
              <p className="text-muted-foreground mb-8 text-center max-w-md">
                Start documenting your investment thesis and track your thoughts
                over time.
              </p>
              <Button onClick={handleNewEntry} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create First Entry
              </Button>
            </div>
          ) : (
            <div className="flex gap-8">
              {/* Sticky date navigation */}
              <div className="w-48 flex-shrink-0">
                <div className="sticky top-24">
                  <nav className="space-y-1">
                    {entries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => handleEntryClick(entry.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          expandedEntryId === entry.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {formatShortDate(entry.date)}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1 space-y-8">
                {entries.map((entry) => {
                  const isExpanded = expandedEntryId === entry.id;
                  return (
                    <div
                      key={entry.id}
                      id={`entry-${entry.id}`}
                      className="scroll-mt-24"
                    >
                      <button
                        onClick={() => handleEntryClick(entry.id)}
                        className="w-full text-left group"
                      >
                        <h3 className="text-lg font-semibold mb-4 text-foreground/80 group-hover:text-foreground transition-colors">
                          {formatDate(entry.date)}
                        </h3>
                      </button>

                      {isExpanded ? (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <TiptapEditor
                            content={entry.content}
                            onChange={(newContent) =>
                              handleContentChange(entry.id, newContent)
                            }
                            placeholder="Write your thoughts for this day..."
                          />
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEntryClick(entry.id)}
                            >
                              Done Editing
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="tiptap cursor-pointer hover:bg-muted/30 transition-colors rounded-lg"
                          onClick={() => handleEntryClick(entry.id)}
                          dangerouslySetInnerHTML={{
                            __html:
                              entry.content ||
                              '<p class="text-muted-foreground italic">No content yet. Click to add.</p>',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {stock && (
        <StockDialog
          stock={stock}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={handleStockUpdated}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {stock.ticker}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {stock.name} and all associated data
              including journal entries and canvas nodes. This action cannot be
              undone.
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
