"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { Button } from "@core/components/ui/button";
import { Input } from "@core/components/ui/input";
import { Label } from "@core/components/ui/label";
import { Card, CardContent } from "@core/components/ui/card";
import { Skeleton } from "@core/components/ui/skeleton";
import { Lock } from "lucide-react";
import { getGalleryFiles } from "@core/app/actions/gallery";
import { toast } from "sonner";
import { sanitizeCustomDateString } from "@core/lib/datetime.helper";

interface ImageState {
  name: string;
  timestamp: Date;
  status: "pending" | "loading" | "decrypting" | "loaded" | "error";
  dataUrl?: string;
  error?: string;
}

export function GalleryView() {
  const [projectId, setProjectId] = useState("");
  const [password, setPassword] = useState("");
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [images, setImages] = useState<ImageState[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    // Cleanup Object URLs on unmount
    return () => {
      setImages((prev) => {
        prev.forEach((img) => {
          if (img.dataUrl?.startsWith("blob:")) URL.revokeObjectURL(img.dataUrl);
        });
        return prev;
      });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !password) {
      toast.error("Please provide both Repository ID and Password");
      return;
    }

    setIsFetchingList(true);
    setImages([]);
    setPage(1);

    await fetchPage(projectId, 1, password);
  };

  const fetchPage = async (pId: string, pageNum: number, pass: string) => {
    setIsFetchingList(true);
    const result = await getGalleryFiles(pId, pageNum);

    if (result.success && result.files) {
      const newFiles = result.files;
      const initialNewImages: ImageState[] = newFiles.map((name) => {
        // Filename is ISO string + extension
        const dateStr = name.replace(".dat", "")
       
        const dateTime = sanitizeCustomDateString(dateStr);
        
        return {
          name,
          timestamp: new Date(dateTime),
          status: "pending",
        };
      });

      setImages((prev) => {
        const combined = [...prev, ...initialNewImages];
        // Sort by date descending
        return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      });

      setHasMore(newFiles.length === 100);
      setIsFetchingList(false);
    } else {
      toast.error(result.error || "Failed to load files");
      setIsFetchingList(false);
    }
  };

  const decryptAll =  () => {
    const pendingImages = images.filter(img => img.status === "pending");
    for (const img of pendingImages) {
       processImage(projectId, img.name, password);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(projectId, nextPage, password);
  };

  const processImage = async (pId: string, fileName: string, pass: string) => {
    const currentImg = images.find(img => img.name === fileName);
    if (currentImg && (currentImg.status === "loaded" || currentImg.status === "decrypting" || currentImg.status === "loading")) {
      return;
    }

    setImages((prev) =>
      prev.map((img) =>
        img.name === fileName ? { ...img, status: "loading" } : img
      )
    );

    setImages((prev) =>
      prev.map((img) =>
        img.name === fileName ? { ...img, status: "decrypting" } : img
      )
    );

    try {
      const response = await fetch("/api/decrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: fileName, password: pass, projectId: pId }),
      });

      if (!response.ok) {
        throw new Error("Failed to decrypt");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setImages((prev) =>
        prev.map((img) =>
          img.name === fileName
            ? { ...img, status: "loaded", dataUrl: url }
            : img
        )
      );
    } catch (error) {
      console.error(`Error decrypting ${fileName}:`, error);
      setImages((prev) =>
        prev.map((img) =>
          img.name === fileName
            ? { ...img, status: "error", error: error instanceof Error ? error.message : "Error" }
            : img
        )
      );
    }
  };

  // Group images by day
  const groupedImages = images.reduce((groups: Record<string, ImageState[]>, image) => {
    const date = image.timestamp.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(image);
    return groups;
  }, {});

  return (
    <div className="space-y-8">
      {images.length === 0 && (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Repository ID</Label>
                <Input
                  id="projectId"
                  placeholder="Enter GitLab Project ID"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter decryption password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isFetchingList}>
                {isFetchingList ? "Fetching list..." : "View Gallery"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {images.length > 0 && (
        <div className="flex justify-between items-center bg-background/95 backdrop-blur sticky top-0 z-20 py-4 border-b">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Repository: {projectId}</h2>
            <p className="text-xs text-muted-foreground">{images.length} images loaded</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={decryptAll}>
              Decrypt All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setImages([]);
                setPage(1);
                setHasMore(false);
              }}
            >
              Change Repository
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {Object.entries(groupedImages).map(([date, imgs]) => (
          <div key={date} className="space-y-4">
            <h3 className="text-lg font-medium sticky top-[72px] bg-background/95 backdrop-blur z-10 py-2">
              {date}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {imgs.map((image) => (
                <Card
                  key={image.name}
                  className="overflow-hidden aspect-square relative group cursor-pointer border-none shadow-none bg-muted"
                  onMouseEnter={() => processImage(projectId, image.name, password)}
                >
                  <CardContent className="p-0 h-full">
                    {image.status === "pending" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Lock className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    ) : image.status === "loading" || image.status === "decrypting" ? (
                      <div className="w-full h-full">
                        <Skeleton className="w-full h-full absolute inset-0" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-background/80 px-2 py-1 rounded text-[10px] font-medium animate-pulse">
                            {image.status === "decrypting" ? "DECRYPTING" : "LOADING"}
                          </div>
                        </div>
                      </div>
                    ) : image.status === "loaded" ? (
                      <NextImage
                        src={image.dataUrl!}
                        alt={image.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-destructive bg-destructive/10 text-center text-[10px]">
                        Error
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <Button onClick={loadMore} disabled={isFetchingList} variant="outline" className="w-40">
            {isFetchingList ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {!isFetchingList && images.length === 0 && (
        <div className="text-center text-muted-foreground py-20 border-2 border-dashed rounded-lg">
          No images to display. Enter repository details to start.
        </div>
      )}
    </div>
  );
}
