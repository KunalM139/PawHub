"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";

type Request = {
  _id: string;
  listingId: {
    _id: string;
    title: string;
    images: string[];
    listingType: string;
    priceInr: number;
    breed: string;
    city: string;
  } | null;
  buyerId: {
    _id: string;
    name: string;
    image?: string;
    phone?: string;
    email: string;
  };
  sellerId: string;
  status: "pending" | "approved" | "rejected";
  message: string;
  createdAt: string;
};

export function InquiriesManager({ currentUserId }: { currentUserId: string }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");

  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.requests || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((req) => (req._id === id ? { ...req, status } : req)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const incoming = requests.filter((r) => r.sellerId === currentUserId);
  const outgoing = requests.filter((r) => r.buyerId?._id === currentUserId);

  const displayList = tab === "incoming" ? incoming : outgoing;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-black/5 bg-white shadow-[var(--shadow-soft)]">
        <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-black/5 pb-2">
        <button
          onClick={() => setTab("incoming")}
          className={cn(
            "pb-2 text-sm font-bold transition-colors",
            tab === "incoming"
              ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
              : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
          )}
        >
          Incoming Requests ({incoming.length})
        </button>
        <button
          onClick={() => setTab("outgoing")}
          className={cn(
            "pb-2 text-sm font-bold transition-colors",
            tab === "outgoing"
              ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
              : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
          )}
        >
          My Requests ({outgoing.length})
        </button>
      </div>

      <DashboardCard title={tab === "incoming" ? "Requests from Buyers" : "Requests Sent by You"}>
        {displayList.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No inquiries found"
            description={tab === "incoming" ? "You haven't received any requests for your listings yet." : "You haven't sent any interest requests yet."}
            actionLabel="Browse Pets"
            actionHref="/browse"
          />
        ) : (
          <div className="space-y-4">
            {displayList.map((req) => (
              <div key={req._id} className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-start">
                {/* Image */}
                {req.listingId?.images?.[0] ? (
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface-muted)]">
                    <Image
                      src={req.listingId.images[0]}
                      alt={req.listingId.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-muted)]">
                    <AlertCircle className="size-5 text-black/20" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={req.listingId ? `/listings/${req.listingId._id}` : "#"}
                      className="font-bold text-[var(--color-foreground)] hover:underline"
                    >
                      {req.listingId?.title ?? "Deleted Listing"}
                    </Link>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                        req.status === "pending" && "bg-amber-100 text-amber-800",
                        req.status === "approved" && "bg-emerald-100 text-emerald-800",
                        req.status === "rejected" && "bg-red-100 text-red-800"
                      )}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
                    {tab === "incoming" ? "From: " : "Sent by you"}
                    {tab === "incoming" && <span className="font-semibold text-[var(--color-foreground)]">{req.buyerId?.name}</span>}
                  </p>

                  {req.message && (
                    <div className="mt-3 rounded-xl bg-[var(--color-surface-muted)] p-3 text-sm italic text-[var(--color-foreground-subtle)]">
                      "{req.message}"
                    </div>
                  )}
                  
                  <p className="mt-3 text-[10px] font-semibold text-[var(--color-foreground-subtle)]">
                    {new Date(req.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>

                {/* Actions */}
                {tab === "incoming" && req.status === "pending" && (
                  <div className="flex shrink-0 gap-2 sm:flex-col">
                    <button
                      onClick={() => handleUpdateStatus(req._id, "approved")}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <Check className="size-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(req._id, "rejected")}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-red-100 px-3 text-xs font-semibold text-red-800 transition hover:bg-red-200"
                    >
                      <X className="size-3.5" /> Decline
                    </button>
                  </div>
                )}
                
                {tab === "outgoing" && req.status === "approved" && req.listingId && (
                  <div className="shrink-0">
                    <Link
                      href={`/listings/${req.listingId._id}`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-xs font-semibold text-[var(--color-primary-foreground)] transition hover:brightness-110"
                    >
                      <MessageSquare className="size-3.5" /> Go to Chat
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
