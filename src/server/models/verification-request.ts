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
    dateOfBirth: {
      type: Date,
      required: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
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
    gstNumber: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
      default: null,
    },
    businessRegistrationNumber: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
      default: null,
    },
    selfieUrl: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "more_info_required", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNotes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
      default: null,
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
    history: [
      {
        action: {
          type: String,
          enum: ["submitted", "reviewed", "approved", "rejected", "resubmitted", "requested_more_info"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        adminId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        notes: {
          type: String,
          required: false,
          maxlength: 1000,
        },
      },
    ],
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
