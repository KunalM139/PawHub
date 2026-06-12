import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/server/db/connect";
import { UserModel } from "@/server/models/user";

type AdminGuardResult =
  | {
      adminId: string;
    }
  | {
      response: NextResponse;
    };

export async function requireAdminSession(): Promise<AdminGuardResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ message: "Unauthorized." }, { status: 401 }),
    };
  }

  await connectToDatabase();

  const user = await UserModel.findById(session.user.id).select("role").lean();

  if (!user || user.role !== "admin") {
    return {
      response: NextResponse.json({ message: "Forbidden." }, { status: 403 }),
    };
  }

  return {
    adminId: session.user.id,
  };
}
