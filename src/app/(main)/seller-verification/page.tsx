import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { VerificationForm } from "@/components/seller-verification/verification-form";
import { Container } from "@/components/ui/container";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";

export const metadata: Metadata = {
  title: "Seller Verification",
  description: "Submit identity and business details to get verified seller status on PawHub.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SellerVerificationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <section className="py-14">
        <Container>
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h1 className="text-3xl font-black tracking-tight">Seller Verification</h1>
            <p className="mt-3 text-sm text-[var(--color-foreground-muted)]">
              Please login to submit your verification request.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  await connectToDatabase();

    const [request, user] = await Promise.all([
    VerificationRequestModel.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean(),
    UserModel.findById(session.user.id).select("role storeName").lean(),
  ]);

  return (
    <div className="font-outfit home-theme bg-[var(--color-surface)] text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] min-h-screen">
      <main className="max-w-[1280px] mx-auto px-6 py-[120px] flex flex-col gap-8">
      {/* Header Banner */}
      <div className="glass-panel rounded-[2rem] p-8 md:p-[32px] relative overflow-hidden card-shadow">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--color-primary-fixed-dim)] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-[var(--color-secondary-fixed-dim)] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-[36px] md:text-[56px] leading-[1.1] tracking-[-0.02em] font-bold text-[var(--color-on-surface)] mb-4">
              <span className="text-gradient">Seller</span> Verification
            </h1>
            <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">
              Apply with identity and business documents to unlock the verified seller trust badge. Ensure a safer community by confirming your details.
            </p>
          </div>
          <div className="hidden md:flex items-center justify-center w-24 h-24 bg-[var(--color-surface-container-lowest)] rounded-full shadow-lg">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
        </div>
      </div>

      <VerificationForm
        initialRequest={request ? JSON.parse(JSON.stringify(request)) : null}
        initialRole={(user?.role as "user" | "verifiedSeller" | "admin" | undefined) ?? "user"}
        initialStoreName={user?.storeName || ""}
      />
    </main>
    </div>
  );
}
