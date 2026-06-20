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
    <footer className="bg-white border-t border-[var(--color-outline-variant)]/20 w-full pt-16 pb-8 reveal font-outfit home-theme">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <PawPrint className="text-[var(--color-primary)] size-10 hover:rotate-12 transition-transform" />
            <span className="text-2xl font-black text-[var(--color-on-surface)] tracking-tight">PawHub</span>
          </Link>
          <p className="font-body-md text-base text-[var(--color-on-surface-variant)] mb-6 leading-relaxed">
            Premium marketplace to safely buy, adopt, and rehome dogs and cats. Built for trust, transparency, and excellent experience.
          </p>
        </div>
        
        <div>
          <h4 className="text-sm text-[var(--color-on-surface)] font-extrabold uppercase tracking-widest mb-6">Explore</h4>
          <ul className="space-y-4">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-base text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-medium transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm text-[var(--color-on-surface)] font-extrabold uppercase tracking-widest mb-6">Company</h4>
          <ul className="space-y-4">
            <li>
              <Link href="/about" className="text-base text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] font-medium transition-colors hover:translate-x-1 inline-block duration-200">
                About PawHub
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-base text-[var(--color-on-surface-variant)] hover:text-[var(--color-secondary)] font-medium transition-colors hover:translate-x-1 inline-block duration-200">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm text-[var(--color-on-surface)] font-extrabold uppercase tracking-widest mb-6">Legal</h4>
          <ul className="space-y-4">
            {siteConfig.legalLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-base text-[var(--color-on-surface-variant)] hover:text-[var(--color-tertiary)] font-medium transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 border-t border-[var(--color-surface-container-high)] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-base text-[var(--color-on-surface-variant)] font-medium">
          Copyright {new Date().getFullYear()} PawHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
