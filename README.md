This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- Guest post comments with KST timestamps
- Member authentication
- Server-side blog management

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase Member Migration

Member accounts can be stored in Supabase for persistent storage across instance restarts.

1. Create table with [docs/supabase-members.sql](docs/supabase-members.sql).
2. Set environment variables in Vercel (or local `.env.local`):
	- `SUPABASE_URL`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `SUPABASE_MEMBERS_TABLE` (optional, default: `members`)
3. Deploy again.

Behavior:

- When Supabase env vars are set, member read/write uses Supabase first.
- On first access, if Supabase is empty and legacy storage has members, existing members are copied once to Supabase.

## Supabase Content Migration

Posts and guest posts can also be stored in Supabase for persistent storage.

1. Create tables with [docs/supabase-content.sql](docs/supabase-content.sql).
2. Set environment variables:
	- `SUPABASE_POSTS_TABLE` (optional, default: `posts`)
	- `SUPABASE_GUEST_POSTS_TABLE` (optional, default: `guest_posts`)
	- `SUPABASE_POST_COMMENTS_TABLE` (optional, default: `post_comments`)
3. Deploy again.

Behavior:

- When Supabase env vars are set, `lib/posts.ts` and `lib/guest-posts.ts` use Supabase first.
- On first access, if Supabase tables are empty and legacy data exists, existing records are copied once to Supabase.
