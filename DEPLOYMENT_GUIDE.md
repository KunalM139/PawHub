# Deployment Guide

This guide walks you through deploying PawHub to a production environment using **Vercel**.

> [!WARNING]
> **Vercel WebSocket Limitations**
> Vercel's Serverless Functions do not support persistent, long-lived WebSocket connections (which Socket.io relies on for real-time messaging). 
> When deployed to Vercel, the real-time chat feature will gracefully fallback to HTTP Long-Polling. This introduces slight latency compared to native WebSockets but ensures the messaging feature continues to function on serverless infrastructure without breaking.

---

## ☁️ External Services Setup

Before deploying, ensure you have production accounts and credentials for the following:

1. **MongoDB Atlas**: Create a production cluster. Secure it with IP Whitelisting (allow `0.0.0.0/0` if deploying to dynamic IP clouds, but secure via strong passwords).
2. **Upstash Redis**: Create a global database. This is critical for the Rate Limiting and Session caches.
3. **Cloudinary**: Required for all user-generated image/video uploads.
4. **Google Cloud Console**: Configure your OAuth Consent Screen and generate Client ID/Secret. Add your production domain to the authorized redirect URIs (e.g. `https://pawhub.com/api/auth/callback/google`).

---

## 🔒 Environment Variables

You must inject the following variables into your production environment:

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=generate_a_secure_random_string

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pawhub

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_secure_token

# Cloudinary
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
```

---

## 🚀 Deployment Steps (Vercel)

1. Connect your GitHub repository to Vercel.
2. In the Vercel project settings, inject all the Environment Variables listed above.
3. **Build Command**: `npm run build`
4. **Install Command**: `npm install`
5. Click **Deploy**. Vercel will automatically handle the Next.js compilation and optimization.

## ✅ Production Checklist

- [ ] All `console.log()` outputs are stripped (Handled automatically by our `logger.ts` in production mode).
- [ ] Database compound indexes are verified in Atlas to prevent slow queries.
- [ ] NextAuth secret is at least 32 characters long.
- [ ] CI/CD pipeline passes completely (See `CI_CD_GUIDE.md`).
