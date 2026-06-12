import { model, models, type InferSchemaType, Schema } from "mongoose";

const otpRequestSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiry: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type OtpRequestDocument = InferSchemaType<typeof otpRequestSchema>;

export const OtpRequestModel =
  models.OtpRequest || model("OtpRequest", otpRequestSchema);
