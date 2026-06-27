import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { AdminActivityModel } from "@/server/models/admin-activity";

export async function GET(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const query: any = {};
    const search = searchParams.get("search") || "";
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { adminName: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const [totalCount, activities] = await Promise.all([
      AdminActivityModel.countDocuments(query),
      AdminActivityModel.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({ activities, totalCount, page, limit }, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch admin activity logs:", err);
    return NextResponse.json({ message: "Failed to fetch logs." }, { status: 500 });
  }
}
