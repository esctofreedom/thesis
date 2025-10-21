"use client";

import { memo, useCallback, useRef } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface ImageNodeData {
  imageUrl: string;
  alt?: string;
  onUpdate: (id: string, data: { imageUrl: string; alt?: string }) => void;
  onDelete: (id: string) => void;
}

const ImageNode = ({ id, data }: NodeProps<ImageNodeData>) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = useCallback(() => {
    data.onDelete(id);
  }, [data, id]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          data.onUpdate(id, { imageUrl: base64String, alt: file.name });
        };
        reader.readAsDataURL(file);
      }
    },
    [data, id]
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="bg-card border-2 border-border rounded-lg shadow-lg min-w-[300px] max-w-[400px] relative">
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

      <div className="p-4">
        {data.imageUrl ? (
          <div className="space-y-2">
            <img
              src={data.imageUrl}
              alt={data.alt || "Node image"}
              className="w-full h-auto rounded-md"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleUploadClick}
              className="w-full"
            >
              <Upload className="h-3 w-3 mr-2" />
              Change Image
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              No image uploaded
            </p>
            <Button size="sm" onClick={handleUploadClick}>
              <Upload className="h-3 w-3 mr-2" />
              Upload Image
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default memo(ImageNode);
