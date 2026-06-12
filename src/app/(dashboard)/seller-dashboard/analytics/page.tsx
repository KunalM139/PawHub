import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { BarChart3, Eye, Heart, MessageSquare, TrendingUp, Users } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { FavoriteModel } from "@/server/models/favorite";
import { ListingModel } from "@/server/models/listing";
import { MessageModel } from "@/server/models/message";

export const metadata: Metadata = {
  title: "Analytics | Seller Dashboard",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const userId = session.user.id;

  const [listingIds, inquiryCount] = await Promise.all([
    ListingModel.find({ sellerId: userId }).select("_id").lean(),
    MessageModel.countDocuments({ receiverId: userId }),
  ]);

  const ids = listingIds.map((l) => l._id);

  const favCount =
    ids.length > 0
      ? await FavoriteModel.countDocuments({ listingId: { $in: ids } })
      : 0;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Listing Views"
          value="—"
          icon={Eye}
          trend="Tracking coming soon"
          gradient="from-sky-500/10 to-blue-500/10"
        />
        <StatCard
          label="Favorites"
          value={favCount}
          icon={Heart}
          trend="From all your listings"
          trendUp={favCount > 0}
          gradient="from-rose-500/10 to-pink-500/10"
        />
        <StatCard
          label="Leads"
          value={inquiryCount}
          icon={MessageSquare}
          trend="Total inquiries received"
          trendUp={inquiryCount > 0}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
      </div>

      {/* Charts Placeholder */}
      <DashboardCard
        title="Performance Trends"
        description="View trends over time for your listing performance"
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/[0.06] bg-[var(--color-surface-muted)]/50 px-6 py-16 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[var(--color-secondary)]">
            <TrendingUp className="size-6 text-[var(--color-foreground-subtle)]" />
          </div>
          <h3 className="mt-4 text-base font-bold text-[var(--color-foreground)]">
            Analytics Charts Coming Soon
          </h3>
          <p className="mt-1.5 max-w-sm text-sm text-[var(--color-foreground-muted)]">
            Detailed charts for listing views, favorites, and lead trends will be
            available here soon.
          </p>
        </div>
      </DashboardCard>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard title="Total Listings" description="All-time listing count">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-12 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
              <BarChart3 className="size-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[var(--color-foreground)]">
                {listingIds.length}
              </p>
              <p className="text-xs text-[var(--color-foreground-muted)]">
                listings published
              </p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title="Buyer Reach" description="Unique buyer interactions">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-12 items-center justify-center rounded-xl bg-sky-500/10">
              <Users className="size-5 text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[var(--color-foreground)]">
                {inquiryCount}
              </p>
              <p className="text-xs text-[var(--color-foreground-muted)]">
                customer messages
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
