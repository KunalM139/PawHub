import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { Heart, ExternalLink } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { FavoriteModel } from "@/server/models/favorite";

export const metadata: Metadata = {
  title: "Favorites | PawHub",
  robots: { index: false, follow: false },
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const favorites = await FavoriteModel.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("listingId", "title breed priceInr city state images")
    .lean();

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Favorite Pets"
        description={`${favorites.length} saved pet${favorites.length !== 1 ? "s" : ""}`}
        action={
          <Link
            href="/browse"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-primary-foreground)] shadow-sm transition hover:brightness-110"
          >
            Browse More
          </Link>
        }
      >
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Save pets you like while browsing to see them here."
            actionLabel="Browse Pets"
            actionHref="/browse"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav) => {
              const listing =
                fav.listingId && typeof fav.listingId === "object"
                  ? (fav.listingId as {
                      _id: string;
                      title: string;
                      breed: string;
                      priceInr: number;
                      city: string;
                      state: string;
                      images?: string[];
                    })
                  : null;

              if (!listing) return null;

              return (
                <Link
                  key={String(fav._id)}
                  href={`/listings/${listing._id}`}
                  className="group overflow-hidden rounded-xl border border-black/[0.04] bg-[var(--color-surface-muted)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
                >
                  {listing.images?.[0] ? (
                    <div className="relative h-36 w-full overflow-hidden bg-[var(--color-secondary)]">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-[var(--color-secondary)]">
                      <Heart className="size-8 text-[var(--color-foreground-subtle)]" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="truncate text-sm font-bold text-[var(--color-foreground)]">
                      {listing.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--color-foreground-muted)]">
                      {listing.breed} • {listing.city}, {listing.state}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-[var(--color-primary)]">
                        ₹{Number(listing.priceInr).toLocaleString("en-IN")}
                      </span>
                      <ExternalLink className="size-3.5 text-[var(--color-foreground-subtle)]" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
