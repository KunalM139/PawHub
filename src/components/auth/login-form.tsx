"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn, useSession } from "next-auth/react";

type LoginFormProps = {
  showGoogleLogin?: boolean;
};

export function LoginForm({ showGoogleLogin = false }: LoginFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result || result.error || !result.ok) {
      setError("Invalid email or password.");
      setIsLoading(false);
      return;
    }

    const updated = await updateSession();
    const userType = updated?.user?.userType;
    const callbackUrl = userType === "seller" ? "/seller-dashboard" : "/dashboard";

    router.push(callbackUrl);
    router.refresh();
  }

  async function handleGoogleLogin() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold text-[var(--color-foreground)]">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ring)]"
          placeholder="you@example.com"
        />
      </label>

      <label className="block text-sm font-semibold text-[var(--color-foreground)]">
        Password
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-ring)]"
          placeholder="At least 8 characters"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] transition hover:brightness-110 disabled:opacity-60"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      {showGoogleLogin ? (
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-[var(--color-foreground)] transition hover:bg-[var(--color-secondary)]"
        >
          Continue with Google
        </button>
      ) : null}

      <div className="flex items-center justify-between text-sm text-[var(--color-foreground-muted)]">
        <Link href="/forgot-password" className="hover:text-[var(--color-foreground)]">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-[var(--color-foreground)]">
          Create account
        </Link>
      </div>
    </form>
  );
}
