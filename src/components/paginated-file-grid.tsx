"use client";

import { useState } from "react";
import { Button } from "@core/components/ui/button";
import { FileCard } from "./file-card";
import { FileState } from "../types/file";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginatedFileGridProps {
  files: FileState[];
  onRemove: (id: string) => void;
  isUploading: boolean;
  itemsPerPage?: number;
}

export function PaginatedFileGrid({
  files,
  onRemove,
  isUploading,
  itemsPerPage = 60
}: PaginatedFileGridProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(files.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFiles = files.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Files Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {currentFiles.map((fileState) => (
          <FileCard
            key={fileState.id + "hello" + fileState.file.name}
            fileState={fileState}
            onRemove={onRemove}
            isUploading={isUploading}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center text-sm text-zinc-500">
        Showing {startIndex + 1}-{Math.min(endIndex, files.length)} of {files.length} files
        {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
      </div>
    </div>
  );
}
