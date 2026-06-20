import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { MessageModel } from "@/server/models/message";

export const metadata: Metadata = {
  title: "Messages | PawHub",
  robots: { index: false, follow: false },
};

function getName(val: unknown): string {
  if (!val || typeof val === "string") return "User";
  if (typeof val === "object" && val !== null && "name" in val) {
    return val.name as string;
  }
  return "User";
}

function getListingTitle(val: unknown): string {
  if (!val || typeof val === "string") return "Listing";
  if (typeof val === "object" && val !== null && "title" in val) {
    return val.title as string;
  }
  return "Listing";
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();

  const messages = await MessageModel.find({
    $or: [{ senderId: session.user.id }, { receiverId: session.user.id }],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("senderId", "name image")
    .populate("receiverId", "name image")
    .populate("listingId", "title")
    .lean() || [];

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        <header className="mb-2">
          <h1 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2">My Messages</h1>
          <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">Your conversations with pet sellers and adoption agencies</p>
        </header>

        {messages.length === 0 ? (
          <section className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] border border-[var(--color-outline-variant)]/30 card-shadow p-[32px] flex flex-col items-center justify-center min-h-[400px] py-20 text-center relative overflow-hidden transition-all duration-300 hover:shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1rem]"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary-fixed)] to-[var(--color-secondary-fixed)] rounded-xl flex items-center justify-center mb-6 shadow-sm border border-[var(--color-outline-variant)]/50 relative z-10">
              <span className="material-symbols-outlined text-4xl text-[var(--color-primary)] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            </div>
            <h2 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-3 relative z-10">No messages yet</h2>
            <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-8 relative z-10">
              Start a conversation by contacting a seller from a pet listing page!
            </p>
            <Link href="/browse" className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-[var(--color-on-primary)] text-[14px] leading-[1.2] tracking-[0.05em] font-semibold py-3 px-8 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 relative z-10 overflow-hidden group/btn inline-flex items-center gap-2">
              <span className="absolute inset-0 w-full h-full bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></span>
              <span className="relative">Browse Pets</span>
            </Link>
          </section>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: any) => {
              const isSender =
                String(
                  typeof msg.senderId === "object" &&
                    msg.senderId !== null &&
                    "_id" in msg.senderId
                    ? msg.senderId._id
                    : msg.senderId,
                ) === session.user.id;
              
              return (
                <article
                  key={String(msg._id)}
                  className="rounded-[1rem] border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-6 transition-all hover:border-[var(--color-primary)]/30 card-shadow relative overflow-hidden group"
                >
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="mt-1 flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-container)]/20 shadow-sm border border-[var(--color-primary)]/10">
                      {isSender ? (
                        <span className="material-symbols-outlined text-[20px] text-[var(--color-primary)]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                      ) : (
                        <span className="material-symbols-outlined text-[20px] text-[var(--color-secondary)]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] leading-[1.2] font-semibold text-[var(--color-on-surface-variant)] tracking-wide">
                        <span className="text-[var(--color-on-surface)] font-bold">{getName(msg.senderId)}</span> → {getName(msg.receiverId)} •{" "}
                        <span className="text-[var(--color-primary)]">
                          {getListingTitle(msg.listingId)}
                        </span>
                      </p>
                      <div className="mt-3 rounded-xl bg-[var(--color-surface-container)] p-4 text-[16px] leading-[1.6] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/20">
                        {msg.body as string}
                      </div>
                      <p className="mt-4 text-[10px] uppercase font-bold tracking-wider text-[var(--color-outline)]">
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
      </main>
    </div>
  );
}
