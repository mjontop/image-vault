"use client";

import { useState } from "react";
import { encryptImage } from "./actions/encrypt";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("Encrypting...");
    setFilename(null);

    try {
      const result = await encryptImage(formData);

      if (result.success) {
        setStatus(null);
        toast.success("Successfully encrypted!");
        setFilename(result.filename || null);
      } else {
        setStatus(null);
        toast.error(`Error: ${result.error}`);
      }
    } catch (err) {
      setStatus(null);
      toast.error("An unexpected error occurred.");
      console.error(err);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <nav className="absolute top-8 right-8">
        <Button asChild variant="outline">
          <Link href="/vault">View Vault →</Link>
        </Button>
      </nav>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Image Encryptor</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="image">Select Image</Label>
              <input
                id="image"
                type="file"
                name="image"
                accept="image/*"
                required
                className="block w-full text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter encryption password"
                required
              />
            </div>

            <Button type="submit" className="mt-4">
              Encrypt to Mystery File
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
