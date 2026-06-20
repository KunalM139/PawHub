"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, ChevronDown, Filter, X } from "lucide-react";

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
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const cityOptions = useMemo(() => getCitiesForState(stateValue), [stateValue]);

  return (
    <form className="w-full space-y-4" method="GET" action="/browse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] size-5" />
            <input
              type="text"
              name="q"
              value={queryText}
              onChange={(event) => setQueryText(event.target.value)}
              placeholder="Breed, title..."
              className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-3 pl-10 pr-4 text-base text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all placeholder:text-[var(--color-outline)]/70"
            />
          </div>
        </div>

        {/* State */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">State</label>
          <div className="relative">
            <input
              type="text"
              name="state"
              value={stateValue}
              onChange={(event) => {
                setStateValue(event.target.value);
                setCityValue("");
              }}
              onBlur={() => {
                setTimeout(() => {
                  setStateOpen(false);
                  if (stateValue) {
                    const match = stateOptions.find(s => s.toLowerCase().startsWith(stateValue.toLowerCase()));
                    if (match) setStateValue(match);
                  }
                }, 200);
              }}
              placeholder="Type state name"
              className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-3 pl-4 pr-12 text-base text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setStateOpen(!stateOpen);
                setCityOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--color-outline)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] rounded-full transition-colors"
            >
              <ChevronDown className="size-5" />
            </button>
            {stateOpen && (
              <div className="absolute z-50 top-full mt-2 w-full bg-white border border-[var(--color-surface-variant)] rounded-xl shadow-xl max-h-60 overflow-y-auto card-shadow">
                {stateOptions
                  .filter(s => s.toLowerCase().includes(stateValue.toLowerCase()))
                  .map((state) => (
                  <div
                    key={state}
                    onClick={() => {
                      setStateValue(state);
                      setCityValue("");
                      setStateOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-[var(--color-primary)]/10 cursor-pointer text-base text-[var(--color-on-surface)] font-medium transition-colors"
                  >
                    {state}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* City */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">City</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] size-5 pointer-events-none" />
            <input
              type="text"
              name="city"
              value={cityValue}
              onChange={(event) => setCityValue(event.target.value)}
              onBlur={() => {
                setTimeout(() => {
                  setCityOpen(false);
                  if (cityValue) {
                    const match = cityOptions.find(c => c.toLowerCase().startsWith(cityValue.toLowerCase()));
                    if (match) setCityValue(match);
                  }
                }, 200);
              }}
              placeholder="Type city name"
              className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-3 pl-10 pr-12 text-base text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setCityOpen(!cityOpen);
                setStateOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[var(--color-outline)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-variant)] rounded-full transition-colors"
            >
              <ChevronDown className="size-5" />
            </button>
            {cityOpen && cityOptions.length > 0 && (
              <div className="absolute z-50 top-full mt-2 w-full bg-white border border-[var(--color-surface-variant)] rounded-xl shadow-xl max-h-60 overflow-y-auto card-shadow">
                {cityOptions
                  .filter(c => c.toLowerCase().includes(cityValue.toLowerCase()))
                  .map((city) => (
                  <div
                    key={city}
                    onClick={() => {
                      setCityValue(city);
                      setCityOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-[var(--color-primary)]/10 cursor-pointer text-base text-[var(--color-on-surface)] font-medium transition-colors"
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
            {cityOpen && cityOptions.length === 0 && (
              <div className="absolute z-50 top-full mt-2 w-full bg-white border border-[var(--color-surface-variant)] rounded-xl shadow-xl p-4 text-center text-[var(--color-on-surface-variant)] text-sm">
                Please select a state first.
              </div>
            )}
          </div>
        </div>

        {/* Pet Type */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">Pet Type</label>
          <div className="relative">
            <select
              value={petCategory}
              onChange={(event) => setPetCategory(event.target.value as BrowseFilters["petCategory"])}
              className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-3 px-4 text-base text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none transition-all cursor-pointer"
            >
              {petOptions.map((option) => (
                 <option key={option.value || "all"} value={option.value}>{option.label}</option>
              ))}
            </select>
            <input type="hidden" name="petCategory" value={petCategory} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] size-5 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2 pt-4 border-t border-[var(--color-surface-variant)]/50">
        <div className="flex flex-wrap gap-4">
           {/* Intent (Purchase/Adoption) */}
           <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--color-on-surface-variant)]">Intent:</span>
            <select
              value={listingType}
              onChange={(event) => setListingType(event.target.value as BrowseFilters["listingType"])}
              className="bg-transparent text-base font-bold text-[var(--color-primary)] focus:outline-none cursor-pointer border-none p-0"
            >
              {intentOptions.map((option) => (
                 <option key={option.value || "all"} value={option.value}>{option.label}</option>
              ))}
            </select>
            <input type="hidden" name="listingType" value={listingType} />
           </div>

           {/* Sort */}
           <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--color-on-surface-variant)]">Sort by:</span>
            <select
              name="sort"
              value={sortValue}
              onChange={(event) => setSortValue(event.target.value as any)}
              className="bg-transparent text-base font-bold text-[var(--color-primary)] focus:outline-none cursor-pointer border-none p-0"
            >
              <option value="latest">Newest First</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
              <option value="age_low_high">Age: Youngest First</option>
              <option value="age_high_low">Age: Oldest First</option>
            </select>
           </div>
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <Link href="/browse" className="w-full md:w-auto px-6 py-3 rounded-full text-[var(--color-on-surface-variant)] text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 border-2 border-[var(--color-surface-container-high)] bg-white hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover-scale">
            <X className="size-5" />
            Clear
          </Link>
          <button type="submit" className="btn-gradient w-full md:w-auto px-8 py-3 rounded-full text-white text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2 hover-scale">
              <Search className="size-5" />
              Apply
          </button>
        </div>
      </div>

      <details className="group mt-4">
        <summary className="cursor-pointer text-sm font-bold text-[var(--color-on-surface-variant)] outline-none hover:text-[var(--color-primary)] transition-colors list-none flex items-center justify-center gap-2">
          <span className="group-open:hidden flex items-center gap-1"><Filter className="size-4" /> Show More Filters</span>
          <span className="hidden group-open:flex items-center gap-1"><Filter className="size-4" /> Hide Filters</span>
        </summary>
        <div className="mt-6 pt-4 border-t border-[var(--color-surface-variant)]/50">
          <div className="grid gap-4 lg:grid-cols-4">
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">
              Breed
              <input
                type="text"
                name="breed"
                value={breed}
                onChange={(event) => setBreed(event.target.value)}
                className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-2 px-3 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">
              Gender
              <select
                name="gender"
                value={gender}
                onChange={(event) => setGender(event.target.value as BrowseFilters["gender"])}
                className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-2 px-3 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              >
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">
              Price Min (INR)
              <input
                type="number"
                name="priceMin"
                min={0}
                placeholder="0"
                value={priceMin}
                onChange={(event) => setPriceMin(event.target.value)}
                className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-2 px-3 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">
              Price Max (INR)
              <input
                type="number"
                name="priceMax"
                min={0}
                placeholder="Any"
                value={priceMax}
                onChange={(event) => setPriceMax(event.target.value)}
                className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-2 px-3 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              />
            </label>
            
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">
              Age Min (months)
              <input
                type="number"
                name="ageMin"
                min={0}
                placeholder="0"
                value={ageMin}
                onChange={(event) => setAgeMin(event.target.value)}
                className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-2 px-3 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              />
            </label>
            
            <label className="flex flex-col gap-2 text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider text-left">
              Age Max (months)
              <input
                type="number"
                name="ageMax"
                min={0}
                placeholder="Any"
                value={ageMax}
                onChange={(event) => setAgeMax(event.target.value)}
                className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-2 px-3 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              />
            </label>

            <label className="col-span-full md:col-span-2 flex items-center gap-3 mt-4 group cursor-pointer">
              <input
                type="checkbox"
                name="verifiedOnly"
                checked={verifiedOnly}
                onChange={(event) => setVerifiedOnly(event.target.checked)}
                className="w-5 h-5 rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] transition-all"
              />
              <span className="font-bold text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">Show only verified sellers</span>
            </label>
          </div>
        </div>
      </details>


    </form>
  );
}
