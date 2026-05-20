import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { extractDateFromString } from "@core/lib/datetime.helper";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const password = formData.get("password") as string | null;

    if (!file || !password) {
      return NextResponse.json({ error: "Missing file or password" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Encryption Step
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encryptedData = Buffer.concat([cipher.update(inputBuffer), cipher.final()]);
    const mysteryBlob = Buffer.concat([salt, iv, encryptedData]);

    let timestamp = extractDateFromString(file.name);
    if (!timestamp) {
      timestamp = new Date(file.lastModified).toISOString().replace(/[:.]/g, "-");
    }
    const filename = `${timestamp}.dat`;

    // Return the encrypted blob and the filename to use for storage
    return new NextResponse(mysteryBlob, {
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Filename": filename,
      },
    });
  } catch (error) {
    console.error("Encryption API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to encrypt image" },
      { status: 500 }
    );
  }
}
