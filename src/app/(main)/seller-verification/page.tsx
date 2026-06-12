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
    UserModel.findById(session.user.id).select("role").lean(),
  ]);

  return (
    <section className="py-14">
      <Container>
        <div className="mb-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h1 className="text-3xl font-black tracking-tight">Seller Verification</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--color-foreground-muted)]">
            Apply with identity and business documents to unlock verified seller trust badge.
          </p>
        </div>

        <VerificationForm
          initialRequest={request ? JSON.parse(JSON.stringify(request)) : null}
          initialRole={(user?.role as "user" | "verifiedSeller" | "admin" | undefined) ?? "user"}
        />
      </Container>
    </section>
  );
}
