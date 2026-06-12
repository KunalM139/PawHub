import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";

export const metadata: Metadata = {
  title: "Verification | Seller Dashboard",
  robots: { index: false, follow: false },
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2; description: string }
> = {
  pending: {
    label: "Pending Review",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
    description:
      "Your verification request is under review. Our team will verify your documents within 2-3 business days.",
  },
  approved: {
    label: "Verified",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
    description:
      "Congratulations! You are a verified seller on PawHub. Your listings now display the verified badge.",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
    description:
      "Your verification request was rejected. Please review the requirements and reapply.",
  },
};

export default async function VerificationPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const [profile, verificationRequest] = await Promise.all([
    UserModel.findById(session.user.id).select("role").lean(),
    VerificationRequestModel.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const isVerified = profile?.role === "verifiedSeller";
  const requestStatus = (verificationRequest?.status as string) ?? null;
  const config = requestStatus ? statusConfig[requestStatus] : null;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="relative overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-4">
          <div
            className={`inline-flex size-12 shrink-0 items-center justify-center rounded-2xl ${
              isVerified
                ? "bg-emerald-100 text-emerald-600"
                : "bg-[var(--color-surface-muted)] text-[var(--color-foreground-subtle)]"
            }`}
          >
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)]">
              Seller Verification
            </h2>
            <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
              {isVerified
                ? "You are a verified seller on PawHub."
                : "Get verified to earn trust and display a verified badge on your listings."}
            </p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      {config && (
        <DashboardCard title="Application Status">
          <div className="flex items-start gap-4 rounded-xl border border-black/[0.04] bg-[var(--color-surface-muted)] p-5">
            <div
              className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}
            >
              <config.icon className="size-5" />
            </div>
            <div>
              <span
                className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${config.color}`}
              >
                {config.label}
              </span>
              <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
                {config.description}
              </p>
              {verificationRequest?.createdAt && (
                <p className="mt-2 text-[10px] text-[var(--color-foreground-subtle)]">
                  Applied on{" "}
                  {new Date(
                    verificationRequest.createdAt as string,
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Timeline */}
      <DashboardCard title="Verification Process">
        <div className="space-y-4">
          {[
            {
              step: 1,
              label: "Submit Application",
              description: "Upload your business documents and ID proof",
              done: !!verificationRequest,
            },
            {
              step: 2,
              label: "Document Review",
              description: "Our team reviews your submitted documents",
              done: requestStatus === "approved",
            },
            {
              step: 3,
              label: "Verification Complete",
              description: "Receive your verified seller badge",
              done: isVerified,
            },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4">
              <div
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  item.done
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-[var(--color-surface-muted)] text-[var(--color-foreground-subtle)]"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  item.step
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${
                    item.done
                      ? "text-emerald-700"
                      : "text-[var(--color-foreground)]"
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-[var(--color-foreground-muted)]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Action */}
      {!isVerified && (
        <div className="flex justify-center">
          <Link
            href="/seller-verification"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-soft)] transition hover:brightness-110"
          >
            <FileText className="size-4" />
            {verificationRequest ? "Reapply for Verification" : "Apply for Verification"}
          </Link>
        </div>
      )}
    </div>
  );
}
