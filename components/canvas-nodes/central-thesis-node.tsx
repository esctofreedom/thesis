"use client";

import { memo, useState, useEffect, useRef, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { TiptapEditor } from "@/components/tiptap/editor";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";

interface CentralThesisNodeData {
  content: string;
  onUpdate: (id: string, data: { content: string }) => void;
}

const CentralThesisNode = ({ id, data }: NodeProps<CentralThesisNodeData>) => {
  const [localContent, setLocalContent] = useState(data.content);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const autoSave = useCallback(
    (content: string) => {
      setSaveStatus("saving");
      data.onUpdate(id, { content });
      // Brief delay to show saving indicator
      setTimeout(() => setSaveStatus("saved"), 500);
    },
    [id, data]
  );

  // Auto-save with debounce
  useEffect(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Only set unsaved if content actually changed
    if (localContent !== data.content) {
      setSaveStatus("unsaved");

      // Set new timeout to auto-save after 2 seconds
      saveTimeoutRef.current = setTimeout(() => {
        autoSave(localContent);
      }, 2000);
    }

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [localContent, data.content, autoSave]);

  const handleChange = (newContent: string) => {
    setLocalContent(newContent);
  };

  return (
    <div className="bg-card border-2 border-primary/50 rounded-lg shadow-2xl w-[700px] relative">
      <div className="border-b bg-muted/50 px-4 py-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Investment Thesis</h3>
            <Badge variant="secondary" className="text-xs">
              Central Note
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-muted-foreground">Saving...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-green-500">Saved</span>
              </>
            )}
            {saveStatus === "unsaved" && (
              <span className="text-orange-500">Unsaved</span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Main investment analysis and reasoning
        </p>
      </div>

      <div className="p-2">
        <TiptapEditor
          content={localContent}
          onChange={handleChange}
          placeholder="Write your investment thesis here..."
        />
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(CentralThesisNode);
