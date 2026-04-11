import { promises as fs } from "node:fs";
import path from "node:path";

export type GuestPost = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  date: string;
};

type NewGuestPostInput = {
  title: string;
  content: string;
  authorId: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const GUEST_POSTS_FILE = path.join(DATA_DIR, "guest-posts.json");

async function ensureGuestPostsFile() {
  try {
    await fs.access(GUEST_POSTS_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(GUEST_POSTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readGuestPosts(): Promise<GuestPost[]> {
  await ensureGuestPostsFile();
  const raw = await fs.readFile(GUEST_POSTS_FILE, "utf-8");
  return JSON.parse(raw) as GuestPost[];
}

async function writeGuestPosts(posts: GuestPost[]) {
  await fs.writeFile(GUEST_POSTS_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

export async function getGuestPosts(): Promise<GuestPost[]> {
  return readGuestPosts();
}

export async function addGuestPost(input: NewGuestPostInput): Promise<GuestPost> {
  const posts = await readGuestPosts();
  const nextPostId = posts.reduce((maxId, post) => Math.max(maxId, post.id), 0) + 1;

  const post: GuestPost = {
    id: nextPostId,
    title: input.title,
    content: input.content,
    authorId: input.authorId,
    date: new Date().toISOString().slice(0, 10),
  };

  posts.unshift(post);
  await writeGuestPosts(posts);
  return post;
}

export async function deleteGuestPostById(id: number): Promise<boolean> {
  const posts = await readGuestPosts();
  const filtered = posts.filter((post) => post.id !== id);

  if (filtered.length === posts.length) {
    return false;
  }

  await writeGuestPosts(filtered);
  return true;
}
