# API Documentation

PawHub utilizes Next.js App Router API Route Handlers. All endpoints strictly consume and return standard JSON.

**Standard Response Schema:**
```json
// Success
{ "success": true, "data": { ... } }

// Failure
{ "success": false, "message": "Human readable error", "errorCode": "AUTH_ERROR" }
```
*(Note: Older legacy endpoints may currently omit the `success` wrapper. See `LOGGING_GUIDE.md` for migration guidelines).*

---

## 🔐 Authentication & AuthZ

### `POST /api/auth/register`
- **Description**: Creates a new user account.
- **Body**: `{ name, email, password, phone, city, state, userIntent }`
- **Rate Limit**: 5 requests / hour / IP
- **Response**: `201 Created`

### `POST /api/auth/otp/send`
- **Description**: Triggers SMS OTP for phone verification.
- **Body**: `{ phone }`
- **Response**: `200 OK`

---

## 🐾 Pet Marketplace

### `GET /api/listings`
- **Description**: Fetches available pet listings. Supports complex pagination and filtering.
- **Query Params**: `type`, `city`, `breed`, `minPrice`, `maxPrice`, `search`, `page`, `limit`
- **Response**: `200 OK` with Array of Listings.

### `POST /api/listings`
- **Description**: Creates a new listing.
- **Auth Required**: Yes (Session required)
- **Body**: FormData or JSON payload of pet details.
- **Response**: `201 Created`

### `PATCH /api/listings/[listingId]`
- **Description**: Updates a listing (e.g., mark as adopted).
- **Auth Required**: Yes (Strict Ownership IDOR verification applied).

---

## 🛍️ E-Commerce

### `GET /api/products`
- **Description**: Fetch inventory.
- **Query Params**: `category`, `search`, `sellerId`

### `POST /api/checkout`
- **Description**: Initializes a Razorpay checkout session and creates a pending Order.
- **Auth Required**: Yes
- **Body**: `{ cartItems: [{ productId, quantity }] }`
- **Response**: `200 OK` with Razorpay `order_id`.

---

## 🚨 Trust & Safety

### `POST /api/reports`
- **Description**: Submits a violation report for any polymorphic entity.
- **Auth Required**: Yes
- **Body**: `{ entityType, entityId, reportedUserId, reason, details }`
- **Response**: `201 Created`

### `PATCH /api/admin/reports`
- **Description**: Resolves a report and triggers the automated Strike System.
- **Auth Required**: Yes (Admin Role ONLY)
- **Body**: `{ reportId, action ("warn" | "strike" | "ban" | "dismiss"), resolutionNote }`

---

## 💬 Messaging

### `GET /api/messages`
- **Description**: Fetches chat history between current user and a target.
- **Query Params**: `userId`, `listingId`
- **Auth Required**: Yes

*(Note: Real-time messaging transmission is handled exclusively via WebSocket / Socket.io on the custom Node server, not via standard REST polling).*
