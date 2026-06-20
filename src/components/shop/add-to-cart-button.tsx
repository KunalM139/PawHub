"use client";

import { useState, useEffect } from "react";
import { CheckoutModal } from "./checkout-modal";
import { ShoppingCart, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function AddToCartButton({ productId, disabled, productStr }: { productId: string, disabled: boolean, productStr: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const product = JSON.parse(productStr);

  useEffect(() => {
    fetchCartStatus();
    const handleCartUpdated = () => fetchCartStatus();
    window.addEventListener("cart-updated", handleCartUpdated);
    return () => window.removeEventListener("cart-updated", handleCartUpdated);
  }, []);

  async function fetchCartStatus() {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (data?.cart?.items) {
        setIsInCart(data.cart.items.some((i: any) => (i.productId._id || i.productId) === productId));
      }
    } catch (e) {}
  }

  async function handleAddToCart() {
    setIsAdding(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 })
    });
    
    if (res.ok) {
      toast.success("Added to cart!");
      setIsInCart(true);
      window.dispatchEvent(new Event("cart-updated"));
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to add to cart");
    }
    setIsAdding(false);
  }

  return (
    <>
      <div className="flex gap-4">
        {isInCart ? (
          <button
            onClick={() => window.location.href = "/dashboard/cart"}
            className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-lg transition-colors whitespace-nowrap"
          >
            <ShoppingCart className="size-5" />
            Go to Cart
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={disabled || isAdding}
            className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <ShoppingCart className="size-5" />
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        )}
        
        <button
          onClick={() => setShowCheckout(true)}
          disabled={disabled}
          className="flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] hover:brightness-110 text-[var(--color-primary-foreground)] font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50"
        >
          <CreditCard className="size-5" />
          Buy Now
        </button>
      </div>

      {showCheckout && (
        <CheckoutModal
          product={product}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
