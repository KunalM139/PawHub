import type { Metadata } from "next";
import { OrderList } from "@/components/shop/order-list";

export const metadata: Metadata = {
  title: "My Orders | PawHub",
  robots: { index: false, follow: false },
};

export default function BuyerOrdersPage() {
  return (
    <main className="w-full max-w-[1280px] mx-auto px-2 md:px-8 pt-8 pb-32">
      {/* Header Area */}
      <div className="mb-12">
        <h1 className="text-[36px] font-bold text-[var(--color-on-surface)] mb-2 font-outfit">My Purchases</h1>
        <p className="text-[18px] font-outfit text-[var(--color-on-surface-variant)] max-w-2xl">
          View your order history, track shipments, and leave reviews for products you've bought.
        </p>
      </div>

      <OrderList viewAs="buyer" />
    </main>
  );
}
