import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { ProductModel } from "@/server/models/product";
import { ProductReviewModel } from "@/server/models/product-review";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { StorefrontFollowButton } from "@/components/shop/storefront-follow-button";
import Link from "next/link";
import { ShoppingBag, Star, ShieldCheck, MapPin } from "lucide-react";

export default async function SellerStorefrontPage(props: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await props.params;

  await connectToDatabase();
  const currentUser = await getCurrentUser();

  const seller = await UserModel.findByIdAndUpdate(
    sellerId,
    { $inc: { storeViews: 1 } },
    { returnDocument: "after" }
  ).lean();
  if (!seller || seller.role !== "verifiedSeller") {
    notFound();
  }

  const products = await ProductModel.find({ sellerId, isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  const allReviews = await ProductReviewModel.find({ productId: { $in: products.map(p => p._id) } }).lean();
  const averageRating = allReviews.length > 0 
    ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length 
    : 0;

  const isFollowing = currentUser 
    ? (await UserModel.findById(currentUser.id).lean())?.followedStores?.some((id: any) => id.toString() === sellerId) 
    : false;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Store Header */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-[var(--shadow-soft)] border border-slate-200">
        <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 -mt-16 mb-6">
            <div className="flex items-end gap-6">
              <div className="size-32 rounded-3xl border-4 border-white bg-slate-100 overflow-hidden shadow-lg relative z-10 shrink-0 flex items-center justify-center">
                {seller.image ? (
                  <img src={seller.image} alt={seller.name} className="size-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-indigo-700">{seller.name.charAt(0)}</span>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                  {seller.storeName || seller.name}
                  <ShieldCheck className="size-6 text-emerald-500" />
                </h1>
                {seller.city && (
                  <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="size-4" /> {seller.city}, {seller.state}
                  </p>
                )}
              </div>
            </div>
            
            {currentUser && currentUser.id !== sellerId && (
              <StorefrontFollowButton sellerId={sellerId} initialIsFollowing={!!isFollowing} />
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 max-w-2xl mb-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Store Rating</p>
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-900">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-slate-500">({allReviews.length})</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Products</p>
              <p className="font-bold text-slate-900">{products.length}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Followers</p>
              <p className="font-bold text-slate-900">1.2k</p>
            </div>
          </div>

          {seller.storeDescription && (
            <div className="prose prose-slate max-w-none">
              <h3 className="text-sm font-bold text-slate-900">About the Store</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{seller.storeDescription}</p>
            </div>
          )}
        </div>
      </div>

      {/* Catalog */}
      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Products Collection</h2>
      {products.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200 rounded-3xl">
          <ShoppingBag className="mx-auto size-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">This store hasn&apos;t listed any products yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p: any) => (
            <Link href={`/dashboard/shop/${p._id}`} key={p._id} className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                {p.images[0] ? (
                  <img src={p.images[0]} alt={p.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex size-full items-center justify-center"><ShoppingBag className="size-10 text-slate-300" /></div>
                )}
                {p.stockQuantity === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <span className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">Out of Stock</span>
                  </div>
                ) : p.averageRating >= 4.5 && p.totalReviews >= 2 ? (
                  <div className="absolute top-3 left-3 bg-amber-400 text-amber-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm z-10">
                    Top Rated
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col p-5">
                <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-fit mb-2">
                  {p.category}
                </span>
                <h3 className="line-clamp-2 text-sm font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                  <p className="text-lg font-black text-slate-900">₹{p.priceInr.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{(p.averageRating || 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
