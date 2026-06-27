"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, PawPrint, ShieldCheck, UserCircle2, X } from "lucide-react";

import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { status, data: session } = useSession();
  const profileRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

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
    // Hide customer/seller links from Admins
    if (user?.role === "admin") {
      return false; // Admins should not see "Browse Pets", "Pet Products", "Post Listing", "Verify Seller"
    }

    if (link.href === "/seller-verification") {
      return user?.userType !== "petOwner";
    }
    return true;
  });

  return (
    <header className="sticky top-0 z-50 w-full pt-4 pb-2 bg-transparent transition-all duration-300 font-outfit home-theme" id="navbar-container">
      {/* Desktop Navbar (Floating Pill) */}
      <nav id="main-nav" className="hidden lg:flex justify-between items-center mx-auto max-w-7xl rounded-full px-6 py-3 bg-white/80 border border-white/40 sticky-nav backdrop-blur-xl shadow-sm">
        
        {/* LOGO */}
        <Link href="/" className="inline-flex items-center gap-2">
          <PawPrint className="text-[var(--color-primary)] size-8 hover:rotate-12 transition-transform" />
          <span className="text-2xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            PawHub
          </span>
        </Link>

        {/* Desktop Tabs */}
        <div className="flex items-center gap-2">
          {filteredNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 hover-scale",
                  isActive 
                    ? "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]" 
                    : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Profile / Auth Buttons */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="inline-flex size-11 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm hover-scale"
              >
                {user?.image ? (
                  <Image src={user.image} alt={user.name ?? "Profile"} width={44} height={44} unoptimized loader={({ src }) => src} className="size-11 object-cover" />
                ) : userInitials ? (
                  <span className="text-sm font-bold text-[var(--color-on-surface)]">{userInitials}</span>
                ) : (
                  <UserCircle2 className="size-6 text-[var(--color-on-surface-variant)]" />
                )}
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-full mt-3 w-44 rounded-2xl border border-black/10 bg-white p-2 shadow-lg z-50">
                  <Link href="/profile" className="block rounded-xl px-3 py-2 text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]" onClick={() => setProfileOpen(false)}>My Profile</Link>
                  <Link href={dashboardHref} className="block rounded-xl px-3 py-2 text-sm font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]" onClick={() => setProfileOpen(false)}>Dashboard</Link>
                  <button type="button" onClick={() => { setProfileOpen(false); void signOut({ callbackUrl: "/" }); }} className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50">Logout</button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] px-4 py-2 text-sm font-bold transition-colors hover-scale">Sign In</Link>
              <Link href="/register" className="btn-gradient text-white rounded-full px-6 py-2.5 text-sm font-bold hover-scale transition-all">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div id="mobile-nav" className="lg:hidden flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-xl border-b border-[var(--color-outline-variant)]/20 shadow-sm sticky-nav mx-4 rounded-3xl mt-2">
        <Link href="/" className="flex items-center gap-2">
          <PawPrint className="text-[var(--color-primary)] size-6" />
          <span className="text-xl font-extrabold text-[var(--color-on-surface)]">PawHub</span>
        </Link>
        <button
          type="button"
          className="text-[var(--color-on-surface)] p-2 bg-[var(--color-surface-container)] rounded-full hover-scale"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5 text-red-500" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          "absolute left-4 right-4 top-20 border border-black/5 bg-white transition-all duration-300 lg:hidden overflow-y-auto shadow-2xl rounded-3xl z-50",
          menuOpen ? "max-h-[80vh] opacity-100 p-4" : "max-h-0 overflow-hidden opacity-0 border-transparent"
        )}
      >
        <div className="space-y-1">
          {filteredNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-2xl px-4 py-3 text-base font-bold transition-colors",
                  isActive
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "text-slate-700 hover:bg-slate-50"
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="mt-4 grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center rounded-xl border border-black/10 px-3 py-3 text-sm font-bold text-[var(--color-foreground)] bg-slate-50">My Profile</Link>
                <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center rounded-xl border border-black/10 px-3 py-3 text-sm font-bold text-[var(--color-foreground)] bg-slate-50">Dashboard</Link>
                <button type="button" onClick={() => { setMenuOpen(false); void signOut({ callbackUrl: "/" }); }} className="col-span-2 inline-flex items-center justify-center rounded-xl bg-red-50 text-red-600 px-3 py-3 text-sm font-bold">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="inline-flex items-center justify-center rounded-xl border border-black/10 px-3 py-3 text-sm font-bold text-[var(--color-foreground)] bg-slate-50">Sign In</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-gradient inline-flex items-center justify-center rounded-xl px-3 py-3 text-sm font-bold text-[var(--color-primary-foreground)]">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
