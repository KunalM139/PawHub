import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Cat, Dog, Search, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Browse Pets | PawHub",
  robots: { index: false, follow: false },
};

const browseLinks = [
  {
    label: "All Pets",
    description: "Browse all dogs and cats available on PawHub",
    href: "/browse",
    icon: Search,
    gradient: "from-orange-500/10 to-amber-500/10",
    iconColor: "text-orange-500",
  },
  {
    label: "Dogs",
    description: "Find dogs for sale, adoption, or rehome",
    href: "/browse?petCategory=dog",
    icon: Dog,
    gradient: "from-amber-500/10 to-yellow-500/10",
    iconColor: "text-amber-600",
  },
  {
    label: "Cats",
    description: "Find cats for sale, adoption, or rehome",
    href: "/browse?petCategory=cat",
    icon: Cat,
    gradient: "from-violet-500/10 to-purple-500/10",
    iconColor: "text-violet-500",
  },
  {
    label: "Adopt",
    description: "Browse pets available for adoption",
    href: "/browse?listingType=adoption",
    icon: Search,
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-500",
  },
  {
    label: "Verified Sellers",
    description: "Browse listings from trusted, verified sellers",
    href: "/browse?verifiedOnly=on",
    icon: ShieldCheck,
    gradient: "from-sky-500/10 to-blue-500/10",
    iconColor: "text-sky-500",
  },
];

export default function PetsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Find Your Perfect Pet
        </h2>
        <p className="mt-2 text-base font-medium text-slate-600">
          Browse trusted listings across India. Filter by type, breed, location, and more.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {browseLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${item.gradient}`} />
              <div className="relative">
                <div
                  className={`inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} ${item.iconColor} shadow-sm`}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {item.label}
                </h3>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {item.description}
                </p>
                <ArrowRight className="mt-4 size-5 text-orange-500 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
