export const siteConfig = {
  name: "PawHub",
  description:
    "India's trusted premium marketplace to buy, adopt, and rehome dogs and cats.",
  tagline: "Find your perfect furry family member.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  navLinks: [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse Pets" },
    { href: "/dashboard/shop", label: "Pet Products" },
    { href: "/post-listing", label: "Post Listing" },
    { href: "/seller-verification", label: "Verify Seller" },
  ],
  legalLinks: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
