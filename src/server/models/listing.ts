import { model, models, type InferSchemaType, Schema } from "mongoose";

import type { ListingType, PetCategory } from "@/types";

const listingSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listingType: {
      type: String,
      enum: ["sale", "adoption", "rehome"],
      required: true,
    },
    petCategory: {
      type: String,
      enum: ["dog", "cat"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 120,
    },
    breed: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 2400,
    },
    ageInMonths: {
      type: Number,
      required: true,
      min: 0,
      max: 300,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    priceInr: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(this: { listingType?: ListingType }, value: number) {
          if (this.listingType === "adoption") {
            return value >= 0;
          }

          return value > 0;
        },
        message:
          "Price must be greater than zero for sale/rehome listings. Adoption can be zero.",
      },
    },
    city: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator(value: string[]) {
          return Array.isArray(value) && value.length > 0 && value.length <= 10;
        },
        message: "A listing must have 1 to 10 images.",
      },
    },
    video: {
      type: String,
      required: false,
      default: null,
    },
    isVerifiedSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "archived"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      required: false,
      trim: true,
      maxlength: 300,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

listingSchema.index({ sellerId: 1, createdAt: -1 });
listingSchema.index({
  status: 1,
  listingType: 1,
  petCategory: 1,
  city: 1,
  createdAt: -1,
});
listingSchema.index({ isActive: 1, createdAt: -1 });
listingSchema.index({ isActive: 1, status: 1, petCategory: 1, listingType: 1, createdAt: -1 });
listingSchema.index({ isActive: 1, status: 1, priceInr: 1, createdAt: -1 });
listingSchema.index({ isActive: 1, status: 1, ageInMonths: 1, createdAt: -1 });
listingSchema.index({
  title: "text",
  breed: "text",
  description: "text",
  city: "text",
});

export type ListingDocument = InferSchemaType<typeof listingSchema> & {
  _id: string;
  listingType: ListingType;
  petCategory: PetCategory;
};

export const ListingModel = models.Listing || model("Listing", listingSchema);
