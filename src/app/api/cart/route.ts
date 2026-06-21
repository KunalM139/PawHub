import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { CartModel } from "@/server/models/cart";
import { ProductModel } from "@/server/models/product";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";

// Fetch the user's cart
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    let cart = await CartModel.findOne({ buyerId: currentUser.id })
      .populate({
        path: "items.productId",
        select: "title images priceInr stockQuantity sellerId",
      })
      .lean();

    if (!cart) {
      cart = { items: [] };
    } else {
      // Filter out items where product no longer exists or was deleted
      cart.items = cart.items.filter((item: any) => item.productId);
    }

    return NextResponse.json({ cart }, { status: 200 });
  } catch (error) {
    logger.error("Cart GET Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// Add an item to the cart
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required." }, { status: 400 });
    }

    const product = await ProductModel.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ message: "Product not available." }, { status: 404 });
    }

    let cart = await CartModel.findOne({ buyerId: currentUser.id });

    if (!cart) {
      // Create new cart
      if (quantity > product.stockQuantity) {
        return NextResponse.json({ message: "Not enough stock." }, { status: 400 });
      }
      cart = await CartModel.create({
        buyerId: currentUser.id,
        items: [{ productId, quantity }],
      });
    } else {
      // Update existing cart
      const existingItemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId);
      
      if (existingItemIndex > -1) {
        // Item exists, add to quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > product.stockQuantity) {
          return NextResponse.json({ message: `Cannot add more. Only ${product.stockQuantity} left in stock.` }, { status: 400 });
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // New item
        if (quantity > product.stockQuantity) {
          return NextResponse.json({ message: "Not enough stock." }, { status: 400 });
        }
        cart.items.push({ productId, quantity });
      }
      await cart.save();
    }

    return NextResponse.json({ message: "Added to cart", cart }, { status: 200 });
  } catch (error: any) {
    logger.error("Cart POST Error:", error);
    return NextResponse.json({ message: error.message || "Failed to update cart." }, { status: 500 });
  }
}

// Update quantity of an item
export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || typeof quantity !== "number") {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    const cart = await CartModel.findOne({ buyerId: currentUser.id });
    if (!cart) {
      return NextResponse.json({ message: "Cart not found." }, { status: 404 });
    }

    const item = cart.items.find((i: any) => i.productId.toString() === productId);
    if (!item) {
      return NextResponse.json({ message: "Item not in cart." }, { status: 404 });
    }

    const product = await ProductModel.findById(productId);
    if (!product || quantity > product.stockQuantity) {
      return NextResponse.json({ message: "Not enough stock." }, { status: 400 });
    }

    item.quantity = quantity;
    await cart.save();

    return NextResponse.json({ message: "Quantity updated", cart }, { status: 200 });
  } catch (error: any) {
    logger.error("Cart PATCH Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// Remove an item from the cart
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ message: "Product ID required." }, { status: 400 });
    }

    await CartModel.findOneAndUpdate(
      { buyerId: currentUser.id },
      { $pull: { items: { productId } } }
    );

    return NextResponse.json({ message: "Item removed" }, { status: 200 });
  } catch (error) {
    logger.error("Cart DELETE Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
