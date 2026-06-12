import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";

const breeds = [
  { name: "Labrador Retriever", image: "https://images.unsplash.com/photo-1595159338600-b8c089a38f32?w=500&h=500&fit=crop" },
  { name: "Golden Retriever", image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop" },
  { name: "German Shepherd", image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&h=500&fit=crop" },
  { name: "Persian Cat", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=500&fit=crop" },
  { name: "Beagle", image: "https://images.unsplash.com/photo-1537151608804-ea2d15a4dd1b?w=500&h=500&fit=crop" },
  { name: "Shih Tzu", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop" },
];

export function PopularBreedsSection() {
  return (
    <section className="py-16 lg:py-24 bg-[#faf9f8]">
      <Container>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl text-center">
          Available Dogs & Puppies Near You
        </h2>
        <p className="mt-4 text-center text-lg text-slate-600">
          Discover more about your favorite breed and determine if it suits your lifestyle.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
          {breeds.map((breed) => (
            <Link
              key={breed.name}
              href={`/browse?q=${breed.name}`}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-surface-muted)]">
                <Image
                  src={breed.image}
                  alt={breed.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="bg-purple-500 py-3 text-center transition-colors group-hover:bg-purple-600">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{breed.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
