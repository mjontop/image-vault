import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getStorageProvider } from "@core/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const { filename, password, projectId } = await req.json();

    if (!filename || !password) {
      return NextResponse.json({ error: "Missing filename or password" }, { status: 400 });
    }

    const provider = getStorageProvider({ projectId });
    const buffer = await provider.getFile(filename);

    const salt = buffer.subarray(0, 16);
    const iv = buffer.subarray(16, 32);
    const encryptedData = buffer.subarray(32);

    const key = crypto.scryptSync(password, salt, 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    // Detect MIME type from magic bytes (since filenames no longer contain original extension)
    let mimeType = "image/png"; // Default
    if (decrypted.length > 4) {
      const hex = decrypted.subarray(0, 4).toString("hex").toUpperCase();
      if (hex.startsWith("FFD8FF")) {
        mimeType = "image/jpeg";
      } else if (hex === "89504E47") {
        mimeType = "image/png";
      } else if (hex.startsWith("474946")) {
        mimeType = "image/gif";
      } else if (hex === "52494646") {
        mimeType = "image/webp";
      } else if (decrypted.toString("utf8", 0, 4) === "<svg" || decrypted.toString("utf8", 0, 5) === "<?xml") {
        mimeType = "image/svg+xml";
      }
    }

    return new NextResponse(decrypted, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Decryption API error:", error);
    return NextResponse.json(
      { error: "Invalid password or corrupted file" },
      { status: 401 }
    );
  }
}
