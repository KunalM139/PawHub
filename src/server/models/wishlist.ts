import { model, models, type InferSchemaType, Schema } from "mongoose";

const wishlistSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    productIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      }
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type WishlistDocument = InferSchemaType<typeof wishlistSchema>;

export const WishlistModel = models.Wishlist || model("Wishlist", wishlistSchema);
