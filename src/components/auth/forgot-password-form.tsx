"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    setMessage(
      data?.message ??
        "If the email exists in our system, you'll receive reset instructions shortly.",
    );
    setIsLoading(false);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold text-[var(--color-foreground)]">
        Account Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ring)]"
          placeholder="you@example.com"
        />
      </label>

      {message ? <p className="text-sm text-[var(--color-foreground-muted)]">{message}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] transition hover:brightness-110 disabled:opacity-60"
      >
        {isLoading ? "Sending..." : "Send Reset Instructions"}
      </button>

      <p className="text-sm text-[var(--color-foreground-muted)]">
        Back to{" "}
        <Link href="/login" className="font-semibold text-[var(--color-foreground)]">
          Sign in
        </Link>
      </p>
    </form>
  );
}
