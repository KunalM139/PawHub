# PawHub Logging & Error Handling Guide

This guide details the centralized logging and standardized error handling methodologies required when contributing to the PawHub codebase.

---

## 1. Centralized Logger

All logging must route through the `src/lib/logger.ts` module. **Do not use `console.log()` or `console.error()` anywhere in the application.**

### Usage

```typescript
import { logger } from "@/lib/logger";

// Standard Information
logger.info("User completed checkout successfully", { orderId: "1234", amount: 500 });

// Non-Critical Warnings
logger.warn("External API rate limit approaching", { endpoint: "stripe" });

// Exceptions & Failures
try {
  await performAction();
} catch (error) {
  logger.error("Failed to perform critical action", error, { userId: "5678" });
}

// Trust & Safety / Security Events
logger.security("Banned user attempted login", { userId: "9999", ip: "192.168.1.1" });
```

### Auto-Redaction (Security)
The logger automatically intercepts and strips sensitive keys (`password`, `token`, `otp`, `creditcard`, `api_key`) from your context objects before writing them to the console or log aggregator. **You should still proactively avoid passing raw secrets to the logger.**

### Environment Behavior
- **Development**: Outputs color-coded, human-readable strings to standard out, including full stack traces for errors.
- **Production**: Outputs strict JSON payloads, consumable by platforms like Datadog or ELK. Stack traces are omitted to prevent leakage unless explicitly required by fatal process errors.

---

## 2. Global Error Classes

PawHub defines a strict taxonomy of errors in `src/lib/errors.ts`. When an exception occurs within business logic, you should throw the specific error class rather than a generic `Error`.

### Available Classes

- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `RateLimitError` (429)
- `InternalServerError` (500)

### Example

```typescript
import { ValidationError, NotFoundError } from "@/lib/errors";

export async function processListing(listingId: string) {
  if (!isValidId(listingId)) {
    throw new ValidationError("Invalid listing ID provided");
  }

  const listing = await ListingModel.findById(listingId);
  if (!listing) {
    throw new NotFoundError("Listing not found in database");
  }
}
```

---

## 3. UI Error Handling

### Toasts
Do not use `window.alert()`. Use the established Toast system to surface user-facing errors gracefully.
*Example:* When an API returns `{ success: false, message: "Invalid email" }`, map that `message` directly into a negative Toast.

### Error Pages
We have global error boundaries wrapping the application:
1. `src/app/not-found.tsx` (404)
2. `src/app/forbidden/page.tsx` (403)
3. `src/app/error.tsx` (500 Boundary)
4. `src/app/global-error.tsx` (Fatal Root Boundary)

Never expose stack traces directly into the UI components. The boundaries automatically format errors depending on `NODE_ENV`.
