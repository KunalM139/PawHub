import { model, models, type InferSchemaType, Schema } from "mongoose";

const favoriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
    versionKey: false,
  },
);

favoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, createdAt: -1 });

export type FavoriteDocument = InferSchemaType<typeof favoriteSchema>;

export const FavoriteModel = models.Favorite || model("Favorite", favoriteSchema);
