"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FileState } from "../types/file";

interface DebouncedFileAdditionOptions {
  delay?: number;
  maxBatchSize?: number;
}

export function useDebouncedFileAddition(options: DebouncedFileAdditionOptions = {}) {
  const { delay = 100, maxBatchSize = 100 } = options;
  const [files, setFiles] = useState<FileState[]>([]);
  const [pendingFiles, setPendingFiles] = useState<FileState[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getFileKey = useCallback((fileState: FileState) => {
    return `${fileState.file.name}-${fileState.file.size}-${fileState.file.lastModified}`;
  }, []);

  const flushPending = useCallback(
    function flushPending() {
      setPendingFiles((currentPending) => {
        if (currentPending.length === 0) {
          timeoutRef.current = null;
          return [];
        }

        const batchSize = Math.min(currentPending.length, maxBatchSize);
        const batch = currentPending.slice(0, batchSize);
        const remaining = currentPending.slice(batchSize);

        setFiles((prev) => {
          const existingKeys = new Set(prev.map(getFileKey));
          const filteredBatch = batch.filter(
            (fileState) => !existingKeys.has(getFileKey(fileState))
          );
          return filteredBatch.length > 0 ? [...prev, ...filteredBatch] : prev;
        });

        if (remaining.length > 0) {
          timeoutRef.current = setTimeout(flushPending, 10);
        } else {
          timeoutRef.current = null;
        }

        return remaining;
      });
    },
    [maxBatchSize]
  );

  const addFiles = useCallback(
    (newFiles: FileState[]) => {
      setPendingFiles((prev) => {
        const existingKeys = new Set(prev.map(getFileKey));
        const uniqueFiles = newFiles.filter(
          (fileState) => !existingKeys.has(getFileKey(fileState))
        );
        return uniqueFiles.length > 0 ? [...prev, ...uniqueFiles] : prev;
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(flushPending, delay);
    },
    [delay, flushPending, getFileKey]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      const removed = prev.find((f) => f.id === id);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return filtered;
    });
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      return [];
    });
    setPendingFiles([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, [files]);

  return {
    files,
    pendingCount: pendingFiles.length,
    addFiles,
    removeFile,
    clearAllFiles,
    setFiles, // For direct state updates when needed
  };
}
