const fs = require('fs');
const path = require('path');

const shellPath = path.resolve('src/components/dashboard/dashboard-shell.tsx');
const sidebarPath = path.resolve('src/components/dashboard/dashboard-sidebar.tsx');
const topbarPath = path.resolve('src/components/dashboard/dashboard-topbar.tsx');

// 1. Update dashboard-shell.tsx
let shellContent = fs.readFileSync(shellPath, 'utf8');

const newNav = `const petOwnerNav: SidebarGroup[] = [
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
      { label: "Settings", href: "/seller-dashboard/settings", icon: "settings", badge: "Soon" },
      { label: "Verification", href: "/seller-dashboard/verification", icon: "verified_user" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { label: "Home", href: "/", icon: "home" },
    ],
  },
];`;

const shellImportsRegex = /const petOwnerNav: SidebarGroup\[\] = \[[\s\S]*?\];\n\nconst sellerNav: SidebarGroup\[\] = \[[\s\S]*?\];/;
shellContent = shellContent.replace(shellImportsRegex, newNav);

const shellReturnRegex = /return \([\s\S]*?\n\s*\);\n}/;
const newShellReturn = `return (
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
}`;
shellContent = shellContent.replace(shellReturnRegex, newShellReturn);
fs.writeFileSync(shellPath, shellContent, 'utf8');

// 2. Update dashboard-sidebar.tsx
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

const sidebarImportsRegex = /export type SidebarItem = {[\s\S]*?};/;
sidebarContent = sidebarContent.replace(sidebarImportsRegex, `export type SidebarItem = {
  label: string;
  href: string;
  icon: string;
  badge?: string;
};`);

const sidebarReturnRegex = /return \([\s\S]*?\n\s*\);\n}/;
const newSidebarReturn = `return (
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
}`;
sidebarContent = sidebarContent.replace(sidebarReturnRegex, newSidebarReturn);
fs.writeFileSync(sidebarPath, sidebarContent, 'utf8');

// 3. Optional: update topbar if necessary (we'll just remove the lucide icon for menu)
let topbarContent = fs.readFileSync(topbarPath, 'utf8');
topbarContent = topbarContent.replace(/import { Menu } from "lucide-react";/, '');
topbarContent = topbarContent.replace(/<Menu className="size-5" \/>/, '<span className="material-symbols-outlined text-[20px]">menu</span>');
// Make sure it looks good with the new theme
topbarContent = topbarContent.replace(/bg-white\/80/, 'bg-[var(--color-surface)]/80');
topbarContent = topbarContent.replace(/border-slate-200/, 'border-[var(--color-outline-variant)]/30');
fs.writeFileSync(topbarPath, topbarContent, 'utf8');

console.log("Successfully updated layout files to use the new sidebar design!");
