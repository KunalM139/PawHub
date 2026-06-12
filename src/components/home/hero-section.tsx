import Image from "next/image";
import Link from "next/link";
import { Search, Heart } from "lucide-react";
import { Container } from "@/components/ui/container";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 pt-16 pb-20 lg:pt-24 lg:pb-32">
      {/* Decorative background elements */}
      <div className="absolute left-10 top-20 opacity-20">
        <Heart className="size-12 text-pink-400 rotate-12" />
      </div>
      <div className="absolute right-20 bottom-20 opacity-20">
        <Heart className="size-16 text-purple-400 -rotate-12" />
      </div>

      <Container className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            Find the perfect companion for your family
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
            Experience the joy of pet parenthood. PawHub connects you with verified ethical breeders and loving owners looking to rehome their pets across India.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/browse"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-8 text-base font-bold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl hover:brightness-110"
            >
              <Search className="size-5" />
              Find Your Pet
            </Link>
            <Link
              href="/post-listing"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-slate-900 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              Rehome a Pet
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          {/* Image */}
          <div className="relative aspect-[4/3] w-full lg:aspect-square drop-shadow-2xl">
            <Image
              src="/images/home/hero-pet.png"
              alt="Happy pet owner"
              fill
              priority
              className="object-contain"
            />
          </div>
          
          {/* Floating badge */}
          <div className="absolute -left-6 bottom-12 rounded-2xl bg-white p-4 shadow-xl sm:bottom-24 sm:left-0 rotate-[-4deg]">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Heart className="size-5 fill-current" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">10k+ Pets</p>
                <p className="text-xs font-medium text-slate-500">Found loving homes</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
