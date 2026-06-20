import { model, models, type InferSchemaType, Schema } from "mongoose";

const orderSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPriceInr: {
      type: Number,
      required: true,
      min: 1,
    },
    shippingAddress: {
      type: Schema.Types.Mixed,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_approval", "approved", "rejected", "shipped", "delivered", "cancelled"],
      default: "pending_approval",
      required: true,
      index: true,
    },
    trackingLink: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "upi_on_delivery"],
      default: "cod",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      required: true,
    },
    approvedAt: {
      type: Date,
      required: false,
      default: null,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: false,
      default: null,
    },
    rejectionReason: {
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

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof orderSchema> & { _id: string };

export const OrderModel = models.Order || model("Order", orderSchema);
