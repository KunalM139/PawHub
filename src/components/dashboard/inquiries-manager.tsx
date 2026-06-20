"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
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
      <div className="flex h-64 items-center justify-center rounded-[2rem] border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] card-shadow">
        <Loader2 className="size-6 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="font-outfit home-theme text-[var(--color-on-surface)] selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] max-w-5xl mx-auto w-full flex flex-col gap-8">
      {/* Navigation Tab Row */}
      <div className="w-full border-b border-[var(--color-outline-variant)]/30">
        <nav className="flex gap-8 px-2">
          <button
            onClick={() => setTab("incoming")}
            className={cn(
              "pb-4 text-[14px] leading-[1.2] tracking-[0.05em] font-bold transition-colors tracking-wide",
              tab === "incoming"
                ? "text-[var(--color-primary)] border-b-4 border-[var(--color-primary)]"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] border-b-4 border-transparent"
            )}
          >
            Incoming Requests ({incoming.length})
          </button>
          <button
            onClick={() => setTab("outgoing")}
            className={cn(
              "pb-4 text-[14px] leading-[1.2] tracking-[0.05em] font-bold transition-colors tracking-wide",
              tab === "outgoing"
                ? "text-[var(--color-primary)] border-b-4 border-[var(--color-primary)]"
                : "text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] border-b-4 border-transparent"
            )}
          >
            My Requests ({outgoing.length})
          </button>
        </nav>
      </div>

      {/* Content Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] leading-[1.3] font-semibold text-[var(--color-on-surface)]">
          {tab === "incoming" ? "Requests from Buyers" : "Requests Sent by You"}
        </h1>
      </div>

      {displayList.length === 0 ? (
        <div className="bg-[var(--color-surface-container-lowest)] card-shadow rounded-[2rem] w-full py-20 px-8 flex flex-col items-center justify-center text-center mt-2 border border-[var(--color-outline-variant)]/30">
          <div className="h-24 w-24 bg-[var(--color-secondary-container)]/20 rounded-2xl flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-[var(--color-secondary)]/5 rounded-2xl transform rotate-3 scale-105 transition-transform duration-500 hover:rotate-6"></div>
            <span className="material-symbols-outlined text-5xl text-[var(--color-secondary)] z-10" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          </div>
          <h2 className="text-[28px] leading-[1.3] font-semibold text-[var(--color-on-surface)] mb-4">No inquiries found</h2>
          <p className="text-[18px] leading-[1.6] text-[var(--color-on-surface-variant)] max-w-md mx-auto mb-10">
            {tab === "incoming" ? "You haven't received any requests for your listings yet. Ensure your listings have high-quality photos to attract buyers." : "You haven't sent any interest requests yet."}
          </p>
          <Link href="/dashboard/pets" className="btn-gradient text-[var(--color-on-primary)] px-8 py-3.5 rounded-full text-[16px] leading-[1.2] tracking-[0.05em] font-semibold flex items-center gap-2 hover-scale">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
            Browse Pets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((req) => (
            <div key={req._id} className="flex flex-col gap-6 rounded-[1rem] border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-6 card-shadow sm:flex-row sm:items-start transition-all hover:border-[var(--color-primary)]/30">
              {/* Image */}
              {req.listingId?.images?.[0] ? (
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface-container)]">
                  <Image
                    src={req.listingId.images[0]}
                    alt={req.listingId.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-container)]">
                  <span className="material-symbols-outlined text-[32px] text-[var(--color-outline)]/50">pets</span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={req.listingId ? `/listings/${req.listingId._id}` : "#"}
                    className="text-[18px] font-bold text-[var(--color-primary)] hover:underline"
                  >
                    {req.listingId?.title ?? "Deleted Listing"}
                  </Link>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12px] font-bold uppercase tracking-wide",
                      req.status === "pending" && "bg-amber-100 text-amber-800",
                      req.status === "approved" && "bg-emerald-100 text-emerald-800",
                      req.status === "rejected" && "bg-red-100 text-red-800"
                    )}
                  >
                    {req.status}
                  </span>
                </div>

                <p className="mt-2 text-[14px] text-[var(--color-on-surface-variant)] font-medium">
                  {tab === "incoming" ? "From: " : "Sent by you"}
                  {tab === "incoming" && <span className="font-bold text-[var(--color-on-surface)]">{req.buyerId?.name}</span>}
                </p>

                {req.message && (
                  <div className="mt-4 rounded-xl bg-[var(--color-surface-container)] p-4 text-[14px] italic text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]/20">
                    "{req.message}"
                  </div>
                )}
                
                <p className="mt-4 text-[12px] font-semibold text-[var(--color-outline)] uppercase tracking-wider">
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
                <div className="flex shrink-0 gap-3 sm:flex-col pt-2">
                  <button
                    onClick={() => handleUpdateStatus(req._id, "approved")}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-[14px] font-bold text-white transition hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req._id, "rejected")}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-100 px-6 text-[14px] font-bold text-red-800 transition hover:bg-red-200 hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                    Decline
                  </button>
                </div>
              )}
              
              {tab === "outgoing" && req.status === "approved" && req.listingId && (
                <div className="shrink-0 pt-2">
                  <Link
                    href={`/listings/${req.listingId._id}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 text-[14px] font-bold text-[var(--color-on-primary)] transition hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                    Go to Chat
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}