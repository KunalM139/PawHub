"use client";

import { useState, useEffect } from "react";


import {
  DashboardSidebar,
  type SidebarGroup,
} from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { cn } from "@/lib/utils";

const petOwnerNav: SidebarGroup[] = [
  {
    title: "Activity",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { label: "Favorites", href: "/dashboard/favorites", icon: "favorite" },
      { label: "Messages", href: "/dashboard/messages", icon: "mail" },
    ],
  },
  {
    title: "My Pets",
    items: [
      { label: "Adoption Inquiries", href: "/dashboard/inquiries", icon: "chat_bubble_outline" },
      { label: "My Listings", href: "/dashboard/my-listings", icon: "pets" },
    ],
  },
  {
    title: "Shop",
    items: [
      { label: "Pet Products", href: "/dashboard/shop", icon: "shopping_cart" },
      { label: "My Orders", href: "/dashboard/orders", icon: "shopping_bag" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/dashboard/profile", icon: "settings" },
      { label: "Addresses", href: "/dashboard/addresses", icon: "location_on" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "Home", href: "/", icon: "home" },
    ],
  },
];

const sellerNav: SidebarGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/seller-dashboard", icon: "dashboard" },
      { label: "Analytics", href: "/seller-dashboard/analytics", icon: "monitoring" },
    ],
  },
  {
    title: "Sales & Shop",
    items: [
      { label: "Inquiries", href: "/seller-dashboard/inquiries", icon: "chat_bubble_outline" },
      { label: "Messages", href: "/seller-dashboard/messages", icon: "mail" },
      { label: "Shop Orders", href: "/seller-dashboard/orders", icon: "shopping_bag" },
    ],
  },
  {
    title: "Inventory",
    items: [
      { label: "Pet Listings", href: "/seller-dashboard/pet-listings", icon: "pets" },
      { label: "Products", href: "/seller-dashboard/product-listings", icon: "inventory_2" },
    ],
  },
  {
    title: "Buying",
    items: [
      { label: "Pet Products", href: "/dashboard/shop", icon: "shopping_cart" },
      { label: "My Purchases", href: "/dashboard/orders", icon: "receipt_long" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Settings", href: "/seller-dashboard/settings", icon: "settings" },
      { label: "Verification", href: "/seller-dashboard/verification", icon: "verified_user" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "Home", href: "/", icon: "home" },
    ],
  },
];

const adminNav: SidebarGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: "dashboard" },
      { label: "Activity Log", href: "/admin/activity", icon: "history" },
    ],
  },
  {
    title: "Marketplace",
    items: [
      { label: "Users", href: "/admin/users", icon: "group" },
      { label: "Verification", href: "/admin/verification", icon: "verified_user" },
    ],
  },
  {
    title: "Moderation",
    items: [
      { label: "Reports", href: "/admin/reports", icon: "report" },
      { label: "Trust & Safety", href: "/admin/trust-safety", icon: "gavel" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: "monitoring" },
      { label: "Notifications", href: "/admin/notifications", icon: "notifications" },
      { label: "Settings", href: "/admin/settings", icon: "settings" },
    ],
  },
];

type DashboardShellProps = {
  children: React.ReactNode;
  pageTitle: string;
  userType: "petOwner" | "seller" | "admin";
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

  const navGroups = userRole === "admin" ? adminNav : (userType === "seller" ? sellerNav : petOwnerNav);

  return (
    <div className="font-outfit home-theme bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen antialiased flex overflow-hidden">
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
          "flex-1 flex flex-col overflow-hidden h-screen transition-all duration-300",
          collapsed ? "ml-[4.5rem]" : "ml-64 lg:ml-[280px]"
        )}
      >
        <DashboardTopbar
          title={pageTitle}
          sidebarOpen={false}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

