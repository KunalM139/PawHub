import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import type { ListingDocument } from "@/server/models/listing";

export async function FeaturedPetsSection() {
  await connectToDatabase();
  
  // Fetch latest 3 approved listings
  const listings = await ListingModel.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean() as unknown as ListingDocument[];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 md:mb-32">
      <div className="flex justify-between items-end mb-10 reveal">
        <div>
          <h2 className="text-3xl md:text-4xl text-[var(--color-on-surface)] mb-2 font-extrabold tracking-tight">Featured Pets</h2>
          <p className="text-base text-[var(--color-on-surface-variant)]">Freshly approved, beautiful companions waiting for you.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[var(--color-primary)] text-sm bg-[var(--color-primary)]/5 px-5 py-2.5 rounded-full transition-colors font-bold hover-scale">
          <Sparkles className="size-5" /> Updated Daily
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.map((listing, index) => (
          <Link
            key={String(listing._id)}
            href={`/listings/${String(listing._id)}`}
            className="bg-white rounded-3xl overflow-hidden card-shadow border border-[var(--color-surface-container-high)] flex flex-col cursor-pointer reveal"
            style={{ transitionDelay: `${(index + 1) * 0.1}s` }}
          >
            <div className="relative h-72 rounded-t-3xl m-2 mb-0 pet-image-container bg-orange-50/50 flex items-center justify-center">
              {listing.images?.[0] ? (
                <Image
                  src={listing.images[0]}
                  alt={listing.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover pet-image"
                />
              ) : (
                <Sparkles className="size-10 text-[var(--color-primary)]/40 pet-image" />
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[var(--color-secondary)] px-4 py-1.5 rounded-full text-[12px] font-extrabold tracking-wider uppercase shadow-sm">
                Featured
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow bg-white z-10 relative">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl text-[var(--color-on-surface)] line-clamp-1 font-bold">{listing.title}</h3>
                <span className="bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] px-3 py-1 rounded-lg text-[13px] font-bold">
                  {listing.ageInMonths} mo
                </span>
              </div>
              
              <p className="text-base text-[var(--color-on-surface-variant)] mb-5 flex items-center gap-1 font-medium">
                {listing.breed} <span className="text-[var(--color-outline-variant)] mx-1">•</span> {listing.city}
              </p>
              
              <div className="mt-auto flex items-center justify-between pt-5 border-t border-[var(--color-surface-variant)]">
                <span className="text-2xl text-[var(--color-primary)] font-black">
                  {listing.listingType === "sale" 
                    ? `₹${Number(listing.priceInr).toLocaleString("en-IN")}`
                    : <span className="text-[var(--color-secondary)]">Free</span>
                  }
                </span>
                <span className="bg-[var(--color-primary-fixed)]/50 text-[var(--color-primary)] px-6 py-2.5 rounded-full text-sm transition-colors font-bold">Meet Me</span>
              </div>
            </div>
          </Link>
        ))}
        
        {listings.length === 0 && (
          <p className="text-sm font-medium text-[var(--color-on-surface-variant)] col-span-full">No featured pets available right now.</p>
        )}
      </div>
    </section>
  );
}
