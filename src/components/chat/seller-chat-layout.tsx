"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, MessageSquare, AlertCircle } from "lucide-react";
import { SellerChatPane } from "./seller-chat-pane";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

export type Conversation = {
  id: string;
  listingId: { _id: string; title: string };
  customerId: { _id: string; name: string; image?: string };
  lastMessage: string;
  updatedAt: string;
  isDeleted?: boolean;
};

type SellerChatLayoutProps = {
  initialConversations: Conversation[];
  currentUserId: string;
};

export function SellerChatLayout({ initialConversations, currentUserId }: SellerChatLayoutProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const activeConversation = conversations.find(c => c.id === activeId);

  const handleDeleteConversation = async (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this entire conversation? It will be removed from your view.")) {
      try {
        setIsDeleting(conversation.id);
        const res = await fetch(\`/api/messages/conversation?listingId=\${conversation.listingId._id}&customerId=\${conversation.customerId._id}\`, {
          method: "DELETE"
        });
        
        if (res.ok) {
          setConversations(prev => prev.filter(c => c.id !== conversation.id));
          if (activeId === conversation.id) {
            setActiveId(null);
          }
        } else {
          alert("Failed to delete conversation.");
        }
      } catch (err) {
        logger.error("Error deleting conversation", err);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  if (conversations.length === 0) {
    return (
      <section className="bg-[var(--color-surface-container-lowest)] rounded-[1rem] border border-[var(--color-outline-variant)]/30 card-shadow p-[32px] flex flex-col items-center justify-center min-h-[400px] py-20 text-center relative overflow-hidden transition-all duration-300 hover:shadow-lg group">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1rem]"></div>
        <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary-fixed)] to-[var(--color-secondary-fixed)] rounded-xl flex items-center justify-center mb-6 shadow-sm border border-[var(--color-outline-variant)]/50 relative z-10">
          <MessageSquare className="w-10 h-10 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-3 relative z-10">No messages yet</h2>
        <p className="text-[16px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-8 relative z-10">
          When buyers contact you about your listings, their messages will appear here.
        </p>
      </section>
    );
  }

  return (
    <div className="flex h-[75vh] min-h-[500px] overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] shadow-lg">
      {/* Sidebar List */}
      <div className={cn("w-full md:w-80 lg:w-96 flex-col border-r border-[var(--color-outline-variant)]/30 bg-white", activeId ? "hidden md:flex" : "flex")}>
        <div className="p-4 border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)]">
          <h2 className="text-lg font-bold text-[var(--color-on-surface)]">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={cn(
                "relative flex cursor-pointer flex-col gap-1 border-b border-[var(--color-outline-variant)]/10 p-4 transition-colors hover:bg-[var(--color-surface-container)]",
                activeId === conv.id ? "bg-[var(--color-primary)]/10 border-l-4 border-l-[var(--color-primary)]" : "border-l-4 border-l-transparent"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-[var(--color-on-surface)] truncate">
                  {conv.customerId.name}
                </h3>
                <span className="text-[10px] text-[var(--color-on-surface-variant)] shrink-0 mt-0.5">
                  {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs font-medium text-[var(--color-primary)] truncate">
                Listing: {conv.listingId.title}
              </p>
              <p className="text-xs text-[var(--color-on-surface-variant)] truncate mt-1">
                {conv.lastMessage}
              </p>
              <button
                onClick={(e) => handleDeleteConversation(e, conv)}
                disabled={isDeleting === conv.id}
                className="absolute right-4 bottom-4 text-[var(--color-outline)] hover:text-red-500 transition-colors"
                title="Delete Conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Pane */}
      <div className={cn("flex-1 bg-[#f8f6f3]", !activeId ? "hidden md:flex" : "flex")}>
        {activeConversation ? (
          <SellerChatPane
            listingId={activeConversation.listingId._id}
            listingTitle={activeConversation.listingId.title}
            customerId={activeConversation.customerId._id}
            customerName={activeConversation.customerId.name}
            currentUserId={currentUserId}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <div className="flex w-full flex-col items-center justify-center text-[var(--color-on-surface-variant)]">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
