# PawHub

PawHub is a premium, full-stack Next.js 15 application designed to provide a comprehensive marketplace for pet adoption, rehoming, and pet-related e-commerce.

## Features

- **Pet Marketplace**: Adopt, rehome, or purchase pets. Advanced filtering and search functionality.
- **E-Commerce Shop**: Browse and buy pet food, accessories, toys, and grooming products.
- **Real-Time Chat**: Socket.io integrated messaging between buyers and sellers.
- **Seller Dashboard**: Manage listings, products, orders, messages, and profile.
- **Admin Dashboard**: Comprehensive moderation tools for users, listings, products, and verification requests.
- **Secure Authentication**: NextAuth.js integration with JWT sessions and robust role-based access control (RBAC).
- **Rate Limiting**: Upstash Redis rate limiting to protect endpoints against abuse.
- **Payment Integration**: Razorpay setup (Test Mode) for secure checkouts.
- **Notifications**: In-app notifications for order updates and new messages.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB (Mongoose)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS & Vanilla CSS
- **Real-Time**: Socket.io (Custom Next.js Server)
- **Storage**: Cloudinary (Image & Video hosting)
- **Caching & Rate Limiting**: Upstash Redis
- **Payments**: Razorpay

## Getting Started

### Prerequisites

Ensure you have Node.js (v20+) installed.

### Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (Note: use `npm run dev:socket` to run the custom socket server):
   ```bash
   npm run dev:socket
   ```
3. Open `http://localhost:3000` in your browser.

## Documentation

For a deeper dive into the system's inner workings, refer to the following documentation files:

- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Database Design](./DATABASE_DESIGN.md)
- [API Documentation](./API_DOCS.md)

## License

MIT License
