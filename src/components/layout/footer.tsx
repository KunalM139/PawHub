import Link from "next/link";
import { PawPrint } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";

const quickLinks = [
  { href: "/browse", label: "Browse Pets" },
  { href: "/post-listing", label: "Post Listing" },
  { href: "/seller-verification", label: "Seller Verification" },
  { href: "/about", label: "About PawHub" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-white">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)]">
                <PawPrint className="size-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">PawHub</span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--color-foreground-muted)]">
              Premium marketplace to safely buy, adopt, and rehome dogs and cats in India.
              Built for trust, transparency, and excellent mobile experience.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-foreground)]">
              Explore
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--color-foreground-muted)] transition-colors hover:text-[var(--color-foreground)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--color-foreground)]">
              Legal
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {siteConfig.legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[var(--color-foreground-muted)] transition-colors hover:text-[var(--color-foreground)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-black/5 pt-5 text-xs text-[var(--color-foreground-subtle)]">
          <p>
            Copyright {new Date().getFullYear()} PawHub. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
