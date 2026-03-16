"use client";

import { Upload, FileUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload?: (files: FileList) => void;
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) {
          onUpload?.(e.dataTransfer.files);
        }
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Перетащите файлы сюда</p>
          <p className="text-xs text-muted-foreground mt-1">или нажмите для выбора</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" className="hidden" multiple onChange={(e) => e.target.files && onUpload?.(e.target.files)} />
          <span className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <FileUp className="h-4 w-4" />
            Выбрать файлы
          </span>
        </label>
      </div>
    </div>
  );
}
