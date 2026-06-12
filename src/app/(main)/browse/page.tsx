import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FindPetFilters } from "@/components/browse/find-pet-filters";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { Container } from "@/components/ui/container";
import { connectToDatabase } from "@/server/db/connect";
import {
  buildPublicListingQuery,
  buildPublicListingSort,
  parseBrowseFilters,
} from "@/server/listings/browse-query";
import { ListingModel } from "@/server/models/listing";

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Find Your Pet",
  description:
    "Find dogs and cats across India with guided filters for purchase, adoption, and location.",
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const filters = parseBrowseFilters(params);

  const petTabs: Array<{ label: string; value: "" | "dog" | "cat" }> = [
    { label: "All", value: "" },
    { label: "Dogs", value: "dog" },
    { label: "Cats", value: "cat" },
  ];

  const buildBrowseLink = (petCategory: "" | "dog" | "cat") => {
    const query = new URLSearchParams();

    if (filters.q) query.set("q", filters.q);
    if (petCategory) query.set("petCategory", petCategory);
    if (filters.breed) query.set("breed", filters.breed);
    if (filters.city) query.set("city", filters.city);
    if (filters.ageMin) query.set("ageMin", filters.ageMin);
    if (filters.ageMax) query.set("ageMax", filters.ageMax);
    if (filters.gender) query.set("gender", filters.gender);
    if (filters.priceMin) query.set("priceMin", filters.priceMin);
    if (filters.priceMax) query.set("priceMax", filters.priceMax);
    if (filters.adoptionOnly) query.set("adoptionOnly", "on");
    if (filters.verifiedOnly) query.set("verifiedOnly", "on");
    if (filters.sort && filters.sort !== "latest") query.set("sort", filters.sort);

    const queryString = query.toString();
    return queryString ? `/browse?${queryString}` : "/browse";
  };

  await connectToDatabase();

  const listings = await ListingModel.find(buildPublicListingQuery(filters))
    .sort(buildPublicListingSort(filters))
    .limit(60)
    .lean();

  return (
    <section className="py-14">
      <Container>
        {/* Hero Header Area */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 p-8 sm:p-12 shadow-sm border border-orange-200/50">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Find Your Best Friend
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-700">
              Choose purchase or adoption, filter by pet type and location, and search trusted listings.
            </p>
          </div>
          
          <div className="relative z-10 mt-10 rounded-2xl bg-white/80 p-6 backdrop-blur-md shadow-sm border border-white">
            <FindPetFilters filters={filters} />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <article
              key={String(listing._id)}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-slate-100"
            >
              <div className="absolute right-3 top-3 z-20">
                <FavoriteButton listingId={String(listing._id)} />
              </div>
              
              <Link href={`/listings/${String(listing._id)}`} className="flex flex-col flex-1">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-surface-muted)]">
                  {listing.images?.[0] ? (
                    <Image
                      src={listing.images[0]}
                      alt={listing.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  
                  {/* Floating Price Tag */}
                  <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 text-sm font-extrabold shadow-sm backdrop-blur-sm text-slate-900">
                    {listing.listingType === "sale" 
                      ? `₹${Number(listing.priceInr).toLocaleString("en-IN")}`
                      : <span className="text-orange-600">Free ({listing.listingType})</span>
                    }
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                      {listing.title}
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500 font-medium">
                    {listing.breed} • {listing.city}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                      {listing.petCategory}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                      {listing.ageInMonths} mo
                    </span>
                    {listing.isVerifiedSeller && (
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-orange-500 py-3 text-center transition-colors group-hover:bg-orange-600 mt-auto">
                  <span className="text-sm font-bold text-white tracking-wide">VIEW DETAILS</span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5 text-sm text-[var(--color-foreground-muted)]">
            No listings match your current filters.
          </div>
        ) : null}
      </Container>
    </section>
  );
}
