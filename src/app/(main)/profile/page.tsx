import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { ProfileWorkspace } from "@/components/profile/profile-workspace";
import { Container } from "@/components/ui/container";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your PawHub profile details and phone verification.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <section className="py-14">
        <Container>
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h1 className="text-3xl font-black tracking-tight">My Profile</h1>
            <p className="mt-3 text-sm text-[var(--color-foreground-muted)]">
              Please login to manage your profile.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  await connectToDatabase();

  const profile = await UserModel.findById(session.user.id)
    .select("name email image role phone city state bio isPhoneVerified userIntent")
    .lean();

  const initialProfile = {
    name: profile?.name ?? "PawHub User",
    email: profile?.email ?? "",
    image: profile?.image ?? null,
    role: profile?.role ?? "user",
    phone: profile?.phone ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    bio: profile?.bio ?? "",
    isPhoneVerified: profile?.isPhoneVerified ?? false,
    userIntent: profile?.userIntent ?? "adopt",
  };

  return (
    <section className="py-14">
      <Container>
        <ProfileWorkspace initialProfile={initialProfile} />
      </Container>
    </section>
  );
}
