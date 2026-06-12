"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import type { ListingType, PetCategory } from "@/types";

export type ListingRecord = {
  _id: string;
  listingType: ListingType;
  petCategory: PetCategory;
  title: string;
  breed: string;
  description: string;
  ageInMonths: number;
  gender: "male" | "female";
  priceInr: number;
  city: string;
  state: string;
  images: string[];
  video?: string | null;
  status: "pending" | "approved" | "rejected" | "archived";
  createdAt: string;
};

type ListingFormState = {
  listingType: ListingType;
  petCategory: PetCategory;
  breed: string;
  description: string;
  ageInMonths: string;
  gender: "male" | "female";
  priceInr: string;
  city: string;
  state: string;
};

type ListingValidationIssues = {
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

type ListingErrorResponse = {
  message?: string;
  issues?: ListingValidationIssues;
};

const fieldLabelMap: Record<string, string> = {
  listingType: "Listing Type",
  petCategory: "Pet Category",
  title: "Listing Title",
  breed: "Breed",
  description: "Description",
  ageInMonths: "Age",
  gender: "Gender",
  priceInr: "Price",
  city: "City",
  state: "State",
  images: "Images",
  video: "Video",
};

function extractListingErrorMessage(data: ListingErrorResponse | null): string {
  if (!data) {
    return "Unable to save listing.";
  }

  const formError = data.issues?.formErrors?.[0];
  if (formError) {
    return formError;
  }

  if (data.issues?.fieldErrors) {
    const firstFieldError = Object.entries(data.issues.fieldErrors).find(
      ([, messages]) => Array.isArray(messages) && messages.length > 0,
    );

    if (firstFieldError) {
      const [field, messages] = firstFieldError;
      const label = fieldLabelMap[field] ?? field;
      return `${label}: ${messages?.[0] ?? "Invalid value."}`;
    }
  }

  return data.message ?? "Unable to save listing.";
}

const emptyForm: ListingFormState = {
  listingType: "sale",
  petCategory: "dog",
  breed: "",
  description: "",
  ageInMonths: "",
  gender: "male",
  priceInr: "",
  city: "",
  state: "",
};

async function uploadMedia(file: File, resourceType: "image" | "video") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("resourceType", resourceType);

  const response = await fetch("/api/uploads/pet-media", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | {
        secureUrl?: string;
        message?: string;
      }
    | null;

  if (!response.ok || !data?.secureUrl) {
    throw new Error(data?.message ?? "Upload failed.");
  }

  return data.secureUrl;
}

type ListingManagementProps = {
  initialListings: ListingRecord[];
  isPhoneVerified: boolean;
  userType?: string;
};

export function ListingManagement({ initialListings, isPhoneVerified, userType = "petOwner" }: ListingManagementProps) {
  const [form, setForm] = useState<ListingFormState>({
    ...emptyForm,
    listingType: userType === "petOwner" ? "rehome" : "sale",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [listings, setListings] = useState<ListingRecord[]>(initialListings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const canCreateListing = isPhoneVerified || Boolean(editingId);

  const submitLabel = useMemo(() => {
    if (isSubmitting) {
      return editingId ? "Updating listing..." : "Creating listing...";
    }

    return editingId ? "Update Listing" : "Create Listing";
  }, [editingId, isSubmitting]);

  async function fetchMyListings() {
    setIsLoadingListings(true);

    const response = await fetch("/api/listings?mine=true", {
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as
      | { listings?: ListingRecord[]; message?: string }
      | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to fetch your listings.");
      setIsLoadingListings(false);
      return;
    }

    setListings(data?.listings ?? []);
    setIsLoadingListings(false);
  }

  function resetFormState() {
    setForm(emptyForm);
    setEditingId(null);
    setSelectedImages([]);
    setSelectedVideo(null);
    setImageUrls([]);
    setVideoUrl(null);
  }

  function startEditing(listing: ListingRecord) {
    setEditingId(listing._id);
    setForm({
      listingType: listing.listingType,
      petCategory: listing.petCategory,
      breed: listing.breed,
      description: listing.description,
      ageInMonths: String(listing.ageInMonths),
      gender: listing.gender,
      priceInr: String(listing.priceInr),
      city: listing.city,
      state: listing.state,
    });
    setImageUrls(listing.images);
    setVideoUrl(listing.video ?? null);
    setMessage("Editing listing.");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!isPhoneVerified && !editingId) {
        setError("Verify your phone number to create new listings.");
        setIsSubmitting(false);
        return;
      }
      const uploadedImageUrls = [...imageUrls];

      for (const file of selectedImages) {
        const url = await uploadMedia(file, "image");
        uploadedImageUrls.push(url);
      }

      if (uploadedImageUrls.length === 0) {
        setError("Add at least one pet image before publishing.");
        setIsSubmitting(false);
        return;
      }

      if (uploadedImageUrls.length > 10) {
        setError("You can upload up to 10 images per listing.");
        setIsSubmitting(false);
        return;
      }

      let uploadedVideoUrl = videoUrl;
      if (selectedVideo) {
        uploadedVideoUrl = await uploadMedia(selectedVideo, "video");
      }

      const generatedTitle = `${form.breed} ${form.gender} ${form.petCategory} for ${form.listingType}`;
      const finalPrice = userType === "petOwner" ? 0 : Number(form.priceInr || 0);

      const payload = {
        ...form,
        title: generatedTitle,
        ageInMonths: Number(form.ageInMonths),
        priceInr: finalPrice,
        images: uploadedImageUrls,
        video: uploadedVideoUrl,
      };

      const endpoint = editingId ? `/api/listings/${editingId}` : "/api/listings";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as ListingErrorResponse | null;

      if (!response.ok) {
        setError(extractListingErrorMessage(data));
        setIsSubmitting(false);
        return;
      }

      setMessage(editingId ? "Listing updated." : "Listing created and sent for approval.");
      resetFormState();
      await fetchMyListings();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save listing.");
    }

    setIsSubmitting(false);
  }

  async function handleDelete(listingId: string) {
    setError(null);
    setMessage(null);

    const confirmed = window.confirm("Archive this listing?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/listings/${listingId}`, {
      method: "DELETE",
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(data?.message ?? "Unable to delete listing.");
      return;
    }

    setMessage("Listing archived.");

    if (editingId === listingId) {
      resetFormState();
    }

    await fetchMyListings();
  }

  function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
    setSelectedImages(Array.from(event.target.files ?? []));
  }

  function handleVideoSelection(event: ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.target.files ?? []);
    setSelectedVideo(file ?? null);
  }

  return (
    <div className="space-y-4">
      {!isPhoneVerified ? (
        <div className="rounded-2xl border border-[#f1d7d7] bg-[#fff6f6] p-4 text-sm text-[#8b1f1f]">
          Phone verification is required to post new listings.
          <Link href="/profile" className="ml-2 font-semibold underline">
            Verify now
          </Link>
          .
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {editingId ? "Edit Listing" : "Create New Listing"}
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Add pet details, upload media, and publish for admin approval.
          </p>
        </div>

        <form className="mt-6 space-y-8" onSubmit={handleSubmit}>
          {/* Core Details Block */}
          <div className="rounded-2xl bg-purple-50/50 p-6 border border-purple-100">
            <h3 className="text-lg font-bold text-purple-900 mb-4">1. Core Details</h3>
            <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Listing Type
              <select
                value={form.listingType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    listingType: event.target.value as ListingType,
                  }))
                }
                className="mt-2 h-12 w-full rounded-xl border border-purple-200/60 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                {userType !== "petOwner" && <option value="sale">Sale</option>}
                <option value="adoption">Adoption</option>
                <option value="rehome">Rehome</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Pet Category
              <select
                value={form.petCategory}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    petCategory: event.target.value as PetCategory,
                  }))
                }
                className="mt-2 h-12 w-full rounded-xl border border-purple-200/60 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Breed
              <input
                type="text"
                required
                minLength={2}
                value={form.breed}
                onChange={(event) =>
                  setForm((current) => ({ ...current, breed: event.target.value }))
                }
                className="mt-2 h-12 w-full rounded-xl border border-purple-200/60 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Gender
              <select
                value={form.gender}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    gender: event.target.value as "male" | "female",
                  }))
                }
                className="mt-2 h-12 w-full rounded-xl border border-purple-200/60 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Age (months)
              <input
                type="number"
                required
                min={0}
                value={form.ageInMonths}
                onChange={(event) =>
                  setForm((current) => ({ ...current, ageInMonths: event.target.value }))
                }
                className="mt-2 h-12 w-full rounded-xl border border-purple-200/60 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </label>

            {userType !== "petOwner" && (
              <label className="block text-sm font-semibold text-slate-700">
                Price (INR)
                <input
                  type="number"
                  required
                  min={0}
                  value={form.priceInr}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, priceInr: event.target.value }))
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-purple-200/60 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              </label>
            )}
          </div>
          </div>

          {/* Location & Details Block */}
          <div className="rounded-2xl bg-blue-50/50 p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-4">2. Location & Story</h3>
            <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              City
              <input
                type="text"
                required
                minLength={2}
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                className="mt-2 h-12 w-full rounded-xl border border-blue-200/60 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              State
              <input
                type="text"
                required
                minLength={2}
                value={form.state}
                onChange={(event) =>
                  setForm((current) => ({ ...current, state: event.target.value }))
                }
                className="mt-2 h-12 w-full rounded-xl border border-blue-200/60 bg-white px-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </div>

          <label className="block mt-6 text-sm font-semibold text-slate-700">
            Description
            <textarea
              required
              minLength={30}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="mt-2 min-h-[140px] w-full rounded-xl border border-blue-200/60 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y"
            />
          </label>
          </div>

          {/* Media Block */}
          <div className="rounded-2xl bg-orange-50/50 p-6 border border-orange-100">
            <h3 className="text-lg font-bold text-orange-900 mb-4">3. Photos & Video</h3>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Pet Images (1 to 10)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelection}
                className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-all cursor-pointer"
              />
            </label>

            {imageUrls.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                {imageUrls.map((url) => (
                  <div key={url} className="flex items-center justify-between rounded-xl bg-white border border-orange-100 p-3 shadow-sm">
                    <p className="truncate text-xs font-medium text-slate-500">{url}</p>
                    <button
                      type="button"
                      className="ml-3 shrink-0 rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      onClick={() =>
                        setImageUrls((current) => current.filter((item) => item !== url))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <label className="block mt-6 text-sm font-semibold text-slate-700">
            Pet Video (optional)
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoSelection}
              className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-all cursor-pointer"
            />
          </label>

          {videoUrl ? (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-white border border-orange-100 px-4 py-3 shadow-sm">
              <p className="truncate text-xs font-medium text-slate-500">{videoUrl}</p>
              <button
                type="button"
                className="ml-3 shrink-0 rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100"
                onClick={() => setVideoUrl(null)}
              >
                Remove
              </button>
            </div>
          ) : null}
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting || !canCreateListing}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-orange-500 px-8 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:bg-orange-600 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitLabel}
            </button>

            {editingId ? (
              <button
                type="button"
                onClick={resetFormState}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-100 px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">My Listings</h2>
          <button
            type="button"
            onClick={() => void fetchMyListings()}
            className="text-sm font-bold text-purple-600 hover:text-purple-700"
          >
            Refresh
          </button>
        </div>

        {isLoadingListings ? <p className="text-sm font-medium text-slate-500">Loading listings...</p> : null}

        {!isLoadingListings && listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <p className="text-sm font-medium text-slate-500">
              You haven't posted any pets yet. Create your first listing above!
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <article key={listing._id} className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{listing.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {listing.breed} • {listing.city}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  listing.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                  listing.status === "pending" ? "bg-amber-100 text-amber-700" :
                  "bg-slate-200 text-slate-700"
                }`}>
                  {listing.status}
                </span>
              </div>

              <div className="mt-auto flex gap-3 pt-4 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => startEditing(listing)}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(listing._id)}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-600 transition hover:bg-red-100"
                >
                  Archive
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      </div>
    </div>
  );
}
