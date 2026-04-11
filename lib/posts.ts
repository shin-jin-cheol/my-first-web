import { promises as fs } from "node:fs";
import path from "node:path";
import { del, put } from "@vercel/blob";

export type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  linkUrl?: string;
  fileUrl?: string;
  fileName?: string;
};

type NewPostInput = {
  title: string;
  content: string;
  author: string;
  linkUrl?: string;
  attachmentFile?: File | null;
};

type UpdatePostInput = {
  title: string;
  content: string;
  author: string;
  linkUrl?: string;
  attachmentFile?: File | null;
  removeAttachment?: boolean;
};

const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const initialPosts: Post[] = [
  {
    id: 1,
    title: "Next.js 16 App Router 시작하기",
    content:
      "Next.js 16에서 App Router를 사용하는 방법과 기본 구조에 대해 알아봅니다. 새로운 파일 기반 라우팅 시스템과 Server Component의 장점을 살펴봅시다.",
    author: "신진철",
    date: "2026-04-05",
  },
  {
    id: 2,
    title: "Tailwind CSS 4로 스타일링하기",
    content:
      "Tailwind CSS 4의 새로운 기능들을 소개합니다. @import 문법과 더욱 강력해진 유틸리티 클래스를 활용하여 빠르고 효율적인 스타일링을 경험해보세요.",
    author: "신진철",
    date: "2026-04-03",
  },
  {
    id: 3,
    title: "TypeScript 타입 안전성 높이기",
    content:
      "TypeScript를 사용하면서 타입 안전성을 최대한 활용하는 팁들을 공유합니다. 제네릭, 유틸리티 타입, 타입 가드 등을 통해 더욱 견고한 코드를 작성할 수 있습니다.",
    author: "신진철",
    date: "2026-03-31",
  },
];

async function ensurePostsFile() {
  try {
    await fs.access(POSTS_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(POSTS_FILE, JSON.stringify(initialPosts, null, 2), "utf-8");
  }
}

async function readPosts(): Promise<Post[]> {
  await ensurePostsFile();
  const raw = await fs.readFile(POSTS_FILE, "utf-8");
  return JSON.parse(raw) as Post[];
}

async function writePosts(posts: Post[]) {
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function ensureUploadsDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

async function saveAttachmentFile(file?: File | null): Promise<{ fileUrl: string; fileName: string } | undefined> {
  if (!file || file.size === 0) {
    return undefined;
  }

  const safeName = sanitizeFileName(file.name || "upload.bin");
  const uniqueName = `${Date.now()}-${safeName}`;

  // In production (or when token is configured), upload to Vercel Blob for persistent storage.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${uniqueName}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return {
      fileUrl: blob.url,
      fileName: file.name || safeName,
    };
  }

  await ensureUploadsDir();

  const filePath = path.join(UPLOADS_DIR, uniqueName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, fileBuffer);

  return {
    fileUrl: `/uploads/${uniqueName}`,
    fileName: file.name || safeName,
  };
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

async function removeAttachment(fileUrl?: string) {
  if (!fileUrl) {
    return;
  }

  if (fileUrl.startsWith("/uploads/")) {
    await removeLocalAttachment(fileUrl);
    return;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(fileUrl);
    } catch {
      // no-op when deletion fails or file already removed
    }
  }
}

function normalizeLinkUrl(input?: string): string | undefined {
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

export async function getPosts(): Promise<Post[]> {
  return readPosts();
}

export async function getPostById(id: number): Promise<Post | undefined> {
  const posts = await readPosts();
  return posts.find((post) => post.id === id);
}

export async function addPost(input: NewPostInput): Promise<Post> {
  const posts = await readPosts();
  const nextPostId = posts.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1;
  const attachment = await saveAttachmentFile(input.attachmentFile);

  const post: Post = {
    id: nextPostId,
    title: input.title,
    content: input.content,
    author: input.author,
    date: new Date().toISOString().slice(0, 10),
    linkUrl: normalizeLinkUrl(input.linkUrl),
    fileUrl: attachment?.fileUrl,
    fileName: attachment?.fileName,
  };

  posts.unshift(post);
  await writePosts(posts);
  return post;
}

export async function deletePostById(id: number): Promise<boolean> {
  const posts = await readPosts();
  const targetPost = posts.find((post) => post.id === id);
  const filtered = posts.filter((post) => post.id !== id);

  if (filtered.length === posts.length) {
    return false;
  }

  await removeAttachment(targetPost?.fileUrl);

  await writePosts(filtered);
  return true;
}

export async function updatePostById(id: number, input: UpdatePostInput): Promise<Post | undefined> {
  const posts = await readPosts();
  const index = posts.findIndex((post) => post.id === id);

  if (index === -1) {
    return undefined;
  }

  const currentPost = posts[index];
  const attachment = await saveAttachmentFile(input.attachmentFile);

  let nextFileUrl = currentPost.fileUrl;
  let nextFileName = currentPost.fileName;

  if (input.removeAttachment) {
    await removeAttachment(currentPost.fileUrl);
    nextFileUrl = undefined;
    nextFileName = undefined;
  }

  if (attachment) {
    await removeAttachment(currentPost.fileUrl);
    nextFileUrl = attachment.fileUrl;
    nextFileName = attachment.fileName;
  }

  const updatedPost: Post = {
    ...currentPost,
    title: input.title,
    content: input.content,
    author: input.author,
    linkUrl: normalizeLinkUrl(input.linkUrl),
    fileUrl: nextFileUrl,
    fileName: nextFileName,
  };

  posts[index] = updatedPost;
  await writePosts(posts);
  return updatedPost;
}
