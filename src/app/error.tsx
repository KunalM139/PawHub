"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Navbar } from "@/components/layout/navbar";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Unhandled Application Error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-[var(--color-background)]">
        <section className="flex min-h-[70vh] items-center justify-center py-20">
          <Container>
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-4xl text-red-600">
                ⚠️
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Something went wrong</h1>
              <p className="mx-auto mt-4 max-w-md text-lg text-[var(--color-foreground-muted)]">
                Our servers encountered an unexpected issue while processing your request. Our engineering team has been notified.
              </p>
              {process.env.NODE_ENV === "development" && (
                <div className="mt-4 rounded-lg bg-gray-900 p-4 text-left text-xs text-red-400 overflow-auto">
                  <p className="font-bold">{error.name}: {error.message}</p>
                </div>
              )}
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => reset()}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-200 px-8 text-sm font-bold text-gray-900 transition-transform hover:bg-gray-300 active:scale-95"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-8 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
