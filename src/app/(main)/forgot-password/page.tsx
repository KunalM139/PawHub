import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request password reset instructions for your PawHub account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your account email and we'll send reset instructions if an account exists."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
