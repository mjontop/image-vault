"use server";

import crypto from "crypto";
import { getStorageProvider } from "../../lib/storage";

export async function getGalleryFiles(projectId: string, page: number = 1) {
  try {
    const provider = getStorageProvider({ projectId });
    const files = await provider.listFiles(page, 100);
    return { success: true, files };
  } catch (error) {
    console.error("Error reading gallery files:", error);
    return { success: false, error: "Failed to load files from repository" };
  }
}

export async function decryptGalleryImage(projectId: string, filename: string, password: string) {
  try {
    const provider = getStorageProvider({ projectId });
    const buffer = await provider.getFile(filename);

    const salt = buffer.subarray(0, 16);
    const iv = buffer.subarray(16, 32);
    const encryptedData = buffer.subarray(32);

    const key = crypto.scryptSync(password, salt, 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    const base64 = decrypted.toString("base64");
    // Determine mime type from filename if possible, default to png
    const mimeType = filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg") ? "image/jpeg" : "image/png";

    return { success: true, dataUrl: `data:${mimeType};base64,${base64}` };
  } catch (error) {
    console.error("Decryption error:", error);
    return { success: false, error: "Invalid password or corrupted file" };
  }
}
