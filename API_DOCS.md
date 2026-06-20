# API Documentation

All API routes in PawHub live under the `/api/` prefix.

## General Response Structure

Responses generally follow a standard JSON shape.
Success:
```json
{
  "data_key": {},
  "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```
Error:
```json
{
  "message": "Human readable error description",
  "issues": {
    "fieldErrors": { "email": ["Invalid email"] }
  }
}
```

## Authentication

### `POST /api/auth/register`
Register a new user. Rate limited.
- **Body**: `{ name, email, password, role }`

### `POST /api/otp/send` & `POST /api/otp/verify`
Handles phone number OTP verification via mock simulation. Rate limited.

## Marketplace (Pets)

### `GET /api/listings`
Fetch paginated public pet listings.
- **Query Params**: `page`, `limit`, `petCategory`, `city`, `breed`, `minPrice`, `maxPrice`, `search`
- **Response**: `{ listings: [], pagination: {} }`

### `POST /api/listings`
Create a new listing. Requires `isPhoneVerified` true.
- **Body**: Listing payload (title, breed, description, etc).

## E-Commerce (Shop)

### `GET /api/products`
Fetch paginated public products.
- **Query Params**: `page`, `limit`, `category`, `search`, `sort`
- **Response**: `{ products: [], pagination: {} }`

### `POST /api/products`
Create a new product. Requires `role` = `verifiedSeller` or `admin`.

## Orders & Checkout

### `GET /api/orders`
Fetch user orders.
- **Query Params**: `viewAs` ("buyer" or "seller"), `page`, `limit`
- **Response**: `{ orders: [], pagination: {} }`

### `POST /api/checkout`
Processes a checkout request. Reduces product stock, creates orders, clears cart, and creates notifications. Rate limited.
- **Body**: `{ shippingAddress, contactPhone, paymentMethod }`

### `POST /api/payments/create-order`
Initiates a Razorpay payment order.
- **Body**: `{ amount }`

### `POST /api/payments/verify`
Verifies a Razorpay HMAC signature.
- **Body**: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`

## Chat & Communications

### `GET /api/messages`
Fetch chat history.
- **Query Params**: `listingId`, `page`, `limit`

### `POST /api/messages`
Send a new message. Emits Socket.io event if online. Rate limited.
- **Body**: `{ receiverId, listingId, body }`

## Utilities

### `POST /api/uploads/pet-media`
Handles multipart form data for uploading images and videos to Cloudinary.
- **Returns**: `{ secureUrl: string }`
