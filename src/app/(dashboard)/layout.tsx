import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";
import { DashboardShellWrapper } from "./dashboard-shell-wrapper";

import type { UserType } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectToDatabase();

  const dbUser = await UserModel.findById(session.user.id)
    .select("name image role userType")
    .lean();

  if (!dbUser) {
    redirect("/login");
  }

  const userType = (dbUser.userType as UserType | undefined) ?? "petOwner";
  const userName = (dbUser.name as string) ?? "PawHub User";
  const userImage = (dbUser.image as string | undefined) ?? null;
  const userRole = (dbUser.role as string) ?? "user";

  return (
    <DashboardShellWrapper
      userType={userType}
      userName={userName}
      userImage={userImage}
      userRole={userRole}
    >
      {children}
    </DashboardShellWrapper>
  );
}
