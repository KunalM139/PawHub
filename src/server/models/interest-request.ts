import { model, models, type InferSchemaType, Schema } from "mongoose";

const interestRequestSchema = new Schema(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    buyerId: {
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    message: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

interestRequestSchema.index({ listingId: 1, buyerId: 1 }, { unique: true });

export type InterestRequestDocument = InferSchemaType<typeof interestRequestSchema>;

export const InterestRequestModel = models.InterestRequest || model("InterestRequest", interestRequestSchema);
