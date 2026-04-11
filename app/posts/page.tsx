import Link from "next/link";
import { getPosts } from "@/lib/posts";
import { getLocale, t } from "@/lib/i18n";
import { getGuestPosts } from "@/lib/guest-posts";

export default async function PostsPage() {
  const locale = await getLocale();
  const posts = await getPosts();
  const guestPosts = await getGuestPosts();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Blog Posts
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-100 drop-shadow-[0_0_14px_rgba(129,216,208,0.45)]">
          {t(locale, "게시글 목록", "Post List")}
        </h1>
      </div>
      <div className="grid gap-7 md:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            <article className="block h-full min-h-64 cursor-pointer rounded-2xl border border-zinc-700 bg-zinc-800 p-7 shadow-[0_0_22px_rgba(129,216,208,0.12)] transition hover:border-[#81d8d0] hover:bg-zinc-700 hover:shadow-[0_0_34px_rgba(129,216,208,0.28)]">
              <h2 className="mb-3 text-xl font-bold text-zinc-100">{post.title}</h2>
              <p className="mb-5 line-clamp-4 text-base leading-7 text-zinc-300">
                {post.content}
              </p>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  <strong>{t(locale, "작성자", "Author")}:</strong> {post.author}
                </p>
                <p>
                  <strong>{t(locale, "날짜", "Date")}:</strong> {post.date}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-zinc-100 drop-shadow-[0_0_10px_rgba(129,216,208,0.3)]">
          {t(locale, "게스트 게시글", "Guest Posts")}
        </h2>
        {guestPosts.length === 0 ? (
          <p className="text-zinc-400">{t(locale, "아직 게스트 게시글이 없습니다.", "No guest posts yet.")}</p>
        ) : (
          <div className="grid gap-7 md:grid-cols-2">
            {guestPosts.map((post) => (
              <article key={post.id} className="h-full min-h-56 rounded-2xl border border-zinc-700 bg-zinc-800 p-7 shadow-[0_0_22px_rgba(129,216,208,0.12)]">
                <h3 className="mb-3 text-xl font-bold text-zinc-100">{post.title}</h3>
                <p className="mb-5 line-clamp-4 text-base leading-7 text-zinc-300">{post.content}</p>
                <div className="space-y-2 text-sm text-zinc-400">
                  <p>
                    <strong>{t(locale, "작성자", "Author")}:</strong> {post.authorId}
                  </p>
                  <p>
                    <strong>{t(locale, "날짜", "Date")}:</strong> {post.date}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
