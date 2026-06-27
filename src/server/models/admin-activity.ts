import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminActivity extends Document {
  timestamp: Date;
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  action: string;
  targetId?: string;
  targetType?: string;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}

const adminActivitySchema = new Schema<IAdminActivity>(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      index: true,
    },
    targetType: {
      type: String,
    },
    notes: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const AdminActivityModel: Model<IAdminActivity> =
  mongoose.models.AdminActivity || mongoose.model<IAdminActivity>("AdminActivity", adminActivitySchema);
