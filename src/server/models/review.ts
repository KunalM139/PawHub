import { model, models, type InferSchemaType, Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: false,
      trim: true,
      maxlength: 120,
      default: null,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 800,
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reviewSchema.index({ listingId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ sellerId: 1, createdAt: -1 });
reviewSchema.index({ sellerId: 1, isVisible: 1, createdAt: -1 });
reviewSchema.index({ listingId: 1, createdAt: -1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;

export const ReviewModel = models.Review || model("Review", reviewSchema);
