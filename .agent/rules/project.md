# Project Rules

## Project Overview

This project is a Next.js application that combines a personal blog with a member-based guest community board.

- Blog post CRUD
- Guest board post CRUD
- Comment and reply features
- Emoji reactions for posts and comments
- Category and search flows
- File and link attachments
- Member signup, login, account management, and owner-only member administration
- Korean/English text handling
- Supabase-first data and file storage with Vercel Blob or local fallback where existing code supports it

The application uses the App Router. Main routes include:

- `/`: home and latest content
- `/posts`, `/posts/[id]`, `/posts/new`, `/posts/[id]/edit`: blog
- `/guest`, `/guest/[id]`, `/guest/new`, `/guest/[id]/edit`, `/guest/account`: guest board and account
- `/auth/login`, `/auth/signup`: authentication
- `/admin/members`: owner-only member management

## Tech Stack And Versions

Use `package.json` as the source of truth for exact versions.

- Framework: Next.js 16.2.1
- Router: App Router only
- Runtime UI: React 19.2.4, React DOM 19.2.4
- Language: TypeScript 5
- Styling: Tailwind CSS v4, CSS variables, `tw-animate-css`
- Components: shadcn/ui under `components/ui/`, Radix UI, lucide-react
- Backend: Supabase through the project's own HTTP helper pattern
- Supabase packages: `@supabase/supabase-js`, `@supabase/ssr`
- File storage: Supabase Storage, Vercel Blob, local fallback
- Lint: ESLint 9, `eslint-config-next` 16.2.1
- Deployment target: Vercel

## Coding Rules

- Follow Next.js 16.2.1 behavior, not older Next.js assumptions.
- Before changing routing, Server Actions, cache, hydration, config, or other Next.js-sensitive areas, read the relevant local guide under `node_modules/next/dist/docs/`.
- Use App Router conventions only. Routes live under `app/` and are exposed through `page.tsx` or `route.ts`.
- Prefer Server Components by default.
- Add `"use client"` only when a component needs browser APIs, React state, effects, event handlers, or other client-only behavior.
- Use `async/await` for data handling and Server Actions.
- Preserve existing Server Action return shapes and redirect/revalidation flows unless the task explicitly requires changing them.
- Use `next/navigation` for App Router navigation utilities.
- Keep environment access centralized through `lib/env.ts`.
- Use `lib/supabase/http.ts` for Supabase REST requests and follow the existing helper pattern.
- Prefer existing domain modules such as `lib/posts.ts`, `lib/guest-posts.ts`, `lib/auth/*`, `lib/storage.ts`, and `lib/attachment-utils.ts`.
- Use `lib/form-utils.ts` for FormData string and number handling.
- Use `lib/date.ts` for KST date/time handling.
- Use `lib/safe-json.ts` or the existing safe parsing utilities instead of ad hoc JSON parsing.
- Validate and normalize user input before trusting it.
- Keep authorization checks in place and prefer `lib/permissions.ts` for post/comment permissions.
- Define props and return types clearly.
- Do not add new dependencies unless the user explicitly requests them.

## UI And Styling Rules

- Prefer shadcn/ui components from `components/ui/` for buttons, inputs, cards, dialogs, and related primitives.
- Preserve existing layout, spacing, typography, and mobile behavior unless the user asks for UI changes.
- Prefer CSS variables and project tokens over direct Tailwind default colors.
- Keep Tailwind usage compatible with Tailwind CSS v4.
- Use lucide-react icons when an icon is needed and an existing icon fits.
- Avoid unnecessary custom UI primitives when a local shadcn/ui component already exists.

## Authentication Structure

Authentication is built around the project's own signed session cookie flow and Supabase Auth integration.

- Authentication Server Actions live in `app/auth/actions.ts`.
- Core auth/member storage logic lives in `lib/auth/core.ts`.
- Login logic lives in `lib/auth/login.ts`.
- Email OTP signup flow lives in `lib/auth/signup.ts`.
- Session cookie signing and verification live in `lib/auth/session.ts`.
- Account update, password change, and withdrawal flows live in `lib/auth/account.ts`.
- Owner-only member administration lives in `lib/auth/admin.ts`.
- Shared auth exports may be exposed through `lib/auth.ts`.

Email OTP is used for signup/login verification flows where implemented. Supabase Auth handles auth-related remote operations when configured, while the app maintains its own member/session behavior through existing `lib/auth/*` modules. Owner authentication compares the SHA-256 hash of the submitted password with `OWNER_PASSWORD`.

Never remove authentication, session, owner, or permission checks to make a flow simpler.

## Forbidden Patterns

- Do not use `next/router`.
- Do not use Pages Router APIs such as `getServerSideProps`, `getStaticProps`, or `getInitialProps`.
- Do not introduce a `pages/` Router flow.
- Do not add unnecessary `"use client"` directives.
- Do not arbitrarily change Server Action flow or response shapes.
- Do not arbitrarily change existing API response shapes or public function return values.
- Do not scatter environment variable reads across feature files.
- Do not bypass `lib/supabase/http.ts` for Supabase REST work unless there is an existing local pattern for the exact case.
- Do not remove input validation, authentication checks, or authorization checks.
- Do not directly trust user input.
- Do not directly use Tailwind default colors when CSS variables or project tokens should be used.
- Do not make unrelated layout, style, or refactoring changes.
- Do not add dependencies without explicit user approval.
- Do not revert user changes unless the user explicitly asks.

## File Structure Summary

- `app/`: App Router routes, layouts, pages, and route-local Server Actions
- `app/components/`: app-level shared components such as header, layout shell, search UI, theme controls, BGM player, and clocks
- `app/auth/`: login/signup pages and authentication Server Actions
- `app/posts/`: blog list/detail/create/edit routes and post Server Actions
- `app/guest/`: guest board list/detail/create/edit/account routes and guest Server Actions
- `app/admin/members/`: owner-only member administration page
- `components/`: shared components used across routes
- `components/ui/`: shadcn/ui primitives
- `lib/`: domain logic, storage, Supabase, auth, permissions, dates, forms, search, i18n, and safety utilities
- `lib/auth/`: authentication, session, signup/login, account, and admin modules
- `lib/supabase/`: Supabase client and HTTP helpers
- `types/`: shared TypeScript types
- `docs/`: SQL and project/development documents
- `supabase/`: Supabase configuration and migrations
- `public/`: static assets
- `node_modules/next/dist/docs/`: local Next.js 16 documentation to consult before Next-sensitive changes

## Verification

After code changes, run:

```bash
npm run build
npm run lint
```

If PowerShell blocks `npm.ps1`, run:

```bash
cmd /c npm run build
cmd /c npm run lint
```
