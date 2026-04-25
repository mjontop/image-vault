"use server";

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

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
    
    const encryptedData = Buffer.concat([
      cipher.update(inputBuffer),
      cipher.final()
    ]);

    const mysteryBlob = Buffer.concat([salt, iv, encryptedData]);

    const storageDir = path.join(process.cwd(), "encrypted-storage");
    await fs.mkdir(storageDir, { recursive: true });

    const filename = `mystery-${Date.now()}.txt`;
    const filePath = path.join(storageDir, filename);
    await fs.writeFile(filePath, mysteryBlob);

    return { success: true, filename };
  } catch (error) {
    console.error("Encryption error:", error);
    return { error: "Failed to encrypt image" };
  }
}
