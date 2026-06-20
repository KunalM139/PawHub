const fs = require('fs');

const path = "d:\\Project\\PawHub\\src\\components\\listings\\listing-management.tsx";
let code = fs.readFileSync(path, 'utf8');

// Replace imports
code = code.replace(
  'import { Cat } from "lucide-react";',
  'import { PlusCircle, List, Camera, Video, RefreshCw, PawPrint, Lightbulb, ArrowRight } from "lucide-react";'
);

// Replace the return block entirely
const newReturn = `  return (
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
        <section className="reveal [animation-delay:150ms] hover-scale bg-[var(--color-surface-container-lowest)] rounded-[2rem] p-8 card-shadow border border-[var(--color-outline-variant)]/20 h-fit">
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
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] hover-scale"
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
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] hover-scale"
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
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] placeholder-[var(--color-outline-variant)] hover-scale"
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
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] hover-scale"
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
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] placeholder-[var(--color-outline-variant)] hover-scale"
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
                      className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] placeholder-[var(--color-outline-variant)] hover-scale"
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
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] hover-scale"
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
                    className="w-full h-14 px-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] hover-scale"
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
                  className="w-full p-4 rounded-xl bg-white/80 border border-[var(--color-outline-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-base text-[var(--color-on-surface)] placeholder-[var(--color-outline-variant)] hover-scale min-h-[140px] resize-y"
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
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl bg-[var(--color-surface-container-low)] border border-dashed border-[var(--color-outline-variant)] cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors hover-scale overflow-hidden relative">
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
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl bg-[var(--color-surface-container-low)] border border-dashed border-[var(--color-outline-variant)] cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors hover-scale overflow-hidden relative">
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
            {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !canCreateListing}
                className="w-full h-14 btn-shimmer text-white text-base font-bold rounded-xl shadow-lg shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:pointer-events-none"
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

        <section className="reveal [animation-delay:300ms] hover-scale bg-[var(--color-surface-container-lowest)] rounded-[2rem] p-8 card-shadow border border-[var(--color-outline-variant)]/20 flex flex-col h-fit lg:sticky lg:top-8">
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
                <article key={listing._id} className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] p-5 transition-all hover:shadow-md hover-scale">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-on-surface)] line-clamp-1">{listing.title}</h3>
                      <p className="mt-1 text-sm font-medium text-[var(--color-on-surface-variant)]">
                        {listing.breed} • {listing.city}
                      </p>
                    </div>
                    <span className={\`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider \${
                      listing.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                      listing.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-200 text-slate-700"
                    }\`}>
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
          <div className="mt-12 p-6 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 relative overflow-hidden hover-scale">
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
`;

const lines = code.split(/\\r?\\n/);
const returnIndex = lines.findIndex(l => l.trim() === 'return (');
if (returnIndex === -1) {
  console.log('Error finding return');
  process.exit(1);
}

const beforeReturn = lines.slice(0, returnIndex).join('\\n');
const finalCode = beforeReturn + '\\n' + newReturn + '}\\n';

fs.writeFileSync(path, finalCode, 'utf8');
console.log('Success');
