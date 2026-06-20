"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Star, X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export function ReviewModal({
  isOpen,
  onClose,
  productId,
  productTitle,
  onReviewSubmitted,
}: {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  onReviewSubmitted?: () => void;
}) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchExistingReview();
    } else {
      resetForm();
    }
  }, [isOpen]);

  async function fetchExistingReview() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/product?productId=${productId}`);
      const data = await res.json();
      if (res.ok && data.reviews && session?.user?.id) {
        const myReview = data.reviews.find((r: any) => r.reviewerId._id === session.user.id);
        if (myReview) {
          setExistingReviewId(myReview._id);
          setRating(myReview.rating);
          setComment(myReview.comment);
          setImageUrls(myReview.images || []);
        }
      }
    } catch (e) {
      console.error("Error fetching review", e);
    }
    setIsLoading(false);
  }

  function resetForm() {
    setRating(5);
    setComment("");
    setSelectedImages([]);
    setImageUrls([]);
    setExistingReviewId(null);
  }

  async function uploadMedia(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("resourceType", "image");

    const response = await fetch("/api/uploads/pet-media", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data?.secureUrl) {
      throw new Error(data?.message ?? "Upload failed.");
    }
    return data.secureUrl;
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      if (imageUrls.length + selectedImages.length + newFiles.length > 5) {
        toast.error("You can upload up to 5 images total.");
        return;
      }
      setSelectedImages((prev) => [...prev, ...newFiles]);
    }
  }

  function removeSelectedImage(index: number) {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  }

  function removeImageUrl(url: string) {
    setImageUrls(imageUrls.filter((u) => u !== url));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalImageUrls = [...imageUrls];

      for (const file of selectedImages) {
        const url = await uploadMedia(file);
        finalImageUrls.push(url);
      }

      const payload = {
        productId,
        reviewId: existingReviewId,
        rating,
        comment,
        images: finalImageUrls,
      };

      const method = existingReviewId ? "PUT" : "POST";

      const res = await fetch("/api/reviews/product", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      toast.success(existingReviewId ? "Review updated!" : "Review submitted!");
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!existingReviewId) return;
    if (!confirm("Are you sure you want to delete your review?")) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/product?reviewId=${existingReviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete review");
      
      toast.success("Review deleted!");
      if (onReviewSubmitted) onReviewSubmitted();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{existingReviewId ? "Edit Your Review" : "Write a Review"}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-1">{productTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Rate your purchase</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star className={`size-8 ${rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Write your review</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you like or dislike? How did it fit? Would you recommend it?"
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Add photos (optional, max 5)</label>
              
              <div className="flex flex-wrap gap-3 mb-3">
                {imageUrls.map((url) => (
                  <div key={url} className="relative size-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={url} alt="Review upload" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImageUrl(url)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="size-5 text-white" />
                    </button>
                  </div>
                ))}
                
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative size-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={URL.createObjectURL(file)} alt="Pending upload" className="w-full h-full object-cover opacity-70" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 type="button" onClick={() => removeSelectedImage(index)} className="size-5 text-white cursor-pointer" />
                    </div>
                  </div>
                ))}

                {(imageUrls.length + selectedImages.length) < 5 && (
                  <label className="size-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
                    <ImageIcon className="size-6 mb-1" />
                    <span className="text-[10px] font-bold">Add</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageSelection} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Submit Review"}
              </button>
              
              {existingReviewId && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDelete}
                  className="px-6 h-12 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
