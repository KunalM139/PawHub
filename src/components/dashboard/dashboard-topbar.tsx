"use client";

import { useEffect, useState, useRef } from "react";
import { ShoppingCart, Heart, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSocket } from "@/components/providers/socket-provider";

type DashboardTopbarProps = {
  title: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
};

export function DashboardTopbar({
  title,
}: DashboardTopbarProps) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function fetchCart() {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => {
          if (data?.cart?.items) {
            const count = data.cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0);
            setCartCount(count);
          }
        })
        .catch(() => null);
    }
    
    function fetchWishlist() {
      fetch("/api/wishlist")
        .then((res) => res.json())
        .then((data) => {
          if (data?.wishlist?.productIds) {
            setWishlistCount(data.wishlist.productIds.length);
          }
        })
        .catch(() => null);
    }

    function fetchNotifications() {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data?.notifications) {
            setNotifications(data.notifications);
          }
        })
        .catch(() => null);
    }

    if (pathname.includes("dashboard")) {
      fetchCart();
      fetchWishlist();
      fetchNotifications();
    }

    window.addEventListener("cart-updated", fetchCart);
    window.addEventListener("wishlist-updated", fetchWishlist);
    window.addEventListener("notifications-updated", fetchNotifications);
    
    return () => {
      window.removeEventListener("cart-updated", fetchCart);
      window.removeEventListener("wishlist-updated", fetchWishlist);
      window.removeEventListener("notifications-updated", fetchNotifications);
    };
  }, [pathname]);

  // Real-time notifications via Socket.io
  useEffect(() => {
    if (!socket) return;
    
    function handleNewNotification(newNotification: any) {
      setNotifications((prev) => [newNotification, ...prev]);
      // Optional: play a sound or show a toast here
    }

    socket.on("notification", handleNewNotification);
    
    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAsRead() {
    if (unreadCount === 0) return;
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  function toggleNotifications() {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markAsRead();
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/80 px-4 backdrop-blur-md sm:px-6">
      <h1 className={cn("text-xl font-extrabold tracking-tight text-slate-900")}>
        {title}
      </h1>

      <div className="flex items-center gap-4 pr-2">
        <div className="relative" ref={dropdownRef}>
          <button onClick={toggleNotifications} className="relative p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] rounded-full transition-colors group">
            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-[var(--color-surface)] animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--color-surface-container-lowest)] rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-outline-variant)]/30 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center p-4 border-b border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-low)]">
                <h3 className="font-bold text-[var(--color-on-surface)]">Notifications</h3>
                <Link href="/dashboard/notifications" onClick={() => setShowNotifications(false)} className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors">
                  View All
                </Link>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[var(--color-on-surface-variant)]">
                    No new notifications
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-outline-variant)]/10">
                    {notifications.slice(0, 5).map((n: any) => (
                      <div key={n._id} className={`p-4 ${n.isRead ? 'bg-[var(--color-surface-container-lowest)]' : 'bg-[var(--color-primary)]/5'}`}>
                        <p className="text-sm font-bold text-[var(--color-on-surface)] mb-1">{n.title}</p>
                        <p className="text-xs text-[var(--color-on-surface-variant)] line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!pathname.startsWith("/admin") && (
          <>
            <Link href="/dashboard/wishlist" className="relative p-2 text-[var(--color-on-surface-variant)] hover:text-rose-500 hover:bg-[var(--color-surface-container-low)] rounded-full transition-colors group">
              <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-[var(--color-surface)]">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>
            
            <Link href="/dashboard/cart" className="relative p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] rounded-full transition-colors group">
              <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white ring-2 ring-[var(--color-surface)]">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
