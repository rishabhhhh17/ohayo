This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Auth setup

### Required environment variables

Create a `.env.local` file in the project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # change to production URL when deploying
```

`SUPABASE_SERVICE_ROLE_KEY` is used only in `lib/supabase/admin.ts` (server-only).  
Never expose it client-side.

### After adding env vars

Install the `server-only` package (used by the admin client):

```bash
npm install server-only
```

Then run the shadcn component installer to ensure all UI components are present:

```bash
npx shadcn@latest add button input label form card alert sonner
```

### How to find a user's UUID

```sql
SELECT id, email FROM auth.users WHERE email = 'you@example.com';
```

### How to promote a user to admin

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<uuid>';
```

### Route protection summary

| Route        | Rule                                      |
|-------------|-------------------------------------------|
| `/account/*` | Must be authenticated; else `→ /login?next=<path>` |
| `/admin/*`   | Must be authenticated AND `profiles.role = 'admin'`; else 404 |

### Auth flow

1. **Sign up** — `/signup` → email confirmation → `/auth/callback?code=…` → session established  
2. **Sign in** — `/login` (email/password or magic link)  
3. **Forgot password** — `/forgot-password` → email → `/auth/callback?code=…&next=/reset-password` → `/reset-password`  
4. **Sign out** — form action in `/account` or GET `/logout` (testing only)
