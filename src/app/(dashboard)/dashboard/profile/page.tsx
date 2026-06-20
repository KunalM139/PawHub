import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { ProfileManager } from "@/components/dashboard/profile-manager";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";

export const metadata: Metadata = {
  title: "Profile | PawHub",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const profile = await UserModel.findById(session.user.id)
    .select("name email image role phone city state bio isPhoneVerified userType")
    .lean();

  if (!profile) return null;

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1000px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        <header className="mb-2">
          <h1 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2">My Profile</h1>
          <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">Manage your personal information and account settings</p>
        </header>

        <ProfileManager profile={{
          name: profile.name as string,
          email: profile.email as string,
          image: (profile.image as string) || null,
          phone: profile.phone as string | undefined,
          city: profile.city as string | undefined,
          state: profile.state as string | undefined,
          bio: profile.bio as string | undefined,
          role: profile.role as string,
          userType: profile.userType as string,
          isPhoneVerified: !!profile.isPhoneVerified,
        }} />
      </main>
    </div>
  );
}
