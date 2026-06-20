import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  ArrowRight,
  Heart,
  ListChecks,
  MessageSquare,
  PawPrint,
  Search,
  Sparkles,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { FavoriteModel } from "@/server/models/favorite";
import { ListingModel } from "@/server/models/listing";
import { MessageModel } from "@/server/models/message";
import { UserModel } from "@/server/models/user";
import { OrderModel } from "@/server/models/order";

export const metadata: Metadata = {
  title: "Dashboard | PawHub",
  description:
    "Your PawHub dashboard — manage favorites, listings, messages, and profile.",
  robots: { index: false, follow: false },
};

export default async function PetOwnerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const userId = session.user.id;

  const [favCount, listingCount, msgCount, profile, recentFavorites, recentOrders, recentMessages] =
    await Promise.all([
      FavoriteModel.countDocuments({ userId }),
      ListingModel.countDocuments({ sellerId: userId }),
      MessageModel.countDocuments({
        $or: [{ senderId: userId }, { receiverId: userId }],
      }),
      UserModel.findById(userId).select("name image").lean(),
      FavoriteModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("listingId", "title breed")
        .lean(),
      OrderModel.find({ buyerId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("productId", "title")
        .lean(),
      MessageModel.find({ $or: [{ senderId: userId }, { receiverId: userId }] })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  const userName = (profile?.name as string) ?? "there";

  let allActivity: any[] = [];

  recentFavorites.forEach((fav: any) => {
    const listing = fav.listingId && typeof fav.listingId === "object" ? fav.listingId : null;
    allActivity.push({
      id: `fav-${fav._id}`,
      createdAt: new Date(fav.createdAt),
      title: listing ? `Saved "${listing.title}"` : "Saved a listing",
      description: listing?.breed ?? "Pet listing",
      dotColor: "bg-rose-400",
    });
  });

  recentOrders.forEach((order: any) => {
    const product = order.productId && typeof order.productId === "object" ? order.productId : null;
    allActivity.push({
      id: `order-${order._id}`,
      createdAt: new Date(order.createdAt),
      title: product ? `Ordered "${product.title}"` : "Placed an order",
      description: `Status: ${String(order.status).replace("_", " ")}`,
      dotColor: "bg-emerald-400",
    });
  });

  recentMessages.forEach((msg: any) => {
    const isSent = String(msg.senderId) === userId;
    allActivity.push({
      id: `msg-${msg._id}`,
      createdAt: new Date(msg.createdAt),
      title: isSent ? "Sent a message" : "Received a message",
      description: msg.body && msg.body.length > 40 ? `${msg.body.substring(0, 40)}...` : (msg.body || "Message"),
      dotColor: "bg-purple-400",
    });
  });

  allActivity.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const topActivity = allActivity.slice(0, 5);

  const activityItems = topActivity.map((act) => ({
    id: act.id,
    title: act.title,
    description: act.description,
    time: act.createdAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    dotColor: act.dotColor,
  }));

  const quickActions = [
    {
      label: "Browse Pets",
      description: "Search dogs and cats across India",
      href: "/browse",
      icon: Search,
      gradient: "from-sky-500 to-blue-600",
    },
    {
      label: "Post Listing",
      description: "Rehome or list a pet for adoption",
      href: "/post-listing",
      icon: PawPrint,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "My Favorites",
      description: "View your saved pets",
      href: "/dashboard/favorites",
      icon: Heart,
      gradient: "from-rose-500 to-pink-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-[2rem] bg-purple-50 p-8 border border-purple-100 shadow-sm">
        <div className="absolute -right-6 -top-6 size-48 rounded-full bg-white/60 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 size-48 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-black uppercase tracking-widest text-purple-700">
            <Sparkles className="size-3" />
            Pet Owner Dashboard
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back, {userName}!
          </h2>
          <p className="mt-2 max-w-lg text-base font-medium text-slate-600">
            Find your perfect furry companion, manage your listings, and connect
            with trusted sellers across India.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Saved Pets"
          value={favCount}
          icon={Heart}
          gradient="bg-rose-50/50"
          iconBg="bg-rose-100 text-rose-600"
        />
        <StatCard
          label="My Listings"
          value={listingCount}
          icon={ListChecks}
          gradient="bg-sky-50/50"
          iconBg="bg-sky-100 text-sky-600"
        />
        <StatCard
          label="Messages"
          value={msgCount}
          icon={MessageSquare}
          gradient="bg-purple-50/50"
          iconBg="bg-purple-100 text-purple-600"
        />
        <StatCard
          label="Browse Pets"
          value="→"
          icon={Search}
          trend="Explore listings"
          gradient="bg-emerald-50/50"
          iconBg="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} text-white shadow-sm`}
              >
                <Icon className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                {action.label}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {action.description}
              </p>
              <ArrowRight className="mt-4 size-5 text-orange-500 transition-transform group-hover:translate-x-1" />
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <DashboardCard
        title="Recent Activity"
        description="Your latest actions on PawHub"
      >
        <ActivityFeed items={activityItems} />
      </DashboardCard>
    </div>
  );
}
