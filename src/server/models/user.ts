import { model, models, type InferSchemaType, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
      minlength: 8,
    },
    image: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      maxlength: 20,
      default: null,
    },
    city: {
      type: String,
      required: false,
      trim: true,
      maxlength: 80,
      default: null,
    },
    state: {
      type: String,
      required: false,
      trim: true,
      maxlength: 80,
      default: null,
    },
    bio: {
      type: String,
      required: false,
      trim: true,
      maxlength: 280,
      default: null,
    },
    storeName: {
      type: String,
      required: false,
      trim: true,
      maxlength: 100,
      default: null,
    },
    storeViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    storeDescription: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
      default: null,
    },
    upiId: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
      default: null,
    },
    upiQrCode: {
      type: String,
      required: false,
      default: null,
    },
    storePolicies: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    userIntent: {
      type: String,
      enum: ["adopt", "rehome", "seller"],
      default: "adopt",
      required: true,
    },
    userType: {
      type: String,
      enum: ["petOwner", "seller"],
      default: "petOwner",
      required: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    otp: {
      type: String,
      required: false,
      default: null,
    },
    otpExpiry: {
      type: Date,
      required: false,
      default: null,
    },
    savedAddresses: [
      {
        tag: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
        fullName: { type: String, required: true, trim: true, maxlength: 100 },
        contactPhone: { type: String, required: true, trim: true, maxlength: 20 },
        building: { type: String, required: true, trim: true, maxlength: 200 },
        area: { type: String, required: true, trim: true, maxlength: 200 },
        landmark: { type: String, required: false, trim: true, maxlength: 200, default: "" },
        city: { type: String, required: true, trim: true, maxlength: 100 },
        state: { type: String, required: true, trim: true, maxlength: 100 },
        pincode: { type: String, required: true, trim: true, maxlength: 20 },
      }
    ],
    recentlyViewedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      }
    ],
    followedStores: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      }
    ],
    role: {
      type: String,
      enum: ["user", "verifiedSeller", "admin"],
      default: "user",
      required: true,
    },
    // Trust & Safety Moderation Fields
    strikeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    warningCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountStatus: {
      type: String,
      enum: ["active", "warned", "suspended", "banned"],
      default: "active",
      required: true,
    },
    suspensionReason: {
      type: String,
      required: false,
      maxlength: 500,
      default: null,
    },
    suspendedUntil: {
      type: Date,
      required: false,
      default: null,
    },
    bannedAt: {
      type: Date,
      required: false,
      default: null,
    },
    bannedReason: {
      type: String,
      required: false,
      maxlength: 500,
      default: null,
    },
    emailVerifiedAt: {
      type: Date,
      required: false,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ["not_submitted", "pending", "more_info_required", "approved", "rejected"],
      default: "not_submitted",
    },
    verificationAdminNotes: {
      type: String,
      required: false,
      maxlength: 1000,
      default: null,
    },
    verificationRejectionReason: {
      type: String,
      required: false,
      maxlength: 500,
      default: null,
    },
    verifiedAt: {
      type: Date,
      required: false,
      default: null,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    verificationResubmissionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ userType: 1, createdAt: -1 });

export type UserDocument = InferSchemaType<typeof userSchema>;

if (process.env.NODE_ENV !== "production") {
  delete models.User;
}
export const UserModel = models.User || model("User", userSchema);
