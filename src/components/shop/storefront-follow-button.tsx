"use client";

import { useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";

export function StorefrontFollowButton({ sellerId, initialIsFollowing }: { sellerId: string, initialIsFollowing: boolean }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFollow() {
    setIsLoading(true);
    const res = await fetch("/api/store/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId })
    });
    
    if (res.ok) {
      const data = await res.json();
      setIsFollowing(data.isFollowing);
    }
    setIsLoading(false);
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`h-12 px-8 inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all shadow-sm ${
        isFollowing 
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
          : "bg-slate-900 text-white hover:bg-slate-800"
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="size-5" /> Following
        </>
      ) : (
        <>
          <UserPlus className="size-5" /> Follow Store
        </>
      )}
    </button>
  );
}
