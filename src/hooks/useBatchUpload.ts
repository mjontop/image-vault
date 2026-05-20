"use client";

import { useState, useCallback, useRef } from "react";
import { FileState } from "../types/file";

interface BatchUploadOptions {
  concurrency?: number;
  onProgress?: (fileId: string, progress: number, status: FileState["status"]) => void;
  onComplete?: (fileId: string) => void;
  onError?: (fileId: string, error: string, status: FileState["status"]) => void;
}

export function useBatchUpload(options: BatchUploadOptions = {}) {
  const { concurrency = 2, onProgress, onComplete, onError } = options;
  const [isUploading, setIsUploading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const encryptFile = useCallback(
    async (fileState: FileState, password: string): Promise<{ blob: Blob; filename: string }> => {
      onProgress?.(fileState.id, 0, "encrypting");

      const formData = new FormData();
      formData.append("file", fileState.file);
      formData.append("password", password);

      const response = await fetch("/api/encrypt", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Encryption failed" }));
        throw new Error(errorData.error || "Encryption failed");
      }

      const blob = await response.blob();
      const filename = response.headers.get("X-Filename") || `${Date.now()}.dat`;

      onProgress?.(fileState.id, 100, "encrypting");
      return { blob, filename };
    },
    [onProgress]
  );

  const uploadBatchToStorage = useCallback(
    async (filesToUpload: { id: string; blob: Blob; filename: string }[]): Promise<void> => {
      if (filesToUpload.length === 0) return;

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        if (abortControllerRef.current) {
          abortControllerRef.current.signal.addEventListener("abort", () => xhr.abort());
        }

        const formData = new FormData();
        filesToUpload.forEach((f) => {
          formData.append("files", f.blob);
          formData.append("filenames", f.filename);
        });

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentage = Math.round((e.loaded * 100) / e.total);
            // Update progress for all files in this batch upload
            filesToUpload.forEach((f) => {
              onProgress?.(f.id, percentage, "uploading");
            });
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            filesToUpload.forEach((f) => {
              onComplete?.(f.id);
            });
            resolve();
          } else {
            let errorMsg = "Batch upload failed";
            try {
              errorMsg = JSON.parse(xhr.responseText || '{"error": "Batch upload failed"}').error;
            } catch {}
            filesToUpload.forEach((f) => {
              onError?.(f.id, errorMsg, "error-upload");
            });
            reject(new Error(errorMsg));
          }
        });

        xhr.addEventListener("error", () => {
          const errorMsg = "Network error during batch upload";
          filesToUpload.forEach((f) => {
            onError?.(f.id, errorMsg, "error-upload");
          });
          reject(new Error(errorMsg));
        });

        xhr.open("POST", "/api/upload/batch");
        xhr.send(formData);
      });
    },
    [onProgress, onComplete, onError]
  );

  const uploadBatch = useCallback(
    async (files: FileState[], password: string): Promise<void> => {
      if (files.length === 0) return;

      setIsUploading(true);
      setCompletedCount(0);
      abortControllerRef.current = new AbortController();

      const pendingFiles = files.filter(
        (f) => f.status === "pending" || f.status === "error-upload" || f.status === "error-encrypt"
      );

      // Phase 1: Encrypt ALL files first
      const encryptedResults: { id: string; blob: Blob; filename: string }[] = [];

      for (let i = 0; i < pendingFiles.length; i += concurrency) {
        if (abortControllerRef.current?.signal.aborted) break;

        const batch = pendingFiles.slice(i, i + concurrency);
        const batchPromises = batch.map(async (fileState) => {
          try {
            const result = await encryptFile(fileState, password);
            encryptedResults.push({ id: fileState.id, ...result });
          } catch (error) {
            console.error(`Encryption failed for ${fileState.id}:`, error);
            onError?.(
              fileState.id,
              error instanceof Error ? error.message : "Encryption failed",
              "error-encrypt"
            );
          }
        });

        await Promise.allSettled(batchPromises);
      }

      if (abortControllerRef.current?.signal.aborted) {
        setIsUploading(false);
        return;
      }

      // Phase 2: Upload successfully encrypted files IN SMART DYNAMIC CHUNKS
      if (encryptedResults.length > 0) {
        const MAX_CHUNK_SIZE_BYTES = 60 * 1024 * 1024; // ~60MB raw data limit per batch
        let currentChunk: { id: string; blob: Blob; filename: string }[] = [];
        let currentChunkSizeBytes = 0;

        const chunks: { id: string; blob: Blob; filename: string }[][] = [];

        // Group files by size
        for (const result of encryptedResults) {
          if (
            currentChunkSizeBytes + result.blob.size > MAX_CHUNK_SIZE_BYTES &&
            currentChunk.length > 0
          ) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentChunkSizeBytes = 0;
          }
          currentChunk.push(result);
          currentChunkSizeBytes += result.blob.size;
        }
        if (currentChunk.length > 0) chunks.push(currentChunk);

        // Upload chunks with a small delay between them to satisfy rate limits
        for (let i = 0; i < chunks.length; i++) {
          if (abortControllerRef.current?.signal.aborted) break;

          const chunk = chunks[i];
          try {
            await uploadBatchToStorage(chunk);
            setCompletedCount((prev) => prev + chunk.length);

            // Add a cooldown delay if there are more chunks to upload
            if (i < chunks.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          } catch (error) {
            console.error("Batch chunk upload failed:", error);
          }
        }
      }
      setIsUploading(false);
      abortControllerRef.current = null;
    },
    [concurrency, encryptFile, uploadBatchToStorage, onError]
  );

  const cancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsUploading(false);
  }, []);

  return {
    uploadBatch,
    cancelUpload,
    isUploading,
    completedCount,
  };
}
