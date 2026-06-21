import { model, models, type InferSchemaType, Schema } from "mongoose";

const productSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["food", "accessories", "toys", "grooming", "other"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2400,
    },
    priceInr: {
      type: Number,
      required: true,
      min: 1,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator(value: string[]) {
          return Array.isArray(value) && value.length > 0 && value.length <= 5;
        },
        message: "A product must have 1 to 5 images.",
      },
    },
    isVerifiedSeller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      }
    ],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      }
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ sellerId: 1, createdAt: -1 });
productSchema.index({ isActive: 1, category: 1, createdAt: -1 });
productSchema.index({ isActive: 1, priceInr: 1, createdAt: -1 });
productSchema.index({ isActive: 1, stockQuantity: 1, createdAt: -1 });
productSchema.index({
  title: "text",
  description: "text",
  category: "text",
});

export type ProductDocument = InferSchemaType<typeof productSchema> & { _id: string };

export const ProductModel = models.Product || model("Product", productSchema);
