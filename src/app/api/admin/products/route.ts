import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { ProductModel } from "@/server/models/product";
import { ReportModel } from "@/server/models/report";
import { UserModel } from "@/server/models/user";
import { logAdminActivity } from "@/lib/admin-activity";

const updateProductSchema = z.object({
  productIds: z.array(z.string().min(1)),
  status: z.enum(["pending", "approved", "rejected", "archived", "deleted"]),
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
      query.title = { $regex: search, $options: "i" };
    }
    if (status) {
      query.status = status;
    }

    const [totalCount, productsRaw] = await Promise.all([
      ProductModel.countDocuments(query),
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("sellerId", "name storeName")
        .lean(),
    ]);

    const productIds = productsRaw.map((p) => p._id.toString());
    
    // Fetch report counts for these products
    const reportCounts = await ReportModel.aggregate([
      { $match: { entityType: "product", entityId: { $in: productIds }, status: { $ne: "resolved" } } },
      { $group: { _id: "$entityId", count: { $sum: 1 } } }
    ]);

    const reportCountMap = new Map<string, number>();
    reportCounts.forEach(r => reportCountMap.set(r._id.toString(), r.count));

    const products = productsRaw.map((product: any) => ({
      ...product,
      reportsCount: reportCountMap.get(product._id.toString()) || 0,
      // Map legacy isActive to status if status is missing
      status: product.status || (product.isActive ? "approved" : "archived")
    }));

    return NextResponse.json({ products, totalCount, page, limit }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to fetch products." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    
    // Handle backwards compatibility for single productId
    if (json.productId && !json.productIds) {
      json.productIds = [json.productId];
    }
    
    const parsed = updateProductSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const adminUser = await UserModel.findById(adminGuard.adminId).select("name").lean();
    const adminName = adminUser?.name || "Admin";

    const updatePayload = {
      status: parsed.data.status,
      isActive: parsed.data.status === "approved" || parsed.data.status === "pending",
    };

    await ProductModel.updateMany(
      { _id: { $in: parsed.data.productIds } },
      { $set: updatePayload }
    );

    // Log activity for each updated product
    const activities = parsed.data.productIds.map(id => ({
      adminId: adminGuard.adminId,
      adminName,
      action: "PRODUCT_" + parsed.data.status.toUpperCase(),
      targetType: "Product",
      targetId: id,
      notes: `Product marked as ${parsed.data.status}`,
      timestamp: new Date(),
    }));

    const { AdminActivityModel } = await import("@/server/models/admin-activity");
    await AdminActivityModel.insertMany(activities);

    return NextResponse.json({ message: "Products updated successfully." }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Unable to update products." }, { status: 500 });
  }
}
