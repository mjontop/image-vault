import fs from "fs/promises";
import path from "path";
import { StorageProvider } from "./types";

export class LocalStorageProvider implements StorageProvider {
  private storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir || path.join(process.cwd(), "encrypted-storage");
  }

  async uploadFile(name: string, content: Buffer): Promise<void> {
    await fs.mkdir(this.storageDir, { recursive: true });
    await fs.writeFile(path.join(this.storageDir, name), content);
  }

  async getFile(name: string): Promise<Buffer> {
    return await fs.readFile(path.join(this.storageDir, name));
  }

  async listFiles(page: number = 1, perPage: number = 100): Promise<string[]> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      const files = await fs.readdir(this.storageDir);
      const allFiles = files.filter((f) => f.endsWith(".dat"));

      const start = (page - 1) * perPage;
      return allFiles.slice(start, start + perPage);
    } catch {
      return [];
    }
  }

  async deleteFile(name: string): Promise<void> {
    await fs.unlink(path.join(this.storageDir, name));
  }
}
