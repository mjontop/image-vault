"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { Button } from "@core/components/ui/button";
import { Card, CardContent } from "@core/components/ui/card";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { ProgressDashboard } from "../components/progress-dashboard";
import { PasswordModal } from "../components/password-modal";
import { FileDropzone } from "../components/file-dropzone";
import { PaginatedFileGrid } from "../components/paginated-file-grid";
import { Stats } from "../types/file";
import { useDebouncedFileAddition } from "../hooks/useDebouncedFileAddition";
import { useBatchUpload } from "../hooks/useBatchUpload";
import { cleanupAllPreviews } from "../hooks/useLazyPreview";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use debounced file addition for performance
  const { files, addFiles, removeFile, clearAllFiles, setFiles } = useDebouncedFileAddition({
    delay: 150,
    maxBatchSize: 50,
  });

  // Use batch upload with concurrency control
  const { uploadBatch, isUploading } = useBatchUpload({
    concurrency: 3, // Upload 3 files at a time
    onProgress: (fileId, progress) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, progress, status: progress < 100 ? "uploading" : "encrypting" }
            : f
        )
      );
    },
    onComplete: (fileId) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, progress: 100, status: "completed" } : f))
      );
    },
    onError: (fileId, error) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "error-encrypt", error } : f))
      );
    },
  });

  const stats: Stats = useMemo(() => {
    const total = files.length;
    const uploaded = files.filter((f) =>
      ["encrypting", "completed", "error-encrypt"].includes(f.status)
    ).length;
    const encrypted = files.filter((f) => f.status === "completed").length;
    const failedUpload = files.filter((f) => f.status === "error-upload").length;
    const failedEncrypt = files.filter((f) => f.status === "error-encrypt").length;
    const overallProgress =
      total > 0 ? (files.reduce((acc, f) => acc + f.progress, 0) / (total * 100)) * 100 : 0;

    return { total, uploaded, encrypted, failedUpload, failedEncrypt, overallProgress };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: "pending" as const,
        previewUrl: "", // Will be generated lazily
      }));
      addFiles(newFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startUpload = () => {
    if (files.length === 0) return;
    setIsModalOpen(true);
  };

  const handleUploadConfirm = async () => {
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    setIsModalOpen(false);

    try {
      await uploadBatch(files, password);
      toast.success("Batch processing finished");
    } catch {
      toast.error("Upload failed");
    } finally {
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center bg-zinc-50 p-4 font-sans md:p-8 dark:bg-black">
      <nav className="mb-8 flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-zinc-900 p-1.5 dark:bg-zinc-100">
            <Lock className="h-5 w-5 text-zinc-100 dark:text-zinc-900" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Image Encryptor</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/vault">View Vault →</Link>
        </Button>
      </nav>

      <Card className="w-full max-w-6xl border-none bg-transparent shadow-none">
        <CardContent className="space-y-6 p-0">
          {/* Global Progress Dashboard */}
          {files.length > 0 && <ProgressDashboard stats={stats} />}

          <FileDropzone
            filesCount={files.length}
            onFileChange={handleFileChange}
            fileInputRef={fileInputRef}
            onClearAll={() => {
              clearAllFiles();
              cleanupAllPreviews();
            }}
            onStartUpload={startUpload}
            isUploading={isUploading}
            allFilesCompleted={files.every((f) => f.status === "completed")}
          />

          {/* Files Grid */}
          <PaginatedFileGrid
            files={files}
            onRemove={removeFile}
            isUploading={isUploading}
            itemsPerPage={60}
          />
        </CardContent>
      </Card>

      <PasswordModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        password={password}
        onPasswordChange={setPassword}
        onConfirm={handleUploadConfirm}
      />
    </div>
  );
}
