"use client";

import { useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { ChatWidget } from "@/components/chat/chat-widget";

type RequestActionProps = {
  listingId: string;
  initialStatus: "pending" | "approved" | "rejected" | null;
  receiverId: string;
  receiverName: string;
  currentUserId: string;
  chatButtonText?: string;
  requestButtonText?: string;
};

export function RequestAction({
  listingId,
  initialStatus,
  receiverId,
  receiverName,
  currentUserId,
  chatButtonText,
  requestButtonText = "Express Interest",
}: RequestActionProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, message: message.trim() }),
      });

      if (res.ok) {
        setStatus("pending");
        setShowModal(false);
      }
    } catch (err) {
      console.error("Failed to send request", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "approved") {
    return (
      <ChatWidget
        listingId={listingId}
        receiverId={receiverId}
        receiverName={receiverName}
        currentUserId={currentUserId}
        buttonText={chatButtonText}
      />
    );
  }

  if (status === "pending") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-100 px-4 text-sm font-semibold text-amber-800 opacity-80"
      >
        Request Pending Approval
      </button>
    );
  }

  if (status === "rejected") {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-11 items-center justify-center rounded-xl bg-red-100 px-4 text-sm font-semibold text-red-800 opacity-80"
      >
        Request Declined
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-soft)] transition hover:brightness-110"
      >
        <MessageSquare className="size-4" />
        {requestButtonText}
      </button>

      {showModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[var(--color-foreground)]">Send Request</h3>
            <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
              Express your interest to the owner. They must approve your request before you can start chatting.
            </p>
            <form onSubmit={handleRequest} className="mt-5 space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-[var(--color-foreground)]">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi, I'm very interested in adopting..."
                  className="mt-1.5 min-h-24 w-full rounded-xl border border-black/10 bg-[var(--color-surface-muted)] px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-black/10 font-semibold text-[var(--color-foreground)] transition hover:bg-[var(--color-surface-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[var(--color-primary)] font-semibold text-[var(--color-primary-foreground)] transition hover:brightness-110 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
