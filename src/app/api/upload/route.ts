import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getStorageProvider } from "@core/lib/storage";
import { extractDateFromString } from "@core/lib/datetime.helper";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const password = formData.get("password") as string | null;

    if (!file || !password) {
      return NextResponse.json({ error: "Missing file or password" }, { status: 400 });
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 100MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Encryption (Status: Encrypting)
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encryptedData = Buffer.concat([cipher.update(inputBuffer), cipher.final()]);
    const mysteryBlob = Buffer.concat([salt, iv, encryptedData]);


    let timestamp = extractDateFromString(file.name) 

    if(!timestamp) {
      timestamp = new Date(file.lastModified).toISOString().replace(/[:.]/g, "-");
    }

    const filename = `${timestamp}.dat`;
    const provider = getStorageProvider();

    await provider.uploadFile(filename, mysteryBlob);

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error("Upload/Encryption error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to encrypt and upload" },
      { status: 500 }
    );
  }
}
