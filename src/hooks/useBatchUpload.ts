"use client";

import { useState, useCallback, useRef } from "react";
import { FileState } from "../types/file";

interface BatchUploadOptions {
  concurrency?: number;
  onProgress?: (fileId: string, progress: number) => void;
  onComplete?: (fileId: string) => void;
  onError?: (fileId: string, error: string) => void;
}

export function useBatchUpload(options: BatchUploadOptions = {}) {
  const { concurrency = 3, onProgress, onComplete, onError } = options;
  const [isUploading, setIsUploading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(async (
    fileState: FileState,
    password: string,
    apiEndpoint: string = "/api/upload"
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", fileState.file);
      formData.append("password", password);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded * 100) / e.total);
          onProgress?.(fileState.id, percentage);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onComplete?.(fileState.id);
          resolve();
        } else {
          let errorMsg = "Encryption failed";
          try {
            errorMsg = JSON.parse(xhr.responseText || '{"error": "Encryption failed"}').error;
          } catch { }
          onError?.(fileState.id, errorMsg);
          reject(new Error(errorMsg));
        }
      });

      xhr.addEventListener("error", () => {
        const errorMsg = "Network error";
        onError?.(fileState.id, errorMsg);
        reject(new Error(errorMsg));
      });

      xhr.upload.addEventListener("load", () => {
        // File upload completed, now encrypting
        onProgress?.(fileState.id, 100);
      });

      xhr.open("POST", apiEndpoint);
      xhr.send(formData);
    });
  }, [onProgress, onComplete, onError]);

  const uploadBatch = useCallback(async (
    files: FileState[],
    password: string,
    apiEndpoint: string = "/api/upload"
  ): Promise<void> => {
    if (files.length === 0) return;

    setIsUploading(true);
    setCompletedCount(0);
    abortControllerRef.current = new AbortController();

    const pendingFiles = files.filter(f => f.status === "pending" || f.status === "error-upload" || f.status === "error-encrypt");

    try {
      // Process files in batches with concurrency limit
      for (let i = 0; i < pendingFiles.length; i += concurrency) {
        if (abortControllerRef.current?.signal.aborted) break;

        const batch = pendingFiles.slice(i, i + concurrency);
        const batchPromises = batch.map(fileState =>
          uploadFile(fileState, password, apiEndpoint)
            .then(() => setCompletedCount(prev => prev + 1))
            .catch(() => setCompletedCount(prev => prev + 1)) // Count errors as completed too
        );

        await Promise.allSettled(batchPromises);

        // Small delay between batches to prevent overwhelming the server
        if (i + concurrency < pendingFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  }, [concurrency, uploadFile]);

  const cancelUpload = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsUploading(false);
  }, []);

  return {
    uploadBatch,
    cancelUpload,
    isUploading,
    completedCount,
    totalCount: 0, // This will be set by the caller
  };
}