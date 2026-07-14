"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Check, CheckCheck, MoreVertical, Edit2, Trash2, ArrowLeft } from "lucide-react";
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
  isEdited?: boolean;
};

type SellerChatPaneProps = {
  listingId: string;
  listingTitle: string;
  customerId: string;
  customerName: string;
  currentUserId: string;
  onBack: () => void;
};

export function SellerChatPane({ listingId, listingTitle, customerId, customerName, currentUserId, onBack }: SellerChatPaneProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, onlineUsers } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  
  const isOnline = onlineUsers.includes(customerId);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/messages?listingId=${listingId}`);
      if (res.ok) {
        const data = await res.json();
        // Filter messages for this specific customer
        const filtered = (data.messages || []).filter((m: Message) => {
           const sId = typeof m.senderId === "object" ? (m.senderId as any)._id : m.senderId;
           const rId = typeof m.receiverId === "object" ? (m.receiverId as any)._id : m.receiverId;
           return (sId === customerId || rId === customerId);
        });
        setMessages(filtered.reverse());
      }
    } catch (err) {
      logger.error("Failed to fetch messages", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages();
    fetch("/api/messages/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, senderId: customerId })
    }).catch(console.error);
  }, [listingId, customerId]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (data: any) => {
      if (data.listingId === listingId && data.senderId === customerId) {
        setMessages((prev) => [...prev, data]);
        fetch("/api/messages/read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, senderId: customerId })
        }).catch(console.error);
      }
    };

    const handleRead = (data: any) => {
      if (data.listingId === listingId && data.receiverId === customerId) {
        setMessages((prev) => 
          prev.map((msg) => {
            const senderIdStr = typeof msg.senderId === "object" ? (msg.senderId as any)._id : msg.senderId;
            return senderIdStr === currentUserId ? { ...msg, status: "read" } : msg;
          })
        );
      }
    };

    const handleTyping = (data: any) => {
      if (data.listingId === listingId && data.senderId === customerId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };

    const handleEdited = (data: any) => {
      if (data.listingId === listingId) {
        setMessages(prev => prev.map(m => m._id === data._id ? { ...m, body: data.body, isEdited: true } : m));
      }
    };

    const handleDeleted = (data: any) => {
      if (data.listingId === listingId) {
        setMessages(prev => prev.filter(m => m._id !== data.messageId));
      }
    };

    socket.on("receive-message", handleReceive);
    socket.on("messages-read", handleRead);
    socket.on("typing", handleTyping);
    socket.on("message-edited", handleEdited);
    socket.on("message-deleted", handleDeleted);

    return () => {
      socket.off("receive-message", handleReceive);
      socket.off("messages-read", handleRead);
      socket.off("typing", handleTyping);
      socket.off("message-edited", handleEdited);
      socket.off("message-deleted", handleDeleted);
    };
  }, [socket, listingId, customerId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    if (editingMessageId) {
      // Handle Edit
      setIsSending(true);
      try {
        const res = await fetch(`/api/messages/${editingMessageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: trimmed }),
        });
        if (res.ok) {
          const { data } = await res.json();
          setMessages(prev => prev.map(m => m._id === editingMessageId ? { ...m, body: data.body, isEdited: true } : m));
          setInputValue("");
          setEditingMessageId(null);
        }
      } catch (err) {
        logger.error("Failed to edit message", err);
      } finally {
        setIsSending(false);
      }
      return;
    }

    // Handle Send New
    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, receiverId: customerId, body: trimmed }),
      });

      if (res.ok) {
        const responseData = await res.json();
        const newMsg = responseData.data || responseData.message;
        if (newMsg && typeof newMsg === "object") {
          setMessages((prev) => [...prev, newMsg]);
        }
        setInputValue("");
      }
    } catch (err) {
      logger.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleUnsend = async (msgId: string) => {
    if (!confirm("Unsend this message? It will be deleted for everyone.")) return;
    try {
      const res = await fetch(`/api/messages/${msgId}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== msgId));
      }
    } catch (err) {
      logger.error("Failed to delete message", err);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#f8f6f3]">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-outline-variant)]/30 bg-white px-4">
        <button onClick={onBack} className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] font-bold text-white text-lg">
          {customerName[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-[var(--color-on-surface)]">{customerName}</h3>
            {isOnline && <span className="size-2 rounded-full bg-emerald-500" />}
          </div>
          <p className="truncate text-xs font-medium text-[var(--color-primary)]">
            {listingTitle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-on-surface-variant)]">
            No messages yet.
          </div>
        ) : (
          messages.filter(msg => msg && typeof msg === "object").map((msg, idx) => {
            const senderIdObj = msg.senderId;
            const senderIdStr = typeof senderIdObj === "object" && senderIdObj !== null ? (senderIdObj as any)._id : senderIdObj;
            const isSender = String(senderIdStr) === String(currentUserId);
            const msgKey = msg._id || `temp-${idx}`;

            return (
              <div key={msgKey} className={cn("flex group", isSender ? "justify-end" : "justify-start")}>
                {isSender && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center mr-2 gap-1">
                    <button onClick={() => { setEditingMessageId(msg._id); setInputValue(msg.body); }} className="p-1 hover:bg-gray-200 rounded text-gray-500" title="Edit">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleUnsend(msg._id)} className="p-1 hover:bg-red-100 rounded text-red-500" title="Unsend">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                    isSender
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-br-sm shadow-sm"
                      : "bg-white text-[var(--color-foreground)] rounded-bl-sm border border-[var(--color-outline-variant)]/30 shadow-sm"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <div className={cn("mt-1 flex items-center justify-end gap-1 text-[9px] font-medium tracking-wide uppercase", isSender ? "text-white/70" : "text-[var(--color-foreground-subtle)]")}>
                    {msg.isEdited && <span className="mr-1 lowercase italic opacity-80">(edited)</span>}
                    {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime()) ? new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) : ""}
                    {isSender && (
                      msg.status === "read" ? <CheckCheck className="size-3 text-blue-300" /> : <Check className="size-3" />
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

      {/* Input */}
      <div className="shrink-0 bg-white p-3 border-t border-[var(--color-outline-variant)]/30">
        {editingMessageId && (
          <div className="flex items-center justify-between mb-2 px-2 text-xs font-semibold text-[var(--color-primary)]">
            <span>Editing message...</span>
            <button onClick={() => { setEditingMessageId(null); setInputValue(""); }} className="hover:underline">Cancel</button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (socket && e.target.value.length > 0) {
                socket.emit("typing", { senderId: currentUserId, receiverId: customerId, listingId });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend(e);
              }
            }}
            placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
            className="max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-black/10 bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
          >
            {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
