import { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local";
import { GitLabStorageProvider } from "./gitlab";

export interface StorageConfig {
  projectId?: string;
}

export function getStorageProvider(config?: StorageConfig): StorageProvider {
  const type = process.env.STORAGE_PROVIDER || "local";

  switch (type.toLowerCase()) {
    case "gitlab":
      return new GitLabStorageProvider(config?.projectId);
    case "local":
    default:
      return new LocalStorageProvider();
  }
}
