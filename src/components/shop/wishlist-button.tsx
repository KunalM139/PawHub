"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export function WishlistButton({ productId }: { productId: string }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetch("/api/wishlist")
      .then(res => res.json())
      .then(data => {
        if (data?.wishlist?.productIds) {
          const ids = data.wishlist.productIds.map((p: any) => p._id || p);
          setIsWishlisted(ids.includes(productId));
        }
      })
      .catch(() => null);
      
    const handleUpdate = () => {
      fetch("/api/wishlist")
        .then(res => res.json())
        .then(data => {
          if (data?.wishlist?.productIds) {
            const ids = data.wishlist.productIds.map((p: any) => p._id || p);
            setIsWishlisted(ids.includes(productId));
          }
        });
    };
    window.addEventListener("wishlist-updated", handleUpdate);
    return () => window.removeEventListener("wishlist-updated", handleUpdate);
  }, [productId]);

  async function toggleWishlist() {
    const method = isWishlisted ? "DELETE" : "POST";
    const url = isWishlisted ? `/api/wishlist?productId=${productId}` : "/api/wishlist";
    const body = isWishlisted ? null : JSON.stringify({ productId });
    
    // optimistic update
    setIsWishlisted(!isWishlisted);
    
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body || undefined
    });
    
    if (res.ok) {
      window.dispatchEvent(new Event("wishlist-updated"));
    } else {
      setIsWishlisted(isWishlisted); // revert
    }
  }

  return (
    <button
      onClick={toggleWishlist}
      className={`size-12 rounded-xl border flex items-center justify-center transition-all ${
        isWishlisted 
          ? "bg-rose-50 border-rose-200 text-rose-500" 
          : "bg-white border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500"
      }`}
    >
      <Heart className={`size-5 ${isWishlisted ? "fill-rose-500" : ""}`} />
    </button>
  );
}
