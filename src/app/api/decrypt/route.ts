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

    // Guess MIME type from filename (filenames are stored as original-name.txt)
    let mimeType = "image/png"; // Default to png
    const lowerFilename = filename.toLowerCase();

    if (lowerFilename.includes(".jpg") || lowerFilename.includes(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (lowerFilename.includes(".gif")) {
      mimeType = "image/gif";
    } else if (lowerFilename.includes(".webp")) {
      mimeType = "image/webp";
    } else if (lowerFilename.includes(".svg")) {
      mimeType = "image/svg+xml";
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
