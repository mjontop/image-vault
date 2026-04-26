"use client";

import { useState, useEffect } from "react";
import { getFiles, decryptImage } from "../actions/files";
import Link from "next/link";

export default function VaultPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [decryptedImages, setDecryptedImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFiles() {
      const result = await getFiles();
      if (result.success) {
        setFiles(result.files || []);
      } else {
        setError(result.error || "Failed to load files");
      }
      setLoading(false);
    }
    loadFiles();
  }, []);

  async function handleDecrypt(filename: string) {
    if (!password) {
      alert("Please enter the password first!");
      return;
    }

    const result = await decryptImage(filename, password);
    if (result.success && result.dataUrl) {
      setDecryptedImages((prev) => ({ ...prev, [filename]: result.dataUrl as string }));
    } else {
      alert(result.error || "Failed to decrypt. Check your password.");
    }
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 p-8 font-sans dark:bg-black">
      <header className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Secure Vault</h1>
          <p className="text-sm text-zinc-500">Your collection of mystery blobs.</p>
        </div>
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ? Back to Encryptor
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl">
        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Master Password for Decryption
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the password used during encryption"
            className="w-full rounded-md border border-zinc-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <p className="mt-2 text-xs text-zinc-500">
            This password will be used to unlock the images below.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-zinc-500">Scanning vault...</p>
        ) : files.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <p className="text-zinc-500">The vault is currently empty.</p>
            <Link href="/" className="mt-4 inline-block text-sm font-medium text-blue-600">
              Go encrypt something first
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {files.map((file) => (
              <div
                key={file}
                className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col">
                  <span className="truncate font-mono text-[10px] text-zinc-400">{file}</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Encrypted Mystery Blob
                  </span>
                </div>

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
                    <button
                      onClick={() => handleDecrypt(file)}
                      className="rounded bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-80 dark:bg-zinc-50 dark:text-zinc-950"
                    >
                      Unlock Image
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
