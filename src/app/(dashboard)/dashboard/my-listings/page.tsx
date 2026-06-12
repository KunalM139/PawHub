import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { ListChecks, Plus } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";

export const metadata: Metadata = {
  title: "My Listings | PawHub",
  robots: { index: false, follow: false },
};

const statusColors: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
};

export default async function MyListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const listings = await ListingModel.find({ sellerId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="space-y-6">
      <DashboardCard
        title="My Listings"
        description={`${listings.length} listing${listings.length !== 1 ? "s" : ""} total`}
        action={
          <Link
            href="/post-listing"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-primary-foreground)] shadow-sm transition hover:brightness-110"
          >
            <Plus className="size-3.5" />
            New Listing
          </Link>
        }
      >
        {listings.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No listings yet"
            description="Post your first pet listing to get started."
            actionLabel="Post Listing"
            actionHref="/post-listing"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  <th className="pb-3 font-semibold text-[var(--color-foreground-subtle)]">
                    Title
                  </th>
                  <th className="pb-3 font-semibold text-[var(--color-foreground-subtle)]">
                    Breed
                  </th>
                  <th className="hidden pb-3 font-semibold text-[var(--color-foreground-subtle)] sm:table-cell">
                    Location
                  </th>
                  <th className="pb-3 font-semibold text-[var(--color-foreground-subtle)]">
                    Status
                  </th>
                  <th className="pb-3 font-semibold text-[var(--color-foreground-subtle)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {listings.map((listing) => {
                  const status = (listing.status as string) ?? "pending";
                  return (
                    <tr key={String(listing._id)} className="group">
                      <td className="py-3.5 pr-4">
                        <span className="font-semibold text-[var(--color-foreground)]">
                          {listing.title as string}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-[var(--color-foreground-muted)]">
                        {listing.breed as string}
                      </td>
                      <td className="hidden py-3.5 pr-4 text-[var(--color-foreground-muted)] sm:table-cell">
                        {listing.city as string}, {listing.state as string}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColors[status] ?? statusColors.pending}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <Link
                          href={`/listings/${String(listing._id)}`}
                          className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
