import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Heart } from "lucide-react";

const benefits = [
  "A reason to smile every morning",
  "An excuse to get outside and explore",
  "Unconditional love without judgment",
  "A natural stress reliever after a long day",
  "Laughter from their goofy everyday antics",
  "A companion who makes a house feel like home",
];

export function PetBenefits() {
  return (
    <section className="bg-[#fff9f5] py-16 lg:py-24">
      <Container className="grid gap-16 lg:grid-cols-2 lg:items-center">
        {/* Left: Decorative Image */}
        <div className="relative mx-auto max-w-md lg:max-w-none">
          {/* Offset Border Decoration */}
          <div className="absolute -inset-4 rounded-[2rem] border-2 border-orange-200 bg-transparent sm:-inset-6" />
          
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-white shadow-xl">
            <Image
              src="/images/home/benefits-basket.png"
              alt="Puppy and kitten in a basket"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right: Benefits List */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            How a Pet Transforms Your Life
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            It’s not just about giving an animal a home. The benefits they bring into your life are truly immeasurable.
          </p>

          <ul className="mt-10 space-y-5">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="mt-1 flex size-6 shrink-0 items-center justify-center text-orange-500">
                  <Heart className="size-5 fill-current" />
                </div>
                <span className="text-lg font-medium text-slate-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
