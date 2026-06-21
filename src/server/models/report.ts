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
      required: false, // Backward compatibility
      index: true,
    },
    entityType: {
      type: String,
      enum: ["listing", "product", "user", "message", "review"],
      default: "listing",
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: false,
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
      enum: [
        // Listings & Products
        "spam", "fake_listing", "scam", "abuse", "animal_welfare", 
        "wrong_information", "duplicate", "fake_product", "counterfeit",
        // Users
        "fraud", "fake_identity", "harassment",
        // Messages
        "threat", "inappropriate_content",
        // Reviews
        "fake_review", "abusive_language", "misleading_information",
        // Catch-all
        "other"
      ],
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
reportSchema.index({ entityType: 1, entityId: 1, status: 1, createdAt: -1 });
reportSchema.index(
  { reporterId: 1, listingId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "open", listingId: { $exists: true, $ne: null } },
  },
);
reportSchema.index(
  { reporterId: 1, entityType: 1, entityId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "open", entityId: { $exists: true, $ne: null } },
  },
);

export type ReportDocument = InferSchemaType<typeof reportSchema>;

export const ReportModel = models.Report || model("Report", reportSchema);
