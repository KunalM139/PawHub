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
    role: {
      type: String,
      enum: ["user", "verifiedSeller", "admin"],
      default: "user",
      required: true,
    },
    emailVerifiedAt: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel = models.User || model("User", userSchema);
