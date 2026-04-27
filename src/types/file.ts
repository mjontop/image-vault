export type UploadStatus = "pending" | "uploading" | "encrypting" | "completed" | "error-upload" | "error-encrypt";

export interface FileState {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  previewUrl: string;
}

export interface Stats {
  total: number;
  uploaded: number;
  encrypted: number;
  failedUpload: number;
  failedEncrypt: number;
  overallProgress: number;
}