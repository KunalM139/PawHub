import { z } from "zod";

const listingTypeEnum = z.enum(["sale", "adoption", "rehome"]);
const petCategoryEnum = z.enum(["dog", "cat"]);
const petGenderEnum = z.enum(["male", "female"]);

export const listingInputSchema = z
  .object({
    listingType: listingTypeEnum,
    petCategory: petCategoryEnum,
    title: z.string().trim().min(8).max(120),
    breed: z.string().trim().min(2).max(80),
    description: z.string().trim().min(30).max(2400),
    ageInMonths: z.coerce.number().int().min(0).max(300),
    gender: petGenderEnum,
    priceInr: z.coerce.number().min(0),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    images: z.array(z.string().url()).min(1).max(10),
    video: z.string().url().nullable().optional(),
  })
  .refine(
    (value) => {
      if (value.listingType === "adoption") {
        return value.priceInr >= 0;
      }

      return value.priceInr > 0;
    },
    {
      path: ["priceInr"],
      message: "Price must be greater than zero for sale and rehome listings.",
    },
  );

export type ListingInput = z.infer<typeof listingInputSchema>;
