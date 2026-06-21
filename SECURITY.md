# Security Architecture

Security is paramount in PawHub. We utilize layered defenses to protect user data, prevent marketplace abuse, and stop denial-of-service vectors.

## 1. Authentication & Session Security
- **JWT Provider**: NextAuth.js issues secure, HTTP-only, encrypted JSON Web Tokens.
- **Perimeter Rejection**: If a user is banned or suspended via the Trust & Safety system, NextAuth (`src/lib/auth.ts`) will outright reject their login attempt—even if they successfully authenticate via Google OAuth.

## 2. Rate Limiting (Upstash Redis)
To prevent brute-force and DDoS attacks, critical endpoints are wrapped in Upstash Redis rate limiters:
- **Login**: 5 requests / 15 minutes / IP
- **Signup**: 3 requests / hour / IP
- **OTP Generation**: 3 requests / 10 minutes
- **Marketplace Reports**: 10 requests / hour

## 3. IDOR Protection (Ownership Checks)
Every single mutating REST API (`PATCH`, `PUT`, `DELETE`) implements strict **Insecure Direct Object Reference** checks. 
Before modifying a listing, product, or order, the server verifies that `document.sellerId.toString() === session.user.id`. 
*(Admins possess a universal bypass to moderate content).*

## 4. Trust & Safety (Automated Moderation)
The marketplace is self-policing via a Strike system:
- Users report malicious entities.
- Admins resolve the report. If they remove the content, the system triggers an automatic Strike against the offender.
- **3 Strikes**: Automatic 7-day account suspension.
- **5 Strikes**: Permanent platform ban.

## 5. Security Logging
Any security violation (e.g., a banned user trying to login, or a rate limit being hit) automatically triggers a `logger.security()` event. In production, this output is ingested by monitoring tools to alert DevOps of active attacks.
