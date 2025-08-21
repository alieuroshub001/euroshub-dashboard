// lib/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary';
import type { IAttachment, IUploadOptions, IUploadResponse } from '@/types/common/uploads';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

function toAttachment(resp: UploadApiResponse, uploadedBy?: string): IAttachment {
  return {
    id: resp.asset_id,
    url: resp.url,
    secure_url: resp.secure_url,
    public_id: resp.public_id,
    original_filename: resp.original_filename || resp.public_id,
    filename: resp.public_id.split('/').pop() || resp.public_id,
    format: resp.format || '',
    resource_type: (resp.resource_type as IAttachment['resource_type']) || 'raw',
    type: 'upload',
    bytes: resp.bytes || 0,
    width: resp.width || undefined,
    height: resp.height || undefined,
    folder: resp.folder,
    tags: (resp.tags as string[]) || [],
    created_at: new Date(resp.created_at),
    uploaded_by: uploadedBy,
  };
}

export async function uploadFile(
  filePathOrBuffer: string | Buffer,
  options: IUploadOptions,
  uploadedBy?: string
): Promise<IUploadResponse> {
  const { folder, resource_type = 'raw', allowed_formats, tags } = options;

  const uploadOptions: UploadApiOptions = {
    folder,
    resource_type: (resource_type === 'raw' ? 'auto' : resource_type) as 'auto' | 'image' | 'video' | 'raw',
    allowed_formats,
    tags,
  };

  try {
    const resp = await cloudinary.uploader.upload(
      typeof filePathOrBuffer === 'string' ? filePathOrBuffer : `data:application/octet-stream;base64,${(filePathOrBuffer as Buffer).toString('base64')}`,
      uploadOptions
    );
    return { attachments: [toAttachment(resp, uploadedBy)], failed: [] };
  } catch (err) {
    return {
      attachments: [],
      failed: [
        {
          filename: typeof filePathOrBuffer === 'string' ? filePathOrBuffer : 'buffer',
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      ],
    };
  }
}

export async function uploadFiles(
  files: Array<{ file: string | Buffer; filename?: string }>,
  options: IUploadOptions,
  uploadedBy?: string
): Promise<IUploadResponse> {
  const results = await Promise.all(
    files.map(async ({ file, filename }) => {
      try {
        const resp = await cloudinary.uploader.upload(
          typeof file === 'string' ? file : `data:application/octet-stream;base64,${(file as Buffer).toString('base64')}`,
          { folder: options.folder, resource_type: ((options.resource_type === 'raw' ? 'auto' : options.resource_type) as 'auto' | 'image' | 'video' | 'raw'), tags: options.tags }
        );
        return { success: true as const, data: toAttachment(resp, uploadedBy) };
      } catch (err) {
        return { success: false as const, error: err, filename: filename || (typeof file === 'string' ? file : 'buffer') };
      }
    })
  );

  const attachments: IAttachment[] = [];
  const failed: IUploadResponse['failed'] = [];

  for (const r of results) {
    if (r.success) attachments.push(r.data);
    else failed.push({ filename: r.filename as string, error: r.error instanceof Error ? r.error.message : 'Unknown error' });
  }

  return { attachments, failed };
}

export async function deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto') {
  const rt = resourceType === 'auto' ? 'image' : resourceType;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: rt as any });
  } catch (e) {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' as any });
  }
}

export default cloudinary;

