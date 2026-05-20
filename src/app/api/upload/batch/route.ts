import { NextRequest, NextResponse } from "next/server";
import { getStorageProvider } from "@core/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const filenames = formData.getAll("filenames") as string[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length !== filenames.length) {
      return NextResponse.json(
        { error: "Number of files and filenames do not match" },
        { status: 400 }
      );
    }

    const storageFiles = await Promise.all(
      files.map(async (file, index) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          name: filenames[index],
          content: Buffer.from(arrayBuffer),
        };
      })
    );

    const provider = getStorageProvider();
    await provider.uploadFiles(storageFiles);

    return NextResponse.json({ success: true, count: files.length });
  } catch (error) {
    console.error("Batch Upload API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload batch" },
      { status: 500 }
    );
  }
}
