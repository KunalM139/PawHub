import { model, models, type InferSchemaType, Schema } from "mongoose";

const productReviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    reviewerId: {
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
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productReviewSchema.index({ productId: 1, reviewerId: 1 }, { unique: true });
productReviewSchema.index({ productId: 1, createdAt: -1 });

export type ProductReviewDocument = InferSchemaType<typeof productReviewSchema>;

if (process.env.NODE_ENV !== "production") {
  delete models.ProductReview;
}
export const ProductReviewModel = models.ProductReview || model("ProductReview", productReviewSchema);
