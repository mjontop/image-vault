import { NextRequest, NextResponse } from "next/server";
import { getStorageProvider } from "@core/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Missing encrypted file" }, { status: 400 });
    }

    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const mysteryBlob = Buffer.from(arrayBuffer);

    const provider = getStorageProvider();

    // Storage Step
    await provider.uploadFile(filename, mysteryBlob);

    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload encrypted file" },
      { status: 500 }
    );
  }
}
