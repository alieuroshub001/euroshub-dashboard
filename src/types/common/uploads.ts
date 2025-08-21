//types/common/uploads.ts
// File upload types (Cloudinary)
export interface IAttachment {
  id?: string;
  url: string;
  secure_url: string;
  public_id: string;
  original_filename: string;
  filename: string;
  format: string;
  resource_type: 'image' | 'video' | 'audio' | 'raw';
  type: 'upload';
  bytes: number;
  width?: number;
  height?: number;
  folder?: string;
  tags?: string[];
  created_at: Date;
  uploaded_by?: string;
}

export interface IUploadResponse {
  attachments: IAttachment[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
}

export interface IUploadOptions {
  folder: string;
  resource_type?: 'image' | 'video' | 'audio' | 'raw';
  allowed_formats?: string[];
  max_file_size?: number;
  tags?: string[];
}