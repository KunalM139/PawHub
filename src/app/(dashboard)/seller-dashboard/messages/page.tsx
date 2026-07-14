import type { Metadata } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { MessageModel } from "@/server/models/message";
import { SellerChatLayout, Conversation } from "@/components/chat/seller-chat-layout";

export const metadata: Metadata = {
  title: "Messages | Seller Dashboard",
  robots: { index: false, follow: false },
};

function getName(val: unknown): string {
  if (!val || typeof val === "string") return "Customer";
  if (typeof val === "object" && val !== null && "name" in val) {
    return val.name as string;
  }
  return "Customer";
}

function getListingTitle(val: unknown): string {
  if (!val || typeof val === "string") return "Unknown Listing";
  if (typeof val === "object" && val !== null && "title" in val) {
    return val.title as string;
  }
  return "Unknown Listing";
}

function getId(val: unknown): string {
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String(val._id);
  }
  return String(val);
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  await connectToDatabase();
  
  // Fetch messages where seller is sender (and not deleted by sender)
  // or seller is receiver (and not deleted by receiver)
  const messages = await MessageModel.find({
    $or: [
      { senderId: session.user.id, deletedBySender: { $ne: true } },
      { receiverId: session.user.id, deletedByReceiver: { $ne: true } },
    ],
  })
    .populate("senderId", "name image")
    .populate("receiverId", "name image")
    .populate("listingId", "title")
    .sort({ createdAt: -1 })
    .lean() || [];

  // Group messages into Conversations
  const conversationMap = new Map<string, Conversation>();

  messages.forEach((msg: any) => {
    const senderId = getId(msg.senderId);
    const receiverId = getId(msg.receiverId);
    
    // The customer is whichever user is NOT the seller
    const customer = senderId === session.user.id ? msg.receiverId : msg.senderId;
    const customerIdStr = getId(customer);
    const listingIdStr = getId(msg.listingId);
    
    const convId = `${listingIdStr}_${customerIdStr}`;

    if (!conversationMap.has(convId)) {
      conversationMap.set(convId, {
        id: convId,
        listingId: { _id: listingIdStr, title: getListingTitle(msg.listingId) },
        customerId: { _id: customerIdStr, name: getName(customer) },
        lastMessage: msg.body as string,
        updatedAt: String(msg.createdAt),
      });
    }
  });

  const initialConversations = Array.from(conversationMap.values());

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)]">
      <main className="max-w-[1280px] mx-auto p-4 md:p-8 flex flex-col gap-4">
        <header className="mb-2">
          <h1 className="text-[32px] leading-[1.2] font-semibold text-[var(--color-on-surface)] mb-2">Customer Messages</h1>
          <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)]">Manage your conversations with potential buyers</p>
        </header>

        <SellerChatLayout 
          initialConversations={initialConversations} 
          currentUserId={session.user.id} 
        />
      </main>
    </div>
  );
}
