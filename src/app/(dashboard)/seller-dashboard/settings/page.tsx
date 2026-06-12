import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Shield,
  Store,
  User,
  XCircle,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";

export const metadata: Metadata = {
  title: "Settings | Seller Dashboard",
  robots: { index: false, follow: false },
};

export default async function SellerSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const profile = await UserModel.findById(session.user.id)
    .select("name email image role phone city state bio isPhoneVerified")
    .lean();

  if (!profile) return null;

  const isVerified = profile.role === "verifiedSeller";

  const fields = [
    { label: "Name", value: profile.name as string, icon: User },
    { label: "Email", value: profile.email as string, icon: Mail },
    {
      label: "Phone",
      value: (profile.phone as string) || "Not set",
      icon: Phone,
      badge: profile.isPhoneVerified
        ? { label: "Verified", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
        : { label: "Unverified", color: "text-amber-700 bg-amber-50 border-amber-200" },
    },
    {
      label: "Location",
      value: [profile.city, profile.state].filter(Boolean).join(", ") || "Not set",
      icon: MapPin,
    },
    {
      label: "Seller Status",
      value: isVerified ? "Verified Seller" : "Standard Seller",
      icon: Shield,
      badge: isVerified
        ? { label: "Verified", color: "text-emerald-700 bg-emerald-50 border-emerald-200" }
        : { label: "Unverified", color: "text-amber-700 bg-amber-50 border-amber-200" },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Seller Profile Header */}
      <div className="flex items-center gap-5 rounded-2xl border border-black/[0.04] bg-white p-6 shadow-[var(--shadow-card)]">
        {profile.image ? (
          <img
            src={profile.image as string}
            alt={profile.name as string}
            className="size-16 rounded-2xl object-cover ring-2 ring-black/5"
          />
        ) : (
          <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-xl font-bold text-white">
            <Store className="size-7" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-[var(--color-foreground)]">
            {profile.name as string}
          </h2>
          <p className="mt-0.5 text-sm text-[var(--color-foreground-muted)]">
            {profile.bio ? (profile.bio as string) : "Seller on PawHub"}
          </p>
        </div>
      </div>

      {/* Profile Details */}
      <DashboardCard
        title="Seller Profile"
        action={
          <Link
            href="/profile"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-black/10 px-4 text-xs font-semibold text-[var(--color-foreground)] transition hover:bg-[var(--color-secondary)]"
          >
            Edit Profile
          </Link>
        }
      >
        <div className="divide-y divide-black/[0.04]">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="flex items-center gap-4 py-3.5">
                <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-muted)]">
                  <Icon className="size-4 text-[var(--color-foreground-subtle)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-foreground-subtle)]">
                    {field.label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-[var(--color-foreground)]">
                    {field.value}
                  </p>
                </div>
                {"badge" in field && field.badge && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${field.badge.color}`}
                  >
                    {field.badge.label === "Verified" ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <XCircle className="size-3" />
                    )}
                    {field.badge.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </DashboardCard>

      {/* Actions */}
      <DashboardCard title="Account Settings">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-sm transition hover:brightness-110"
          >
            Edit Profile
          </Link>
          {!isVerified && (
            <Link
              href="/seller-verification"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-black/10 px-5 text-sm font-semibold text-[var(--color-foreground)] transition hover:bg-[var(--color-secondary)]"
            >
              Apply for Verification
            </Link>
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
