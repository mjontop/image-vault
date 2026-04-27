"use client";

import { Button } from "@core/components/ui/button";
import { cn } from "@core/lib/utils";
import { Upload, Plus, Loader2, ShieldCheck } from "lucide-react";

interface FileDropzoneProps {
  filesCount: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onClearAll: () => void;
  onStartUpload: () => void;
  isUploading: boolean;
  allFilesCompleted: boolean;
}

export function FileDropzone({
  filesCount,
  onFileChange,
  fileInputRef,
  onClearAll,
  onStartUpload,
  isUploading,
  allFilesCompleted,
}: FileDropzoneProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-4 md:flex-row",
        filesCount === 0 ? "justify-center" : "justify-between"
      )}
    >
      <div
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/50",
          filesCount === 0 ? "mx-auto w-full max-w-2xl p-12" : "flex-1 p-4"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={onFileChange}
        />
        <div className={cn("flex items-center gap-3", filesCount === 0 ? "flex-col" : "flex-row")}>
          <div className="rounded-full bg-zinc-100 p-2 dark:bg-zinc-800">
            {filesCount === 0 ? (
              <Upload className="h-6 w-6 text-zinc-500" />
            ) : (
              <Plus className="h-5 w-5 text-zinc-500" />
            )}
          </div>
          <div className={filesCount === 0 ? "text-center" : "text-left"}>
            <p className="text-sm font-semibold">
              {filesCount === 0 ? "Select Images to Encrypt" : "Add More Images"}
            </p>
            {filesCount === 0 && (
              <p className="mt-1 text-xs text-zinc-500">PNG, JPG, GIF up to 100MB</p>
            )}
          </div>
        </div>
      </div>

      {filesCount > 0 && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Button variant="outline" onClick={onClearAll} disabled={isUploading} className="md:w-32">
            Clear All
          </Button>
          <Button
            onClick={onStartUpload}
            disabled={isUploading || allFilesCompleted}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 md:w-64 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" /> Encrypt & Upload
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
