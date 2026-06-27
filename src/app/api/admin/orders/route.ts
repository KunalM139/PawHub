import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { OrderModel } from "@/server/models/order";
import { UserModel } from "@/server/models/user";
import { logAdminActivity } from "@/lib/admin-activity";

const updateOrderSchema = z.object({
  orderId: z.string().min(1),
  orderStatus: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "closed"]),
});

export async function GET(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) return adminGuard.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.orderStatus = status;
    }

    const [totalCount, orders] = await Promise.all([
      OrderModel.countDocuments(query),
      OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("buyerId", "name email")
        .populate("sellerId", "storeName name")
        .lean(),
    ]);

    return NextResponse.json({ orders, totalCount, page, limit }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to fetch orders." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    const parsed = updateOrderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const order = await OrderModel.findById(parsed.data.orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    order.orderStatus = parsed.data.orderStatus;
    await order.save();

    const adminUser = await UserModel.findById(adminGuard.adminId).select("name").lean();
    await logAdminActivity({
      adminId: adminGuard.adminId,
      adminName: adminUser?.name || "Admin",
      action: "ORDER_" + parsed.data.orderStatus.toUpperCase(),
      targetId: order._id.toString(),
      targetType: "Order",
      notes: `Order status forced to ${parsed.data.orderStatus}`,
      req: request,
    });

    return NextResponse.json({ order }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Unable to update order." }, { status: 500 });
  }
}
