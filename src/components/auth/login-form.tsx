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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block text-[13px] font-bold text-[var(--color-on-surface)]">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          placeholder="you@example.com"
        />
      </label>

      <label className="block text-[13px] font-bold text-[var(--color-on-surface)]">
        Password
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] px-4 text-[15px] text-[var(--color-on-surface)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          placeholder="At least 8 characters"
        />
      </label>

      {error ? <p className="text-[13px] font-semibold text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full h-12 rounded-xl btn-gradient text-[15px] font-bold tracking-wide text-white shadow-md hover-scale transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      {showGoogleLogin ? (
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] text-[15px] font-bold text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)] mt-4"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      ) : null}

      <div className="flex items-center justify-between text-[13px] font-semibold text-[var(--color-on-surface-variant)] pt-2">
        <Link href="/forgot-password" className="hover:text-[var(--color-primary)] transition-colors">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-[var(--color-primary)] transition-colors">
          Create account
        </Link>
      </div>
    </form>
  );
}
