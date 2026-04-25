"use server";

import crypto from "crypto";
import { getStorageProvider } from "../../lib/storage";

export async function getFiles() {
  try {
    const provider = getStorageProvider();
    const files = await provider.listFiles();
    return { success: true, files };
  } catch (error) {
    console.error("Error reading files:", error);
    return { success: false, error: "Failed to load files" };
  }
}

export async function decryptImage(filename: string, password: string) {
  try {
    const provider = getStorageProvider();
    const buffer = await provider.getFile(filename);

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
    console.error("Decryption error:", error);
    return { success: false, error: "Invalid password or corrupted file" };
  }
}
