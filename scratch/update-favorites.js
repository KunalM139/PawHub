const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/(dashboard)/dashboard/favorites/page.tsx');

const newCode = `import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";

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
    .lean() || [];

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2 flex items-center gap-3">
              Favorite Pets
            </h1>
            <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">
              {favorites.length} saved pet{favorites.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/browse"
            className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full btn-gradient px-8 text-[15px] font-bold text-white shadow-md hover:shadow-lg hover-scale transition-all overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="material-symbols-outlined text-[20px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
            <span className="relative z-10">Browse More</span>
          </Link>
        </header>

        {favorites.length === 0 ? (
          <section className="bg-[var(--color-surface-container-lowest)] rounded-[1.5rem] border border-[var(--color-outline-variant)]/30 card-shadow p-[32px] flex flex-col items-center justify-center min-h-[400px] py-20 text-center relative overflow-hidden transition-all duration-300 hover:shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1.5rem]"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-primary-fixed)] to-[var(--color-secondary-fixed)] rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-[var(--color-outline-variant)]/50 relative z-10">
              <span className="material-symbols-outlined text-[48px] text-[var(--color-primary)] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
            <h2 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-3 relative z-10">No favorites yet</h2>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-8 relative z-10">
              Save pets you like while browsing to easily find them later here!
            </p>
            <Link href="/browse" className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-on-primary)] text-[15px] tracking-wide font-bold py-3.5 px-8 rounded-full shadow-md hover:shadow-lg hover-scale transition-all duration-300 relative z-10 overflow-hidden group/btn inline-flex items-center gap-2">
              <span className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></span>
              <span className="relative flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                Browse Pets
              </span>
            </Link>
          </section>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((fav: any) => {
              const listing = fav.listingId;
              if (!listing) return null;

              return (
                <Link
                  key={String(fav._id)}
                  href={\`/listings/\${listing._id}\`}
                  className="group flex flex-col bg-[var(--color-surface-container-lowest)] rounded-[1.5rem] border border-[var(--color-outline-variant)]/30 card-shadow overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--color-primary)]/30"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-[var(--color-surface-container-high)]">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-container)]">
                        <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-3 right-3">
                      <div className="size-10 rounded-full bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-rose-500 hover:scale-110 hover:bg-rose-50 transition-all border border-white">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center gap-2 text-white/90 text-[12px] font-bold tracking-wider">
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        VIEW DETAILS
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-[18px] font-bold text-[var(--color-on-surface)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
                      {listing.title}
                    </h3>
                    <p className="mt-1 text-[14px] font-medium text-[var(--color-on-surface-variant)] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {listing.city}, {listing.state}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-[var(--color-outline-variant)]/30 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] block mb-0.5">Breed</span>
                        <span className="text-[14px] font-bold text-[var(--color-on-surface)] truncate max-w-[120px] block">{listing.breed}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] block mb-0.5">Price</span>
                        <span className="text-[18px] font-black text-[var(--color-primary)]">
                          ₹{Number(listing.priceInr).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully redesigned favorites page');
