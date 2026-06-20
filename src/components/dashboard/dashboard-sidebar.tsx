"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
};

export type SidebarGroup = {
  title?: string;
  items: SidebarItem[];
};

type DashboardSidebarProps = {
  groups: SidebarGroup[];
  userName: string;
  userImage?: string | null;
  userRole: string;
  collapsed: boolean;
  onToggle: () => void;
};

export function DashboardSidebar({
  groups,
  userName,
  userImage,
  userRole,
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = userName
    .split(" ")
    .map((p) => p.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] transition-all duration-300",
        collapsed ? "w-[4.5rem]" : "w-64 lg:w-[280px]"
      )}
    >
      {/* Logo & Collapse */}
      <div className={cn("p-6 flex items-center gap-3 border-b border-[var(--color-outline-variant)]/30 relative", collapsed && "p-4 justify-center")}>
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
          </div>
          {!collapsed && (
            <h1 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-primary)] tracking-tight">PawHub</h1>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "absolute -right-3.5 top-6 z-50 hidden size-7 items-center justify-center rounded-full border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] shadow-sm transition hover:bg-[var(--color-surface-container-high)] lg:inline-flex",
            collapsed && "rotate-180"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>
      </div>

      {/* User Info */}
      <div className={cn("p-6 flex items-center gap-3 border-b border-[var(--color-outline-variant)]/30", collapsed && "p-4 justify-center")}>
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
            className="w-10 h-10 shrink-0 rounded-full object-cover ring-2 ring-white"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--color-secondary-container)] flex items-center justify-center text-white shrink-0 font-bold">
            {initials}
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <h2 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold leading-tight text-[var(--color-on-surface)] truncate">
              {userName}
            </h2>
            <div className="text-[var(--color-on-surface-variant)] text-xs truncate capitalize">
              {userRole === "verifiedSeller" ? "Verified Seller" : userRole}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {groups.map((group, gIdx) => (
          <div key={gIdx}>
            {group.title && !collapsed && (
              <h3 className="px-4 mb-2 text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider">
                {group.title}
              </h3>
            )}
            {group.title && collapsed && (
              <div className="mx-auto mb-2 h-px w-6 bg-[var(--color-outline-variant)]/30" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "nav-item flex items-center gap-3 rounded-lg text-[14px] leading-[1.2] tracking-[0.05em] font-semibold transition-all duration-200",
                      collapsed ? "justify-center p-2" : "px-4 py-2",
                      isActive
                        ? "active bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-primary)]/5 hover:translate-x-1"
                    )}
                  >
                    <span
                      className={cn("material-symbols-outlined text-[20px]", isActive && "active")}
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)] text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[var(--color-outline-variant)]/30">
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => {
            setIsLoggingOut(true);
            void signOut({ callbackUrl: "/" });
          }}
          className={cn(
            "nav-item flex w-full items-center gap-3 rounded-lg text-[var(--color-on-surface)] text-sm font-semibold transition-all duration-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50",
            collapsed ? "justify-center p-2" : "px-4 py-2 hover:translate-x-1"
          )}
        >
          {collapsed ? (
            <span className="material-symbols-outlined text-[20px]">logout</span>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-[var(--color-on-surface)] text-[var(--color-surface)] flex items-center justify-center text-[10px] font-bold">
                {initials[0] || 'L'}
              </div>
              <span className="truncate">{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
