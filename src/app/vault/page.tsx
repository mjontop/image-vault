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
    loadFiles();
  }, []);

  async function loadFiles() {
    const result = await getFiles();
    if (result.success) {
      setFiles(result.files || []);
    } else {
      setError(result.error || "Failed to load files");
    }
    setLoading(false);
  }

  async function handleDecrypt(filename: string) {
    if (!password) {
      alert("Please enter the password first!");
      return;
    }

    const result = await decryptImage(filename, password);
    if (result.success && result.dataUrl) {
      setDecryptedImages(prev => ({ ...prev, [filename]: result.dataUrl as string }));
    } else {
      alert(result.error || "Failed to decrypt. Check your password.");
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-50 font-sans dark:bg-black p-8">
      <header className="max-w-4xl mx-auto w-full mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Secure Vault</h1>
          <p className="text-sm text-zinc-500">Your collection of mystery blobs.</p>
        </div>
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← Back to Encryptor
        </Link>
      </header>

      <main className="max-w-4xl mx-auto w-full">
        <div className="mb-8 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Master Password for Decryption
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the password used during encryption"
            className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-2 text-xs text-zinc-500">
            This password will be used to unlock the images below.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-zinc-500">Scanning vault...</p>
        ) : files.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
            <p className="text-zinc-500">The vault is currently empty.</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 text-sm font-medium">
              Go encrypt something first
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {files.map((file) => (
              <div key={file} className="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-400 truncate">{file}</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Encrypted Mystery Blob</span>
                </div>

                {decryptedImages[file] ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={decryptedImages[file]} 
                      alt="Decrypted content" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <button 
                      onClick={() => handleDecrypt(file)}
                      className="px-4 py-2 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-bold rounded hover:opacity-80 transition-opacity"
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
