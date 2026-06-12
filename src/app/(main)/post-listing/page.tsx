import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { ListingManagement } from "@/components/listings/listing-management";
import { Container } from "@/components/ui/container";
import { connectToDatabase } from "@/server/db/connect";
import { ListingModel } from "@/server/models/listing";
import { UserModel } from "@/server/models/user";

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
      <section className="py-14">
        <Container>
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h1 className="text-3xl font-black tracking-tight">Post and Manage Listings</h1>
            <p className="mt-3 text-sm text-[var(--color-foreground-muted)]">
              Please login to create and manage listings.
            </p>
          </div>
        </Container>
      </section>
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
    <section className="py-14">
      <Container>
        <div className="mb-6 rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h1 className="text-3xl font-black tracking-tight">Post and Manage Listings</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-foreground-muted)]">
            Create dog and cat listings with media uploads, edit details anytime, and archive
            listings directly from your workspace.
          </p>
        </div>

        <ListingManagement
          initialListings={initialListings}
          isPhoneVerified={isPhoneVerified}
          userType={userType}
        />
      </Container>
    </section>
  );
}
