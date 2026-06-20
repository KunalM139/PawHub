import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";

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
  archived: "bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/50",
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
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="flex-1 w-full max-w-[1280px] mx-auto py-8">
        <div className="flex flex-col gap-10">
          {/* Header Area */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
            <div className="flex flex-col gap-2">
              <h1 className="text-[32px] md:text-[40px] leading-tight text-[var(--color-on-surface)] font-bold tracking-tight">Pet Listings</h1>
              <p className="text-[18px] text-[var(--color-on-surface-variant)] font-medium">Manage all your pet listings</p>
            </div>
            <Link
              href="/post-listing"
              className="btn-gradient hover-scale rounded-full px-8 py-3.5 text-[var(--color-on-primary)] flex items-center gap-2 font-semibold tracking-wide shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Listing
            </Link>
          </header>

          {/* Content Area */}
          {listings.length === 0 ? (
            <section className="w-full bg-[var(--color-surface-container-lowest)] rounded-3xl card-shadow border border-[var(--color-outline-variant)]/40 py-24 px-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-700 group-hover:opacity-50">
                <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-[var(--color-primary)]/5 blur-3xl mix-blend-multiply"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[var(--color-secondary)]/5 blur-3xl mix-blend-multiply"></div>
              </div>
              <div className="flex flex-col items-center gap-8 z-10 max-w-lg mx-auto">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[var(--color-primary-container)] to-[var(--color-secondary-container)] flex items-center justify-center icon-glow mb-2 transition-transform duration-500 group-hover:scale-110">
                  <span className="material-symbols-outlined text-white text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                </div>
                <div className="flex flex-col gap-4">
                  <h2 className="text-[28px] md:text-3xl font-bold text-[var(--color-on-surface)] gradient-text">No pet listings yet</h2>
                  <p className="text-[16px] md:text-[17px] text-[var(--color-on-surface-variant)] leading-relaxed">
                    Create your first pet listing to start selling on PawHub. Connect with families looking for their perfect companion.
                  </p>
                </div>
                <Link
                  href="/post-listing"
                  className="btn-gradient hover-scale rounded-full px-10 py-4 text-[var(--color-on-primary)] flex items-center gap-2 mt-4 font-semibold tracking-wide shadow-xl shadow-[var(--color-primary)]/20"
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                  Create First Listing
                </Link>
              </div>
            </section>
          ) : (
            <section className="w-full bg-[var(--color-surface-container-lowest)] rounded-3xl card-shadow border border-[var(--color-outline-variant)]/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[15px]">
                  <thead>
                    <tr className="border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)]">
                      <th className="py-5 pl-8 pr-4 font-bold tracking-wide text-[var(--color-on-surface-variant)] uppercase text-[12px]">Pet</th>
                      <th className="py-5 px-4 font-bold tracking-wide text-[var(--color-on-surface-variant)] uppercase text-[12px]">Breed</th>
                      <th className="hidden py-5 px-4 font-bold tracking-wide text-[var(--color-on-surface-variant)] uppercase text-[12px] md:table-cell">Price</th>
                      <th className="hidden py-5 px-4 font-bold tracking-wide text-[var(--color-on-surface-variant)] uppercase text-[12px] sm:table-cell">Location</th>
                      <th className="py-5 px-4 font-bold tracking-wide text-[var(--color-on-surface-variant)] uppercase text-[12px]">Status</th>
                      <th className="py-5 pr-8 pl-4 font-bold tracking-wide text-[var(--color-on-surface-variant)] uppercase text-[12px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-outline-variant)]/20">
                    {listings.map((listing) => {
                      const status = (listing.status as string) ?? "pending";
                      const images = listing.images as string[] | undefined;
                      return (
                        <tr key={String(listing._id)} className="group transition-colors hover:bg-[var(--color-surface-container-lowest)]/50 cursor-default">
                          <td className="py-4 pl-8 pr-4">
                            <div className="flex items-center gap-4">
                              {images?.[0] ? (
                                <img
                                  src={images[0]}
                                  alt={listing.title as string}
                                  className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                                />
                              ) : (
                                <div className="flex w-14 h-14 items-center justify-center rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20">
                                  <span className="material-symbols-outlined text-[24px] text-[var(--color-outline)]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                                </div>
                              )}
                              <span className="font-bold text-[16px] text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                                {listing.title as string}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-[var(--color-on-surface-variant)]">
                            {listing.breed as string}
                          </td>
                          <td className="hidden py-4 px-4 font-bold text-[var(--color-on-surface)] md:table-cell">
                            ₹{Number(listing.priceInr).toLocaleString("en-IN")}
                          </td>
                          <td className="hidden py-4 px-4 font-medium text-[var(--color-on-surface-variant)] sm:table-cell">
                            {listing.city as string}, {listing.state as string}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest shadow-sm ${statusColors[status] ?? statusColors.pending}`}>
                              {status === "approved" && <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                              {status === "pending" && <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>}
                              {status === "rejected" && <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>}
                              {status}
                            </span>
                          </td>
                          <td className="py-4 pr-8 pl-4">
                            <Link
                              href={`/listings/${String(listing._id)}`}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] hover:shadow-md transition-all hover-scale"
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
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

