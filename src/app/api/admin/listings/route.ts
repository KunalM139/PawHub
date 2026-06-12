import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { ListingModel } from "@/server/models/listing";

const updateListingSchema = z.object({
  listingId: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected", "archived"]),
  rejectionReason: z.string().trim().max(300).optional().nullable(),
});

export async function GET(request: Request) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = status ? { status } : {};

    const listings = await ListingModel.find(query)
      .sort({ isPhoneVerified: -1, isVerifiedSeller: -1, createdAt: -1 })
      .limit(120)
      .lean();

    return NextResponse.json({ listings }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to fetch listings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const adminGuard = await requireAdminSession();
  if ("response" in adminGuard) {
    return adminGuard.response;
  }

  try {
    const json = await request.json();
    const parsed = updateListingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid payload.",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const listing = await ListingModel.findById(parsed.data.listingId);
    if (!listing) {
      return NextResponse.json({ message: "Listing not found." }, { status: 404 });
    }

    listing.set({
      status: parsed.data.status,
      rejectionReason: parsed.data.status === "rejected" ? parsed.data.rejectionReason ?? null : null,
      isActive: parsed.data.status !== "archived",
    });

    await listing.save();

    return NextResponse.json({ listing }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Unable to update listing." }, { status: 500 });
  }
}
