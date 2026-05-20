import { StorageProvider } from "./types";

interface GitLabFile {
  id: string;
  name: string;
  type: string;
  path: string;
  mode: string;
}

export class GitLabStorageProvider implements StorageProvider {
  private baseUrl: string;
  private projectId: string;
  private token: string;
  private branch: string;

  constructor(overrideProjectId?: string) {
    this.baseUrl = process.env.GITLAB_BASE_URL || "https://gitlab.com";
    this.projectId = overrideProjectId || process.env.GITLAB_PROJECT_ID || "";
    this.token = process.env.GITLAB_TOKEN || "";
    this.branch = process.env.GITLAB_BRANCH || "main";

    if (!this.projectId || !this.token) {
      console.warn("GitLabStorageProvider: GITLAB_PROJECT_ID or GITLAB_TOKEN is not set");
    }
  }

  async uploadFile(name: string, content: Buffer): Promise<void> {
    const filePath = encodeURIComponent(name);
    const url = `${this.baseUrl}/api/v4/projects/${this.projectId}/repository/files/${filePath}`;

    const formData = new FormData();
    formData.append("branch", this.branch);
    formData.append("author_email", "automationbot@image-vault.com");
    formData.append("author_name", "Automation Image vault (bot)");
    formData.append("commit_message", `Add encrypted file: ${name}`);

    const blob = new Blob([new Uint8Array(content)]);
    formData.append("content", blob);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "PRIVATE-TOKEN": this.token,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitLab upload failed: ${response.statusText} - ${error}`);
    }
  }

  async uploadFiles(files: { name: string; content: Buffer }[]): Promise<void> {
    if (files.length === 0) return;

    const url = `${this.baseUrl}/api/v4/projects/${this.projectId}/repository/commits`;

    const actions = files.map((file) => ({
      action: "create",
      file_path: file.name,
      content: file.content.toString("base64"),
      encoding: "base64",
    }));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "PRIVATE-TOKEN": this.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        branch: this.branch,
        commit_message: `Add ${files.length} encrypted files`,
        actions,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitLab batch upload failed: ${response.statusText} - ${error}`);
    }
  }

  async getFile(name: string): Promise<Buffer> {
    const filePath = encodeURIComponent(name);
    const url = `${this.baseUrl}/api/v4/projects/${this.projectId}/repository/files/${filePath}/raw?ref=${this.branch}`;

    const response = await fetch(url, {
      headers: {
        "PRIVATE-TOKEN": this.token,
      },
    });

    if (!response.ok) {
      throw new Error(`GitLab get file failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async listFiles(page: number = 1, perPage: number = 100): Promise<string[]> {
    const url = `${this.baseUrl}/api/v4/projects/${this.projectId}/repository/tree?ref=${this.branch}&per_page=${perPage}&page=${page}`;

    const response = await fetch(url, {
      headers: {
        "PRIVATE-TOKEN": this.token,
      },
    });

    if (!response.ok) {
      console.error("GitLab list files failed:", await response.text());
      return [];
    }

    const files = (await response.json()) as GitLabFile[];
    return files
      .filter((f) => f.type === "blob" && (f.name.endsWith(".dat") || f.name.endsWith(".txt")))
      .map((f) => f.name)
      .reverse();
  }

  async deleteFile(name: string): Promise<void> {
    const filePath = encodeURIComponent(name);
    const url = `${this.baseUrl}/api/v4/projects/${this.projectId}/repository/files/${filePath}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "PRIVATE-TOKEN": this.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        branch: this.branch,
        commit_message: `Delete encrypted file: ${name}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitLab delete failed: ${response.statusText}`);
    }
  }
}
