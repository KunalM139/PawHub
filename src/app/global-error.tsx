"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Global boundary caught error", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-4xl text-red-600">
            ❌
          </div>
          <h2 className="text-3xl font-black">Critical Application Error</h2>
          <p className="mt-4 text-gray-600">
            A fatal error prevented the application from loading properly.
          </p>
          <button
            onClick={() => reset()}
            className="mt-8 rounded-xl bg-[var(--color-primary)] px-8 py-3 text-sm font-bold text-white transition hover:scale-105"
          >
            Attempt Recovery
          </button>
        </div>
      </body>
    </html>
  );
}
