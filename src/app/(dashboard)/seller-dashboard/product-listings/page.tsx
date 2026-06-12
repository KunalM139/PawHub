import type { Metadata } from "next";
import { Box, Package, ShoppingCart, Sparkles, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Listings | Seller Dashboard",
  robots: { index: false, follow: false },
};

const features = [
  {
    label: "Add Products",
    description: "List pet food, toys, grooming supplies, and accessories",
    icon: Package,
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
  },
  {
    label: "Inventory Management",
    description: "Track stock levels, set alerts, and manage variants",
    icon: Box,
    gradient: "from-sky-500/10 to-blue-500/10",
    iconColor: "text-sky-500",
  },
  {
    label: "Pricing & Offers",
    description: "Set prices, discounts, and run promotional campaigns",
    icon: Tag,
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
  },
  {
    label: "Orders",
    description: "Process orders, manage shipping, and handle returns",
    icon: ShoppingCart,
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-500",
  },
];

export default function ProductListingsPage() {
  return (
    <div className="space-y-6">
      {/* Coming Soon Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-8 -top-8 size-36 rounded-full bg-[var(--color-primary)]/15 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 size-28 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="size-3" />
            Coming Soon
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Pet Product Marketplace
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/70">
            Soon you&apos;ll be able to sell pet food, accessories, and supplies
            alongside your pet listings. Expand your business with PawHub&apos;s
            integrated product marketplace.
          </p>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.label}
              className={`relative overflow-hidden rounded-2xl border border-black/[0.04] bg-gradient-to-br ${feature.gradient} p-5 opacity-75`}
            >
              <div className="absolute right-3 top-3 rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-foreground-subtle)]">
                Soon
              </div>
              <div className={`inline-flex size-11 items-center justify-center rounded-xl bg-white/80 shadow-sm ${feature.iconColor}`}>
                <Icon className="size-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--color-foreground)]">
                {feature.label}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
