import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { UserModel } from "@/server/models/user";
import { logAdminActivity } from "@/lib/admin-activity";

const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "verifiedSeller", "admin"]),
});

export async function GET(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (roleFilter) {
      query.role = roleFilter;
    }

    const [totalCount, users] = await Promise.all([
      UserModel.countDocuments(query),
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("name email role createdAt strikeCount accountStatus image")
        .lean(),
    ]);

    return NextResponse.json({ users, totalCount, page, limit }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to fetch users." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    const parsed = updateUserRoleSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      parsed.data.userId,
      {
        $set: {
          role: parsed.data.role,
        },
      },
      {
        returnDocument: "after",
      },
    )
      .select("name email role createdAt")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const adminUser = await UserModel.findById(adminGuard.adminId).select("name").lean();

    await logAdminActivity({
      adminId: adminGuard.adminId,
      adminName: adminUser?.name || "Admin",
      action: "USER_PROMOTION",
      targetId: parsed.data.userId,
      targetType: "User",
      notes: `Role changed to ${parsed.data.role}`,
      req: request,
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to update user." }, { status: 500 });
  }
}
