import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  BarChart3,
  Eye,
  Heart,
  ListChecks,
  MessageSquare,
  PawPrint,
  Plus,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { MessageModel } from "@/server/models/message";
import { ReviewModel } from "@/server/models/review";
import { UserModel } from "@/server/models/user";
import { ProductModel } from "@/server/models/product";

export const metadata: Metadata = {
  title: "Seller Dashboard | PawHub",
  description: "Manage your pet business on PawHub.",
  robots: { index: false, follow: false },
};

export default async function SellerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const userId = session.user.id;

  const [totalListings, activeListings, totalInquiries, reviews, profile, products] =
    await Promise.all([
      ListingModel.countDocuments({ sellerId: userId }),
      ListingModel.countDocuments({ sellerId: userId, status: "approved" }),
      MessageModel.countDocuments({ receiverId: userId }),
      ReviewModel.find({ sellerId: userId }).select("rating").lean(),
      UserModel.findById(userId).select("name image role storeViews").lean(),
      ProductModel.find({ sellerId: userId }).select("_id views").lean(),
    ]);

  // Real Analytics Aggregation
  const storeViews = (profile?.storeViews as number) || 0;
  const productViews = products.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalViews = storeViews + productViews;

  // Favorites (Count of wishlists containing seller's products)
  let favoritesCount = 0;
  if (products.length > 0) {
    const productIds = products.map(p => p._id);
    const { WishlistModel } = await import("@/server/models/wishlist");
    favoritesCount = await WishlistModel.countDocuments({
      productIds: { $in: productIds }
    });
  }

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + ((r.rating as number) ?? 0), 0) /
          reviews.length
        ).toFixed(1)
      : "N/A";

  const userName = (profile?.name as string) ?? "Seller";
  const isVerified = profile?.role === "verifiedSeller";

  const quickActions = [
    {
      label: "Add Pet Listing",
      description: "Create a new listing for a dog or cat",
      href: "/post-listing",
      icon: Plus,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "View Inquiries",
      description: "Respond to customer messages",
      href: "/seller-dashboard/messages",
      icon: MessageSquare,
      gradient: "from-sky-500 to-blue-600",
    },
    {
      label: "Verification",
      description: isVerified ? "You're verified!" : "Get your verified badge",
      href: "/seller-dashboard/verification",
      icon: ShieldCheck,
      gradient: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] min-h-screen">
      <main className="max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-xl bg-[var(--color-inverse-surface)] text-[var(--color-inverse-on-surface)] p-[32px] shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface)]/20 border border-[var(--color-surface)]/30 text-[14px] leading-[1.2] tracking-[0.05em] font-semibold backdrop-blur-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
              Seller Central
              {isVerified && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </span>
              )}
            </span>
            <h1 className="text-[32px] leading-[1.2] font-semibold">Welcome back, {userName}!</h1>
            <p className="text-[18px] leading-[1.6] max-w-2xl opacity-90">Manage your pet listings, track performance, and grow your business on India's most trusted pet marketplace.</p>
          </div>
          {/* Decorative Element */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 pointer-events-none mix-blend-overlay">
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCyYgoWky4-KsCAMh4XGeAD1u9953aeY-dohBLtUjd9d3DXAUAgyVCTZi0LWqMKapMwuntC3NhZU0NaU1l9Qj3hQG8Al1USBRbntW5QyPS2AUO148rh2QcwVyBTUOcvTC3B_smF_xu76N0e2Uwv9m_ZaDBHczsXaydr9Ieuy-E8SE4gWcxne2mXRm9LQBUSVtSE0W8LcS0HPykiaLzYD_PsRiHSy07O9TjFDxSqZKIYGd8-khgdhoAg7iiC0-hpVIIknTCYWd28IC4')" }}></div>
          </div>
        </section>

        {/* KPI Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric 1 */}
          <div className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-6 card-shadow hover-scale flex flex-col justify-between h-full border border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Total Listings</h3>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <span className="material-symbols-outlined">format_list_bulleted</span>
              </div>
            </div>
            <div>
              <div className="text-[32px] leading-[1.2] font-semibold mb-1">{totalListings}</div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-6 card-shadow hover-scale flex flex-col justify-between h-full border border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Active Listings</h3>
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)]/20 flex items-center justify-center text-[var(--color-primary)]">
                <span className="material-symbols-outlined">pets</span>
              </div>
            </div>
            <div>
              <div className="text-[32px] leading-[1.2] font-semibold mb-1">{activeListings}</div>
              <p className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-primary)]">{totalListings > 0 ? Math.round((activeListings / totalListings) * 100) : 0}% approved</p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-6 card-shadow hover-scale flex flex-col justify-between h-full border border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Total Inquiries</h3>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <span className="material-symbols-outlined">chat_bubble_outline</span>
              </div>
            </div>
            <div>
              <div className="text-[32px] leading-[1.2] font-semibold mb-1">{totalInquiries}</div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-6 card-shadow hover-scale flex flex-col justify-between h-full border border-[var(--color-outline-variant)]/30">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Seller Rating</h3>
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container-high)] flex items-center justify-center text-[var(--color-on-surface)]">
                <span className="material-symbols-outlined">star_rate</span>
              </div>
            </div>
            <div>
              <div className="text-[32px] leading-[1.2] font-semibold mb-1">{avgRating}</div>
              <p className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)]">{reviews.length} reviews</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Action 1 */}
          <Link className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-6 card-shadow hover-scale group block border border-[var(--color-outline-variant)]/30" href="/post-listing">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-700 mb-4">
              <span className="material-symbols-outlined">add</span>
            </div>
            <h3 className="text-[24px] leading-[1.3] font-semibold mb-2 group-hover:text-[var(--color-primary)] transition-colors">Add Pet Listing</h3>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] mb-4">Create a new listing for a dog or cat</p>
            <span className="material-symbols-outlined text-[var(--color-primary)] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>

          {/* Action 2 */}
          <Link className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-6 card-shadow hover-scale group block border border-[var(--color-outline-variant)]/30" href="/seller-dashboard/messages">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
              <span className="material-symbols-outlined">inbox</span>
            </div>
            <h3 className="text-[24px] leading-[1.3] font-semibold mb-2 group-hover:text-[var(--color-primary)] transition-colors">View Inquiries</h3>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] mb-4">Respond to customer messages</p>
            <span className="material-symbols-outlined text-[var(--color-primary)] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>

          {/* Action 3 */}
          <Link className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-6 card-shadow hover-scale group block border border-[var(--color-outline-variant)]/30" href="/seller-dashboard/verification">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-[var(--color-primary)] mb-4">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <h3 className="text-[24px] leading-[1.3] font-semibold mb-2 group-hover:text-[var(--color-primary)] transition-colors">Verification</h3>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] mb-4">{isVerified ? "You're verified!" : "Get your verified badge"}</p>
            <span className="material-symbols-outlined text-[var(--color-primary)] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </section>

        {/* Performance Summary */}
        <section className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] p-[32px] card-shadow border border-[var(--color-outline-variant)]/30">
          <div className="mb-6">
            <h2 className="text-[24px] leading-[1.3] font-semibold mb-1">Performance Summary</h2>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)]">Quick snapshot of your seller metrics</p>
          </div>
          <div className="bg-[var(--color-surface-container-low)] rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-outline-variant)]/50 gap-6 md:gap-0">
            {/* Stat 1 */}
            <div className="flex flex-col items-center justify-center text-center px-4 py-4 md:py-0">
              <span className="material-symbols-outlined text-[var(--color-outline)] mb-2">visibility</span>
              <div className="text-[32px] leading-[1.2] font-semibold mb-1">{totalViews}</div>
              <div className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Total Views</div>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center justify-center text-center px-4 py-4 md:py-0">
              <span className="material-symbols-outlined text-[var(--color-outline)] mb-2">favorite_border</span>
              <div className="text-[32px] leading-[1.2] font-semibold mb-1">{favoritesCount}</div>
              <div className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Favorites</div>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center justify-center text-center px-4 py-4 md:py-0">
              <span className="material-symbols-outlined text-[var(--color-outline)] mb-2">bar_chart</span>
              <div className="text-[32px] leading-[1.2] font-semibold mb-1">{totalInquiries}</div>
              <div className="text-[14px] leading-[1.2] tracking-[0.05em] font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Leads</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
