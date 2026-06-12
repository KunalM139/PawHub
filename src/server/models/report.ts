import { model, models, type InferSchemaType, Schema } from "mongoose";

const reportSchema = new Schema(
  {
    reporterId: {
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
    reportedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    reason: {
      type: String,
      enum: ["spam", "fake_listing", "scam", "abuse", "animal_welfare", "other"],
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    reviewedAt: {
      type: Date,
      required: false,
      default: null,
    },
    resolutionNote: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ listingId: 1, status: 1, createdAt: -1 });
reportSchema.index(
  { reporterId: 1, listingId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "open" },
  },
);

export type ReportDocument = InferSchemaType<typeof reportSchema>;

export const ReportModel = models.Report || model("Report", reportSchema);
