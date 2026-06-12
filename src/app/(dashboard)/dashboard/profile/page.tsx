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
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-5 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        {profile.image ? (
          <img
            src={profile.image as string}
            alt={profile.name as string}
            className="size-20 rounded-3xl object-cover ring-4 ring-slate-50"
          />
        ) : (
          <div className="inline-flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-orange-400 text-2xl font-black text-white shadow-sm">
            {(profile.name as string)
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {profile.name as string}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {profile.bio ? (profile.bio as string) : "No bio set"}
          </p>
        </div>
      </div>

      {/* Inline Profile Manager */}
      <ProfileManager profile={{
        name: profile.name as string,
        email: profile.email as string,
        phone: profile.phone as string | undefined,
        city: profile.city as string | undefined,
        state: profile.state as string | undefined,
        bio: profile.bio as string | undefined,
        role: profile.role as string,
        userType: profile.userType as string,
        isPhoneVerified: !!profile.isPhoneVerified,
      }} />
    </div>
  );
}
