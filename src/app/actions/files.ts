"use server";

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const storageDir = path.join(process.cwd(), "encrypted-storage");

export async function getFiles() {
  try {
    await fs.mkdir(storageDir, { recursive: true });
    const files = await fs.readdir(storageDir);
    return { success: true, files: files.filter(f => f.endsWith(".txt")).reverse() };
  } catch (error) {
    console.error("Error reading files:", error);
    return { success: false, error: "Failed to load files" };
  }
}

export async function decryptImage(filename: string, password: string) {
  try {
    const filePath = path.join(storageDir, filename);
    const buffer = await fs.readFile(filePath);

    const salt = buffer.subarray(0, 16);
    const iv = buffer.subarray(16, 32);
    const encryptedData = buffer.subarray(32);

    const key = crypto.scryptSync(password, salt, 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);

    const base64 = decrypted.toString("base64");
    return { success: true, dataUrl: `data:image/png;base64,${base64}` };
  } catch (error) {
    return { success: false, error: "Invalid password or corrupted file" };
  }
}
