"use client";

import { Progress } from "@core/components/ui/progress";
import { cn } from "@core/lib/utils";
import {
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { FileState } from "../types/file";
import { useLazyPreview } from "../hooks/useLazyPreview";

interface FileCardProps {
  fileState: FileState;
  onRemove: (id: string) => void;
  isUploading: boolean;
}

export function FileCard({ fileState, onRemove, isUploading }: FileCardProps) {
  const { previewUrl, isLoading, generatePreview } = useLazyPreview(fileState);

  return (
    <div className="group relative flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="aspect-square relative overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previewUrl}
            alt="preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            onClick={generatePreview}
          >
            {isLoading ? (
              <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
            ) : (
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-zinc-400 mx-auto mb-1" />
                <span className="text-xs text-zinc-500">Click to preview</span>
              </div>
            )}
          </div>
        )}

        {/* Status Overlays */}
        {fileState.status === "completed" && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[1px]">
            <CheckCircle2 className="h-10 w-10 text-white drop-shadow-md" />
          </div>
        )}
        {(fileState.status === "error-upload" || fileState.status === "error-encrypt") && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[1px]">
            <AlertCircle className="h-10 w-10 text-white drop-shadow-md" />
          </div>
        )}
        {(fileState.status === "uploading" || fileState.status === "encrypting") && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
            <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">
              {fileState.status === "uploading" ? `${fileState.progress}%` : "Encrypting"}
            </span>
          </div>
        )}

        {fileState.status === "pending" && !isUploading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(fileState.id);
            }}
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-opacity md:opacity-0 group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="p-2 space-y-1.5">
        <p className="text-[11px] font-medium truncate text-zinc-700 dark:text-zinc-300">
          {fileState.file.name}
        </p>
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
            fileState.status === "pending" && "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
            fileState.status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            (fileState.status === "error-upload" || fileState.status === "error-encrypt") && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            (fileState.status === "uploading" || fileState.status === "encrypting") && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          )}>
            {fileState.status.replace("error-", "failed ")}
          </span>
        </div>
        {fileState.status === "uploading" && (
          <Progress value={fileState.progress} className="h-1" />
        )}
      </div>
    </div>
  );
}