import type { Metadata } from "next";
import { OrderList } from "@/components/shop/order-list";

export const metadata: Metadata = {
  title: "Shop Orders | Seller Dashboard",
  robots: { index: false, follow: false },
};

export default function SellerOrdersPage() {
  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] space-y-8 max-w-[1280px] mx-auto w-full">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] md:text-[36px] leading-[1.2] font-semibold text-[var(--color-on-surface)] tracking-tight">Customer Orders</h1>
        <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-2xl">
          Manage product orders, update shipping statuses, and view customer details.
        </p>
      </header>

      <OrderList viewAs="seller" />
    </div>
  );
}
