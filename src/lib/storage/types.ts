export interface StorageFile {
  name: string;
  content: Buffer;
}

export interface StorageProvider {
  uploadFile(name: string, content: Buffer): Promise<void>;
  getFile(name: string): Promise<Buffer>;
  listFiles(page?: number, perPage?: number): Promise<string[]>;
  deleteFile(name: string): Promise<void>;
}
