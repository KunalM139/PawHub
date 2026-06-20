const fs = require('fs');
const path = require('path');

const authShellPath = path.resolve('src/components/auth/auth-shell.tsx');
const authShellCode = `import type { ReactNode } from "react";
import Image from "next/image";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <section className="min-h-[100dvh] flex font-outfit home-theme">
      {/* Left side: Image */}
      <div className="hidden lg:block relative w-1/2 bg-[var(--color-surface-container)]">
        <Image
          src="/images/auth-pet.png"
          alt="Cute pet"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-on-surface)]/60 via-transparent to-transparent" />
        <div className="absolute bottom-16 left-16 right-16 text-white">
          <h2 className="font-serif text-[42px] font-extrabold tracking-tight leading-[1.1] drop-shadow-md">Join the PawHub Family</h2>
          <p className="mt-3 text-[18px] font-medium text-white/90 drop-shadow-sm max-w-md">Thousands of happy pets have found their forever homes. Yours is next.</p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20 xl:px-32 bg-[var(--color-surface)]">
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-serif text-[38px] font-black tracking-tight text-[var(--color-on-surface)] leading-tight">{title}</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-on-surface-variant)]">{subtitle}</p>
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </section>
  );
}
`;
fs.writeFileSync(authShellPath, authShellCode, 'utf8');

const loginFormPath = path.resolve('src/components/auth/login-form.tsx');
const loginFormCode = `"use client";

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
`;
fs.writeFileSync(loginFormPath, loginFormCode, 'utf8');

console.log("Successfully redesigned login form and auth shell");
