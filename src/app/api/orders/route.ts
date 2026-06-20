import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db/connect";
import { OrderModel } from "@/server/models/order";
import { ProductModel } from "@/server/models/product";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const viewAs = searchParams.get("viewAs") || "buyer"; // "buyer" or "seller"

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (viewAs === "seller") {
      query.sellerId = currentUser.id;
    } else {
      query.buyerId = currentUser.id;
    }

    const total = await OrderModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const orders = await OrderModel.find(query)
      .populate("productId", "title images category priceInr")
      .populate("buyerId", "name email phone image")
      .populate("sellerId", "name email phone image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({ 
      orders,
      pagination: { total, page, limit, totalPages }
    }, { status: 200 });
  } catch (error) {
    console.error("Orders GET Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity, shippingAddress, contactPhone, paymentMethod } = body;

    if (!productId || !quantity || !shippingAddress || !contactPhone) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    const product = await ProductModel.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ message: "Product not available." }, { status: 404 });
    }

    if (product.stockQuantity < quantity) {
      return NextResponse.json({ message: "Not enough stock available." }, { status: 400 });
    }

    const totalPriceInr = product.priceInr * quantity;

    const newOrder = await OrderModel.create({
      productId,
      buyerId: currentUser.id,
      sellerId: product.sellerId,
      quantity,
      totalPriceInr,
      shippingAddress,
      contactPhone,
      paymentMethod: paymentMethod || "cod",
      status: "pending_approval",
      paymentStatus: "pending",
    });

    // Notify Seller
    await NotificationModel.create({
      userId: product.sellerId,
      title: "New Order Pending Approval",
      message: `${currentUser.name || "A customer"} has placed an order for ${quantity}x ${product.title}. Please review and approve it.`,
      type: "order",
      link: "/seller-dashboard/orders"
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Orders POST Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to place order." },
      { status: 500 }
    );
  }
}
