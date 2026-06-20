"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/pets": "Browse Pets",
  "/dashboard/favorites": "Favorites",
  "/dashboard/my-listings": "My Listings",
  "/dashboard/shop": "Pet Shop",
  "/dashboard/messages": "Messages",
  "/dashboard/profile": "Profile",
  "/dashboard/inquiries": "Inquiries",
  "/seller-dashboard": "Seller Overview",
  "/seller-dashboard/pet-listings": "Pet Listings",
  "/seller-dashboard/product-listings": "Product Listings",
  "/seller-dashboard/messages": "Customer Messages",
  "/seller-dashboard/inquiries": "Inquiries",
  "/seller-dashboard/orders": "Customer Orders",
  "/seller-dashboard/analytics": "Analytics",
  "/seller-dashboard/verification": "Verification",
  "/seller-dashboard/settings": "Settings",
};

type DashboardShellWrapperProps = {
  children: React.ReactNode;
  userType: "petOwner" | "seller";
  userName: string;
  userImage: string | null;
  userRole: string;
};

export function DashboardShellWrapper({
  children,
  userType,
  userName,
  userImage,
  userRole,
}: DashboardShellWrapperProps) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? "Dashboard";

  return (
    <DashboardShell
      pageTitle={pageTitle}
      userType={userType}
      userName={userName}
      userImage={userImage}
      userRole={userRole}
    >
      {children}
    </DashboardShell>
  );
}
