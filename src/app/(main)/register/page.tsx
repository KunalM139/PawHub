import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your PawHub account to buy, adopt, or responsibly rehome dogs and cats.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create Your PawHub Account"
      subtitle="Join India's premium pet marketplace to buy, adopt, or responsibly rehome pets."
    >
      <RegisterForm />
    </AuthShell>
  );
}
