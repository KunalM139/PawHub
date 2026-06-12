import type { Metadata } from "next";

import { FeaturedPetsSection } from "@/components/home/featured-pets";
import { HeroSection } from "@/components/home/hero-section";
import { PopularBreedsSection } from "@/components/home/popular-breeds";
import { ThingsToConsider } from "@/components/home/things-to-consider";
import { PetBenefits } from "@/components/home/pet-benefits";
import { FaqSection } from "@/components/home/faq-section";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Find Dogs & Cats for Sale and Adoption in India",
  description:
    "Discover verified dog and cat listings across India for sale, adoption, and responsible rehoming on PawHub.",
};

export default function Home() {
  return (
    <div className="pb-8">
      <HeroSection />

      <section className="pb-6">
        <Container>
          <div className="grid gap-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:grid-cols-3 sm:p-8">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-orange-50/50 p-6 text-center border border-orange-100">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
                Active Listings
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">2,400+</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-purple-50/50 p-6 text-center border border-purple-100">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-600">
                Verified Sellers
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">730+</p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50/50 p-6 text-center border border-blue-100">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Cities Covered
              </p>
              <p className="mt-2 text-3xl font-black text-slate-900">40+</p>
            </div>
          </div>
        </Container>
      </section>

      <FeaturedPetsSection />
      <PopularBreedsSection />
      <ThingsToConsider />
      <PetBenefits />
      <FaqSection />
    </div>
  );
}
