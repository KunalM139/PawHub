"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Heart,
  Home,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Package,
  PawPrint,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";

import {
  DashboardSidebar,
  type SidebarGroup,
} from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { cn } from "@/lib/utils";

const petOwnerNav: SidebarGroup[] = [
  {
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Pets",
    items: [
      { label: "Browse Pets", href: "/dashboard/pets", icon: PawPrint },
      { label: "Favorites", href: "/dashboard/favorites", icon: Heart },
    ],
  },
  {
    title: "Listings",
    items: [
      { label: "My Listings", href: "/dashboard/my-listings", icon: ListChecks },
      { label: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
    ],
  },
  {
    title: "Shop",
    items: [
      { label: "Pet Shop", href: "/dashboard/shop", icon: ShoppingBag, badge: "Soon" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
      { label: "Profile", href: "/dashboard/profile", icon: User },
    ],
  },
];

const sellerNav: SidebarGroup[] = [
  {
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "Overview", href: "/seller-dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Pet Listings", href: "/seller-dashboard/pet-listings", icon: PawPrint },
      { label: "Products", href: "/seller-dashboard/product-listings", icon: Package, badge: "Soon" },
      { label: "Inquiries", href: "/seller-dashboard/inquiries", icon: MessageSquare },
    ],
  },
  {
    title: "Business",
    items: [
      { label: "Messages", href: "/seller-dashboard/messages", icon: MessageSquare },
      { label: "Analytics", href: "/seller-dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Verification", href: "/seller-dashboard/verification", icon: ShieldCheck },
      { label: "Settings", href: "/seller-dashboard/settings", icon: Settings },
    ],
  },
];

type DashboardShellProps = {
  children: React.ReactNode;
  pageTitle: string;
  userType: "petOwner" | "seller";
  userName: string;
  userImage?: string | null;
  userRole: string;
};

export function DashboardShell({
  children,
  pageTitle,
  userType,
  userName,
  userImage,
  userRole,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navGroups = userType === "seller" ? sellerNav : petOwnerNav;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <DashboardSidebar
        groups={navGroups}
        userName={userName}
        userImage={userImage}
        userRole={userRole}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* Main content */}
      <div
        className={cn(
          "transition-all duration-300 flex flex-col min-h-screen",
          collapsed ? "pl-[4.5rem]" : "pl-64",
        )}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 shrink-0" />
        <DashboardTopbar
          title={pageTitle}
          sidebarOpen={false}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
