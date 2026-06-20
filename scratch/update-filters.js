const fs = require('fs');
const path = require('path');

// 1. Update FindPetFilters
const filtersPath = path.resolve('src/components/browse/find-pet-filters.tsx');
let filtersCode = fs.readFileSync(filtersPath, 'utf8');

// Replace State input with select
filtersCode = filtersCode.replace(
  /<input[\\s\\S]*?name="state"[\\s\\S]*?\/>/,
  \`<select
              name="state"
              value={stateValue}
              onChange={(event) => {
                setStateValue(event.target.value);
                setCityValue("");
              }}
              className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-3 pl-4 pr-10 text-base text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">All States</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)] size-5 pointer-events-none" />\`
);

// Replace City input with select
filtersCode = filtersCode.replace(
  /<input[\\s\\S]*?name="city"[\\s\\S]*?\/>/,
  \`<select
              name="city"
              value={cityValue}
              onChange={(event) => setCityValue(event.target.value)}
              className="w-full bg-white/80 border border-[var(--color-surface-variant)] rounded-xl py-3 pl-10 pr-10 text-base text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">All Cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)] size-5 pointer-events-none" />\`
);

// Remove datalists
filtersCode = filtersCode.replace(/<datalist id="browse-state-options">[\s\S]*?<\/datalist>/, '');
filtersCode = filtersCode.replace(/<datalist id="browse-city-options">[\s\S]*?<\/datalist>/, '');

fs.writeFileSync(filtersPath, filtersCode, 'utf8');

// 2. Update Browse Page
const pagePath = path.resolve('src/app/(main)/browse/page.tsx');
let pageCode = fs.readFileSync(pagePath, 'utf8');

pageCode = pageCode.replace(
  'const rawListings = await ListingModel.find(buildPublicListingQuery(filters))',
  \`const totalCount = await ListingModel.countDocuments(buildPublicListingQuery(filters));
  const rawListings = await ListingModel.find(buildPublicListingQuery(filters))\`
);

pageCode = pageCode.replace(
  '{listings.length} Available Pets',
  '{totalCount} Available Pets'
);

fs.writeFileSync(pagePath, pageCode, 'utf8');

console.log("Successfully updated filters and total count");
