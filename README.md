# PawHub

PawHub is a premium pet marketplace focused on dogs and cats in India, with trust-first flows for buyers, adopters, and verified sellers.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- MongoDB + Mongoose
- NextAuth (JWT sessions)
- Cloudinary (media uploads)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment file:

```bash
copy .env.example .env.local
```

3. Update values in `.env.local`:

- `NEXTAUTH_SECRET`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (optional, for Google auth)

4. Run development server:

```bash
npm run dev
```

5. Open:

```txt
http://localhost:3000
```

## Quality Checks

```bash
npm run lint
npm run build
```

## Production Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Configure project environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to production domain.
5. Deploy.

## MongoDB Atlas Connection

1. Create an Atlas cluster.
2. Create a database user with read/write permissions.
3. Add your deployment IP or enable network access as required.
4. Copy the Atlas connection string into `MONGODB_URI`.
5. Set `MONGODB_DB_NAME` (default: `pawhub`).

## Deployment Checklist

| Item | Required | Location |
| --- | --- | --- |
| Set production domain in `NEXT_PUBLIC_APP_URL` | Yes | Vercel Environment Variables |
| Set production domain in `NEXTAUTH_URL` | Yes | Vercel Environment Variables |
| Set secure `NEXTAUTH_SECRET` | Yes | Vercel Environment Variables |
| Configure `MONGODB_URI` from Atlas | Yes | Vercel Environment Variables |
| Configure `MONGODB_DB_NAME` | Yes | Vercel Environment Variables |
| Configure Cloudinary keys (`CLOUDINARY_*`) | Yes | Vercel Environment Variables |
| Configure Google OAuth credentials (optional) | Optional | Vercel + Google Cloud Console |
| Add production callback URL for Google auth | Optional | Google Cloud Console |
| Verify `/robots.txt` responds correctly | Yes | Deployed app runtime check |
| Verify `/sitemap.xml` responds correctly | Yes | Deployed app runtime check |
| Run `npm run lint` before release | Yes | CI/local |
| Run `npm run build` before release | Yes | CI/local |

## Sprint 12 SEO + Performance

- Route metadata implemented across key pages.
- Dynamic sitemap available at `/sitemap.xml`.
- Robots policy available at `/robots.txt`.
- Image optimization enabled with Next.js `Image` and Cloudinary remote patterns.
- `poweredByHeader` disabled in Next.js config.

## Notes

- If `MONGODB_URI` is not set during build, sitemap gracefully falls back to static URLs.
- Admin APIs and protected seller workflows require authenticated sessions.
