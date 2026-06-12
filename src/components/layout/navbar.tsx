"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, PawPrint, ShieldCheck, UserCircle2, X } from "lucide-react";

import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { status, data: session } = useSession();
  const profileRef = useRef<HTMLDivElement | null>(null);

  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  const dashboardHref =
    user?.userType === "seller" ? "/seller-dashboard" : "/dashboard";

    useEffect(() => {
      function handleClick(event: MouseEvent) {
        if (!profileRef.current) {
          return;
        }

        if (profileRef.current.contains(event.target as Node)) {
          return;
        }

        setProfileOpen(false);
      }

      if (profileOpen) {
        document.addEventListener("mousedown", handleClick);
      }

      return () => {
        document.removeEventListener("mousedown", handleClick);
      };
    }, [profileOpen]);
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part.trim()[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const filteredNavLinks = siteConfig.navLinks.filter((link) => {
    if (link.href === "/seller-verification") {
      return user?.userType !== "petOwner";
    }
    return true;
  });

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <Container className="flex h-[4.5rem] items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[var(--shadow-soft)]">
            <PawPrint className="size-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-[var(--color-foreground)]">
            PawHub
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[var(--color-foreground-muted)] transition-colors hover:text-[var(--color-foreground)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="inline-flex size-11 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-[var(--shadow-soft)]"
                aria-label="Open profile menu"
              >
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "Profile"}
                    width={44}
                    height={44}
                    unoptimized
                    loader={({ src }) => src}
                    className="size-11 object-cover"
                  />
                ) : userInitials ? (
                  <span className="text-sm font-semibold">{userInitials}</span>
                ) : (
                  <UserCircle2 className="size-6 text-[var(--color-foreground-muted)]" />
                )}
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-full mt-3 w-44 rounded-2xl border border-black/10 bg-white p-2 shadow-[var(--shadow-soft)]">
                  <Link
                    href="/profile"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
                    onClick={() => setProfileOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href={dashboardHref}
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
                    onClick={() => setProfileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      void signOut({ callbackUrl: "/" });
                    }}
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:bg-[var(--color-secondary)]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-soft)] transition hover:brightness-110"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex rounded-xl p-2 text-[var(--color-foreground)] md:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      <div
        className={cn(
          "border-t border-black/5 bg-white transition-all duration-300 md:hidden",
          menuOpen ? "max-h-[420px] opacity-100" : "max-h-0 overflow-hidden opacity-0",
        )}
      >
        <Container className="space-y-2 py-4">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-3 grid grid-cols-2 gap-2 pt-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]"
                >
                  My Profile
                </Link>
                <Link
                  href={dashboardHref}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut({ callbackUrl: "/" });
                  }}
                  className="col-span-2 inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-[var(--color-primary-foreground)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 px-3 py-2 text-sm font-semibold text-[var(--color-foreground)]"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-[var(--color-primary-foreground)]"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          <p className="inline-flex items-center gap-2 pt-1 text-xs text-[var(--color-foreground-subtle)]">
            <ShieldCheck className="size-4" />
            Trusted listings for dogs and cats across India
          </p>
        </Container>
      </div>
    </header>
  );
}
