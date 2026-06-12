import { model, models, type InferSchemaType, Schema } from "mongoose";

const verificationRequestSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    legalName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    businessName: {
      type: String,
      required: false,
      trim: true,
      maxlength: 120,
      default: null,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: /^\+?[0-9]{10,15}$/,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    idProofUrl: {
      type: String,
      required: true,
      trim: true,
    },
    businessProofUrl: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    aboutBusiness: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
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
    rejectionReason: {
      type: String,
      required: false,
      trim: true,
      maxlength: 300,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

verificationRequestSchema.index({ userId: 1, createdAt: -1 });
verificationRequestSchema.index({ status: 1, createdAt: -1 });
verificationRequestSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  },
);

export type VerificationRequestDocument = InferSchemaType<typeof verificationRequestSchema>;

export const VerificationRequestModel =
  models.VerificationRequest || model("VerificationRequest", verificationRequestSchema);
