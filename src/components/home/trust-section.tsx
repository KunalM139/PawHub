import { BadgeCheck, HeartHandshake, MessageCircleMore } from "lucide-react";

import { Container } from "@/components/ui/container";

const trustPoints = [
  {
    icon: BadgeCheck,
    title: "Verified Sellers",
    text: "Seller verification and profile checks for safer transactions.",
  },
  {
    icon: HeartHandshake,
    title: "Ethical Rehome & Adoption",
    text: "Support responsible pet ownership with transparent listing types.",
  },
  {
    icon: MessageCircleMore,
    title: "Direct Contact",
    text: "Chat with owners and breeders quickly before making decisions.",
  },
];

export function TrustSection() {
  return (
    <section className="pb-12 pt-6">
      <Container>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Why PawHub</h2>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)] sm:text-base">
            Built as a trust-first marketplace for dogs and cats in India.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {trustPoints.map((point) => (
              <article
                key={point.title}
                className="rounded-2xl bg-[var(--color-surface-muted)] p-5"
              >
                <point.icon className="size-6 text-[var(--color-primary)]" />
                <h3 className="mt-3 text-base font-bold">{point.title}</h3>
                <p className="mt-1 text-sm leading-7 text-[var(--color-foreground-muted)]">
                  {point.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
