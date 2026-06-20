const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/(dashboard)/dashboard/wishlist/page.tsx');

const newCode = `"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

type WishlistProduct = {
  _id: string;
  title: string;
  images: string[];
  priceInr: number;
  stockQuantity: number;
};

export default function WishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    setIsLoading(true);
    const res = await fetch("/api/wishlist");
    const data = await res.json().catch(() => null);
    if (res.ok && data?.wishlist?.productIds) {
      setProducts(data.wishlist.productIds);
    }
    setIsLoading(false);
  }

  async function removeProduct(productId: string) {
    const res = await fetch(\`/api/wishlist?productId=\${productId}\`, { method: "DELETE" });
    if (res.ok) {
      window.dispatchEvent(new Event("wishlist-updated"));
      setProducts(products.filter(p => p._id !== productId));
    }
  }

  async function moveToCart(productId: string) {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    if (res.ok) {
      window.dispatchEvent(new Event("cart-updated"));
      await removeProduct(productId);
    } else {
      toast.error("Failed to move to cart. It may be out of stock.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 font-outfit home-theme">
        <div className="size-12 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin" />
        <p className="text-[var(--color-on-surface-variant)] text-[16px] font-semibold animate-pulse">Loading your wishlist...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center font-outfit home-theme text-[var(--color-on-surface)]">
        <div className="size-24 rounded-[2rem] bg-gradient-to-br from-rose-400/20 to-rose-600/10 flex items-center justify-center mb-8 shadow-sm border border-rose-200/50">
          <span className="material-symbols-outlined text-[48px] text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </div>
        <h2 className="text-[28px] md:text-[32px] font-bold text-[var(--color-on-surface)] mb-3 tracking-tight">Your Wishlist is empty</h2>
        <p className="text-[16px] text-[var(--color-on-surface-variant)] mb-10 max-w-sm leading-relaxed">Save items you love here and purchase them later when you're ready.</p>
        <Link href="/dashboard/shop" className="h-14 px-10 inline-flex items-center justify-center rounded-full btn-gradient text-[16px] font-bold text-white hover-scale shadow-md tracking-wide">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] max-w-[1280px] mx-auto space-y-8 pb-24 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-10">
        <div className="size-14 bg-gradient-to-br from-rose-400/20 to-rose-600/10 text-rose-500 rounded-[1.2rem] flex items-center justify-center shadow-sm border border-rose-200/50">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </div>
        <div>
          <h1 className="text-[32px] md:text-[36px] font-extrabold text-[var(--color-on-surface)] tracking-tight leading-[1.2] mb-1">My Wishlist</h1>
          <p className="text-[16px] font-semibold text-[var(--color-outline)] tracking-wide flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            {products.length} {products.length === 1 ? 'Item' : 'Items'} Saved
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product._id} className="group flex flex-col overflow-hidden rounded-[2rem] border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] card-shadow hover-scale">
            <Link href={\`/dashboard/shop/\${product._id}\`} className="relative aspect-[4/3] bg-[var(--color-surface-container)] overflow-hidden block">
              {product.images[0] ? (
                <img src={product.images[0]} alt={product.title} className="size-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <span className="material-symbols-outlined text-[48px] text-[var(--color-outline-variant)]/50">image</span>
                </div>
              )}
              {product.stockQuantity === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="rounded-full bg-rose-500 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">Out of Stock</span>
                </div>
              ) : null}
            </Link>
            
            <div className="flex flex-1 flex-col p-6 relative">
              <button 
                onClick={() => removeProduct(product._id)}
                className="absolute -top-6 right-5 size-12 bg-white text-[var(--color-outline)] hover:text-rose-500 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-[var(--color-outline-variant)]/20 hover:scale-110 z-10"
                title="Remove from Wishlist"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
              </button>
              
              <Link href={\`/dashboard/shop/\${product._id}\`} className="mt-2">
                <h3 className="mb-2 line-clamp-2 text-[18px] font-bold leading-tight text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">{product.title}</h3>
              </Link>
              <p className="text-[22px] font-black text-[var(--color-primary)] mb-6">₹{product.priceInr.toLocaleString()}</p>
              
              <div className="mt-auto">
                <button
                  onClick={() => moveToCart(product._id)}
                  disabled={product.stockQuantity === 0}
                  className="w-full inline-flex h-12 items-center justify-center gap-3 rounded-full btn-gradient px-4 text-[15px] font-bold tracking-wide text-white shadow-sm transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed hover-scale overflow-hidden relative group/btn"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  <span className="material-symbols-outlined text-[20px] relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                  <span className="relative z-10">Move to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully redesigned wishlist page');
