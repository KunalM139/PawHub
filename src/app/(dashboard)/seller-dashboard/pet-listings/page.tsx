import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { PawPrint, Plus, Pencil, Trash2 } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";

export const metadata: Metadata = {
  title: "Pet Listings | Seller Dashboard",
  robots: { index: false, follow: false },
};

const statusColors: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
};

export default async function SellerPetListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const listings = await ListingModel.find({ sellerId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Pet Listings"
        description="Manage all your pet listings"
        action={
          <Link
            href="/post-listing"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-primary-foreground)] shadow-sm transition hover:brightness-110"
          >
            <Plus className="size-3.5" />
            Add Listing
          </Link>
        }
      >
        {listings.length === 0 ? (
          <EmptyState
            icon={PawPrint}
            title="No pet listings"
            description="Create your first pet listing to start selling on PawHub."
            actionLabel="Add Pet Listing"
            actionHref="/post-listing"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  <th className="pb-3 font-semibold text-[var(--color-foreground-subtle)]">Pet</th>
                  <th className="pb-3 font-semibold text-[var(--color-foreground-subtle)]">Breed</th>
                  <th className="hidden pb-3 font-semibold text-[var(--color-foreground-subtle)] md:table-cell">Price</th>
                  <th className="hidden pb-3 font-semibold text-[var(--color-foreground-subtle)] sm:table-cell">Location</th>
                  <th className="pb-3 font-semibold text-[var(--color-foreground-subtle)]">Status</th>
                  <th className="pb-3 font-semibold text-[var(--color-foreground-subtle)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {listings.map((listing) => {
                  const status = (listing.status as string) ?? "pending";
                  const images = listing.images as string[] | undefined;
                  return (
                    <tr key={String(listing._id)} className="group">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          {images?.[0] ? (
                            <img
                              src={images[0]}
                              alt={listing.title as string}
                              className="size-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--color-surface-muted)]">
                              <PawPrint className="size-4 text-[var(--color-foreground-subtle)]" />
                            </div>
                          )}
                          <span className="font-semibold text-[var(--color-foreground)]">
                            {listing.title as string}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-[var(--color-foreground-muted)]">
                        {listing.breed as string}
                      </td>
                      <td className="hidden py-3.5 pr-4 font-semibold text-[var(--color-foreground)] md:table-cell">
                        ₹{Number(listing.priceInr).toLocaleString("en-IN")}
                      </td>
                      <td className="hidden py-3.5 pr-4 text-[var(--color-foreground-muted)] sm:table-cell">
                        {listing.city as string}, {listing.state as string}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColors[status] ?? statusColors.pending}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/listings/${String(listing._id)}`}
                            className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                          >
                            View
                          </Link>
                        </div>
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
