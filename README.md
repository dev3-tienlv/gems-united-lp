# GEMS United Headless Frontend

Next.js frontend for the Wix Headless direction (UI fully controlled in code).

## Quick start

1. Copy env file:

```bash
cp .env.example .env.local
```

2. Fill required values in `.env.local`:

- `WIX_HEADLESS_API_KEY`: Wix API key for server-side data requests
- `WIX_HEADLESS_SITE_ID`: Defaults to `b97a67bb-8f38-442d-8e50-69d29744f34c`
- `WIX_CAREERS_COLLECTION_ID`: Wix CMS collection ID for careers
- `WIX_BLOGS_COLLECTION_ID`: Wix CMS collection ID for blogs
- `WIX_INBOX_API_TOKEN`: Wix token with `SCOPE.DC-INBOX.MANAGE-MSGS` (for headless chat bridge)

3. Run dev server:

```bash
npm run dev
```

## Integration behavior

- Homepage reads data via `src/lib/wix-headless.ts`
- If Wix credentials/collection IDs are missing, app falls back to local mock data
- Headless chat widget posts to `POST /api/wix-chat` and forwards visitor messages to Wix Inbox/Chat
- Connection status endpoint:

`GET /api/headless-status`

## Notes

- Keep API key server-only (never expose to client components)
- For production, set env vars in hosting provider (e.g. Vercel project settings)

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
