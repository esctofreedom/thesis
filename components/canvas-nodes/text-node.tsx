"use client";

import { memo, useCallback, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TextNodeData {
  content: string;
  onUpdate: (id: string, data: { content: string }) => void;
  onDelete: (id: string) => void;
}

const TextNode = ({ id, data }: NodeProps<TextNodeData>) => {
  const [localContent, setLocalContent] = useState(data.content || "");

  const handleDelete = useCallback(() => {
    data.onDelete(id);
  }, [data, id]);

  const handleBlur = useCallback(() => {
    if (localContent !== data.content) {
      data.onUpdate(id, { content: localContent });
    }
  }, [localContent, data, id]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalContent(e.target.value);
    },
    []
  );

  return (
    <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg shadow-lg w-[250px] relative">
      <div className="absolute -top-3 -right-3 z-10">
        <Button
          size="icon"
          variant="destructive"
          className="h-6 w-6 rounded-full"
          onClick={handleDelete}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <textarea
        value={localContent}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Type a quick note..."
        className="w-full h-[150px] p-3 bg-transparent border-none resize-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground font-sans"
      />

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(TextNode);
