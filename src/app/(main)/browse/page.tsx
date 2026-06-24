import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FindPetFilters } from "@/components/browse/find-pet-filters";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { connectToDatabase } from "@/server/db/connect";
import { buildPublicListingQuery, buildPublicListingSort, parseBrowseFilters } from "@/server/listings/browse-query";
import { ListingModel } from "@/server/models/listing";
import { Heart, PawPrint, MapPin, CheckCircle } from "lucide-react";
import { ScrollAnimations } from "@/components/providers/scroll-animations";
import { VerifiedSellerBadge } from "@/components/verified-seller-badge";

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

  await connectToDatabase();

  const totalCount = await ListingModel.countDocuments(buildPublicListingQuery(filters));

  const rawListings = await ListingModel.find(buildPublicListingQuery(filters))
    .sort(buildPublicListingSort(filters))
    .limit(filters.limit + 1)
    .lean();

  const hasMore = rawListings.length > filters.limit;
  const listings = rawListings.slice(0, filters.limit);

  return (
    <div className="font-outfit home-theme bg-[var(--color-surface)] text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] overflow-hidden min-h-screen">
      <ScrollAnimations />
      {/* Hero Section */}
      <section className="relative pt-16 md:pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center reveal z-10 overflow-hidden rounded-b-[4rem]">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface-container-low)] to-[var(--color-surface)]/0 -z-20 rounded-b-[4rem]"></div>
        <div className="absolute w-[400px] h-[400px] top-[-100px] left-[-100px] rounded-full bg-[var(--color-primary-fixed-dim)]/30 blur-[40px] animate-float-1 -z-10"></div>
        <div className="absolute w-[500px] h-[500px] bottom-[-150px] right-[-100px] rounded-full bg-[var(--color-secondary-fixed-dim)]/20 blur-[40px] animate-float-2 -z-10" style={{ animationDelay: '-5s' }}></div>
        
        {/* Floating Icons */}
        <div className="absolute top-20 left-[20%] text-[var(--color-primary)]/30 animate-pulse hidden md:block">
          <PawPrint className="size-10" />
        </div>
        <div className="absolute bottom-40 right-[15%] text-[var(--color-secondary)]/30 animate-pulse hidden md:block" style={{ animationDelay: '1s' }}>
          <Heart className="size-8" />
        </div>
        
        <h1 className="text-4xl md:text-6xl mb-6 max-w-3xl leading-tight font-black">
          <span className="text-gradient">Find Your Best Friend</span>
        </h1>
        <p className="text-lg text-[var(--color-on-surface-variant)] max-w-2xl mx-auto mb-12">
          Choose purchase or adoption, filter by pet type and location, and search trusted listings.
        </p>
        
        {/* Filter Panel */}
        <div className="glass-panel w-full max-w-5xl mx-auto rounded-[2rem] p-6 md:p-8 shadow-xl flex flex-col gap-6 relative z-30">
          <FindPetFilters filters={filters} />
        </div>
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full pb-32 reveal relative z-20 -mt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">{totalCount} Available Pets</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing, index) => (
            <div
              key={String(listing._id)}
              className="bg-white rounded-[1.5rem] overflow-hidden card-shadow hover:-translate-y-2 hover:shadow-[0_15px_50px_rgba(99,14,212,0.1)] transition-all duration-300 flex flex-col group reveal"
              style={{ transitionDelay: `${(index + 1) * 0.05}s` }}
            >
              <div className="relative h-64 overflow-hidden rounded-t-[1.5rem] m-2 pet-image-container bg-orange-50/50">
                {listing.images?.[0] ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 pet-image"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)]/40 pet-image">
                    <PawPrint className="size-12" />
                  </div>
                )}
                
                <div className="absolute top-4 right-4 z-20">
                   <FavoriteButton listingId={String(listing._id)} />
                </div>
                
                <div className="absolute bottom-4 left-4 glass-panel px-3 py-1.5 rounded-full text-sm font-bold text-[var(--color-on-surface)] z-10 shadow-sm flex items-center gap-1">
                  {listing.listingType === "sale" 
                    ? `₹${Number(listing.priceInr).toLocaleString("en-IN")}`
                    : <span className="text-[var(--color-secondary)]">Free (Rehome)</span>
                  }
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow bg-white relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[20px] font-bold text-[var(--color-on-surface)] leading-tight line-clamp-1">{listing.title}</h3>
                  <span className="bg-[var(--color-secondary-fixed)]/50 text-[var(--color-on-secondary-container)] px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                    {listing.ageInMonths} mo
                  </span>
                </div>
                
                <p className="text-base text-[var(--color-on-surface-variant)] mb-4 flex items-center gap-1 font-medium">
                  <MapPin className="size-4" /> {listing.city}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                  <span className="bg-[var(--color-surface-container-high)] px-3 py-1 rounded-full text-xs font-semibold text-[var(--color-on-surface-variant)]">
                    {listing.breed || listing.petCategory}
                  </span>
                  {listing.isVerifiedSeller && (
                    <VerifiedSellerBadge withText size="sm" />
                  )}
                </div>
              </div>
              
              <Link href={`/listings/${String(listing._id)}`} className="w-full py-4 text-center bg-[var(--color-surface-container-high)] text-[var(--color-primary)] text-sm font-bold uppercase tracking-wider group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors duration-300 relative z-20 block">
                  View Details
              </Link>
            </div>
          ))}
        </div>

        {listings.length === 0 ? (
          <div className="mt-12 text-center p-12 bg-white rounded-3xl border border-[var(--color-surface-container-high)] card-shadow">
            <PawPrint className="size-16 text-[var(--color-outline-variant)] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[var(--color-on-surface)] mb-2">No pets found</h3>
            <p className="text-[var(--color-on-surface-variant)]">We couldn't find any listings matching your filters. Try adjusting your search criteria!</p>
          </div>
        ) : null}

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <form method="GET" action="/browse">
              {/* Preserve existing search params as hidden inputs */}
              {Object.entries(filters).map(([key, value]) => {
                // don't include limit in the mapped fields, we explicitly set it
                if (key === "limit") return null;
                // only include if the value actually exists/is set
                if (value === "" || value === false || value === null || value === undefined) return null;
                return <input key={key} type="hidden" name={key} value={value.toString()} />;
              })}
              <input type="hidden" name="limit" value={filters.limit + 15} />
              
              <button 
                type="submit" 
                className="px-8 py-3 rounded-full border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold text-sm uppercase tracking-wider hover:bg-[var(--color-primary)]/5 transition-colors"
              >
                Load More Listings
              </button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
