import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  BarChart3,
  Eye,
  Heart,
  ListChecks,
  MessageSquare,
  PawPrint,
  Plus,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { MessageModel } from "@/server/models/message";
import { ReviewModel } from "@/server/models/review";
import { UserModel } from "@/server/models/user";

export const metadata: Metadata = {
  title: "Seller Dashboard | PawHub",
  description: "Manage your pet business on PawHub.",
  robots: { index: false, follow: false },
};

export default async function SellerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const userId = session.user.id;

  const [totalListings, activeListings, totalInquiries, reviews, profile] =
    await Promise.all([
      ListingModel.countDocuments({ sellerId: userId }),
      ListingModel.countDocuments({ sellerId: userId, status: "approved" }),
      MessageModel.countDocuments({ receiverId: userId }),
      ReviewModel.find({ sellerId: userId }).select("rating").lean(),
      UserModel.findById(userId).select("name image role").lean(),
    ]);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + ((r.rating as number) ?? 0), 0) /
          reviews.length
        ).toFixed(1)
      : "N/A";

  const userName = (profile?.name as string) ?? "Seller";
  const isVerified = profile?.role === "verifiedSeller";

  const quickActions = [
    {
      label: "Add Pet Listing",
      description: "Create a new listing for a dog or cat",
      href: "/post-listing",
      icon: Plus,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "View Inquiries",
      description: "Respond to customer messages",
      href: "/seller-dashboard/messages",
      icon: MessageSquare,
      gradient: "from-sky-500 to-blue-600",
    },
    {
      label: "Verification",
      description: isVerified ? "You're verified!" : "Get your verified badge",
      href: "/seller-dashboard/verification",
      icon: ShieldCheck,
      gradient: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-6 -top-6 size-32 rounded-full bg-[var(--color-primary)]/20 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 size-40 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Store className="size-3" />
            Seller Central
            {isVerified && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                <ShieldCheck className="size-2.5" /> Verified
              </span>
            )}
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {userName}!
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/70">
            Manage your pet listings, track performance, and grow your business on
            India&apos;s most trusted pet marketplace.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Listings"
          value={totalListings}
          icon={ListChecks}
          gradient="from-orange-500/10 to-amber-500/10"
        />
        <StatCard
          label="Active Listings"
          value={activeListings}
          icon={PawPrint}
          trend={`${totalListings > 0 ? Math.round((activeListings / totalListings) * 100) : 0}% approved`}
          trendUp={activeListings > 0}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
        <StatCard
          label="Total Inquiries"
          value={totalInquiries}
          icon={MessageSquare}
          gradient="from-sky-500/10 to-blue-500/10"
        />
        <StatCard
          label="Seller Rating"
          value={avgRating}
          icon={Star}
          trend={`${reviews.length} review${reviews.length !== 1 ? "s" : ""}`}
          gradient="from-amber-500/10 to-yellow-500/10"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
            >
              <div
                className={`inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-sm`}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--color-foreground)]">
                {action.label}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                {action.description}
              </p>
              <ArrowRight className="mt-3 size-4 text-[var(--color-primary)] transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>

      {/* Performance Summary */}
      <DashboardCard
        title="Performance Summary"
        description="Quick snapshot of your seller metrics"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--color-surface-muted)] p-4 text-center">
            <Eye className="mx-auto size-5 text-[var(--color-foreground-subtle)]" />
            <p className="mt-2 text-2xl font-extrabold text-[var(--color-foreground)]">—</p>
            <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">Total Views</p>
          </div>
          <div className="rounded-xl bg-[var(--color-surface-muted)] p-4 text-center">
            <Heart className="mx-auto size-5 text-[var(--color-foreground-subtle)]" />
            <p className="mt-2 text-2xl font-extrabold text-[var(--color-foreground)]">—</p>
            <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">Favorites</p>
          </div>
          <div className="rounded-xl bg-[var(--color-surface-muted)] p-4 text-center">
            <BarChart3 className="mx-auto size-5 text-[var(--color-foreground-subtle)]" />
            <p className="mt-2 text-2xl font-extrabold text-[var(--color-foreground)]">—</p>
            <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">Leads</p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
