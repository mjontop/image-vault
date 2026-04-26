"use client";

import { useState } from "react";
import { encryptImage } from "./actions/encrypt";
import Link from "next/link";

export default function Home() {
  const [status, setStatus] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setStatus("Encrypting...");
    setFilename(null);

    try {
      const result = await encryptImage(formData);

      if (result.success) {
        setStatus("Successfully encrypted!");
        setFilename(result.filename || null);
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (err) {
      setStatus("An unexpected error occurred.");
      console.error(err);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <nav className="absolute top-8 right-8">
        <Link
          href="/vault"
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          View Vault →
        </Link>
      </nav>

      <main className="flex w-full max-w-md flex-col rounded-xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Image Encryptor</h1>

        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Select Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className="block w-full text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter encryption password"
              required
              className="rounded-md border border-zinc-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          <button
            type="submit"
            className="mt-4 rounded-md bg-zinc-950 px-4 py-2 font-bold text-white transition-opacity hover:opacity-90 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Encrypt to Mystery File
          </button>
        </form>

        {status && (
          <div className="mt-6 rounded-md bg-zinc-100 p-4 text-sm dark:bg-zinc-800">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{status}</p>
            {filename && (
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Saved as:{" "}
                <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">{filename}</code>
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
