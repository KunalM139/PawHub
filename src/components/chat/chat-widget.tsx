"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Send, X, MessageSquare, Loader2, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/components/providers/socket-provider";
import { logger } from "@/lib/logger";

type Message = {
  _id: string;
  body: string;
  senderId: { _id: string; name: string } | string;
  receiverId: { _id: string; name: string } | string;
  createdAt: string;
  status: "sent" | "delivered" | "read";
};

type ChatWidgetProps = {
  listingId: string;
  receiverId: string;
  receiverName: string;
  currentUserId: string;
  buttonText?: string;
};

export function ChatWidget({ listingId, receiverId, receiverName, currentUserId, buttonText }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { socket, onlineUsers } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const isOnline = onlineUsers.includes(receiverId);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/messages?listingId=${listingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages((data.messages || []).reverse()); // API returns sorted by -1 (newest first), reverse for UI
      }
    } catch (err) {
      logger.error("Failed to fetch messages", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", (data: any) => {
      // If the message is for this listing and from this receiver
      if (data.listingId === listingId && data.senderId === receiverId) {
        setMessages((prev) => [...prev, data]);
        // Only mark as read if chat is currently open
        if (isOpen) {
          fetch("/api/messages/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listingId, senderId: receiverId })
          }).catch(console.error);
        }
      }
    });

    socket.on("messages-read", (data: any) => {
      if (data.listingId === listingId && data.receiverId === receiverId) {
        setMessages((prev) => 
          prev.map((msg) => 
            (typeof msg.senderId === "string" ? msg.senderId === currentUserId : msg.senderId._id === currentUserId)
              ? { ...msg, status: "read" }
              : msg
          )
        );
      }
    });

    socket.on("typing", (data: any) => {
      if (data.listingId === listingId && data.senderId === receiverId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("messages-read");
      socket.off("typing");
    };
  }, [socket, listingId, receiverId, currentUserId]);

  useEffect(() => {
    if (isOpen) {
      void fetchMessages();
      fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, senderId: receiverId })
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMaximized]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, receiverId, body: trimmed }),
      });

      if (res.ok) {
        const responseData = await res.json();
        setMessages((prev) => [...prev, responseData.data]);
        
        setInputValue("");
      }
    } catch (err) {
      logger.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-primary-foreground)] shadow-[var(--shadow-soft)] transition hover:brightness-110"
      >
        <MessageSquare className="size-4" />
        {buttonText || `Chat with ${receiverName}`}
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Chat Modal */}
      <div
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden border border-black/10 bg-[#f8f6f3] shadow-2xl transition-all duration-300",
          isMaximized
            ? "inset-0 sm:inset-4 sm:rounded-2xl"
            : "left-1/2 top-1/2 h-[540px] w-[420px] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl",
        )}
      >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between bg-white px-4 border-b border-black/5 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--color-primary)] font-bold text-white">
            {receiverName[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight text-[var(--color-foreground)]">{receiverName}</h3>
            {isOnline ? (
              <p className="text-[10px] font-semibold tracking-wide text-emerald-600 uppercase">Online</p>
            ) : (
              <p className="text-[10px] font-semibold tracking-wide text-[var(--color-foreground-muted)] uppercase">Offline</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-foreground-muted)]">
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-[var(--color-surface-muted)] transition"
          >
            {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-[var(--color-surface-muted)] transition hover:text-red-600"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 inline-flex size-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)]">
              <MessageSquare className="size-5 text-[var(--color-foreground-subtle)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--color-foreground)]">No messages yet</p>
            <p className="mt-1 text-xs text-[var(--color-foreground-muted)] max-w-[200px]">
              Send a message to start the conversation with {receiverName}.
            </p>
          </div>
        ) : (
          messages.filter(msg => msg && typeof msg === "object").map((msg, idx) => {
            const senderIdObj = msg.senderId;
            const senderIdStr = typeof senderIdObj === "object" && senderIdObj !== null 
                ? (senderIdObj as any)._id 
                : senderIdObj;
            const isSender = String(senderIdStr) === String(currentUserId);
            const msgKey = msg._id || \`temp-\${idx}\`;

            return (
              <div key={msgKey} className={cn("flex", isSender ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    isSender
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-br-sm shadow-sm"
                      : "bg-white text-[var(--color-foreground)] rounded-bl-sm border border-black/5 shadow-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <div className={cn("mt-1 flex items-center justify-end gap-1 text-[9px] font-medium tracking-wide uppercase", isSender ? "text-white/70" : "text-[var(--color-foreground-subtle)]")}>
                    {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime()) ? new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : ""}
                    {isSender && (
                      msg.status === "read" ? (
                        <CheckCheck className="size-3 text-blue-300" />
                      ) : (
                        <Check className="size-3" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm border border-black/5 shadow-sm px-4 py-3 flex gap-1 items-center">
              <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 bg-white p-3 border-t border-black/5">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (socket && e.target.value.length > 0) {
                socket.emit("typing", { senderId: currentUserId, receiverId, listingId });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend(e);
              }
            }}
            placeholder="Type your message..."
            className="max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-black/10 bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-sm transition hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
          >
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      </div>
      </div>
    </>
  );
}
