const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/browse/find-pet-filters.tsx');
let fileCode = fs.readFileSync(filePath, 'utf8');

// 1. Add useState for dropdowns
fileCode = fileCode.replace(
  'const [sortValue, setSortValue] = useState(filters.sort || "latest");',
  \`const [sortValue, setSortValue] = useState(filters.sort || "latest");
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);\`
);

// 2. Replace State Select with Custom Combobox
const stateCombobox = \`<div className="relative">
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
                    const match = stateOptions.find(s => s.toLowerCase() === stateValue.toLowerCase());
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
                {stateOptions.map((state) => (
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
          </div>\`;

fileCode = fileCode.replace(
  /<select[\s\S]*?name="state"[\s\S]*?<\/select>\s*<ChevronDown[^>]*\/>/g,
  stateCombobox
);

// 3. Replace City Select with Custom Combobox
const cityCombobox = \`<div className="relative">
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
                    const match = cityOptions.find(c => c.toLowerCase() === cityValue.toLowerCase());
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
                {cityOptions.map((city) => (
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
          </div>\`;

fileCode = fileCode.replace(
  /<MapPin[^>]*\/>\s*<select[\s\S]*?name="city"[\s\S]*?<\/select>\s*<ChevronDown[^>]*\/>/g,
  cityCombobox
);

fs.writeFileSync(filePath, fileCode, 'utf8');

console.log("Successfully fixed state and city dropdowns");
