"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

type FavoriteButtonProps = {
  listingId: string;
  initialFavorited?: boolean;
};

export function FavoriteButton({ listingId, initialFavorited = false }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (loading) return;
    
    // Optimistic update could be added here, but since it's just adding to favorites
    // and no unfavorite endpoint exists, we just set true if successful.
    setLoading(true);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (res.ok) {
        setFavorited(true);
      }
    } catch (err) {
      logger.error("Failed to favorite", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={loading}
      className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white/90 text-[var(--color-foreground-muted)] shadow-sm backdrop-blur-md transition hover:scale-105 hover:text-[var(--color-primary)] active:scale-95 disabled:opacity-50"
      aria-label="Add to favorites"
    >
      <Heart
        className={cn(
          "size-4.5 transition-colors",
          favorited && "fill-[var(--color-primary)] text-[var(--color-primary)]",
        )}
      />
    </button>
  );
}
