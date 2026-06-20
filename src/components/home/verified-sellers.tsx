import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { ProductModel } from "@/server/models/product";
import { ListingModel } from "@/server/models/listing";
import Link from "next/link";

export async function VerifiedSellersSection() {
  await connectToDatabase();

  // Get top 3 verified sellers by store views
  const sellers = await UserModel.find({ role: "verifiedSeller" })
    .sort({ storeViews: -1 })
    .limit(3)
    .lean();

  if (!sellers.length) return null;

  // Enhance with active listing/product count
  const enhancedSellers = await Promise.all(sellers.map(async (seller: any) => {
    const productsCount = await ProductModel.countDocuments({ sellerId: seller._id, isActive: true });
    const listingsCount = await ListingModel.countDocuments({ sellerId: seller._id, status: "approved" });
    return {
      ...seller,
      totalActiveItems: productsCount + listingsCount
    };
  }));

  return (
    <section className="pb-12 pt-2">
      <Container>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Top Verified Sellers</h2>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            Profiles reviewed by PawHub to help buyers and adopters connect with confidence.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {enhancedSellers.map((seller) => (
              <Link href={`/dashboard/store/${seller._id}`} key={seller._id} className="block transition-transform hover:-translate-y-1">
                <article className="rounded-2xl bg-[var(--color-surface-muted)] p-5 border border-transparent hover:border-indigo-100 transition-colors h-full">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600 shadow-sm mb-3">
                    <BadgeCheck className="size-4" />
                    Verified Seller
                  </div>
                  <h3 className="mt-1 text-base font-bold text-slate-900">{seller.storeName || seller.name}</h3>
                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{seller.city || "Pan India"}</p>
                  
                  <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center">
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">
                      {seller.totalActiveItems} active items
                    </p>
                    <p className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                      {seller.storeViews || 0} Views
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
