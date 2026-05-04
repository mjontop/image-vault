"use server";

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
