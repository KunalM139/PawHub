const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/(dashboard)/dashboard/my-listings/page.tsx');

const newCode = `import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";

export const metadata: Metadata = {
  title: "My Listings | PawHub",
  robots: { index: false, follow: false },
};

const statusConfig: Record<string, { bg: string, text: string, icon: string }> = {
  approved: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: "check_circle" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-600", icon: "hourglass_empty" },
  rejected: { bg: "bg-rose-500/10", text: "text-rose-600", icon: "cancel" },
  archived: { bg: "bg-[var(--color-outline-variant)]/20", text: "text-[var(--color-outline)]", icon: "inventory_2" },
};

export default async function MyListingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const listings = await ListingModel.find({ sellerId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean() || [];

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2">My Pet Listings</h1>
            <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">
              {listings.length} {listings.length === 1 ? "pet listed" : "pets listed"} for adoption
            </p>
          </div>
          <Link
            href="/post-listing"
            className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full btn-gradient px-8 text-[15px] font-bold text-white shadow-md hover:shadow-lg hover-scale transition-all overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="material-symbols-outlined text-[20px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            <span className="relative z-10">New Listing</span>
          </Link>
        </header>

        {listings.length === 0 ? (
          <section className="bg-[var(--color-surface-container-lowest)] rounded-[1.5rem] border border-[var(--color-outline-variant)]/30 card-shadow p-[32px] flex flex-col items-center justify-center min-h-[400px] py-20 text-center relative overflow-hidden transition-all duration-300 hover:shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1.5rem]"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-primary-fixed)] to-[var(--color-secondary-fixed)] rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-[var(--color-outline-variant)]/50 relative z-10">
              <span className="material-symbols-outlined text-[48px] text-[var(--color-primary)] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
            </div>
            <h2 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-3 relative z-10">No listings yet</h2>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-8 relative z-10">
              You haven't posted any pets for adoption. Create your first listing to help a pet find its forever home!
            </p>
            <Link href="/post-listing" className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-on-primary)] text-[15px] tracking-wide font-bold py-3.5 px-8 rounded-full shadow-md hover:shadow-lg hover-scale transition-all duration-300 relative z-10 overflow-hidden group/btn inline-flex items-center gap-2">
              <span className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></span>
              <span className="relative">Post Your First Pet</span>
            </Link>
          </section>
        ) : (
          <div className="bg-[var(--color-surface-container-lowest)] rounded-[1.5rem] border border-[var(--color-outline-variant)]/30 card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)]/50">
                    <th className="py-5 px-6 font-bold text-[14px] uppercase tracking-wider text-[var(--color-on-surface-variant)]">Pet Details</th>
                    <th className="py-5 px-6 font-bold text-[14px] uppercase tracking-wider text-[var(--color-on-surface-variant)] hidden sm:table-cell">Location</th>
                    <th className="py-5 px-6 font-bold text-[14px] uppercase tracking-wider text-[var(--color-on-surface-variant)] hidden md:table-cell">Price</th>
                    <th className="py-5 px-6 font-bold text-[14px] uppercase tracking-wider text-[var(--color-on-surface-variant)]">Status</th>
                    <th className="py-5 px-6 font-bold text-[14px] uppercase tracking-wider text-[var(--color-on-surface-variant)] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-outline-variant)]/20">
                  {listings.map((listing: any) => {
                    const status = (listing.status as string) ?? "pending";
                    const config = statusConfig[status] || statusConfig.pending;
                    
                    return (
                      <tr key={String(listing._id)} className="group hover:bg-[var(--color-primary)]/5 transition-colors duration-200">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-[var(--color-surface-container-highest)] overflow-hidden shrink-0 border border-[var(--color-outline-variant)]/30 flex items-center justify-center">
                               {listing.images?.[0] ? (
                                 <img src={listing.images[0]} alt={listing.title} className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                               ) : (
                                 <span className="material-symbols-outlined text-[var(--color-outline)] text-[24px]">pets</span>
                               )}
                            </div>
                            <div>
                              <p className="font-bold text-[16px] text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{listing.title as string}</p>
                              <p className="text-[13px] font-semibold text-[var(--color-on-surface-variant)] mt-0.5">{listing.breed as string}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-on-surface-variant)]">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            {listing.city as string}, {listing.state as string}
                          </div>
                        </td>
                        <td className="py-5 px-6 hidden md:table-cell text-[15px] font-bold text-[var(--color-on-surface)]">
                          {listing.priceInr ? \`₹\${listing.priceInr.toLocaleString()}\` : "Free"}
                        </td>
                        <td className="py-5 px-6">
                          <span className={\`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest \${config.bg} \${config.text}\`}>
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{config.icon}</span>
                            {status}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <Link
                            href={\`/listings/\${String(listing._id)}\`}
                            className="inline-flex items-center justify-center size-10 rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 shadow-sm border border-[var(--color-outline-variant)]/30"
                            title="View Listing"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully redesigned my-listings page');
