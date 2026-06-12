import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin-auth";
import { ListingModel } from "@/server/models/listing";
import { ReportModel } from "@/server/models/report";
import { UserModel } from "@/server/models/user";
import { VerificationRequestModel } from "@/server/models/verification-request";

export async function GET() {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const [totalUsers, totalListings, pendingListings, pendingVerification, openReports] =
      await Promise.all([
        UserModel.countDocuments(),
        ListingModel.countDocuments(),
        ListingModel.countDocuments({ status: "pending" }),
        VerificationRequestModel.countDocuments({ status: "pending" }),
        ReportModel.countDocuments({ status: { $in: ["open", "in_review"] } }),
      ]);

    return NextResponse.json(
      {
        overview: {
          totalUsers,
          totalListings,
          pendingListings,
          pendingVerification,
          openReports,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ message: "Unable to fetch admin overview." }, { status: 500 });
  }
}
