import type { Metadata } from "next";
import { Bone, Heart, ShoppingBag, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Pet Shop | PawHub",
  robots: { index: false, follow: false },
};

const categories = [
  {
    label: "Pet Food",
    description: "Premium dog and cat food from trusted brands",
    icon: Bone,
    gradient: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
  },
  {
    label: "Accessories",
    description: "Collars, leashes, beds, toys, and grooming supplies",
    icon: ShoppingBag,
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-500",
  },
  {
    label: "Wishlist",
    description: "Your saved products will appear here",
    icon: Heart,
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-500",
  },
];

export default function ShopPage() {
  return (
    <div className="space-y-6">
      {/* Coming Soon Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-8 -top-8 size-36 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 size-28 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="size-3" />
            Coming Soon
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            PawHub Pet Shop
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/80">
            Soon you&apos;ll be able to shop premium pet food, accessories, and supplies
            — all from verified sellers on PawHub.
          </p>
        </div>
      </div>

      {/* Category Preview */}
      <div className="grid gap-4 sm:grid-cols-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.label}
              className={`relative overflow-hidden rounded-2xl border border-black/[0.04] bg-gradient-to-br ${cat.gradient} p-5 opacity-75`}
            >
              <div className="absolute right-3 top-3 rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-foreground-subtle)]">
                Soon
              </div>
              <div
                className={`inline-flex size-11 items-center justify-center rounded-xl bg-white/80 shadow-sm ${cat.iconColor}`}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[var(--color-foreground)]">
                {cat.label}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">
                {cat.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
