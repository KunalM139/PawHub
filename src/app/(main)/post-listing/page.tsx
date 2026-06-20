import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { ListingManagement } from "@/components/listings/listing-management";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { UserModel } from "@/server/models/user";
import { ScrollAnimations } from "@/components/providers/scroll-animations";

export const metadata: Metadata = {
  title: "Post Listing",
  description:
    "Create and manage dog and cat listings with media uploads from your PawHub seller workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PostListingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="font-outfit home-theme bg-[var(--color-surface)] text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] min-h-screen">
        <ScrollAnimations />
        <main className="max-w-[1280px] mx-auto px-6 py-12 space-y-8 lg:space-y-12">
          <div className="reveal">
            <section className="glass-panel rounded-[2rem] p-8 flex flex-col items-start gap-2 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <h1 className="text-4xl md:text-5xl font-black text-[var(--color-on-surface)] tracking-tight">Post and Manage Listings</h1>
              <p className="text-lg text-[var(--color-on-surface-variant)] max-w-2xl">Please login to create and manage listings.</p>
            </section>
          </div>
        </main>
      </div>
    );
  }

  await connectToDatabase();

  const [listings, user] = await Promise.all([
    ListingModel.find({ sellerId: session.user.id }).sort({ createdAt: -1 }).lean(),
    UserModel.findById(session.user.id).select("isPhoneVerified userType").lean(),
  ]);

  const initialListings = JSON.parse(JSON.stringify(listings));
  const isPhoneVerified = user?.isPhoneVerified ?? false;
  const userType = user?.userType ?? "petOwner";

  return (
    <div className="font-outfit home-theme bg-[var(--color-surface)] text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] min-h-screen">
      <ScrollAnimations />
      <main className="max-w-[1280px] mx-auto px-6 py-12 space-y-8 lg:space-y-12">
        {/* Header Banner */}
        <div className="reveal">
          <section className="glass-panel rounded-[2rem] p-8 md:p-10 flex flex-col items-start gap-2 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--color-on-surface)] tracking-tight">Post and Manage Listings</h1>
            <p className="text-lg text-[var(--color-on-surface-variant)] max-w-2xl">Create dog and cat listings with media uploads, edit details anytime, and archive listings directly from your workspace.</p>
          </section>
        </div>

        {/* Two-Column Dashboard */}
        <ListingManagement
          initialListings={initialListings}
          isPhoneVerified={isPhoneVerified}
          userType={userType}
        />
      </main>
    </div>
  );
}
