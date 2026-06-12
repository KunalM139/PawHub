import { BadgeCheck } from "lucide-react";

import { Container } from "@/components/ui/container";

const verifiedSellers = [
  { name: "Happy Tails Kennels", city: "Bengaluru", listings: 32 },
  { name: "Royal Paws Cattery", city: "Mumbai", listings: 18 },
  { name: "Puppy Planet", city: "Delhi", listings: 24 },
];

export function VerifiedSellersSection() {
  return (
    <section className="pb-12 pt-2">
      <Container>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Verified Sellers</h2>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            Profiles reviewed by PawHub to help buyers and adopters connect with confidence.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {verifiedSellers.map((seller) => (
              <article key={seller.name} className="rounded-2xl bg-[var(--color-surface-muted)] p-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-foreground)]">
                  <BadgeCheck className="size-4 text-[var(--color-primary)]" />
                  Verified
                </div>
                <h3 className="mt-3 text-base font-bold">{seller.name}</h3>
                <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{seller.city}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-foreground)]">
                  {seller.listings} active listings
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
