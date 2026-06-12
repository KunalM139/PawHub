import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { MessageSquare, Send } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { MessageModel } from "@/server/models/message";

export const metadata: Metadata = {
  title: "Inquiries | Seller Dashboard",
  robots: { index: false, follow: false },
};

function getName(val: unknown): string {
  if (!val || typeof val === "string") return "Customer";
  if (typeof val === "object" && val !== null && "name" in val) {
    return (val as { name?: string }).name ?? "Customer";
  }
  return "Customer";
}

function getListingTitle(val: unknown): string {
  if (!val || typeof val === "string") return "Listing";
  if (typeof val === "object" && val !== null && "title" in val) {
    return (val as { title?: string }).title ?? "Listing";
  }
  return "Listing";
}

export default async function SellerMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const messages = await MessageModel.find({
    $or: [{ senderId: session.user.id }, { receiverId: session.user.id }],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("senderId", "name")
    .populate("receiverId", "name")
    .populate("listingId", "title")
    .lean();

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Customer Inquiries"
        description="Messages from potential buyers about your listings"
      >
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No inquiries yet"
            description="When buyers contact you about your listings, their messages will appear here."
            actionLabel="Manage Listings"
            actionHref="/seller-dashboard/pet-listings"
          />
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => {
              const isSender =
                String(
                  typeof msg.senderId === "object" &&
                    msg.senderId !== null &&
                    "_id" in msg.senderId
                    ? (msg.senderId as { _id: string })._id
                    : msg.senderId,
                ) === session.user.id;
              return (
                <article
                  key={String(msg._id)}
                  className="rounded-xl border border-black/[0.04] bg-[var(--color-surface-muted)] p-4 transition hover:bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]">
                      {isSender ? (
                        <Send className="size-3.5 text-[var(--color-primary)]" />
                      ) : (
                        <MessageSquare className="size-3.5 text-[var(--color-foreground-subtle)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--color-foreground-subtle)]">
                        {getName(msg.senderId)} → {getName(msg.receiverId)} •{" "}
                        <span className="text-[var(--color-primary)]">
                          {getListingTitle(msg.listingId)}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-foreground)]">
                        {msg.body as string}
                      </p>
                      <p className="mt-1.5 text-[10px] text-[var(--color-foreground-subtle)]">
                        {new Date(msg.createdAt as string).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
