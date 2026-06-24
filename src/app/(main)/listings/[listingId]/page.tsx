import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";
import { notFound } from "next/navigation";
import { cache } from "react";

import { RequestAction } from "@/components/listings/request-action";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ListingDetailGallery } from "@/components/listings/listing-detail-gallery";
import { ReportListingForm } from "@/components/listings/report-listing-form";
import { ReviewForm } from "@/components/listings/review-form";
import { Container } from "@/components/ui/container";
import { VerifiedSellerBadge } from "@/components/verified-seller-badge";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { FavoriteModel } from "@/server/models/favorite";
import { ListingModel } from "@/server/models/listing";
import { ReviewModel } from "@/server/models/review";
import { UserModel } from "@/server/models/user";
import { InterestRequestModel } from "@/server/models/interest-request";

type ListingDetailPageProps = {
  params: Promise<{ listingId: string }>;
};

const getListingById = cache(async (listingId: string) => {
  if (!Types.ObjectId.isValid(listingId)) {
    return null;
  }

  await connectToDatabase();

  return ListingModel.findOne({
    _id: listingId,
    isActive: true,
    status: "approved",
  }).lean();
});

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { listingId } = await params;
  const listing = await getListingById(listingId);

  if (!listing) {
    return {
      title: "Listing Not Found",
      description: "This listing is not available.",
    };
  }

  return {
    title: listing.title,
    description: `${listing.breed} in ${listing.city}, ${listing.state}. ${listing.description.slice(0, 120)}...`,
    openGraph: {
      title: listing.title,
      description: `${listing.breed} • ${listing.city}, ${listing.state}`,
      images: listing.images?.[0] ? [{ url: listing.images[0] }] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { listingId } = await params;

  const listing = await getListingById(listingId);

  if (!listing) {
    notFound();
  }

  await connectToDatabase();

  const [seller, reviews, relatedListings] = await Promise.all([
    UserModel.findById(listing.sellerId).select("name image role createdAt").lean(),
    ReviewModel.find({ listingId: listing._id, isVisible: true })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
    ListingModel.find({
      _id: { $ne: listing._id },
      petCategory: listing.petCategory,
      isActive: true,
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
      : 0;

  const session = await getServerSession(authOptions);

  const isFavorited = session?.user?.id
    ? Boolean(
        await FavoriteModel.findOne({
          userId: session.user.id,
          listingId: listing._id,
        })
          .select("_id")
          .lean(),
      )
    : false;

  const existingRequest = session?.user?.id
    ? await InterestRequestModel.findOne({
        listingId: listing._id,
        buyerId: session.user.id,
      })
        .select("status")
        .lean()
    : null;

  const whatsappMessage = encodeURIComponent(
    `Hi, I am interested in your PawHub listing: ${listing.title}`,
  );

  return (
    <section className="py-14">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-black/5 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <ListingDetailGallery images={listing.images ?? []} title={listing.title} />

            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-foreground-muted)]">
                <span className="rounded-full bg-[var(--color-surface-muted)] px-2 py-1 uppercase">
                  {listing.listingType}
                </span>
                <span className="rounded-full bg-[var(--color-surface-muted)] px-2 py-1 uppercase">
                  {listing.petCategory}
                </span>
                <span className="rounded-full bg-[var(--color-surface-muted)] px-2 py-1 uppercase">
                  {listing.gender}
                </span>
                <span className="rounded-full bg-[var(--color-surface-muted)] px-2 py-1">
                  {listing.ageInMonths} months
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight">{listing.title}</h1>
              <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
                {listing.breed} • {listing.city}, {listing.state}
              </p>

              {listing.listingType === "sale" ? (
                <p className="mt-4 text-3xl font-black text-slate-900 tracking-tight">
                  ₹{Number(listing.priceInr).toLocaleString("en-IN")}
                </p>
              ) : (
                <p className="mt-4 text-2xl font-black text-orange-600 tracking-tight">
                  Free (Rehome)
                </p>
              )}

              <p className="mt-4 text-sm leading-7 text-[var(--color-foreground-muted)]">
                {listing.description}
              </p>
            </div>
          </article>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-purple-100 bg-purple-50/50 p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-purple-950">
                {listing.listingType === "sale" ? "Seller Profile" : "Owner Profile"}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
                {seller?.name ?? "PawHub Seller"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {listing.isVerifiedSeller ? (
                  <VerifiedSellerBadge withText size="sm" />
                ) : (
                  <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 font-semibold">
                    User
                  </span>
                )}
                {listing.isPhoneVerified ? (
                  <span className="rounded-full bg-[#e8fff0] px-2.5 py-1 font-semibold text-[#176a37]">
                    Phone Verified
                  </span>
                ) : null}
                <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 font-semibold">
                  {reviews.length} reviews
                </span>
                {reviews.length > 0 ? (
                  <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 font-semibold">
                    {averageRating.toFixed(1)} / 5
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {session?.user?.id ? (
                  String(listing.sellerId) === session.user.id ? (
                    <div className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-surface-muted)] px-4 text-sm font-semibold text-[var(--color-foreground-muted)]">
                      Your Listing
                    </div>
                  ) : (
                    <RequestAction
                      listingId={String(listing._id)}
                      initialStatus={(existingRequest?.status as any) || null}
                      receiverId={String(listing.sellerId)}
                      receiverName={seller?.name ?? (listing.listingType === "sale" ? "Seller" : "Owner")}
                      currentUserId={session.user.id}
                      chatButtonText={listing.listingType === "sale" ? "Chat with Seller" : "Chat with Owner"}
                      requestButtonText={listing.listingType === "sale" ? "Request to Buy" : "Request to Adopt"}
                    />
                  )
                ) : (
                  <Link
                    href={`/login?callbackUrl=/listings/${String(listing._id)}`}
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] transition hover:brightness-110"
                  >
                    Login to Chat
                  </Link>
                )}
                <a
                  href={`https://wa.me/?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold"
                >
                  WhatsApp
                </a>
                {session?.user?.id ? (
                  <FavoriteButton
                    listingId={String(listing._id)}
                    initialFavorited={isFavorited}
                  />
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold"
                  >
                    Login to Save Favorite
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-amber-50/30 p-6 shadow-sm">
              <h2 className="text-xl font-black tracking-tight text-amber-950">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--color-foreground-muted)]">
                  No reviews yet for this listing.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {reviews.slice(0, 4).map((review) => (
                    <article
                      key={String(review._id)}
                      className="rounded-2xl bg-white/60 p-4 border border-amber-100"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-subtle)]">
                        Rating: {review.rating}/5
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
                        {review.comment}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              {session?.user?.id ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Only the user who adopted or purchased this pet can leave a rating and review.
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--color-foreground-muted)]">
                  Login to add a rating and review.
                </p>
              )}

              {session?.user?.id ? (
                <ReportListingForm listingId={String(listing._id)} />
              ) : (
                <p className="mt-4 text-sm text-[var(--color-foreground-muted)]">
                  Login to report suspicious or fake listings.
                </p>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50/50 p-6 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Related Pets</h2>
          {relatedListings.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-foreground-muted)]">
              No related pets available right now.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedListings.map((related) => (
                <Link
                  key={String(related._id)}
                  href={`/listings/${String(related._id)}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-base font-bold text-slate-900">{related.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {related.breed} • {related.city}
                  </p>
                  <p className="mt-2 text-sm font-black text-orange-600">
                    ₹{Number(related.priceInr).toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
