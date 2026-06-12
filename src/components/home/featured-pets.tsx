import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import type { ListingRecord } from "@/server/models/listing";

export async function FeaturedPetsSection() {
  await connectToDatabase();
  
  // Fetch latest 3 approved listings
  const listings = await ListingModel.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean() as unknown as ListingRecord[];

  return (
    <section className="pb-20 pt-10">
      <Container>
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Featured Pets</h2>
            <p className="mt-2 text-base text-slate-600">
              Freshly approved, beautiful companions waiting for you.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700 shadow-sm">
            <Sparkles className="size-5" />
            Updated Daily
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={String(listing._id)}
              href={`/listings/${String(listing._id)}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-slate-100"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-orange-50">
                {listing.images?.[0] ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-orange-200">
                    <Sparkles className="size-10" />
                  </div>
                )}
                
                <div className="absolute top-3 left-3 rounded-xl bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-black uppercase tracking-widest text-orange-600 shadow-sm">
                  Featured
                </div>
              </div>

              <div className="flex flex-col p-6">
                <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors">
                  {listing.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {listing.breed} • {listing.city}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-black text-slate-900">
                    {listing.listingType === "sale" 
                      ? `₹${Number(listing.priceInr).toLocaleString("en-IN")}`
                      : <span className="text-orange-600">Free</span>
                    }
                  </p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {listing.ageInMonths} mo
                  </span>
                </div>
              </div>
            </Link>
          ))}
          
          {listings.length === 0 && (
             <p className="text-sm font-medium text-slate-500">No featured pets available right now.</p>
          )}
        </div>
      </Container>
    </section>
  );
}
