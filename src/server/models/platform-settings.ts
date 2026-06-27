import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlatformSettings extends Document {
  isMaintenanceMode: boolean;
  announcementBanner: {
    isActive: boolean;
    message: string;
    linkUrl?: string;
  };
  allowedPetCategories: string[];
  allowedProductCategories: string[];
  reportReasons: string[];
  verificationRequiredDocs: string[];
  featureToggles: {
    enableProducts: boolean;
    enableAdoption: boolean;
    enableReviews: boolean;
  };
}

const platformSettingsSchema = new Schema<IPlatformSettings>(
  {
    isMaintenanceMode: {
      type: Boolean,
      default: false,
    },
    announcementBanner: {
      isActive: { type: Boolean, default: false },
      message: { type: String, default: "" },
      linkUrl: { type: String, default: "" },
    },
    allowedPetCategories: {
      type: [String],
      default: ["Dog", "Cat"],
    },
    allowedProductCategories: {
      type: [String],
      default: ["Food", "Toys", "Accessories", "Health", "Grooming"],
    },
    reportReasons: {
      type: [String],
      default: [
        "Spam",
        "Fake Listing",
        "Scam",
        "Abuse",
        "Animal Welfare Violation",
        "Other",
      ],
    },
    verificationRequiredDocs: {
      type: [String],
      default: ["ID Proof", "Business Registration"],
    },
    featureToggles: {
      enableProducts: { type: Boolean, default: true },
      enableAdoption: { type: Boolean, default: true },
      enableReviews: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const PlatformSettingsModel: Model<IPlatformSettings> =
  mongoose.models.PlatformSettings || mongoose.model<IPlatformSettings>("PlatformSettings", platformSettingsSchema);
