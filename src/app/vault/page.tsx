"use client";

import { useState, useEffect } from "react";
import { getFiles, decryptImage } from "../actions/files";
import Link from "next/link";
import { Button } from "@core/components/ui/button";
import { Label } from "@core/components/ui/label";
import { Input } from "@core/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@core/components/ui/card";
import { Skeleton } from "@core/components/ui/skeleton";
import { toast } from "sonner";
import { LockIcon } from "lucide-react";

export default function VaultPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [decryptedImages, setDecryptedImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [decryptingAll, setDecryptingAll] = useState(false);

  useEffect(() => {
    async function loadFiles() {
      const result = await getFiles();
      if (result.success) {
        setFiles(result.files || []);
      } else {
        toast.error(result.error || "Failed to load files");
      }
      setLoading(false);
    }
    loadFiles();
  }, []);

  async function handleDecryptAll() {
    if (!password) {
      toast.error("Please enter the password first!");
      return;
    }

    if (files.length === 0) {
      toast.info("No files to decrypt.");
      return;
    }

    setDecryptingAll(true);
    const newDecrypted: Record<string, string> = {};
    const failedFiles: string[] = [];

    const results = await Promise.all(files.map((file) => decryptImage(file, password)));

    results.forEach((result, index) => {
      const file = files[index];
      if (result.success && result.dataUrl) {
        newDecrypted[file] = result.dataUrl as string;
      } else {
        failedFiles.push(file);
      }
    });

    setDecryptedImages((prev) => ({ ...prev, ...newDecrypted }));
    setDecryptingAll(false);

    if (failedFiles.length === files.length) {
      toast.error("Failed to decrypt any images. Check your password or file integrity.");
    } else if (failedFiles.length > 0) {
      toast.error(`Failed to decrypt ${failedFiles.length} image(s)`);
    } else {
      toast.success("All images decrypted successfully!");
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 p-8 font-sans dark:bg-black">
      <header className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Secure Vault</h1>
          <p className="text-sm text-zinc-500">Your collection of mystery blobs.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">← Back to Encryptor</Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-4xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Master Password for Decryption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the password used during encryption"
              />
              <p className="text-xs text-zinc-500">
                This password will be used to unlock the images below.
              </p>
              <Button
                onClick={handleDecryptAll}
                disabled={!password || decryptingAll || files.length === 0}
                className="w-full"
              >
                {decryptingAll ? "Unlocking..." : "Unlock All Images"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="aspect-video w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : files.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-zinc-500">The vault is currently empty.</p>
              <Button asChild variant="link" className="mt-4">
                <Link href="/">Go encrypt something first</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {files.map((file) => (
              <Card key={file}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4">
                    {decryptedImages[file] ? (
                      <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={decryptedImages[file]}
                          alt="Decrypted content"
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <LockIcon className="h-8 w-8 text-zinc-400" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
