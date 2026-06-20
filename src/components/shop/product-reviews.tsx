"use client";

import { useState, useEffect } from "react";
import { Star, ShieldCheck, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    const res = await fetch(`/api/reviews/product?productId=${productId}`);
    const data = await res.json();
    if (data.reviews) setReviews(data.reviews);
  }

  return (
    <div className="pt-16 border-t border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Reviews</h2>
        <p className="text-slate-500 font-medium mt-1">Read what others have to say about this product</p>
      </div>
      
      <div className="space-y-6 max-w-4xl">
        {reviews.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
            <Star className="mx-auto size-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-lg">No reviews yet.</p>
            <p className="text-slate-400 mt-1">Check back later or leave a review if you've bought this!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                    {review.reviewerId?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{review.reviewerId?.name || "Anonymous User"}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`size-3 ${review.rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {review.isVerifiedPurchase && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <ShieldCheck className="size-3.5" /> Verified Buyer
                  </div>
                )}
              </div>
              
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {review.images.map((img: string, i: number) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="relative size-20 sm:size-24 rounded-2xl overflow-hidden border border-slate-200 group block hover:border-indigo-400 transition-colors">
                      <img src={img} alt={`Review photo ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
