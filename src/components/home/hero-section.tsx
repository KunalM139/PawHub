"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Heart, PawPrint, Dog, Cat, ShoppingBag, Shirt } from "lucide-react";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/browse');
    }
  };

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-32 overflow-hidden hero-enter">
      {/* Decorative Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[var(--color-secondary-fixed-dim)]/40 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-primary-fixed-dim)]/50 blur-[120px]"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-[20%] left-[10%] opacity-30 hidden md:block">
          <Heart className="text-[var(--color-secondary)] size-16 animate-float-1" />
        </div>
        <div className="absolute bottom-[30%] right-[15%] opacity-30 hidden md:block">
          <PawPrint className="text-[var(--color-tertiary-fixed-dim)] size-14 animate-float-2" />
        </div>
        <div className="absolute top-[15%] right-[10%] opacity-30 rotate-12 hidden md:block">
          <PawPrint className="text-[var(--color-primary)] size-12 animate-float-3" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl text-[var(--color-on-surface)] mb-6 max-w-4xl mx-auto tracking-tight font-black">
          Find Your <span className="text-gradient font-black">Perfect Companion</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto mb-12">
          Experience the joy of pet parenthood. PawHub connects you with verified ethical breeders and loving owners looking to rehome their pets across the country.
        </p>

        {/* Search Panel */}
        <div className="glass-panel max-w-3xl mx-auto rounded-[2.5rem] p-3 md:p-4 shadow-2xl flex flex-col gap-5 relative z-10 transition-transform duration-500 hover:shadow-[var(--color-primary)]/20 hover:-translate-y-1">
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full p-2.5 border border-[var(--color-outline-variant)]/30 focus-within:border-[var(--color-primary)] focus-within:ring-4 ring-[var(--color-primary)]/20 transition-all">
            <Search className="text-[var(--color-primary)] ml-4 size-6" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-lg text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)]/70 px-4 outline-none" 
              placeholder="Search for breeds, categories, or locations..." 
              type="text"
            />
            <button type="submit" className="btn-gradient text-white rounded-full px-8 py-3.5 text-sm font-bold whitespace-nowrap hidden sm:block hover-scale">Search Pets</button>
            <button type="submit" className="btn-gradient text-white rounded-full px-4 py-3.5 text-sm font-bold whitespace-nowrap sm:hidden hover-scale"><Search className="size-5"/></button>
          </form>
          
          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 px-2 pb-2">
            <Link href="/browse?category=dogs" className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border border-[var(--color-primary)]/20 hover-scale">
              <Dog className="size-5" /> Dogs
            </Link>
            <Link href="/browse?category=cats" className="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border border-[var(--color-secondary)]/20 hover-scale">
              <Cat className="size-5" /> Cats
            </Link>
            <Link href="/dashboard/shop" className="bg-[var(--color-tertiary-fixed)] text-[var(--color-tertiary)] hover:bg-[var(--color-tertiary)] hover:text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 border border-[var(--color-tertiary)]/20 hover-scale">
              <ShoppingBag className="size-5" /> Pet Products
            </Link>
            <Link href="/dashboard/shop" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all sm:flex items-center gap-2 hidden border border-amber-500/20 hover-scale">
              <Shirt className="size-5" /> Accessories
            </Link>
          </div>

          <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block pointer-events-none">
            <PawPrint className="size-10 text-[var(--color-primary)] animate-float-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
