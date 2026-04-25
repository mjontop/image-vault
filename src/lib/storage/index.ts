import { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local";
import { GitLabStorageProvider } from "./gitlab";

export function getStorageProvider(): StorageProvider {
  const type = process.env.STORAGE_PROVIDER || "local";

  switch (type.toLowerCase()) {
    case "gitlab":
      return new GitLabStorageProvider();
    case "local":
    default:
      return new LocalStorageProvider();
  }
}
