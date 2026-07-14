import type { Metadata } from "next";

import { FeaturedPetsSection } from "@/components/home/featured-pets";
import { HeroSection } from "@/components/home/hero-section";
import { TrustFeatures } from "@/components/home/trust-features";
import { CtaBanner } from "@/components/home/cta-banner";
import { FaqSection } from "@/components/home/faq-section";
import { ScrollAnimations } from "@/components/providers/scroll-animations";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Find Dogs & Cats for Sale and Adoption in India",
  description:
    "Discover verified dog and cat listings across India for sale, adoption, and responsible rehoming on PawHub.",
};

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="font-outfit home-theme pb-8 bg-[var(--color-surface)] text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] overflow-hidden">
      <ScrollAnimations />
      <HeroSection />

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 md:mb-32 reveal" id="stats-section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white card-shadow rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-[var(--color-surface-container-high)]">
            <p className="text-[var(--color-secondary)] text-sm font-bold tracking-widest uppercase mb-3">Active Listings</p>
            <h3 className="text-4xl md:text-6xl text-[var(--color-on-surface)] font-black"><span className="stat-counter" data-target="2400">0</span>+</h3>
          </div>
          <div className="bg-white card-shadow rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-[var(--color-surface-container-high)]">
            <p className="text-[var(--color-primary)] text-sm font-bold tracking-widest uppercase mb-3">Verified Sellers</p>
            <h3 className="text-4xl md:text-6xl text-[var(--color-on-surface)] font-black"><span className="stat-counter" data-target="730">0</span>+</h3>
          </div>
          <div className="bg-white card-shadow rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-[var(--color-surface-container-high)]">
            <p className="text-[var(--color-tertiary-container)] text-sm font-bold tracking-widest uppercase mb-3">Cities Covered</p>
            <h3 className="text-4xl md:text-6xl text-[var(--color-on-surface)] font-black"><span className="stat-counter" data-target="40">0</span>+</h3>
          </div>
        </div>
      </section>

      <FeaturedPetsSection />
      <TrustFeatures />
      <FaqSection />
      <CtaBanner />
    </div>
  );
}
