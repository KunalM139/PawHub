import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InquiriesManager } from "@/components/dashboard/inquiries-manager";

export const metadata: Metadata = {
  title: "Inquiries | PawHub",
  robots: { index: false, follow: false },
};

export default async function DashboardInquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return <InquiriesManager currentUserId={session.user.id} />;
}
