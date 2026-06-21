import { model, models, type InferSchemaType, Schema } from "mongoose";

const moderationLogSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
      default: null,
    },
    actionType: {
      type: String,
      enum: [
        "warn",
        "add_strike",
        "remove_strike",
        "reset_strikes",
        "suspend",
        "ban",
        "mute",
        "resolve_report",
        "dismiss_report",
        "remove_listing",
        "remove_product",
        "remove_review",
        "restore_content"
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: ["listing", "product", "user", "message", "review", "report"],
      required: false,
      default: null,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
      index: true,
    },
    reason: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

moderationLogSchema.index({ targetUserId: 1, createdAt: -1 });
moderationLogSchema.index({ adminId: 1, createdAt: -1 });
moderationLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export type ModerationLogDocument = InferSchemaType<typeof moderationLogSchema>;

export const ModerationLogModel = models.ModerationLog || model("ModerationLog", moderationLogSchema);
