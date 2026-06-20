"use client";

import Link from "next/link";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PlusCircle, List, Camera, Video, RefreshCw, PawPrint, Lightbulb, ArrowRight } from "lucide-react";

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
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

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

  async function confirmDeleteListing() {
    if (!listingToDelete) return;

    const response = await fetch(`/api/listings/${listingToDelete}`, {
      method: "DELETE",
    });

    const data = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      toast.error(data?.message ?? "Unable to delete listing.");
      return;
    }

    toast.success("Listing archived.");

    if (editingId === listingToDelete) {
      resetFormState();
    }

    setListingToDelete(null);
    await fetchMyListings();
  }

  function handleDelete(listingId: string) {
    setListingToDelete(listingId);
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
        <div className="rounded-2xl border border-[var(--color-error-container)] bg-[var(--color-error-container)]/20 p-4 text-sm text-[var(--color-on-error-container)]">
          Phone verification is required to post new listings.
          <Link href="/profile" className="ml-2 font-bold underline">
            Verify now
          </Link>
          .
        </div>
      ) : null}
      
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="reveal [animation-delay:150ms] bg-[var(--color-surface-container-lowest)] rounded-[2rem] p-8 card-shadow border border-[var(--color-outline-variant)]/20 h-fit">
          <div className="flex items-center gap-3 mb-8">
            <PlusCircle className="text-[var(--color-primary)] size-8" />
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">
              {editingId ? "Edit Listing" : "Create New Listing"}
            </h2>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Core Details Block */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-outline-variant)]/30">
                <span className="text-[var(--color-secondary)] font-bold text-sm">1.</span>
                <h3 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-widest">Core Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">Listing Type</label>
                  <select
                    value={form.listingType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        listingType: event.target.value as ListingType,
                      }))
                    }
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)]"
                  >
                    {userType !== "petOwner" && <option value="sale">Sale</option>}
                    <option value="adoption">Adoption</option>
                    <option value="rehome">Rehome</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">Pet Category</label>
                  <select
                    value={form.petCategory}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        petCategory: event.target.value as PetCategory,
                      }))
                    }
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)]"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">Breed</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.breed}
                    onChange={(event) => setForm((current) => ({ ...current, breed: event.target.value }))}
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] placeholder-[var(--color-outline-variant)]"
                    placeholder="e.g. Golden Retriever"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        gender: event.target.value as "male" | "female",
                      }))
                    }
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)]"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">Age (months)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.ageInMonths}
                    onChange={(event) => setForm((current) => ({ ...current, ageInMonths: event.target.value }))}
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] placeholder-[var(--color-outline-variant)]"
                    placeholder="0"
                  />
                </div>

                {userType !== "petOwner" && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">Price (INR)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={form.priceInr}
                      onChange={(event) => setForm((current) => ({ ...current, priceInr: event.target.value }))}
                      className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] placeholder-[var(--color-outline-variant)]"
                      placeholder="₹ 0.00"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location & Story Block */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-outline-variant)]/30">
                <span className="text-[var(--color-secondary)] font-bold text-sm">2.</span>
                <h3 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-widest">Location & Story</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">City</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.city}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">State</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.state}
                    onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">Description</label>
                <textarea
                  required
                  minLength={30}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full p-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] placeholder-[var(--color-outline-variant)] min-h-[140px] resize-y"
                  placeholder="Tell potential owners about your pet's personality..."
                  rows={4}
                />
              </div>
            </div>

            {/* Photos & Video Block */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-outline-variant)]/30">
                <span className="text-[var(--color-secondary)] font-bold text-sm">3.</span>
                <h3 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-widest">Photos & Video</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">Pet Images (1 to 10)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl bg-[var(--color-surface-container-low)] border border-dashed border-[var(--color-outline-variant)] cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors overflow-hidden relative">
                    <Camera className="text-[var(--color-outline)] mb-1 size-6" />
                    <span className="text-sm font-bold text-[var(--color-outline)]">Upload Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelection}
                      className="hidden"
                    />
                  </label>
                  {imageUrls.length > 0 && (
                    <div className="grid gap-2 mt-2">
                      {imageUrls.map((url) => (
                        <div key={url} className="flex items-center justify-between rounded-xl bg-white/80 border border-[var(--color-outline-variant)]/50 px-3 py-2 shadow-sm">
                          <p className="truncate text-xs font-medium text-[var(--color-on-surface-variant)] max-w-[200px]">{url}</p>
                          <button
                            type="button"
                            className="ml-2 shrink-0 rounded-lg bg-[var(--color-error-container)] px-2 py-1 text-xs font-bold text-[var(--color-on-error-container)] transition hover:opacity-80"
                            onClick={() => setImageUrls((current) => current.filter((item) => item !== url))}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-[var(--color-on-surface-variant)] ml-1">Pet Video (Optional)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl bg-[var(--color-surface-container-low)] border border-dashed border-[var(--color-outline-variant)] cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors overflow-hidden relative">
                    <Video className="text-[var(--color-outline)] mb-1 size-6" />
                    <span className="text-sm font-bold text-[var(--color-outline)]">Upload Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelection}
                      className="hidden"
                    />
                  </label>
                  {videoUrl && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-white/80 border border-[var(--color-outline-variant)]/50 px-3 py-2 shadow-sm">
                      <p className="truncate text-xs font-medium text-[var(--color-on-surface-variant)] max-w-[200px]">{videoUrl}</p>
                      <button
                        type="button"
                        className="ml-2 shrink-0 rounded-lg bg-[var(--color-error-container)] px-2 py-1 text-xs font-bold text-[var(--color-on-error-container)] transition hover:opacity-80"
                        onClick={() => setVideoUrl(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error ? <p className="text-sm font-medium text-[var(--color-error)]">{error}</p> : null}
            {message ? <p className="text-sm font-medium text-[var(--color-primary)]">{message}</p> : null}

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !canCreateListing}
                className="w-full h-14 btn-gradient text-white text-base font-bold rounded-xl shadow-lg shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:pointer-events-none"
              >
                <span>{submitLabel}</span>
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetFormState}
                  className="w-full h-12 flex items-center justify-center rounded-xl bg-[var(--color-surface-container-high)] text-sm font-bold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-highest)]"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="reveal [animation-delay:300ms] bg-[var(--color-surface-container-lowest)] rounded-[2rem] p-8 card-shadow border border-[var(--color-outline-variant)]/20 flex flex-col h-fit lg:sticky lg:top-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <List className="text-[var(--color-secondary)] size-8" />
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">My Listings</h2>
            </div>
            <button
              type="button"
              onClick={() => void fetchMyListings()}
              className="text-[var(--color-primary)] font-bold text-sm hover:underline decoration-2 underline-offset-4 transition-all flex items-center gap-1 group"
            >
              <RefreshCw className="size-4 group-active:rotate-180 transition-transform" />
              Refresh
            </button>
          </div>

          {isLoadingListings && <p className="text-sm font-medium text-[var(--color-on-surface-variant)] mb-4">Loading listings...</p>}

          {!isLoadingListings && listings.length === 0 && (
            <div className="rounded-[2rem] border-[3px] border-dashed border-[var(--color-outline-variant)] flex flex-col items-center justify-center py-20 px-8 text-center bg-[var(--color-surface-container-lowest)]/50">
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-[var(--color-primary)]/5 rounded-full animate-ping opacity-25"></div>
                <PawPrint className="text-[var(--color-primary)] size-10 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-on-surface)] mb-2">No Pet Listings</h3>
              <p className="text-base text-[var(--color-on-surface-variant)] max-w-xs mx-auto">
                You haven't posted any pets for sale or adoption yet. Your active listings will appear here once created.
              </p>
            </div>
          )}

          {listings.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {listings.map((listing) => (
                <article key={listing._id} className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-on-surface)] line-clamp-1">{listing.title}</h3>
                      <p className="mt-1 text-sm font-medium text-[var(--color-on-surface-variant)]">
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

                  <div className="mt-auto flex gap-3 pt-4 border-t border-[var(--color-outline-variant)]/30">
                    <button
                      type="button"
                      onClick={() => startEditing(listing)}
                      className="flex-1 inline-flex h-10 items-center justify-center rounded-xl bg-white border border-[var(--color-outline-variant)]/40 text-xs font-bold text-[var(--color-on-surface)] transition hover:bg-[var(--color-surface-container-highest)]"
                    >
                      Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(listing._id)}
                      className="flex-1 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-error-container)] text-xs font-bold text-[var(--color-on-error-container)] transition hover:opacity-80"
                    >
                      Archive
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Subtle Decorative Background */}
          <div className="mt-12 p-6 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm font-bold text-[var(--color-primary)] mb-1">Quick Tip</p>
              <p className="text-base text-[var(--color-on-surface-variant)]">High-quality photos and detailed descriptions increase your listing's visibility by up to 80%.</p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Lightbulb className="size-32" />
            </div>
          </div>
        </section>

        <ConfirmModal
          isOpen={!!listingToDelete}
          title="Archive Listing"
          message="Are you sure you want to archive this listing? It will no longer be visible to buyers."
          confirmText="Archive"
          isDestructive={true}
          onConfirm={confirmDeleteListing}
          onCancel={() => setListingToDelete(null)}
        />
      </div>
    </div>
  );
}
