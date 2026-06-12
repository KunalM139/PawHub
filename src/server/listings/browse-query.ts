import type { ListingType, PetCategory } from "@/types";

type ListingSortValue = "latest" | "price_low_high" | "price_high_low" | "age_low_high" | "age_high_low";

type ListingSort = Record<string, 1 | -1>;

export type BrowseFilters = {
  q: string;
  petCategory: "" | PetCategory;
  listingType: "" | ListingType;
  breed: string;
  city: string;
  state: string;
  ageMin: string;
  ageMax: string;
  gender: "" | "male" | "female";
  priceMin: string;
  priceMax: string;
  adoptionOnly: boolean;
  verifiedOnly: boolean;
  sort: ListingSortValue;
};

function getFirstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toNumberOrNull(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function toBoolean(value: string): boolean {
  return value === "true" || value === "1" || value === "on";
}

export function parseBrowseFilters(
  source: URLSearchParams | Record<string, string | string[] | undefined>,
): BrowseFilters {
  const get = (key: string) => {
    if (source instanceof URLSearchParams) {
      return source.get(key) ?? "";
    }

    return getFirstValue(source[key]);
  };

  const q = get("q").trim();
  const petCategoryRaw = get("petCategory").trim().toLowerCase();
  const listingTypeRaw = get("listingType").trim().toLowerCase();
  const genderRaw = get("gender").trim().toLowerCase();
  const sortRaw = get("sort").trim().toLowerCase();

  const sort: ListingSortValue =
    sortRaw === "price_low_high" || sortRaw === "price_high_low" || sortRaw === "age_low_high" || sortRaw === "age_high_low" ? sortRaw : "latest";

  return {
    q,
    petCategory: petCategoryRaw === "dog" || petCategoryRaw === "cat" ? petCategoryRaw : "",
    listingType:
      listingTypeRaw === "sale" || listingTypeRaw === "adoption" || listingTypeRaw === "rehome"
        ? listingTypeRaw
        : "",
    breed: get("breed").trim(),
    city: get("city").trim(),
    state: get("state").trim(),
    ageMin: get("ageMin").trim(),
    ageMax: get("ageMax").trim(),
    gender: genderRaw === "male" || genderRaw === "female" ? genderRaw : "",
    priceMin: get("priceMin").trim(),
    priceMax: get("priceMax").trim(),
    adoptionOnly: toBoolean(get("adoptionOnly")),
    verifiedOnly: toBoolean(get("verifiedOnly")),
    sort,
  };
}

export function buildPublicListingQuery(filters: BrowseFilters) {
  const query: Record<string, unknown> = {
    isActive: true,
    status: "approved",
  };

  if (filters.q) {
    const search = new RegExp(escapeRegex(filters.q), "i");
    query.$or = [
      { title: search },
      { breed: search },
      { description: search },
      { city: search },
      { state: search },
    ];
  }

  if (filters.petCategory) {
    query.petCategory = filters.petCategory;
  }

  if (filters.breed) {
    query.breed = new RegExp(escapeRegex(filters.breed), "i");
  }

  if (filters.city) {
    query.city = new RegExp(escapeRegex(filters.city), "i");
  }

  if (filters.state) {
    query.state = new RegExp(escapeRegex(filters.state), "i");
  }

  if (filters.gender) {
    query.gender = filters.gender;
  }

  const ageMin = toNumberOrNull(filters.ageMin);
  const ageMax = toNumberOrNull(filters.ageMax);

  if (ageMin !== null || ageMax !== null) {
    query.ageInMonths = {
      ...(ageMin !== null ? { $gte: ageMin } : {}),
      ...(ageMax !== null ? { $lte: ageMax } : {}),
    };
  }

  const priceMin = toNumberOrNull(filters.priceMin);
  const priceMax = toNumberOrNull(filters.priceMax);

  if (priceMin !== null || priceMax !== null) {
    query.priceInr = {
      ...(priceMin !== null ? { $gte: priceMin } : {}),
      ...(priceMax !== null ? { $lte: priceMax } : {}),
    };
  }

  if (filters.listingType) {
    query.listingType = filters.listingType;
  } else if (filters.adoptionOnly) {
    query.listingType = "adoption";
  }

  if (filters.verifiedOnly) {
    query.isPhoneVerified = true;
  }

  return query;
}

export function buildPublicListingSort(filters: BrowseFilters): ListingSort {
  if (filters.sort === "price_low_high") {
    return {
      priceInr: 1 as const,
      createdAt: -1 as const,
    };
  }

  if (filters.sort === "price_high_low") {
    return {
      priceInr: -1 as const,
      createdAt: -1 as const,
    };
  }

  if (filters.sort === "age_low_high") {
    return {
      ageInMonths: 1 as const,
      createdAt: -1 as const,
    };
  }

  if (filters.sort === "age_high_low") {
    return {
      ageInMonths: -1 as const,
      createdAt: -1 as const,
    };
  }

  return {
    createdAt: -1 as const,
  };
}
