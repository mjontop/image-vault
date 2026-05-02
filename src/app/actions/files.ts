"use server";

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
