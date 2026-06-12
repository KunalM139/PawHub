"use client";

import { useState, type FormEvent } from "react";

type ReviewFormProps = {
  listingId: string;
};

export function ReviewForm({ listingId }: ReviewFormProps) {
  const [rating, setRating] = useState("5");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingId,
        rating,
        title: title || null,
        comment,
      }),
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to submit review.");
      setIsSubmitting(false);
      return;
    }

    setSuccess("Review submitted.");
    setTitle("");
    setComment("");
    setIsSubmitting(false);

    setTimeout(() => {
      window.location.reload();
    }, 600);
  }

  return (
    <form className="mt-4 space-y-3 rounded-2xl bg-[var(--color-surface-muted)] p-4" onSubmit={handleSubmit}>
      <h3 className="text-sm font-bold uppercase tracking-wide">Add Rating & Review</h3>

      <label className="block text-sm font-semibold">
        Rating
        <select
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          className="mt-2 h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm"
        >
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </label>

      <label className="block text-sm font-semibold">
        Title (optional)
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 h-10 w-full rounded-lg border border-black/10 bg-white px-3 text-sm"
        />
      </label>

      <label className="block text-sm font-semibold">
        Review
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="mt-2 min-h-20 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
          minLength={4}
          maxLength={800}
          required
        />
      </label>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-700">{success}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-primary-foreground)] disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
