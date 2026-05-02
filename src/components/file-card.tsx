"use client";

import { Progress } from "@core/components/ui/progress";
import { cn } from "@core/lib/utils";
import { Loader2, X, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react";
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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        {previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full cursor-pointer items-center justify-center transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
            onClick={generatePreview}
          >
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto mb-1 h-8 w-8 text-zinc-400" />
                <span className="text-xs text-zinc-500">Click to preview</span>
              </div>
            )}
          </div>
        )}

        {/* Status Overlays */}
        {fileState.status === "completed" && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-[1px]">
            <CheckCircle2 className="h-10 w-10 text-white drop-shadow-md" />
          </div>
        )}
        {(fileState.status === "error-upload" || fileState.status === "error-encrypt") && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-[1px]">
            <AlertCircle className="h-10 w-10 text-white drop-shadow-md" />
          </div>
        )}
        {(fileState.status === "uploading" || fileState.status === "encrypting") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-4">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-white" />
            <span className="text-[10px] font-bold tracking-wider text-white uppercase">
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
            className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white transition-opacity group-hover:opacity-100 hover:bg-black/70 md:opacity-0"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="space-y-1.5 p-2">
        <p className="truncate text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
          {fileState.file.name}
        </p>
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
              fileState.status === "pending" && "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
              fileState.status === "completed" &&
                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              (fileState.status === "error-upload" || fileState.status === "error-encrypt") &&
                "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              (fileState.status === "uploading" || fileState.status === "encrypting") &&
                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            )}
          >
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
