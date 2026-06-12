import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { UserModel } from "@/server/models/user";

const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["user", "verifiedSeller", "admin"]),
});

export async function GET() {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select("name email role createdAt")
      .lean();

    return NextResponse.json({ users }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to fetch users." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
        new: true,
      },
    )
      .select("name email role createdAt")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to update user." }, { status: 500 });
  }
}
