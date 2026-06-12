import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleOAuthConfigured } from "@/lib/oauth";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your PawHub account to manage listings, favorites, and messages.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  const showGoogleLogin = isGoogleOAuthConfigured();

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to continue browsing trusted dog and cat listings on PawHub."
    >
      <LoginForm showGoogleLogin={showGoogleLogin} />
    </AuthShell>
  );
}
