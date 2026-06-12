"use client";

import Image from "next/image";
import { useState } from "react";

type ListingDetailGalleryProps = {
  images: string[];
  title: string;
};

export function ListingDetailGallery({ images, title }: ListingDetailGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImage = images.length > 0;
  const activeImage = hasImage ? images[activeIndex] : null;

  return (
    <div className="space-y-3">
      <div className="relative h-88 overflow-hidden rounded-3xl bg-gradient-to-br from-[#ffd8a8] via-[#ffedd7] to-[#d6ebff]">
        {activeImage ? (
          <Image src={activeImage} alt={title} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 overflow-hidden rounded-xl border ${
                index === activeIndex ? "border-[var(--color-primary)]" : "border-black/10"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${title} image ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
