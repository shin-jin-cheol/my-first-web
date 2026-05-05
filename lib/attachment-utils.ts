import { promises as fs } from "node:fs";
import path from "node:path";
import { del, put } from "@vercel/blob";

type SupabaseAttachmentOptions = {
  supabaseServiceRoleKey?: string;
  supabaseUploadsBucket: string;
  getSupabaseStorageObjectEndpoint: (pathname?: string) => string;
  getSupabasePublicFileUrl: (storagePath: string) => string;
};

export type AttachmentRuntimeOptions = SupabaseAttachmentOptions & {
  hasSupabaseStorage: boolean;
  hasBlobStorageToken: boolean;
  uploadsDir: string;
};

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function uploadAttachmentToSupabaseStorage(
  file: File,
  uniqueName: string,
  options: SupabaseAttachmentOptions,
): Promise<{ fileUrl: string; fileName: string } | undefined> {
  if (!options.supabaseServiceRoleKey) {
    return undefined;
  }

  const storagePath = `uploads/${uniqueName}`;
  const response = await fetch(
    options.getSupabaseStorageObjectEndpoint(`/${options.supabaseUploadsBucket}/${storagePath}`),
    {
      method: "POST",
      headers: {
        apikey: options.supabaseServiceRoleKey,
        Authorization: `Bearer ${options.supabaseServiceRoleKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: Buffer.from(await file.arrayBuffer()),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return undefined;
  }

  return {
    fileUrl: options.getSupabasePublicFileUrl(storagePath),
    fileName: file.name || uniqueName,
  };
}

function extractSupabaseStoragePath(fileUrl: string | undefined, supabaseUploadsBucket: string) {
  if (!fileUrl) {
    return undefined;
  }

  const publicPrefix = `/storage/v1/object/public/${supabaseUploadsBucket}/`;
  const privatePrefix = `/storage/v1/object/${supabaseUploadsBucket}/`;

  try {
    const parsed = new URL(fileUrl);
    if (parsed.pathname.startsWith(publicPrefix)) {
      return parsed.pathname.slice(publicPrefix.length);
    }

    if (parsed.pathname.startsWith(privatePrefix)) {
      return parsed.pathname.slice(privatePrefix.length);
    }

    return undefined;
  } catch {
    if (fileUrl.startsWith(publicPrefix)) {
      return fileUrl.slice(publicPrefix.length);
    }

    if (fileUrl.startsWith(privatePrefix)) {
      return fileUrl.slice(privatePrefix.length);
    }

    return undefined;
  }
}

async function removeSupabaseAttachment(fileUrl: string | undefined, options: SupabaseAttachmentOptions) {
  if (!options.supabaseServiceRoleKey) {
    return;
  }

  const storagePath = extractSupabaseStoragePath(fileUrl, options.supabaseUploadsBucket);
  if (!storagePath) {
    return;
  }

  try {
    await fetch(options.getSupabaseStorageObjectEndpoint(`/${options.supabaseUploadsBucket}/${storagePath}`), {
      method: "DELETE",
      headers: {
        apikey: options.supabaseServiceRoleKey,
        Authorization: `Bearer ${options.supabaseServiceRoleKey}`,
      },
      cache: "no-store",
    });
  } catch {
    // no-op when deletion fails or file already removed
  }
}

async function ensureUploadsDir(uploadsDir: string) {
  await fs.mkdir(uploadsDir, { recursive: true });
}

async function removeLocalAttachment(fileUrl?: string) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", fileUrl.replace(/^\//, ""));
  try {
    await fs.unlink(filePath);
  } catch {
    // no-op when file does not exist
  }
}

export async function saveAttachmentFile(
  file: File | null | undefined,
  options: AttachmentRuntimeOptions,
): Promise<{ fileUrl: string; fileName: string } | undefined> {
  if (!file || file.size === 0) {
    return undefined;
  }

  const safeName = sanitizeFileName(file.name || "upload.bin");
  const uniqueName = `${Date.now()}-${safeName}`;

  if (options.hasSupabaseStorage) {
    const uploaded = await uploadAttachmentToSupabaseStorage(file, uniqueName, options);
    if (uploaded) {
      return uploaded;
    }
  }

  if (options.hasBlobStorageToken) {
    const blob = await put(`uploads/${uniqueName}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return {
      fileUrl: blob.url,
      fileName: file.name || safeName,
    };
  }

  await ensureUploadsDir(options.uploadsDir);

  const filePath = path.join(options.uploadsDir, uniqueName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, fileBuffer);

  return {
    fileUrl: `/uploads/${uniqueName}`,
    fileName: file.name || safeName,
  };
}

export async function removeAttachment(fileUrl: string | undefined, options: AttachmentRuntimeOptions) {
  if (!fileUrl) {
    return;
  }

  if (options.hasSupabaseStorage) {
    await removeSupabaseAttachment(fileUrl, options);
  }

  if (fileUrl.startsWith("/uploads/")) {
    await removeLocalAttachment(fileUrl);
    return;
  }

  if (options.hasBlobStorageToken) {
    try {
      await del(fileUrl);
    } catch {
      // no-op when deletion fails or file already removed
    }
  }
}

export function normalizeLinkUrl(input?: string): string | undefined {
  if (!input) {
    return undefined;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}