"use client";

import { useMemo, useState } from "react";

import { getCitiesForState, stateOptions } from "@/lib/locations";
import type { BrowseFilters } from "@/server/listings/browse-query";

const intentOptions = [
  { label: "All", value: "" },
  { label: "Purchase", value: "sale" },
  { label: "Adoption", value: "adoption" },
];

const petOptions = [
  { label: "All", value: "" },
  { label: "Dogs", value: "dog" },
  { label: "Cats", value: "cat" },
];

type Props = {
  filters: BrowseFilters;
};

export function FindPetFilters({ filters }: Props) {
  const [listingType, setListingType] = useState(filters.listingType);
  const [petCategory, setPetCategory] = useState(filters.petCategory);
  const [stateValue, setStateValue] = useState(filters.state);
  const [cityValue, setCityValue] = useState(filters.city);
  const [queryText, setQueryText] = useState(filters.q);
  const [breed, setBreed] = useState(filters.breed);
  const [ageMin, setAgeMin] = useState(filters.ageMin);
  const [ageMax, setAgeMax] = useState(filters.ageMax);
  const [gender, setGender] = useState(filters.gender);
  const [priceMin, setPriceMin] = useState(filters.priceMin);
  const [priceMax, setPriceMax] = useState(filters.priceMax);
  const [verifiedOnly, setVerifiedOnly] = useState(filters.verifiedOnly);
  const [sortValue, setSortValue] = useState(filters.sort || "latest");

  const cityOptions = useMemo(() => getCitiesForState(stateValue), [stateValue]);

  return (
    <form className="mt-6 space-y-4" method="GET" action="/browse">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/60 p-6 backdrop-blur-md shadow-lg shadow-orange-100/50">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block text-sm font-semibold">
            What are you looking for?
            <input
              type="text"
              name="q"
              value={queryText}
              onChange={(event) => setQueryText(event.target.value)}
              placeholder="Breed, title, district..."
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-medium outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400"
            />
          </label>

          <label className="block text-sm font-semibold">
            State
            <input
              type="text"
              name="state"
              list="browse-state-options"
              value={stateValue}
              onChange={(event) => {
                setStateValue(event.target.value);
                setCityValue("");
              }}
              placeholder="Select or type"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-medium outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400"
            />
          </label>

          <label className="block text-sm font-semibold">
            City / District
            <input
              type="text"
              name="city"
              list="browse-city-options"
              value={cityValue}
              onChange={(event) => setCityValue(event.target.value)}
              placeholder="Select or type"
              className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-medium outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="flex flex-col justify-end gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-subtle)]">
              Purchase or adopt
            </span>
            <div className="flex flex-wrap gap-2">
              {intentOptions.map((option) => (
                <button
                  key={option.value || "all"}
                  type="button"
                  onClick={() => setListingType(option.value as BrowseFilters["listingType"])}
                  className={`inline-flex h-12 items-center justify-center rounded-2xl px-5 text-xs font-bold tracking-wide transition-all ${
                    listingType === option.value
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-white/80 border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="listingType" value={listingType} />
          </div>

          <div className="flex flex-col justify-end gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-subtle)]">
              Pet type
            </span>
            <div className="flex flex-wrap gap-2">
              {petOptions.map((option) => (
                <button
                  key={option.value || "all"}
                  type="button"
                  onClick={() => setPetCategory(option.value as BrowseFilters["petCategory"])}
                  className={`inline-flex h-12 items-center justify-center rounded-2xl px-5 text-xs font-bold tracking-wide transition-all ${
                    petCategory === option.value
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "bg-white/80 border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="petCategory" value={petCategory} />
          </div>

          <div className="flex flex-col justify-end gap-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--color-foreground-subtle)]">
              Sort By
            </label>
            <select
              name="sort"
              value={sortValue}
              onChange={(event) => setSortValue(event.target.value as any)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            >
              <option value="latest">Newest First</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="age_low_high">Age: Youngest First</option>
              <option value="age_high_low">Age: Oldest First</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-md"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <details className="group rounded-3xl border border-white/60 bg-white/60 p-6 backdrop-blur-md shadow-lg shadow-orange-100/50">
        <summary className="cursor-pointer text-sm font-bold text-slate-700 outline-none hover:text-orange-600 transition-colors list-none flex items-center justify-center gap-2">
          <span className="group-open:hidden">Show More Filters</span>
          <span className="hidden group-open:block">Hide Filters</span>
        </summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="block text-sm font-semibold">
            Breed
            <input
              type="text"
              name="breed"
              value={breed}
              onChange={(event) => setBreed(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
            />
          </label>

          <label className="block text-sm font-semibold">
            Gender
            <select
              name="gender"
              value={gender}
              onChange={(event) => setGender(event.target.value as BrowseFilters["gender"])}
              className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <label className="block text-sm font-semibold">
            Phone verified only
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="verifiedOnly"
                checked={verifiedOnly}
                onChange={(event) => setVerifiedOnly(event.target.checked)}
                className="size-4"
              />
              <span className="text-xs text-[var(--color-foreground-muted)]">Show verified listings</span>
            </div>
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm font-semibold">
            Age Min (months)
            <input
              type="number"
              name="ageMin"
              min={0}
              placeholder="0"
              value={ageMin}
              onChange={(event) => setAgeMin(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-ring)]"
            />
          </label>

          <label className="block text-sm font-semibold">
            Age Max (months)
            <input
              type="number"
              name="ageMax"
              min={0}
              placeholder="Any"
              value={ageMax}
              onChange={(event) => setAgeMax(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-ring)]"
            />
          </label>

          <label className="block text-sm font-semibold">
            Price Min (INR)
            <input
              type="number"
              name="priceMin"
              min={0}
              placeholder="0"
              value={priceMin}
              onChange={(event) => setPriceMin(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-ring)]"
            />
          </label>

          <label className="block text-sm font-semibold">
            Price Max (INR)
            <input
              type="number"
              name="priceMax"
              min={0}
              placeholder="Any"
              value={priceMax}
              onChange={(event) => setPriceMax(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-[var(--color-ring)]"
            />
          </label>
        </div>
      </details>

      <datalist id="browse-state-options">
        {stateOptions.map((state) => (
          <option key={state} value={state} />
        ))}
      </datalist>
      <datalist id="browse-city-options">
        {cityOptions.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </form>
  );
}
