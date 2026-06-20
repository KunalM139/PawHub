import { model, models, type InferSchemaType, Schema } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: true } // keeping _id for subdocuments helps with easy updates
);

const cartSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type CartItemDocument = InferSchemaType<typeof cartItemSchema> & { _id: string };
export type CartDocument = InferSchemaType<typeof cartSchema> & { _id: string };

export const CartModel = models.Cart || model("Cart", cartSchema);
