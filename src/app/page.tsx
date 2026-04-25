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
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black p-8">
      <nav className="absolute top-8 right-8">
        <Link 
          href="/vault" 
          className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          View Vault →
        </Link>
      </nav>

      <main className="flex flex-col w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">
          Image Encryptor
        </h1>
        
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
              className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input 
              type="password" 
              name="password" 
              placeholder="Enter encryption password"
              required 
              className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit"
            className="mt-4 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 font-bold py-2 px-4 rounded-md transition-opacity hover:opacity-90"
          >
            Encrypt to Mystery File
          </button>
        </form>

        {status && (
          <div className="mt-6 p-4 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{status}</p>
            {filename && (
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Saved as: <code className="bg-zinc-200 dark:bg-zinc-700 px-1 rounded">{filename}</code>
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
