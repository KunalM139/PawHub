import type { Metadata } from "next";
import { ShopGallery } from "@/components/shop/shop-gallery";

export const metadata: Metadata = {
  title: "Pet Shop | PawHub",
  robots: { index: false, follow: false },
};

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[var(--color-foreground)]">PawHub Pet Shop</h1>
        <p className="mt-2 text-base text-[var(--color-foreground-muted)]">
          Browse premium pet food, accessories, toys, and supplies from verified sellers.
        </p>
      </div>

      <ShopGallery />
    </div>
  );
}

