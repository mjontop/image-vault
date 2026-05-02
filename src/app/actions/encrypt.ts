"use server";

import crypto from "crypto";
import { getStorageProvider } from "../../lib/storage";

export async function encryptImage(formData: FormData) {
  try {
    const file = formData.get("image") as File | null;
    const password = formData.get("password") as string | null;

    if (!file || !password) {
      return { error: "Missing file or password" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, salt, 32);

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    const encryptedData = Buffer.concat([cipher.update(inputBuffer), cipher.final()]);

    const mysteryBlob = Buffer.concat([salt, iv, encryptedData]);

    const timestamp = new Date(file.lastModified).toISOString();
    const filename = `${timestamp}.dat`;
    const provider = getStorageProvider();

    // Process is atomic: uploadFile will throw if it fails.
    // If it succeeds, the file is safely stored in the provider.
    await provider.uploadFile(filename, mysteryBlob);

    return { success: true, filename };
  } catch (error) {
    console.error("Encryption/Upload error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to encrypt and upload image",
    };
  }
}
