"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  ChevronLeft,
  LogOut,
  PawPrint,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
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
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      {/* Logo & Collapse */}
      <div className={cn("relative flex h-16 items-center px-4", collapsed && "px-0 justify-center")}>
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            <PawPrint className="size-[18px]" />
          </span>
          {!collapsed && (
            <span className="text-xl font-black tracking-tight text-slate-900">
              PawHub
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "absolute -right-3.5 top-5 z-50 hidden size-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50 hover:text-slate-600 sm:inline-flex",
            collapsed && "rotate-180",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className="size-4" />
        </button>
      </div>

      {/* User Info */}
      <div className={cn("mx-3 mb-4 mt-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-3 transition-all", collapsed && "mx-0 px-0 flex items-center justify-center border-none bg-transparent")}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          {userImage ? (
            <img
              src={userImage}
              alt={userName}
              className="size-9 shrink-0 rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-orange-400 text-xs font-bold text-white shadow-sm">
              {initials}
            </span>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {userName}
              </p>
              <p className="truncate text-[11px] font-medium capitalize text-slate-500">
                {userRole === "verifiedSeller" ? "Verified Seller" : userRole}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className={cn(gIdx > 0 && "mt-6")}>
            {group.title && !collapsed && (
              <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                {group.title}
              </p>
            )}
            {group.title && collapsed && (
              <div className="mx-auto mb-2 h-px w-6 bg-slate-200" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-150",
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-[18px] shrink-0 transition-colors",
                          isActive ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600",
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-700">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={() => {
            setIsLoggingOut(true);
            void signOut({ callbackUrl: "/" });
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="size-[18px] shrink-0" />
          {!collapsed && <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
    </aside>
  );
}
