import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { CartModel } from "@/server/models/cart";
import { OrderModel } from "@/server/models/order";
import { ProductModel } from "@/server/models/product";
import { NotificationModel } from "@/server/models/notification";
import { getCurrentUser } from "@/lib/auth";
import { apiRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await apiRateLimit.limit(`checkout_${ip}`);
    if (!success) {
      return NextResponse.json({ message: "Checkout rate limit exceeded. Try again later." }, { status: 429 });
    }

    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { shippingAddress, contactPhone, paymentMethod } = body;

    if (!shippingAddress || !contactPhone || !paymentMethod) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // 1. Fetch the user's cart
    const cart = await CartModel.findOne({ buyerId: currentUser.id }).populate("items.productId");
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: "Cart is empty." }, { status: 400 });
    }

    const validItems = [];
    
    // 2. Verify stock for all items
    for (const item of cart.items) {
      const product = item.productId as any; // populated product doc
      
      if (!product || !product.isActive) {
        return NextResponse.json({ message: `One or more items are no longer available.` }, { status: 400 });
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json({ message: `Not enough stock for ${product.title}. Only ${product.stockQuantity} left.` }, { status: 400 });
      }
      
      validItems.push({
        product,
        quantity: item.quantity
      });
    }

    // 3. Create Orders (one per item to support multiple sellers easily)
    const orderPromises = validItems.map(({ product, quantity }) => {
      const totalPriceInr = product.priceInr * quantity;
      return OrderModel.create({
        productId: product._id,
        buyerId: currentUser.id,
        sellerId: product.sellerId,
        quantity,
        totalPriceInr,
        shippingAddress,
        contactPhone,
        paymentMethod,
        status: "pending_approval",
      });
    });

    const createdOrders = await Promise.all(orderPromises);

    // Create notifications for sellers
    const notificationPromises = createdOrders.map(order => {
      return NotificationModel.create({
        userId: order.sellerId,
        title: "New Order Received!",
        message: `You have received a new order for ₹${order.totalPriceInr}. Please check your dashboard.`,
        type: "order",
        link: "/dashboard/orders"
      });
    });
    await Promise.all(notificationPromises);

    // 4. Stock is no longer deducted here. It is deducted when the seller approves the order.


    // 5. Clear Cart
    await CartModel.findOneAndDelete({ buyerId: currentUser.id });

    return NextResponse.json({ message: "Order placed successfully." }, { status: 201 });
  } catch (error: any) {
    logger.error("Checkout POST Error", error);
    return NextResponse.json(
      { message: error.message || "Failed to place order." },
      { status: 500 }
    );
  }
}
