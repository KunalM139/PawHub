# 🐾 PawHub
bhfhhhhh
![CI/CD Pipeline](https://github.com/KunalM139/PawHub/actions/workflows/ci.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

PawHub is a premium, full-stack Next.js 15 application designed to provide a comprehensive marketplace for peer-to-peer pet adoption, rehoming, and B2C pet-related e-commerce.

---

## ✨ Features

- **Pet Marketplace**: Adopt or rehome pets with advanced geolocation and breed filtering.
- **E-Commerce Shop**: Browse and purchase pet food, accessories, toys, and grooming products.
- **Real-Time Chat**: Socket.io integrated messaging between buyers and sellers.
- **Seller Dashboard**: Manage listings, products, orders, and inquiries in a unified interface.
- **Admin Moderation**: Comprehensive tools for resolving reports, managing user strikes, and handling verification requests.
- **Trust & Safety**: Automated 3-strike suspension and 5-strike permaban mechanics to protect the community.
- **Secure Authentication**: NextAuth.js (Email/Google) combined with strict IDOR API protections.
- **Rate Limiting**: Upstash Redis protection against brute-force and DDoS attacks.

---

## 🏗️ Architecture Overview

PawHub is a monolithic full-stack React application powered by the Next.js App Router.
Data is persisted in **MongoDB**, binary assets are uploaded to **Cloudinary**, and real-time connectivity is managed by a custom Node.js server wrapping **Socket.io**.

*For a deep dive, read the [System Architecture Guide](./SYSTEM_ARCHITECTURE.md).*

---

## 💻 Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | Next.js 15 (React 19) |
| **Styling** | Tailwind CSS + Vanilla CSS |
| **Database** | MongoDB (Mongoose ORM) |
| **Authentication** | NextAuth.js |
| **Real-Time WebSockets**| Socket.io |
| **Caching / Rate Limits**| Upstash Redis |
| **Image Storage** | Cloudinary |

---

## 📂 Folder Structure

```text
pawhub/
├── src/
│   ├── app/           # Next.js App Router (Pages, Layouts, API Routes)
│   ├── components/    # Reusable React UI Components
│   ├── lib/           # Core utilities (Logger, Errors, Auth, Redis)
│   └── server/        # Mongoose Database Models & DB Connection
├── public/            # Static assets
├── .github/           # CI/CD Workflows
└── server.js          # Custom Node entrypoint for Socket.io integration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB Atlas Cluster
- Upstash Redis Database
- Cloudinary Account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KunalM139/PawHub.git
   cd PawHub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file referencing the variables detailed in the [Deployment Guide](./DEPLOYMENT_GUIDE.md).

4. **Start the Development Server:**
   *Note: Standard `npm run dev` will not boot the WebSockets. You must use the custom socket script.*
   ```bash
   npm run dev:socket
   ```

5. **Visit Application:** Open `http://localhost:3000`

---

## 📖 Complete Documentation Hub

For developers contributing to the project, please review the extensive documentation architecture:

1. [System Architecture](./SYSTEM_ARCHITECTURE.md) - Full system flow and diagrams.
2. [Database Design](./DATABASE_DESIGN.md) - MongoDB schemas, relationships, and indexing.
3. [API Documentation](./API_DOCUMENTATION.md) - REST endpoints, payloads, and expected responses.
4. [Security Architecture](./SECURITY.md) - Threat prevention and IDOR ownership models.
5. [Deployment Guide](./DEPLOYMENT_GUIDE.md) - How to ship this project to production.
6. [Logging & Error Guide](./LOGGING_GUIDE.md) - Requirements for the centralized logger.
7. [CI/CD Guide](./CI_CD_GUIDE.md) - GitHub Actions overview.
8. [Contributing Guidelines](./CONTRIBUTING.md) - GitFlow and PR rules.
9. [Changelog](./CHANGELOG.md) - Version history.

---

## 🗺️ Future Roadmap

- [ ] Transition from Polling to WebHooks for Payment Verification.
- [ ] Implement Playwright E2E Tests in the CI/CD Pipeline.
- [ ] Develop native React Native mobile companion app using existing REST APIs.

---

## 🤝 Contributors

Created and maintained by the PawHub Engineering Team. Refer to [CONTRIBUTING.md](./CONTRIBUTING.md) if you'd like to get involved!

---

## 📄 License

This project is licensed under the MIT License.
