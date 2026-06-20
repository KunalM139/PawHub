import { connectToDatabase } from "@/server/db/connect";
import { ProductModel } from "@/server/models/product";
import { UserModel } from "@/server/models/user";
import { OrderModel } from "@/server/models/order";
import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ShieldCheck, Star } from "lucide-react";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { WishlistButton } from "@/components/shop/wishlist-button";
import { ProductReviews } from "@/components/shop/product-reviews";
import mongoose from "mongoose";

export default async function ProductDetailPage(props: { params: Promise<{ productId: string }> }) {
  const { productId } = await props.params;

  await connectToDatabase();
  const currentUser = await getCurrentUser();

  const product = await ProductModel.findByIdAndUpdate(
    productId, 
    { $inc: { views: 1 } },
    { returnDocument: "after" }
  ).populate("sellerId", "name storeName").lean();
  if (!product || !product.isActive) {
    notFound();
  }

  // Update Recently Viewed
  if (currentUser) {
    // Remove if exists, then push to end to keep it most recent
    await UserModel.findByIdAndUpdate(currentUser.id, {
      $pull: { recentlyViewedProducts: productId }
    });
    await UserModel.findByIdAndUpdate(currentUser.id, {
      $push: { recentlyViewedProducts: { $each: [productId], $slice: -10 } }
    });
  }

  // Fetch similar products
  const similarProducts = await ProductModel.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .lean();

  // Fetch recently viewed
  let recentlyViewed: any[] = [];
  if (currentUser) {
    const userWithViews = await UserModel.findById(currentUser.id)
      .populate({
        path: "recentlyViewedProducts",
        model: ProductModel,
        match: { isActive: true, _id: { $ne: product._id } }
      })
      .lean();
    if (userWithViews && userWithViews.recentlyViewedProducts) {
      recentlyViewed = (userWithViews.recentlyViewedProducts as any[]).reverse().slice(0, 4);
    }
  }

  // Count total delivered items
  const deliveredOrders = await OrderModel.find({ productId, status: "delivered" }).select("quantity").lean();
  const totalSold = deliveredOrders.reduce((sum, order) => sum + order.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <Link href="/dashboard/shop" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="size-4" /> Back to Shop
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {product.images[0] ? (
              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="size-16 text-slate-300" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img: string, i: number) => (
                <div key={i} className="size-24 shrink-0 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors">
                  <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">{product.title}</h1>
            
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`size-4 ${product.averageRating >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700">{(product.averageRating || 0).toFixed(1)}</span>
              <span className="text-sm text-slate-500">({product.totalReviews || 0} reviews)</span>
              
              {totalSold > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm font-bold text-indigo-600">{totalSold} bought</span>
                </>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-6 items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Sold by:</span>
                <Link href={`/dashboard/store/${(product.sellerId as any)._id}`} className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  {(product.sellerId as any).storeName || (product.sellerId as any).name}
                </Link>
              </div>
              {product.isVerifiedSeller && (
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="size-4" /> Verified Seller
                </div>
              )}
            </div>
          </div>

          <div className="my-8 py-8 border-y border-slate-100">
            <p className="text-4xl font-black text-slate-900">₹{product.priceInr.toLocaleString()}</p>
            <p className="text-sm font-medium text-slate-500 mt-2">Inclusive of all taxes</p>
          </div>

          <div className="mb-8 prose prose-slate max-w-none">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Product Description</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-bold text-slate-700">Availability:</span>
              <span className={`font-black ${product.stockQuantity > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
              </span>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <AddToCartButton 
                  productId={String(product._id)} 
                  disabled={product.stockQuantity === 0} 
                  productStr={JSON.stringify(product)}
                />
              </div>
              <WishlistButton productId={String(product._id)} />
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={String(product._id)} />

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="pt-16 border-t border-slate-100">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-8">Similar Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((p: any) => (
              <Link href={`/dashboard/shop/${p._id}`} key={p._id} className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img src={p.images[0] || "https://placehold.co/400x300"} alt={p.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-col p-4">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                  <p className="mt-auto text-lg font-black text-slate-900">₹{p.priceInr.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="pt-16 border-t border-slate-100">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-8">Recently Viewed</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyViewed.map((p: any) => (
              <Link href={`/dashboard/shop/${p._id}`} key={p._id} className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img src={p.images[0] || "https://placehold.co/400x300"} alt={p.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-col p-4">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                  <p className="mt-auto text-lg font-black text-slate-900">₹{p.priceInr.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
